import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAssignedRoles } from "@/lib/services/memberService";

export async function GET() {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const roles = await getAssignedRoles(clubId);
    return NextResponse.json({ roles });
  } catch (e) {
    console.error("Failed to get assigned roles", e);
    return NextResponse.json({ error: "Server error", roles: [] }, { status: 500 });
  }
}
