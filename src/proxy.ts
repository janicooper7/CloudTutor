// Route protection (Next.js 16 renamed Middleware → Proxy). Uses only the
// edge-safe config (no DB) — the `authorized` callback in auth.config.ts
// redirects unauthenticated users away from /dashboard to the sign-in page.

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
