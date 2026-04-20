import { NextResponse } from "next/server";
import { registerNewClub } from "@/lib/services/registrationService";

export async function POST(req: Request) {
  try {
    const { email, password, name, clubName } = await req.json();

    if (!email || !password || !name || !clubName) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    await registerNewClub({ email, password, name, clubName });

    return NextResponse.json({ ok: true, message: "Registration successful. Please log in." });
  } catch (error) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
