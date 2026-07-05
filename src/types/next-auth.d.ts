// Augment NextAuth's Session/JWT to carry the tenant id.

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      tutorId: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tutorId?: string;
  }
}
