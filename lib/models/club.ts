import type { ObjectId } from "mongodb";

export const CLUBS_COLLECTION = "clubs";

export interface ClubDocument {
  _id:          ObjectId;
  name:         string;
  /** URL friendly identifier, e.g. "my-club" */
  slug:         string;
  /** MongoDB ObjectId string of the Super Admin owner */
  ownerId:      string;
  /** Whether the club has completed initial onboarding steps */
  isOnboarded:  boolean;
  createdAt:    Date;
  updatedAt:    Date;
}
