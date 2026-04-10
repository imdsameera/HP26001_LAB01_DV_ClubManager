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
    jwt({ token, user }) {
      if (user) {
        token.role     = (user as { role: UserRole }).role;
        token.memberId = (user as { memberId?: string }).memberId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: UserRole }).role         = token.role as UserRole;
        (session.user as { memberId?: string }).memberId   = token.memberId as string | undefined;
      }
      return session;
    },
  },

  // Providers are added in auth.ts (Node.js runtime only)
  providers: [],
};
