import { NextResponse } from "next/server";
import { approveMember } from "@/lib/services/memberService";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    let role;
    try {
      const body = await _request.json();
      role = body?.role;
    } catch {
      // Ignored: empty or invalid JSON body
    }

    const result = await approveMember(id, role);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
