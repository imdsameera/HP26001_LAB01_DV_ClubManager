/**
 * Seed script — creates the initial SUPER_ADMIN user.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * Or with ts-node:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-admin.ts
 */

import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { loadEnvConfig } from "@next/env";
import * as path   from "path";
 
 // Load environment variables via Next.js utility
 loadEnvConfig(process.cwd());

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME   = "club-management-dev";
const COLL      = "users";

// ── Default credentials (change these!) ──────────────────────────────────────
const ADMIN_EMAIL    = "admin@hyke.lk";
const ADMIN_NAME     = "Super Admin";
const ADMIN_PASSWORD = "Admin@123";   // ← Change after first login!

async function seed() {
  if (!MONGO_URI) {
    console.error("❌  MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db   = client.db(DB_NAME);
    const coll = db.collection(COLL);

    const existing = await coll.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`✅  Super Admin already exists: ${ADMIN_EMAIL}`);
      return;
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await coll.insertOne({
      email:        ADMIN_EMAIL,
      name:         ADMIN_NAME,
      passwordHash: hash,
      role:         "SUPER_ADMIN",
      isActive:     true,
      createdAt:    new Date(),
      updatedAt:    new Date(),
    });

    console.log("✅  Super Admin created successfully!");
    console.log("   Email:    ", ADMIN_EMAIL);
    console.log("   Password: ", ADMIN_PASSWORD);
    console.log("   ⚠️  Change your password after first login!");
  } finally {
    await client.close();
  }
}

seed().catch(e => { console.error("Seed failed:", e); process.exit(1); });
