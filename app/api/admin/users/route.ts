import { NextResponse, type NextRequest } from "next/server";
import { auth }                          from "@/auth";
import {
  listAdminUsers,
  createAdminUser,
  deleteUserById,
  findUserById,
} from "@/lib/services/userService";
import { patchUserById } from "@/lib/repositories/userRepository";
import type { UserRole } from "@/lib/models/user";

// ─── GET /api/admin/users — list all admin accounts ──────────────────────────
export async function GET() {
  const session = await auth();
  const clubId = (session?.user as any)?.clubId;
  if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session?.user?.role || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await listAdminUsers(clubId);
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
  const clubId = (session?.user as any)?.clubId;
  if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session?.user?.role || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role as string)) {
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
    if (!["SUPER_ADMIN", "ADMIN", "SECRETARY", "TREASURER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const id = await createAdminUser(clubId, email, name, role, password);
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// ─── DELETE /api/admin/users?id=xxx — revoke admin access ────────────────────
export async function DELETE(request: NextRequest) {
  const session = await auth();
  const clubId = (session?.user as any)?.clubId;
  if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session?.user?.role || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Prevent self-deletion
  const selfId = (session.user as { id?: string }).id;
  if (selfId && id === selfId) {
    return NextResponse.json({ error: "You cannot revoke your own access." }, { status: 400 });
  }

  const target = await findUserById(clubId, id);
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (session.user.role === "ADMIN" && ["SUPER_ADMIN", "ADMIN"].includes(target.role)) {
    return NextResponse.json({ error: "You do not have permission to remove this admin." }, { status: 403 });
  }

  await deleteUserById(clubId, id);
  return NextResponse.json({ ok: true });
}

// ─── PATCH /api/admin/users — change a user's role ───────────────────────────
export async function PATCH(request: NextRequest) {
  const session = await auth();
  const clubId = (session?.user as any)?.clubId;
  if (!clubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session?.user?.role || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, role } = await request.json() as { id: string; role: string };
    if (!id || !role) return NextResponse.json({ error: "Missing id or role." }, { status: 400 });
    if (!["SUPER_ADMIN", "ADMIN", "SECRETARY", "TREASURER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const target = await findUserById(clubId, id);
    if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

    // Prevent self-role-change
    const selfId = (session.user as { id?: string }).id;
    if (selfId && id === selfId) {
      return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
    }

    // ADMIN cannot change ADMIN or SUPER_ADMIN roles
    if (session.user.role === "ADMIN" && ["SUPER_ADMIN", "ADMIN"].includes(target.role)) {
      return NextResponse.json({ error: "You do not have permission to change this user's role." }, { status: 403 });
    }

    await patchUserById(clubId, id, { role: role as UserRole });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
