import "server-only";

import type {
  Collection,
  Db,
  Filter,
  OptionalUnlessRequiredId,
  Sort,
  UpdateFilter,
} from "mongodb";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { getSettings } from "@/lib/services/settingsService";
import {
  COUNTERS_COLLECTION,
  DB_NAME,
  MEMBER_ID_PREFIX_DEFAULT,
  MEMBERS_COLLECTION,
  type MemberDocument,
  type MemberRole,
  type MemberStatus,
} from "@/lib/models/member";

let indexesEnsured = false;

async function membersCollection(db: Db): Promise<Collection<MemberDocument>> {
  return db.collection<MemberDocument>(MEMBERS_COLLECTION);
}

export async function ensureMemberIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const db = await getDb(DB_NAME);
  const coll = await membersCollection(db);
  await coll.createIndex({ status: 1 });
  await coll.createIndex({ appliedAt: -1 });
  await coll.createIndex(
    { memberId: 1 },
    { unique: true, sparse: true },
  );
  indexesEnsured = true;
}

async function getColl(): Promise<Collection<MemberDocument>> {
  await ensureMemberIndexes();
  const db = await getDb(DB_NAME);
  return membersCollection(db);
}

async function nextMemberIdString(clubId: string): Promise<string> {
  const settings = await getSettings(clubId);
  const prefix   = settings.memberIdPrefix || MEMBER_ID_PREFIX_DEFAULT;

  const db = await getDb(DB_NAME);
  const counters = db.collection<{ _id: string; seq: number }>(COUNTERS_COLLECTION);
  const out = await counters.findOneAndUpdate(
    { _id: `memberSeq_${clubId}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  const seq = out?.seq ?? 1;
  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export async function getCurrentSequence(clubId: string): Promise<number> {
  const db = await getDb(DB_NAME);
  const counters = db.collection<{ _id: string; seq: number }>(COUNTERS_COLLECTION);
  const doc = await counters.findOne({ _id: `memberSeq_${clubId}` });
  return doc?.seq ?? 0;
}

export async function insertMember(
  clubId: string,
  doc: OptionalUnlessRequiredId<Omit<MemberDocument, "_id" | "clubId">>,
): Promise<ObjectId> {
  const coll = await getColl();
  const fullDoc = { ...doc, clubId } as OptionalUnlessRequiredId<MemberDocument>;
  const { insertedId } = await coll.insertOne(fullDoc);
  return insertedId;
}

export async function findMemberById(clubId: string, id: string): Promise<MemberDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  const coll = await getColl();
  return coll.findOne({ _id: new ObjectId(id), clubId });
}

export async function findMembersByStatus(clubId: string, status: MemberStatus): Promise<MemberDocument[]> {
  const coll = await getColl();
  const sort: Sort = status === "pending" ? { appliedAt: -1 } : { joinDate: -1 };
  return coll.find({ status, clubId }).sort(sort).toArray();
}

export async function findMemberByMemberId(clubId: string, memberId: string): Promise<MemberDocument | null> {
  const coll = await getColl();
  return coll.findOne({ memberId, clubId, status: "active" });
}

export async function findMemberByEmail(clubId: string, email: string): Promise<MemberDocument | null> {
  const coll = await getColl();
  return coll.findOne({ 
    email: { $regex: new RegExp(`^${email.trim()}$`, "i") }, 
    clubId,
    status: "active" 
  });
}

export async function countMembersByStatus(clubId: string, status: MemberStatus): Promise<number> {
  const coll = await getColl();
  return coll.countDocuments({ status, clubId });
}

export async function deleteMemberById(clubId: string, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const coll = await getColl();
  const r = await coll.deleteOne({ _id: new ObjectId(id), clubId });
  return r.deletedCount === 1;
}

export async function updateMemberById(
  clubId: string,
  id: string,
  patch: Partial<
    Pick<
      MemberDocument,
      | "initials"
      | "firstName"
      | "lastName"
      | "nic"
      | "email"
      | "phoneCode"
      | "phone"
      | "whatsappCode"
      | "whatsapp"
      | "address"
      | "avatarUrl"
      | "role"
      | "paletteIdx"
      | "joinDate"
    >
  > & { updatedAt: Date },
  options?: { unsetAvatarUrl?: boolean },
): Promise<MemberDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  const coll = await getColl();
  const filter: Filter<MemberDocument> = {
    _id: new ObjectId(id),
    clubId,
    status: "active",
  };
  const setPayload = { ...patch };
  if (options?.unsetAvatarUrl) {
    delete setPayload.avatarUrl;
  }
  const update: UpdateFilter<MemberDocument> = { $set: setPayload };
  if (options?.unsetAvatarUrl) {
    update.$unset = { avatarUrl: "" };
  }
  const out = await coll.findOneAndUpdate(filter, update, { returnDocument: "after" });
  return out;
}

export async function insertActiveMember(
  clubId: string,
  base: Omit<
    MemberDocument,
    "_id" | "clubId" | "status" | "memberId" | "appliedAt" | "createdAt" | "updatedAt" | "joinDate"
  > & { role: MemberRole; joinDate: string },
): Promise<ObjectId> {
  const coll = await getColl();
  const memberId = await nextMemberIdString(clubId);
  const now = new Date();
  const doc: Omit<MemberDocument, "_id"> = {
    ...base,
    clubId,
    status: "active",
    memberId,
    appliedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await coll.insertOne(doc as OptionalUnlessRequiredId<MemberDocument>);
  return insertedId;
}

export async function approvePendingMember(clubId: string, id: string, role?: MemberRole): Promise<MemberDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  const coll = await getColl();
  const oid = new ObjectId(id);
  const pending = await coll.findOne({ _id: oid, clubId, status: "pending" });
  if (!pending) return null;

  const memberId = await nextMemberIdString(clubId);
  const now = new Date();
  const joinDate = pending.joinDate ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const update: UpdateFilter<MemberDocument> = {
    $set: {
      status: "active" as MemberStatus,
      memberId,
      role: role ?? (pending.role ?? "Member") as MemberRole,
      joinDate,
      updatedAt: now,
    },
  };

  const out = await coll.findOneAndUpdate({ _id: oid, clubId, status: "pending" }, update, {
    returnDocument: "after",
  });
  return out;
}

export async function getAssignedRoles(clubId: string): Promise<MemberRole[]> {
  const coll = await getColl();
  // Find distinct roles from active members, filter out 'Member'
  const roles = await coll.distinct("role", { status: "active", clubId }) as MemberRole[];
  return roles.filter(r => r && r !== "Member");
}

export async function checkExistingCredentials(
  clubId: string,
  nic?: string,
  email?: string,
  phone?: string
): Promise<{ nic?: boolean; email?: boolean; phone?: boolean }> {
  const coll = await getColl();
  const conditions = [];

  if (nic) conditions.push({ nic: { $regex: new RegExp(`^${nic.trim()}$`, "i") } });
  if (email) conditions.push({ email: { $regex: new RegExp(`^${email.trim()}$`, "i") } });
  if (phone) conditions.push({ phone: { $regex: new RegExp(`^${phone.trim()}$`, "i") } });

  if (conditions.length === 0) return {};

  const docs = await coll
    .find({
      clubId,
      status: { $in: ["active", "pending"] as MemberStatus[] },
      $or: conditions,
    })
    .project<{ nic?: string; email?: string; phone?: string }>({ nic: 1, email: 1, phone: 1 })
    .toArray();

  const result: { nic?: boolean; email?: boolean; phone?: boolean } = {};
  for (const doc of docs) {
    if (nic && doc.nic?.toLowerCase() === nic.toLowerCase().trim()) result.nic = true;
    if (email && doc.email?.toLowerCase() === email.toLowerCase().trim()) result.email = true;
    if (phone && doc.phone?.toLowerCase() === phone.toLowerCase().trim()) result.phone = true;
  }
  return result;
}
