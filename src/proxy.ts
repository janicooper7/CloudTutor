// Route protection (Next.js 16 renamed Middleware → Proxy). Two rules, in order:
//
//   1. The pre-launch site gate — no valid gate cookie, no site at all (/enter).
//   2. Dashboard auth — /dashboard requires a signed-in tutor, else /login.
//
// Uses only the edge-safe auth config (no DB import). Note that passing a
// handler to `auth()` means NextAuth's own `authorized` callback no longer
// drives the redirect (see node_modules/next-auth/lib/index.js — the
// userMiddlewareOrRoute branch wins over the !authorized branch), so rule 2 is
// enforced here rather than in auth.config.ts.

import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { GATE_COOKIE, GATE_PATH, gateEnabled, tokenIsValid } from "@/lib/site-gate";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname, search } = request.nextUrl;

  if (gateEnabled() && !tokenIsValid(request.cookies.get(GATE_COOKIE)?.value)) {
    const url = request.nextUrl.clone();
    url.pathname = GATE_PATH;
    url.search = "";
    // Remember where they were headed so the gate can send them back there.
    const from = pathname + search;
    if (from !== "/") url.searchParams.set("from", from);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/dashboard") && !request.auth?.user) {
    const url = request.nextUrl.clone();
    url.pathname = authConfig.pages.signIn;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  // The gate has to cover the whole site, so this is far broader than the old
  // /dashboard-only matcher. Excluded:
  //   api        — those routes authenticate themselves, and the capture
  //                extension calls them with a Bearer token and no cookies, so
  //                gating them would break uploads mid-recording.
  //   enter      — the gate page itself, plus its Server Action (a Server
  //                Function POSTs to the route it lives on, so excluding the
  //                path excludes the action too).
  //   _next, .*  — build output and static assets under public/.
  matcher: ["/((?!api|enter|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
