import type { ObjectId } from "mongodb";

export const USERS_COLLECTION = "users";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SECRETARY" | "TREASURER" | "MEMBER";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Admin",
  SECRETARY:   "Secretary",
  TREASURER:   "Treasurer",
  MEMBER:      "Member",
};

export interface UserDocument {
  _id:           ObjectId;
  email:         string;
  name:          string;
  passwordHash:  string;
  role:          UserRole;
  /** HYKE-XXXX club member ID — only for MEMBER role */
  memberId?:     string;
  /** MongoDB ObjectId string of the linked member document */
  memberDocId?:  string;
  /** Base64 data URL or external URL for the user avatar */
  avatarUrl?:    string | null;
  isActive:      boolean;
  createdAt:     Date;
  updatedAt:     Date;
}
