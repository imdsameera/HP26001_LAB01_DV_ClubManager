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
  findMembersByStatus,
  insertActiveMember,
  insertMember,
  updateMemberById,
} from "@/lib/repositories/memberRepository";
import type { AdminMemberFields, JoinFields } from "@/lib/validators/member";

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
  name: string;
  dateApplied: string;
}

function initialsFromDisplayName(name: string): string {
  const str = name.trim();
  const tokens = str.split(/[\s.]+/).filter(Boolean);
  if (tokens.length === 0) return "?";
  if (tokens.length === 1) return tokens[0].substring(0, 2).toUpperCase();
  const first = tokens[0][0];
  const second = tokens[tokens.length - 1][0];
  return (first + (second || "")).toUpperCase() || "?";
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
    initials: initialsFromDisplayName(name),
    name,
    dateApplied: `${y}-${m}-${d}`,
  };
}

export async function listActiveMembersApi(): Promise<MemberApiRecord[]> {
  const docs = await findMembersByStatus("active");
  return docs.map(documentToMemberApi).filter((x): x is MemberApiRecord => x !== null);
}

export async function listPendingApprovals(): Promise<PendingApprovalRow[]> {
  const docs = await findMembersByStatus("pending");
  return docs.map(pendingToRow);
}

export async function getDashboardStats(): Promise<{
  totalMembers: number;
  pendingApprovals: number;
}> {
  const [totalMembers, pendingApprovals] = await Promise.all([
    countMembersByStatus("active"),
    countMembersByStatus("pending"),
  ]);
  return { totalMembers, pendingApprovals };
}

export async function createPendingFromJoin(
  fields: JoinFields,
  avatarDataUrl?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date();
  const nameKey = `${fields.initials}|${fields.firstName}|${fields.lastName}|${now.getTime()}`;
  const doc: Omit<MemberDocument, "_id"> = {
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
  if (avatarDataUrl) doc.avatarUrl = avatarDataUrl;
  await insertMember(doc);
  return { ok: true };
}

export async function createActiveMember(
  fields: AdminMemberFields,
  avatarDataUrl?: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const now = new Date();
  const nameKey = `${fields.initials}|${fields.firstName}|${fields.lastName}|${now.getTime()}`;
  const base: Omit<
    MemberDocument,
    "_id" | "status" | "memberId" | "appliedAt" | "createdAt" | "updatedAt" | "joinDate"
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
  if (avatarDataUrl) base.avatarUrl = avatarDataUrl;
  const id = await insertActiveMember({
    ...base,
    joinDate: todayYmd(),
  });
  return { ok: true, id: id.toHexString() };
}

export async function updateActiveMember(
  id: string,
  fields: AdminMemberFields,
  avatarDataUrl?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await findMemberById(id);
  if (!existing || existing.status !== "active") {
    return { ok: false, error: "Member not found" };
  }
  const nameKey = `${fields.initials}|${fields.firstName}|${fields.lastName}|${existing._id.toHexString()}`;
  const patch: Parameters<typeof updateMemberById>[1] = {
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
  const out = await updateMemberById(id, patch, { unsetAvatarUrl });
  if (!out) return { ok: false, error: "Member not found" };
  return { ok: true };
}

export async function removeMember(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const ok = await deleteMemberById(id);
  if (!ok) return { ok: false, error: "Not found" };
  return { ok: true };
}

export async function approveMember(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const doc = await approvePendingMember(id);
  if (!doc) return { ok: false, error: "Pending application not found" };
  return { ok: true };
}

export async function getMemberApiById(id: string): Promise<MemberApiRecord | null> {
  const doc = await findMemberById(id);
  if (!doc || doc.status !== "active") return null;
  return documentToMemberApi(doc);
}
