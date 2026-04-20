import "server-only";

import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  findUserByIdentifier,
  findUserById,
  createUser,
  updateUserPassword,
  patchUser,
  listAdminUsers,
  deleteUserById,
  emailExists,
} from "@/lib/repositories/userRepository";
import type { UserRole } from "@/lib/models/user";

const SALT_ROUNDS = 12;

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function authenticateUser(
  identifier: string,
  password: string,
): Promise<{ id: string; email: string; name: string; role: UserRole; clubId: string; status: string; memberId?: string; avatarUrl?: string | null } | null> {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.isActive) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return {
    id:        user._id.toString(),
    email:     user.email,
    name:      user.name,
    role:      user.role,
    clubId:    user.clubId,
    status:    user.status,
    memberId:  user.memberId,
    avatarUrl: user.avatarUrl,
  };
}

// ─── User creation ────────────────────────────────────────────────────────────

export async function createAdminUser(
  clubId:   string,
  email:    string,
  name:     string,
  role:     Exclude<UserRole, "MEMBER">,
  password: string,
): Promise<string> {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  if (await emailExists(email)) {
    const existing = await findUserByEmail(email);
    if (existing!.role !== "MEMBER") {
      throw new Error(`An admin with the email ${email} already exists.`);
    }
    await patchUser(email, { name, role, passwordHash: hash, isActive: true });
    return existing!._id.toString();
  }
  const id = await createUser({ clubId, email, name, passwordHash: hash, role, status: "active", isActive: true });
  return id.toString();
}

export async function createMemberUser(
  clubId:      string,
  email:       string,
  name:        string,
  memberId:    string,   // HYKE-XXXX
  memberDocId: string,   // MongoDB ObjectId string
  password:    string,
): Promise<string> {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  if (await emailExists(email)) {
    const existing = await findUserByEmail(email);
    // If Admin, reject member binding to maintain security
    if (existing!.role !== "MEMBER") {
      throw new Error(`Cannot bind member account to email ${email}. It already exists as an Admin.`);
    }
    // Update existing Member with new memberId, doc linkage, and new temp password
    await patchUser(email, {
      name,
      passwordHash: hash,
      memberId,
      memberDocId,
      isActive: true,
    });
    return existing!._id.toString();
  }

  const id = await createUser({
    clubId,
    email,
    name,
    passwordHash: hash,
    role:         "MEMBER",
    memberId,
    memberDocId,
    status:       "active",
    isActive:     true,
  });
  return id.toString();
}

/** Generate a human-readable temporary password, e.g. "Hyke@483920" */
export function generateTempPassword(): string {
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  return `Hyke@${digits}`;
}

// ─── Password management ──────────────────────────────────────────────────────

export async function changePassword(
  email:           string,
  currentPassword: string,
  newPassword:     string,
): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found.");
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect.");
  if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updateUserPassword(email, hash);
}

// ─── Admin access management ──────────────────────────────────────────────────

export { listAdminUsers, deleteUserById, findUserById };
