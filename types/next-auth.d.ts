import { UserRole } from "@/lib/models/user";
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      role:     UserRole;
      memberId?: string;
      clubId?:   string;
      status?:   string;
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role:     UserRole;
    memberId?: string;
    clubId?:   string;
    status?:   string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?:     UserRole;
    memberId?: string;
    clubId?:   string;
    status?:   string;
  }
}
