import NextAuth          from "next-auth";
import { authConfig }     from "@/auth.config";
import { NextResponse }   from "next/server";

const { auth } = NextAuth(authConfig);

const ADMIN_ROLES = ["SUPER_ADMIN", "SECRETARY", "TREASURER"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as { role?: string } | undefined)?.role ?? null;

  // ── Public routes — always accessible ───────────────────────────────────────
  const isPublic =
    pathname === "/login"          ||
    pathname.startsWith("/join")   ||
    pathname.startsWith("/verify-email");

  if (isPublic) {
    // Already authenticated → redirect away from login
    if (role && pathname === "/login") {
      const dest = role === "MEMBER" ? "/portal" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // ── Not authenticated → redirect to login ────────────────────────────────────
  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── MEMBER trying to access admin area ────────────────────────────────────────
  if (role === "MEMBER" && !pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  // ── Admin trying to access member portal ──────────────────────────────────────
  if (ADMIN_ROLES.includes(role) && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ── Route-level RBAC ──────────────────────────────────────────────────────────

  // Settings — SUPER_ADMIN only
  if (pathname.startsWith("/settings") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Finance — SUPER_ADMIN or TREASURER
  if (
    pathname.startsWith("/finance") &&
    role !== "SUPER_ADMIN" && role !== "TREASURER"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Members / Events — SUPER_ADMIN or SECRETARY
  if (
    (pathname.startsWith("/members") || pathname.startsWith("/events")) &&
    role !== "SUPER_ADMIN" && role !== "SECRETARY"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except Next.js internals, static files, and the NextAuth API
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
