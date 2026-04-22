/**
 * auth.config.ts — Edge-compatible auth configuration.
 *
 * ⚠️  This file MUST NOT import any Node.js-only modules (bcryptjs, MongoDB, etc.)
 *    It is imported by middleware.ts which runs in the Edge runtime.
 *
 * The Credentials provider (which needs bcryptjs) is added in auth.ts.
 */
import type { NextAuthConfig } from "next-auth";
import type { UserRole }       from "@/lib/models/user";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as any;
        token.role     = u.role;
        token.memberId = u.memberId;
        token.clubId   = u.clubId;
        token.slug     = u.clubSlug;
        token.status   = u.status;
      }
      if (trigger === "update" && session) {
        if (session.name)   token.name   = session.name;
        if (session.status) token.status = session.status;
        if (session.slug)   token.slug   = session.slug;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id                           = token.sub; 
        (session.user as { role?: UserRole }).role         = token.role as UserRole;
        (session.user as { memberId?: string }).memberId   = token.memberId as string | undefined;
        (session.user as { clubId?: string }).clubId       = token.clubId as string | undefined;
        (session.user as { slug?: string }).slug           = token.slug as string | undefined;
        (session.user as { status?: string }).status       = token.status as string | undefined;
      }
      return session;
    },
  },

  // Providers are added in auth.ts (Node.js runtime only)
  providers: [],
};
