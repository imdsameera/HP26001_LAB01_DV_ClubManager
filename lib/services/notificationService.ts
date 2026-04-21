import "server-only";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { DB_NAME } from "@/lib/models/member";
import {
  NOTIFICATIONS_COLLECTION,
  type NotificationDocument,
  type NotificationType,
} from "@/lib/models/notification";

async function getCollection() {
  const db = await getDb(DB_NAME);
  return db.collection<NotificationDocument>(NOTIFICATIONS_COLLECTION);
}

export async function createNotification(
  clubId:   string,
  type:     NotificationType,
  title:    string,
  message:  string,
  metadata?: Record<string, string>,
): Promise<string> {
  const coll = await getCollection();
  const doc: Omit<NotificationDocument, "_id"> = {
    clubId,
    type,
    title,
    message,
    metadata,
    read:      false,
    createdAt: new Date(),
  };
  const res = await coll.insertOne(doc as NotificationDocument);
  const id = res.insertedId.toHexString();
  console.log(`[NotificationService] Created notification ${id} for club ${clubId} (Type: ${type})`);
  return id;
}

export async function listNotifications(
  clubId: string,
  limit = 20,
): Promise<NotificationDocument[]> {
  const coll = await getCollection();
  return await coll
    .find({ clubId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function markNotificationAsRead(
  clubId: string,
  notificationId: string,
): Promise<boolean> {
  const coll = await getCollection();
  const res = await coll.updateOne(
    { _id: new ObjectId(notificationId), clubId },
    { $set: { read: true } },
  );
  return res.modifiedCount > 0;
}

export async function markAllAsRead(clubId: string): Promise<number> {
  const coll = await getCollection();
  const res = await coll.updateMany(
    { clubId, read: false },
    { $set: { read: true } },
  );
  return res.modifiedCount;
}
