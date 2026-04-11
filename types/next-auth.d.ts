import type { DefaultSession } from "next-auth";
import type { UserRole }       from "@/lib/models/user";

declare module "next-auth" {
  interface Session {
    user: {
      role:      UserRole;
      memberId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role:      UserRole;
    memberId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role:      UserRole;
    memberId?: string;
  }
}
