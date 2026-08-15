// Full NextAuth setup (Node runtime). Spreads the edge-safe config and adds
// everything that needs the database: the email/password provider, and the
// callbacks that ensure a `tutors` row exists for the account and carry its id
// in the JWT so every request can resolve the tenant.
//
// The Credentials provider lives here rather than in auth.config.ts on purpose
// — its `authorize` touches the DB, and auth.config.ts has to stay edge-safe
// for the proxy. The proxy only decodes the session JWT, so it never needs to
// know this provider exists.

import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";
import { db } from "@/db";
import { tutors } from "@/db/schema";
import { verifyPassword } from "@/lib/password";

/**
 * Thrown for every failed password sign-in, whatever the actual cause — wrong
 * password, no such tutor, or a Google-only account. `code` reaches the client
 * as `error=...`; keeping it uniform means the form can't be used to probe
 * which emails have accounts.
 */
class InvalidLogin extends CredentialsSignin {
  code = "credentials";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) throw new InvalidLogin();

        const [tutor] = await db
          .select({
            id: tutors.id,
            email: tutors.email,
            name: tutors.name,
            passwordHash: tutors.passwordHash,
          })
          .from(tutors)
          .where(eq(tutors.email, email))
          .limit(1);

        // No row, or a Google-only row with no password set. Either way, refuse.
        if (!tutor?.passwordHash) throw new InvalidLogin();
        if (!(await verifyPassword(password, tutor.passwordHash))) {
          throw new InvalidLogin();
        }

        return { id: tutor.id, email: tutor.email, name: tutor.name };
      },
    }),
  ],
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
