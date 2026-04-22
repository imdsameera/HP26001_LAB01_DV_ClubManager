import { NextResponse } from "next/server";
import { findClubBySlug } from "@/lib/repositories/clubRepository";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle")?.toLowerCase().trim();

  if (!handle) {
    return NextResponse.json({ available: false, error: "Handle is required" });
  }

  // Basic validation: alphanumeric and hyphens
  if (!/^[a-z0-9-]+$/.test(handle)) {
    return NextResponse.json({ available: false, error: "Invalid format. Use lowercase letters, numbers, and hyphens." });
  }

  try {
    const club = await findClubBySlug(handle);
    return NextResponse.json({ available: !club });
  } catch (error) {
    return NextResponse.json({ available: false, error: "Database error" }, { status: 500 });
  }
}
