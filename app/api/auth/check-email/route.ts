import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/repositories/userRepository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ available: true });
    }

    const user = await findUserByEmail(email);
    
    // We consider it available if no user exists with this email
    return NextResponse.json({ available: !user });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json({ available: false, error: "Validation failed" }, { status: 500 });
  }
}
