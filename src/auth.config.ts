// Edge-safe auth config: providers + authorization rules only, no database
// imports. This is what middleware uses (runs on the edge), so keep it light.
// The full config in src/auth.ts spreads this and adds DB-backed callbacks.

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  // Google provider auto-reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from env.
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Kept as the declarative statement of which routes need a session, and
    // still used anywhere `auth` runs without its own handler. src/proxy.ts
    // passes a handler (for the site gate), which makes NextAuth ignore this
    // callback's boolean — the /dashboard redirect is enforced there instead.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard) return isLoggedIn; // false → redirect to signIn page
      return true;
    },
  },
} satisfies NextAuthConfig;
