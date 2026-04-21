import NextAuth          from "next-auth";
import { authConfig }     from "@/auth.config";
import { NextResponse }   from "next/server";

const { auth } = NextAuth(authConfig);


export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { role?: string; slug?: string; status?: string } | undefined;
  const role = user?.role ?? null;
  const slug = user?.slug ?? null;

  // ── Public routes — always accessible from root ─────────────────────────────────
  const isGlobalPublic =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/api/auth/signout") ||
    pathname === "/";

  // ── Club-specific public routes ──────────────────────────────────────────────
  // These are /[handle]/join etc.
  const pathSegments = pathname.split("/").filter(Boolean);
  const isJoin = pathSegments[1] === "join";
  const isPortal = pathSegments[1] === "portal";

  if (isGlobalPublic) {
    // Already authenticated → redirect away from login/register to their dashboard
    if (role && (pathname === "/login" || pathname === "/register")) {
      const isSetup = req.nextUrl.searchParams.get("setup") === "true";
      
      if (slug) {
        const dest = role === "MEMBER" ? `/${slug}/portal` : `/${slug}`;
        return NextResponse.redirect(new URL(dest, req.url));
      }

      if (pathname === "/login") {
        return NextResponse.next();
      }

      if (pathname === "/register" && isSetup) {
        return NextResponse.next();
      }

      return NextResponse.redirect(new URL("/register?setup=true", req.url));
    }
    return NextResponse.next();
  }

  // ── Not authenticated → redirect to login ────────────────────────────────────
  // We allow /[handle]/join to be accessed without login
  if (!role && !isJoin) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Handle Enforcement (Multi-tenancy) ─────────────────────────────────────────
  // Redirect /[handle]/dashboard to /[handle] (Convenience)
  if (pathSegments[1] === "dashboard") {
    return NextResponse.redirect(new URL(`/${pathSegments[0]}`, req.url));
  }

  // If user is logged in but has no slug, they must go to setup
  if (role && !slug && !isGlobalPublic && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/register?setup=true", req.url));
  }

  // ── Routing Enforcement ────────────────────────────────────────────────────────
  // If user is logged in, they should only access their own slug
  const urlHandle = pathSegments[0];
  if (role && urlHandle && !isGlobalPublic) {
     const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
     const normUrl   = normalize(urlHandle);
     const normSlug  = slug ? normalize(slug) : null;

     if (normSlug && normUrl !== normSlug) {
        // Only redirect if they are actually in the wrong club's workspace
        const newPath = pathname.replace(`/${urlHandle}`, `/${slug}`);
        return NextResponse.redirect(new URL(newPath, req.url));
     }
  }

  // ── Route-level RBAC ──────────────────────────────────────────────────────────
  // Note: pathSegments[0] is the slug, pathSegments[1] is the resource (dashboard, members, etc)
  const resource = pathSegments[1];

  if (resource === "settings" && role !== "SUPER_ADMIN" && role !== "ADMIN") {
    return NextResponse.redirect(new URL(`/${slug}`, req.url));
  }

  if (resource === "finance" && role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "TREASURER") {
    return NextResponse.redirect(new URL(`/${slug}`, req.url));
  }

  if ((resource === "members" || resource === "events") && role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "SECRETARY") {
    return NextResponse.redirect(new URL(`/${slug}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except Next.js internals, static files, and the NextAuth API
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
