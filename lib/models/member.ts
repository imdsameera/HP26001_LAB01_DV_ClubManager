import type { ObjectId } from "mongodb";

export const MEMBERS_COLLECTION = "members";
export const COUNTERS_COLLECTION = "counters";
export const MEMBER_ID_PREFIX = "HYKE-";
export const DB_NAME = "club-management-dev";

export type MemberStatus = "pending" | "active";

/** Stored role matches UI Role in MemberDetailPanel */
export type MemberRole =
  | "Member"
  | "President"
  | "Vice President"
  | "Secretary"
  | "Treasurer";

export interface MemberDocument {
  _id: ObjectId;
  status: MemberStatus;
  initials: string;
  firstName: string;
  lastName: string;
  nic: string;
  email: string;
  phoneCode: string;
  phone: string;
  whatsappCode: string;
  whatsapp: string;
  address: string;
  avatarUrl?: string;
  /** Present when status is active */
  memberId?: string;
  role?: MemberRole;
  paletteIdx: number;
  /** YYYY-MM-DD when active */
  joinDate?: string;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function buildDisplayName(doc: Pick<MemberDocument, "initials" | "firstName" | "lastName">): string {
  const parts = [doc.initials.trim(), doc.firstName.trim(), doc.lastName.trim()].filter(Boolean);
  return parts.join(" ").trim() || "Unknown";
}

export function formatPhoneLine(code: string, number: string): string {
  const c = code.trim();
  const n = number.trim();
  if (!n) return "";
  if (c && (c.startsWith("+") || c.length > 0)) {
    return `${c} ${n}`.trim();
  }
  return n;
}

export function paletteIndexFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 7;
}

export function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
