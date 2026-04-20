import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDashboardStats } from "@/lib/services/memberService";

export async function GET() {
  try {
    const session = await auth();
    const clubId = (session?.user as any)?.clubId;
    if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stats = await getDashboardStats(clubId);
    return NextResponse.json(stats);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
