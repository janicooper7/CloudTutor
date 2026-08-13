// Site-wide password gate — keeps bumblenote.com private while it's pre-launch.
//
// This is NOT a user auth system. It's one shared password covering the whole
// site, checked in src/proxy.ts before any page renders, so the public can't
// browse the marketing site or reach a login form. Per-tutor identity is still
// NextAuth + Google (src/auth.ts); the gate sits in front of all of it.
//
// The gate is active only when SITE_PASSWORD is set. Leaving it unset disables
// the gate rather than locking everyone out, so a missing env var can't brick
// the live site — after deploying, confirm the variable is actually set.

import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "./env";

export const GATE_COOKIE = "bn_gate";
export const GATE_PATH = "/enter";
export const GATE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function gateEnabled(): boolean {
  return env.SITE_PASSWORD.length > 0;
}

/**
 * The cookie value a visitor holds once they're through the gate. Derived from
 * the password and AUTH_SECRET rather than being the password itself, so the
 * cookie can't be read back into the password, and rotating either value
 * invalidates every cookie already issued.
 */
function expectedToken(): string {
  return createHash("sha256")
    .update(`${env.SITE_PASSWORD}:${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex");
}

/** Returns the cookie value for a correct password, or null for a wrong one. */
export function issueToken(password: string): string | null {
  if (!gateEnabled()) return null;
  return equals(password, env.SITE_PASSWORD) ? expectedToken() : null;
}

export function tokenIsValid(token: string | undefined): boolean {
  if (!token) return false;
  return equals(token, expectedToken());
}

/** Constant-time compare. timingSafeEqual throws unless the lengths match. */
function equals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Sanitize the post-gate redirect target. `from` arrives in the query string,
 * so it has to be confined to this site — a bare "//evil.com" or "https://..."
 * would otherwise turn the gate into an open redirect.
 */
export function safeReturnPath(from: string | undefined): string {
  if (!from || !from.startsWith("/") || from.startsWith("//")) return "/";
  return from;
}
