import "server-only";

import {
  buildDisplayName,
  formatPhoneLine,
  paletteIndexFromString,
  todayYmd,
  type MemberDocument,
  type MemberRole,
} from "@/lib/models/member";
import {
  approvePendingMember,
  countMembersByStatus,
  deleteMemberById,
  findMemberById,
  findMemberByMemberId,
  findMemberByEmail,
  findMembersByStatus,
  insertActiveMember,
  insertMember,
  updateMemberById,
  getAssignedRoles as getAssignedRolesFromDb,
  checkExistingCredentials,
} from "@/lib/repositories/memberRepository";
import { deleteMemberAuthAccountByEmail } from "@/lib/repositories/userRepository";
import type { AdminMemberFields, JoinFields } from "@/lib/validators/member";

export async function getAssignedRoles(clubId: string): Promise<MemberRole[]> {
  return await getAssignedRolesFromDb(clubId);
}

/** Mirrors UI `Member` from MemberDetailPanel (no financials from API). */
export interface MemberApiRecord {
  id: string;
  name: string;
  avatarUrl?: string;
  memberId: string;
  nic: string;
  address: string;
  phone: string;
  whatsapp: string;
  email?: string;
  role: MemberRole;
  paletteIdx: number;
  joinDate: string;
}

export interface PendingApprovalRow {
  id: string;
  initials: string;
  firstName: string;
  lastName: string;
  name: string;
  nic: string;
  email?: string;
  phoneCode: string;
  phone: string;
  whatsappCode: string;
  whatsapp: string;
  address: string;
  avatarUrl?: string;
  role: MemberRole;
  dateApplied: string;
}

function initialsFromNames(firstName: string, lastName: string): string {
  const f = firstName.trim();
  const l = lastName.trim();
  const firstChar = f ? f[0].toUpperCase() : "";
  const secondChar = l ? l[0].toUpperCase() : "";
  const result = firstChar + secondChar;
  return result || "?";
}

function documentToMemberApi(doc: MemberDocument): MemberApiRecord | null {
  if (doc.status !== "active" || !doc.memberId) return null;
  return {
    id: doc._id.toHexString(),
    name: buildDisplayName(doc),
    avatarUrl: doc.avatarUrl,
    memberId: doc.memberId,
    nic: doc.nic,
    address: doc.address,
    phone: formatPhoneLine(doc.phoneCode, doc.phone),
    whatsapp: formatPhoneLine(doc.whatsappCode, doc.whatsapp),
    email: doc.email || undefined,
    role: doc.role ?? "Member",
    paletteIdx: doc.paletteIdx,
    joinDate: doc.joinDate ?? todayYmd(),
  };
}

function pendingToRow(doc: MemberDocument): PendingApprovalRow {
  const name = buildDisplayName(doc);
  const y = doc.appliedAt.getFullYear();
  const m = String(doc.appliedAt.getMonth() + 1).padStart(2, "0");
  const d = String(doc.appliedAt.getDate()).padStart(2, "0");
  return {
    id: doc._id.toHexString(),
    initials: initialsFromNames(doc.firstName, doc.lastName),
    firstName: doc.firstName,
    lastName: doc.lastName,
    name,
    nic: doc.nic,
    email: doc.email || undefined,
    phoneCode: doc.phoneCode,
    phone: doc.phone,
    whatsappCode: doc.whatsappCode,
    whatsapp: doc.whatsapp,
    address: doc.address,
    avatarUrl: doc.avatarUrl,
    role: doc.role ?? "Member",
    dateApplied: `${y}-${m}-${d}`,
  };
}

export async function listActiveMembersApi(clubId: string): Promise<MemberApiRecord[]> {
  const docs = await findMembersByStatus(clubId, "active");
  return docs.map(documentToMemberApi).filter((x): x is MemberApiRecord => x !== null);
}

export async function listPendingApprovals(clubId: string): Promise<PendingApprovalRow[]> {
  const docs = await findMembersByStatus(clubId, "pending");
  return docs.map(pendingToRow);
}

export async function getDashboardStats(clubId: string): Promise<{
  totalMembers: number;
  pendingApprovals: number;
}> {
  const [totalMembers, pendingApprovals] = await Promise.all([
    countMembersByStatus(clubId, "active"),
    countMembersByStatus(clubId, "pending"),
  ]);
  return { totalMembers, pendingApprovals };
}

export async function createPendingFromJoin(
  clubId: string,
  fields: JoinFields,
  avatarDataUrl?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Check for existing credentials before proceeding
  const duplicates = await checkExistingCredentials(clubId, fields.nic, fields.email, fields.phone);
  if (duplicates.email) return { ok: false, error: "This email is already registered." };
  if (duplicates.nic) return { ok: false, error: "This NIC is already registered." };
  if (duplicates.phone) return { ok: false, error: "This phone number is already registered." };

  const now = new Date();
  const nameKey = `${fields.initials}|${fields.firstName}|${fields.lastName}|${now.getTime()}`;
  const doc: Omit<MemberDocument, "_id" | "clubId"> = {
    status: "pending",
    initials: fields.initials,
    firstName: fields.firstName,
    lastName: fields.lastName,
    nic: fields.nic,
    email: fields.email,
    phoneCode: fields.phoneCode,
    phone: fields.phone,
    whatsappCode: fields.whatsappCode,
    whatsapp: fields.whatsapp,
    address: fields.address,
    paletteIdx: paletteIndexFromString(nameKey),
    appliedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  const insertedId = await insertMember(clubId, doc);

  // Trigger notification for admins
  try {
    const { createNotification } = await import("@/lib/services/notificationService");
    await createNotification(
      clubId,
      "new_applicant",
      "New Membership Application",
      `${fields.firstName} ${fields.lastName} has applied to join.`,
      { applicantId: insertedId.toHexString() },
    );
  } catch (err) {
    console.error("[createPendingFromJoin] Failed to create notification:", err);
  }

  return { ok: true };
}

export async function createActiveMember(
  clubId: string,
  fields: AdminMemberFields,
  avatarDataUrl?: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const now = new Date();
  const nameKey = `${fields.initials}|${fields.firstName}|${fields.lastName}|${now.getTime()}`;
  const base: Omit<
    MemberDocument,
    "_id" | "clubId" | "status" | "memberId" | "appliedAt" | "createdAt" | "updatedAt" | "joinDate"
  > & { role: MemberRole } = {
    initials: fields.initials,
    firstName: fields.firstName,
    lastName: fields.lastName,
    nic: fields.nic,
    email: fields.email,
    phoneCode: fields.phoneCode,
    phone: fields.phone,
    whatsappCode: fields.whatsappCode,
    whatsapp: fields.whatsapp,
    address: fields.address,
    role: fields.role,
    paletteIdx: paletteIndexFromString(nameKey),
  };
  if (avatarDataUrl) (base as any).avatarUrl = avatarDataUrl;
  const id = await insertActiveMember(clubId, {
    ...base,
    joinDate: todayYmd(),
  });
  return { ok: true, id: id.toHexString() };
}

export async function updateActiveMember(
  clubId: string,
  id: string,
  fields: AdminMemberFields,
  avatarDataUrl?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await findMemberById(clubId, id);
  if (!existing || existing.status !== "active") {
    return { ok: false, error: "Member not found" };
  }
  const nameKey = `${fields.initials}|${fields.firstName}|${fields.lastName}|${existing._id.toHexString()}`;
  const patch: Parameters<typeof updateMemberById>[2] = {
    initials: fields.initials,
    firstName: fields.firstName,
    lastName: fields.lastName,
    nic: fields.nic,
    email: fields.email,
    phoneCode: fields.phoneCode,
    phone: fields.phone,
    whatsappCode: fields.whatsappCode,
    whatsapp: fields.whatsapp,
    address: fields.address,
    role: fields.role,
    paletteIdx: paletteIndexFromString(nameKey),
    updatedAt: new Date(),
  };
  let unsetAvatarUrl = false;
  if (avatarDataUrl !== undefined) {
    if (avatarDataUrl === null || avatarDataUrl === "") {
      unsetAvatarUrl = true;
    } else {
      patch.avatarUrl = avatarDataUrl;
    }
  }
  const out = await updateMemberById(clubId, id, patch, { unsetAvatarUrl });
  if (!out) return { ok: false, error: "Member not found" };
  return { ok: true };
}

export async function removeMember(clubId: string, id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const member = await findMemberById(clubId, id);
  if (!member) return { ok: false, error: "Not found" };

  const ok = await deleteMemberById(clubId, id);
  if (!ok) return { ok: false, error: "Failed to delete member" };

  if (member.email) {
    try {
      await deleteMemberAuthAccountByEmail(member.email);
    } catch (e) {
      console.error("[removeMember] Failed to delete auth account for:", member.email, e);
    }
  }

  return { ok: true };
}

export async function approveMember(
  clubId: string,
  id: string,
  role?: MemberRole,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const doc = await approvePendingMember(clubId, id, role);
  if (!doc) return { ok: false, error: "Pending application not found" };
  return { ok: true };
}

export async function getMemberApiById(clubId: string, id: string): Promise<MemberApiRecord | null> {
  const doc = await findMemberById(clubId, id);
  if (!doc || doc.status !== "active") return null;
  return documentToMemberApi(doc);
}

export async function getMemberApiByMemberId(clubId: string, memberId: string): Promise<MemberApiRecord | null> {
  const doc = await findMemberByMemberId(clubId, memberId);
  if (!doc) return null;
  return documentToMemberApi(doc);
}

export async function getMemberApiByEmail(clubId: string, email: string): Promise<MemberApiRecord | null> {
  const doc = await findMemberByEmail(clubId, email);
  if (!doc) return null;
  return documentToMemberApi(doc);
}
