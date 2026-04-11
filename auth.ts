/**
 * auth.ts — Full NextAuth configuration (Node.js runtime only).
 *
 * Extends auth.config.ts and adds the Credentials provider
 * which requires bcryptjs (a Node.js module).
 *
 * DO NOT import this file in middleware.ts.
 */
import NextAuth       from "next-auth";
import Credentials    from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { authenticateUser } from "@/lib/services/userService";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        return authenticateUser(
          credentials.email    as string,
          credentials.password as string,
        );
      },
    }),
  ],
});
