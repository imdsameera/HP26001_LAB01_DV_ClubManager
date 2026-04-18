import "server-only";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { DB_NAME } from "@/lib/models/member";
import { USERS_COLLECTION } from "@/lib/models/user";
import type { UserDocument, UserRole } from "@/lib/models/user";

async function col() {
  const db = await getDb(DB_NAME);
  return db.collection<UserDocument>(USERS_COLLECTION);
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const c = await col();
  return c.findOne({ email: email.toLowerCase().trim() });
}

export async function findUserByIdentifier(identifier: string): Promise<UserDocument | null> {
  const c = await col();
  const searchStr = identifier.trim();
  if (searchStr.includes('@')) {
    return c.findOne({ email: searchStr.toLowerCase() });
  } else {
    // Use a case-insensitive regex for memberId matching
    return c.findOne({ memberId: { $regex: new RegExp(`^${searchStr}$`, 'i') } });
  }
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  const c = await col();
  return c.findOne({ _id: new ObjectId(id) });
}

export async function createUser(
  data: Omit<UserDocument, "_id" | "createdAt" | "updatedAt">,
): Promise<ObjectId> {
  const c   = await col();
  const now = new Date();
  const res = await c.insertOne({
    ...data,
    email:     data.email.toLowerCase().trim(),
    isActive:  data.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  } as UserDocument);
  return res.insertedId;
}

export async function updateUserPassword(email: string, newHash: string): Promise<void> {
  const c = await col();
  await c.updateOne(
    { email: email.toLowerCase().trim() },
    { $set: { passwordHash: newHash, updatedAt: new Date() } },
  );
}

export async function listAdminUsers(): Promise<UserDocument[]> {
  const c = await col();
  return c
    .find({ role: { $in: ["SUPER_ADMIN", "SECRETARY", "TREASURER"] as UserRole[] } })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function deleteUserById(id: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ _id: new ObjectId(id) });
}

export async function emailExists(email: string): Promise<boolean> {
  const c = await col();
  return !!(await c.findOne({ email: email.toLowerCase().trim() }, { projection: { _id: 1 } }));
}
