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
import {
  COUNTERS_COLLECTION,
  DB_NAME,
  MEMBER_ID_PREFIX,
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

async function nextMemberIdString(): Promise<string> {
  const db = await getDb(DB_NAME);
  const counters = db.collection<{ _id: string; seq: number }>(COUNTERS_COLLECTION);
  const out = await counters.findOneAndUpdate(
    { _id: "memberSeq" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  const seq = out?.seq ?? 1;
  return `${MEMBER_ID_PREFIX}${String(seq).padStart(3, "0")}`;
}

export async function insertMember(
  doc: OptionalUnlessRequiredId<Omit<MemberDocument, "_id">>,
): Promise<ObjectId> {
  const coll = await getColl();
  const { insertedId } = await coll.insertOne(doc as OptionalUnlessRequiredId<MemberDocument>);
  return insertedId;
}

export async function findMemberById(id: string): Promise<MemberDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  const coll = await getColl();
  return coll.findOne({ _id: new ObjectId(id) });
}

export async function findMembersByStatus(status: MemberStatus): Promise<MemberDocument[]> {
  const coll = await getColl();
  const sort: Sort = status === "pending" ? { appliedAt: -1 } : { joinDate: -1 };
  return coll.find({ status }).sort(sort).toArray();
}

export async function countMembersByStatus(status: MemberStatus): Promise<number> {
  const coll = await getColl();
  return coll.countDocuments({ status });
}

export async function deleteMemberById(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const coll = await getColl();
  const r = await coll.deleteOne({ _id: new ObjectId(id) });
  return r.deletedCount === 1;
}

export async function updateMemberById(
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
  base: Omit<
    MemberDocument,
    "_id" | "status" | "memberId" | "appliedAt" | "createdAt" | "updatedAt" | "joinDate"
  > & { role: MemberRole; joinDate: string },
): Promise<ObjectId> {
  const coll = await getColl();
  const memberId = await nextMemberIdString();
  const now = new Date();
  const doc: Omit<MemberDocument, "_id"> = {
    ...base,
    status: "active",
    memberId,
    appliedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await coll.insertOne(doc as OptionalUnlessRequiredId<MemberDocument>);
  return insertedId;
}

export async function approvePendingMember(id: string): Promise<MemberDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  const coll = await getColl();
  const oid = new ObjectId(id);
  const pending = await coll.findOne({ _id: oid, status: "pending" });
  if (!pending) return null;

  const memberId = await nextMemberIdString();
  const now = new Date();
  const joinDate = pending.joinDate ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const update: UpdateFilter<MemberDocument> = {
    $set: {
      status: "active" as MemberStatus,
      memberId,
      role: (pending.role ?? "Member") as MemberRole,
      joinDate,
      updatedAt: now,
    },
  };

  const out = await coll.findOneAndUpdate({ _id: oid, status: "pending" }, update, {
    returnDocument: "after",
  });
  return out;
}
