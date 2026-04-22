import type { ObjectId } from "mongodb";

export const NOTIFICATIONS_COLLECTION = "notifications";

export type NotificationType = "new_applicant" | "system" | "finance";

export interface NotificationDocument {
  _id: ObjectId;
  /** ID of the club this notification belongs to */
  clubId: string;
  /** Type of notification (for icon/routing logic) */
  type: NotificationType;
  title: string;
  message: string;
  /** Key-value pairs for deep linking or extra data */
  metadata?: Record<string, string>;
  /** Whether the notification has been read by someone in the club */
  read: boolean;
  createdAt: Date;
}
