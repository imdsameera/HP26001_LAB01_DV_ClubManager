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

export async function findClubById(id: string): Promise<ClubDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  const c = await col();
  return c.findOne({ _id: new ObjectId(id) });
}

export async function findClubBySlug(slug: string): Promise<ClubDocument | null> {
  const c = await col();
  return c.findOne({ slug: slug.toLowerCase().trim() });
}

export async function updateClubSlug(clubId: string, slug: string): Promise<{ ok: boolean; error?: string }> {
  const c = await col();
  const cleanedSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  
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
