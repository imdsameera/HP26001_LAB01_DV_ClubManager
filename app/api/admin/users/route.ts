import { NextResponse, type NextRequest } from "next/server";
import { auth }                          from "@/auth";
import {
  listAdminUsers,
  createAdminUser,
  deleteUserById,
} from "@/lib/services/userService";
import type { UserRole } from "@/lib/models/user";

// ─── GET /api/admin/users — list all admin accounts ──────────────────────────
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await listAdminUsers();
  return NextResponse.json({
    users: users.map(u => ({
      id:        u._id.toString(),
      email:     u.email,
      name:      u.name,
      role:      u.role,
      isActive:  u.isActive,
      createdAt: u.createdAt,
    })),
  });
}

// ─── POST /api/admin/users — create a new admin account ──────────────────────
export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, name, role, password } = await request.json() as {
      email:    string;
      name:     string;
      role:     Exclude<UserRole, "MEMBER">;
      password: string;
    };

    if (!email || !name || !role || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!["SUPER_ADMIN", "SECRETARY", "TREASURER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const id = await createAdminUser(email, name, role, password);
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// ─── DELETE /api/admin/users?id=xxx — revoke admin access ────────────────────
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Prevent self-deletion
  const selfId = (session.user as { id?: string }).id;
  if (selfId && id === selfId) {
    return NextResponse.json({ error: "You cannot revoke your own access." }, { status: 400 });
  }

  await deleteUserById(id);
  return NextResponse.json({ ok: true });
}
