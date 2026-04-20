import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db/mongodb";
import { DB_NAME, MEMBERS_COLLECTION, COUNTERS_COLLECTION } from "@/lib/models/member";
import { CLUBS_COLLECTION } from "@/lib/models/club";
import { USERS_COLLECTION } from "@/lib/models/user";
import { SETTINGS_COLLECTION } from "@/lib/services/settingsService";
import { ObjectId } from "mongodb";

export async function DELETE() {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    const clubId = (session?.user as any)?.clubId;
    const role = (session?.user as any)?.role;

    if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb(DB_NAME);

    // 1. Delete associated data if Super Admin
    if (role === "SUPER_ADMIN" && clubId) {
      // Delete Club
      await db.collection(CLUBS_COLLECTION).deleteOne({ _id: new ObjectId(clubId) });
      
      // Delete Members
      await db.collection(MEMBERS_COLLECTION).deleteMany({ clubId });
      
      // Delete Settings
      await db.collection(SETTINGS_COLLECTION).deleteOne({ _id: clubId });
      
      // Delete Counters
      await db.collection(COUNTERS_COLLECTION).deleteMany({ _id: { $regex: clubId } });
      
      // Delete other admins of this club
      await db.collection(USERS_COLLECTION).deleteMany({ clubId });
    } else {
      // Just delete this specific user
      await db.collection(USERS_COLLECTION).deleteOne({ email: userEmail });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[delete-account DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
