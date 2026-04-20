import "server-only";

import * as crypto from "node:crypto";
import { DB_NAME } from "@/lib/models/member";
import { getDb } from "@/lib/db/mongodb";

export const SETTINGS_COLLECTION = "settings";

// ─── Public interface (safe to send to client) ────────────────────────────────

export interface ClubSettings {
  senderEmail:         string;   // verified "From" address
  senderEmailPending?: string;  // awaiting email verification
  senderName:          string;   // "From" display name
  newMemberAlerts:     boolean;
  welcomeTemplate:     string;
  welcomeSubject:      string;
  paymentReminders:    boolean;  // future
  weeklyDigest:        boolean;  // future

  // General Profile
  clubName:            string;
  tagline:             string;
  publicEmail:         string;
  phoneNumber:         string;
  headquarters:        string;
  memberIdPrefix:      string;
}

// ─── Internal DB document (includes private token fields) ────────────────────

export interface SettingsDoc extends ClubSettings {
  _id: string;
  verificationToken?:       string;
  verificationTokenExpiry?: Date;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: ClubSettings = {
  senderEmail:        "",
  senderEmailPending: undefined,
  senderName:         "Organisation Administrator",
  newMemberAlerts:    true,
  welcomeTemplate:    `Hi {{first_name}},\n\nWelcome to our club! Your membership application has been approved.\n\nYour Member ID is: {{member_id}}\n\nWe're excited to have you on board.\n\nBest regards,\nThe Team`,
  welcomeSubject:     "Welcome to the Club! 🎉",
  paymentReminders:   false,
  weeklyDigest:       true,

  clubName:           "My Youth Club",
  tagline:            "",
  publicEmail:        "",
  phoneNumber:        "",
  headquarters:       "",
  memberIdPrefix:     "M",
};

// ─── Collection helpers ───────────────────────────────────────────────────────

async function getCollection() {
  const db = await getDb(DB_NAME);
  return db.collection<SettingsDoc>(SETTINGS_COLLECTION);
}

function docToSettings(doc: SettingsDoc): ClubSettings {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, verificationToken, verificationTokenExpiry, ...rest } = doc;
  return { ...DEFAULT_SETTINGS, ...rest };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getSettings(clubId: string): Promise<ClubSettings> {
  const coll = await getCollection();
  const doc  = await coll.findOne({ _id: clubId });
  if (!doc) return { ...DEFAULT_SETTINGS };
  return docToSettings(doc);
}

export async function saveSettings(clubId: string, patch: Partial<ClubSettings>): Promise<ClubSettings> {
  const coll = await getCollection();
  await coll.updateOne(
    { _id: clubId },
    { $set: patch },
    { upsert: true },
  );
  return getSettings(clubId);
}

/**
 * Stores the pending email + a verification token in the DB.
 * Returns the token so the caller can include it in the verification link.
 */
export async function createVerificationToken(clubId: string, email: string): Promise<string> {
  const token  = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now

  const coll = await getCollection();
  await coll.updateOne(
    { _id: clubId },
    {
      $set: {
        senderEmailPending:      email,
        verificationToken:       token,
        verificationTokenExpiry: expiry,
      },
    },
    { upsert: true },
  );
  return token;
}

/**
 * Validates the token. If valid, promotes the pending email to active.
 * Returns `{ ok: true }` or `{ ok: false, reason: string }`.
 */
export async function consumeVerificationToken(
  clubId: string,
  token: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const coll = await getCollection();
  const doc  = await coll.findOne({ _id: clubId });

  if (!doc?.verificationToken) {
    return { ok: false, reason: "No pending verification found." };
  }
  if (doc.verificationToken !== token) {
    return { ok: false, reason: "Invalid verification link." };
  }
  if (doc.verificationTokenExpiry && doc.verificationTokenExpiry < new Date()) {
    return { ok: false, reason: "Verification link has expired. Please request a new one." };
  }

  const verifiedEmail = doc.senderEmailPending ?? "";

  await coll.updateOne(
    { _id: clubId },
    {
      $set:   { senderEmail: verifiedEmail },
      $unset: {
        senderEmailPending:      "",
        verificationToken:       "",
        verificationTokenExpiry: "",
      },
    },
  );

  return { ok: true };
}

/**
 * Removes the verified sender email (and any pending state).
 */
export async function removeSenderEmail(clubId: string): Promise<ClubSettings> {
  const coll = await getCollection();
  await coll.updateOne(
    { _id: clubId },
    {
      $set:   { senderEmail: "" },
      $unset: {
        senderEmailPending:      "",
        verificationToken:       "",
        verificationTokenExpiry: "",
      },
    },
    { upsert: true },
  );
  return getSettings(clubId);
}

/**
 * Cancels a pending verification without affecting the current active email.
 */
export async function cancelPendingVerification(clubId: string): Promise<ClubSettings> {
  const coll = await getCollection();
  await coll.updateOne(
    { _id: clubId },
    {
      $unset: {
        senderEmailPending:      "",
        verificationToken:       "",
        verificationTokenExpiry: "",
      },
    },
    { upsert: true },
  );
  return getSettings(clubId);
}
