import type { ObjectId } from "mongodb";

export const USERS_COLLECTION = "users";

export type UserRole = "SUPER_ADMIN" | "SECRETARY" | "TREASURER" | "MEMBER";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
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
  isActive:      boolean;
  createdAt:     Date;
  updatedAt:     Date;
}
