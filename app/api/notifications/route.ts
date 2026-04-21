import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  listNotifications,
  markAllAsRead,
  markNotificationAsRead,
} from "@/lib/services/notificationService";

export async function GET() {
  const session = await auth();
  const clubId = session?.user?.clubId;

  if (!clubId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await listNotifications(clubId);
    return NextResponse.json({ notifications });
  } catch (e) {
    console.error("[API Notifications GET]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  const clubId = session?.user?.clubId;

  if (!clubId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, all } = await request.json();

    if (all) {
      const count = await markAllAsRead(clubId);
      return NextResponse.json({ ok: true, count });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });
    }

    const ok = await markNotificationAsRead(clubId, id);
    return NextResponse.json({ ok });
  } catch (e) {
    console.error("[API Notifications PATCH]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
