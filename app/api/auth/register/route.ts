import { NextResponse } from "next/server";
import { registerNewClub } from "@/lib/services/registrationService";

export async function POST(req: Request) {
  try {
    const { email, password, name, clubName, handle, tagline, headquarters, publicEmail, phoneNumber } = await req.json();

    if (!email || !password || !name || !clubName || !handle) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    await registerNewClub({ 
      email, 
      password, 
      name, 
      clubName, 
      handle, 
      tagline, 
      headquarters, 
      publicEmail, 
      phoneNumber 
    });

    const slug = handle.toLowerCase().replace(/[^a-z0-0-]+/g, "");
    return NextResponse.json({ ok: true, slug, message: "Registration successful. Launching dashboard..." });
  } catch (error) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
