import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSettings, saveSettings } from "@/lib/services/settingsService";
import { findClubById, updateClubSlug, updateClubName } from "@/lib/repositories/clubRepository";

export async function GET() {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await getSettings(clubId);
    const club = await findClubById(clubId);
    return NextResponse.json({ settings, handle: club?.slug });
  } catch (e) {
    console.error("[settings GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { handle, ...patch } = await request.json();

    // 1. Handle Slug (Handle) update if provided
    if (handle !== undefined) {
      const role = (session?.user as any)?.role;
      if (role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Only Super Admins can change the club handle." }, { status: 403 });
      }
      const slugRes = await updateClubSlug(clubId, handle);
      if (!slugRes.ok) {
        return NextResponse.json({ error: slugRes.error }, { status: 400 });
      }
    }

    // 2. Handle Club Name sync if changed in settings
    if (patch.clubName) {
      await updateClubName(clubId, patch.clubName);
    }

    // 3. Save other settings
    const updated = await saveSettings(clubId, patch);
    
    // Refresh club to get matching slug if changed
    const club = await findClubById(clubId);
    return NextResponse.json({ settings: updated, handle: club?.slug });
  } catch (e) {
    console.error("[settings POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
