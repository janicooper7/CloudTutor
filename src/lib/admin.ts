// Who is allowed to use the operator-only routes (/api/admin/*).
//
// These routes are deliberately cross-tenant — recovering a failed upload has to
// reach jobs belonging to any tutor — so "signed in" is nowhere near enough of a
// check once signup is open to the public. Access is an explicit allowlist of
// email addresses, set via ADMIN_EMAILS.
//
// The allowlist is matched against the NextAuth session email (i.e. the verified
// Google account), never against a capture Bearer token: those tokens belong to
// ordinary tutors and must not confer operator powers.

import { auth } from "@/auth";

function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * The signed-in operator's email, or null if the caller isn't one. An empty or
 * unset ADMIN_EMAILS denies everyone — for an operator tool that's the safe
 * failure mode (unlike the site gate, where empty means "off").
 */
export async function currentAdminEmail(): Promise<string | null> {
  const admins = allowlist();
  if (admins.length === 0) return null;

  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;

  return admins.includes(email) ? email : null;
}
