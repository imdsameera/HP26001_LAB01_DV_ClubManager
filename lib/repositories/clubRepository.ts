import "server-only";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { DB_NAME } from "@/lib/models/member";
import { CLUBS_COLLECTION } from "@/lib/models/club";
import type { ClubDocument } from "@/lib/models/club";

async function col() {
  const db = await getDb(DB_NAME);
  return db.collection<ClubDocument>(CLUBS_COLLECTION);
}

/** Ensure unique index on slug for multi-tenant routing */
export async function ensureClubIndexes() {
  const c = await col();
  await c.createIndex({ slug: 1 }, { unique: true, sparse: true });
}

export async function findClubById(id: string): Promise<ClubDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  const c = await col();
  return c.findOne({ _id: new ObjectId(id) });
}

export async function findClubBySlug(slug: string): Promise<ClubDocument | null> {
  const c = await col();
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Create a regex that allows optional hyphens between any characters
  // e.g. "hyketestclub" -> /^h-?y-?k-?e-?t-?e-?s-?t-?c-?l-?u-?b-?$/i
  const regexPattern = "^" + normalized.split("").join("-?") + "-?$";
  
  const club = await c.findOne({
    slug: { $regex: new RegExp(regexPattern, "i") }
  });
  
  return club;
}

export async function updateClubSlug(clubId: string, slug: string): Promise<{ ok: boolean; error?: string }> {
  const c = await col();
  const cleanedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  
  if (!cleanedSlug) return { ok: false, error: "Invalid handle." };

  // Check uniqueness
  const existing = await findClubBySlug(cleanedSlug);
  if (existing && existing._id.toHexString() !== clubId) {
    return { ok: false, error: "This handle is already taken." };
  }

  await c.updateOne(
    { _id: new ObjectId(clubId) },
    { $set: { slug: cleanedSlug, updatedAt: new Date() } }
  );

  return { ok: true };
}

export async function updateClubName(clubId: string, name: string): Promise<void> {
  const c = await col();
  await c.updateOne(
    { _id: new ObjectId(clubId) },
    { $set: { name: name.trim(), updatedAt: new Date() } }
  );
}
