import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/services/settingsService";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (e) {
    console.error("[settings GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await saveSettings(body);
    return NextResponse.json({ settings: updated });
  } catch (e) {
    console.error("[settings POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
