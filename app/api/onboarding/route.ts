import { NextResponse } from "next/server";
import { auth }         from "@/auth";
import { getDb }        from "@/lib/db/mongodb";
import { DB_NAME }      from "@/lib/models/member";
import { USERS_COLLECTION } from "@/lib/models/user";
import { CLUBS_COLLECTION } from "@/lib/models/club";
import { SETTINGS_COLLECTION, type SettingsDoc } from "@/lib/services/settingsService";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { club, user } = await req.json();
    const db = await getDb(DB_NAME);
    const now = new Date();

    // 1. Get current user
    const userColl = db.collection(USERS_COLLECTION);
    const currentUser = await userColl.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const clubId = currentUser.clubId;

    // 2. Update Club details
    const clubColl = db.collection(CLUBS_COLLECTION);
    await clubColl.updateOne(
      { _id: new ObjectId(clubId) },
      { 
        $set: { 
          name:         club.name.trim(), 
          isOnboarded:  true,
          updatedAt:    now 
        } 
      }
    );

    // 3. Update User details & Status
    await userColl.updateOne(
      { _id: currentUser._id },
      { 
        $set: { 
          name:      user.name.trim(),
          avatarUrl: user.avatarUrl || null,
          status:    "active",
          updatedAt: now 
        } 
      }
    );

    // 4. Update Club Settings
    const settingsColl = db.collection<SettingsDoc>(SETTINGS_COLLECTION);
    await settingsColl.updateOne(
      { _id: clubId },
      { 
        $set: { 
          clubName:     club.name.trim(),
          tagline:      club.tagline?.trim() || "",
          headquarters: club.headquarters?.trim() || "",
          publicEmail:  club.publicEmail?.trim() || "",
          phoneNumber:  club.phoneNumber?.trim() || "",
          senderName:   club.name.trim(),
        } 
      }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
