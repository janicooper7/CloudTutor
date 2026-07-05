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
    // Runs in middleware to gate protected routes.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard) return isLoggedIn; // false → redirect to signIn page
      return true;
    },
  },
} satisfies NextAuthConfig;
