// Full NextAuth setup (Node runtime). Spreads the edge-safe config and adds the
// DB-backed callbacks: on sign-in we ensure a `tutors` row exists for the Google
// account and carry its id in the JWT, so every request can resolve the tenant.

import NextAuth from "next-auth";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";
import { db } from "@/db";
import { tutors } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // `user` is only present on initial sign-in. Upsert the tutor by email
      // and stash its id on the token for subsequent requests.
      if (user?.email) {
        const email = user.email;
        const [existing] = await db
          .select({ id: tutors.id })
          .from(tutors)
          .where(eq(tutors.email, email))
          .limit(1);

        if (existing) {
          token.tutorId = existing.id;
        } else {
          const [created] = await db
            .insert(tutors)
            .values({ email, name: user.name ?? email })
            .returning({ id: tutors.id });
          token.tutorId = created.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.tutorId) {
        session.user.tutorId = token.tutorId as string;
      }
      return session;
    },
  },
});

/** The tutor the current request acts as. Throws if unauthenticated. */
export async function currentTutorId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.tutorId) {
    throw new Error("Unauthorized: no tutor in session");
  }
  return session.user.tutorId;
}
