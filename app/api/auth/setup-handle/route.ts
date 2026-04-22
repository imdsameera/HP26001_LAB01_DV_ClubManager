import { NextResponse } from "next/server";
import { setupExistingClub } from "@/lib/services/registrationService";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.clubId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clubName, handle, tagline, headquarters, publicEmail, phoneNumber } = await req.json();

    if (!clubName || !handle) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    await setupExistingClub({
      userId:       session.user.id,
      clubId:       session.user.clubId,
      clubName,
      handle,
      tagline,
      headquarters,
      publicEmail,
      phoneNumber
    });

    return NextResponse.json({ 
      ok: true, 
      slug: handle.toLowerCase().replace(/[^a-z0-9-]+/g, ""),
      message: "Club established successfully!" 
    });
  } catch (error) {
    console.error("Setup handle error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
