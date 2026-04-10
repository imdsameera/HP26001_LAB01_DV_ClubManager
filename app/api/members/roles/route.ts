import { NextResponse } from "next/server";
import { getAssignedRoles } from "@/lib/services/memberService";

export async function GET() {
  try {
    const roles = await getAssignedRoles();
    return NextResponse.json({ roles });
  } catch (e) {
    console.error("Failed to get assigned roles", e);
    return NextResponse.json({ error: "Server error", roles: [] }, { status: 500 });
  }
}
