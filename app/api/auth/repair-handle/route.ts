import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findClubById } from "@/lib/repositories/clubRepository";

/**
 * GET /api/auth/repair-handle
 * 
 * This endpoint checks if a logged-in user who is missing a "slug" in their session
 * actually already has an established club in the database.
 * If so, it returns the slug so the client can update the session.
 */
export async function GET() {
  try {
    const session = await auth();
    
    // User must be logged in and have a clubId assigned
    if (!session?.user?.id || !session?.user?.clubId) {
      return NextResponse.json({ error: "Unauthorized or no club assigned" }, { status: 401 });
    }

    // Fetch the club directly from the DB
    const club = await findClubById(session.user.clubId);

    if (!club || !club.slug || !club.isOnboarded) {
      return NextResponse.json({ 
        ok: false, 
        message: "No established club found for this user." 
      });
    }

    return NextResponse.json({ 
      ok: true, 
      slug: club.slug,
      clubName: club.name
    });
  } catch (error) {
    console.error("Repair handle error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
