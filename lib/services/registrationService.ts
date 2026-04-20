import "server-only";

import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/mongodb";
import { DB_NAME } from "@/lib/models/member";
import { CLUBS_COLLECTION } from "@/lib/models/club";
import { USERS_COLLECTION } from "@/lib/models/user";
import { SETTINGS_COLLECTION, DEFAULT_SETTINGS, type SettingsDoc } from "@/lib/services/settingsService";
import type { ClubDocument } from "@/lib/models/club";
import type { UserDocument } from "@/lib/models/user";
import { ObjectId } from "mongodb";

const SALT_ROUNDS = 12;

export interface RegistrationData {
  email:    string;
  password: string;
  name:     string; // Admin's name
  clubName: string; // The club they are creating
}

/**
 * Perform atomic registration of a new SaaS tenant.
 * Creates: 1. Club, 2. User (Super Admin), 3. Club Settings.
 */
export async function registerNewClub(data: RegistrationData): Promise<{ userId: string; clubId: string }> {
  const db = await getDb(DB_NAME);
  const now = new Date();

  // 1. Check if email exists
  const userColl = db.collection<UserDocument>(USERS_COLLECTION);
  const existing = await userColl.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    throw new Error("This email is already registered.");
  }

  // 2. Create Club
  const clubColl = db.collection<ClubDocument>(CLUBS_COLLECTION);
  const clubId = new ObjectId();
  const slug = data.clubName
    .toLowerCase()
    .replace(/[^a-z0-0]+/g, ""); // Strictly alphanumeric, no spaces or hyphens

  const clubDoc: ClubDocument = {
    _id:          clubId,
    name:         data.clubName.trim(),
    slug:         slug || clubId.toString(),
    ownerId:      "", // Will update after user creation
    isOnboarded:  false,
    createdAt:    now,
    updatedAt:    now,
  };
  await clubColl.insertOne(clubDoc);

  // 3. Create User
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const userId = new ObjectId();
  
  const userDoc: UserDocument = {
    _id:           userId,
    email:         data.email.toLowerCase().trim(),
    name:          data.name.trim(),
    passwordHash,
    role:          "SUPER_ADMIN",
    clubId:        clubId.toString(),
    status:        "onboarding", // Forces them into onboarding flow
    isActive:      true,
    createdAt:     now,
    updatedAt:     now,
  };
  await userColl.insertOne(userDoc);

  // 4. Link Owner to Club
  await clubColl.updateOne({ _id: clubId }, { $set: { ownerId: userId.toString() } });

  // 5. Initialize Club Settings
  const settingsColl = db.collection<SettingsDoc>(SETTINGS_COLLECTION);
  await settingsColl.insertOne({
    _id:        clubId.toString(), // Tenant-specific settings ID
    ...DEFAULT_SETTINGS,
    clubName:   data.clubName.trim(),
    senderName: data.clubName.trim(),
  });

  return { 
    userId: userId.toString(), 
    clubId: clubId.toString() 
  };
}
