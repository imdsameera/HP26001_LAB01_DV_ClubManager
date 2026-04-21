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
  /** M001 club member ID — only for MEMBER role */
  memberId?:     string;
  /** MongoDB ObjectId string of the linked member document */
  memberDocId?:  string;
  /** ID of the club this user belongs to */
  clubId:        string;
  /** Base64 data URL or external URL for the user avatar */
  avatarUrl?:    string | null;
  /** active: can access dashboard, onboarding: must complete setup */
  status:        "active" | "onboarding";
  isActive:      boolean;
  createdAt:     Date;
  updatedAt:     Date;
}
