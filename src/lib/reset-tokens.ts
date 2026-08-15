// Issue and redeem password-reset tokens. Node-only (node:crypto + DB).
//
// The token in the emailed link is 32 bytes of CSPRNG output; only its SHA-256
// lands in the database. Plain SHA-256 is deliberate here — unlike a password,
// the token has full entropy, so there is nothing for an attacker to guess and
// nothing a slow KDF would buy. What matters is that the stored value can't be
// replayed as a link.

import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, tutors } from "@/db/schema";

/** How long an emailed link stays good. Short: the mailbox is the weak link. */
export const RESET_TTL_MINUTES = 60;

/**
 * Minimum spacing between reset emails for one tutor. Stops the form being used
 * to flood somebody's inbox — the caller still reports success either way, so a
 * throttled request is indistinguishable from a sent one.
 */
const RESEND_COOLDOWN_MS = 60_000;

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/**
 * Mint a reset token for `tutorId`, or null if one was issued moments ago.
 *
 * Any older unused tokens are burned first: requesting a new link should
 * invalidate the previous one, so a forwarded or intercepted earlier email
 * stops working the moment the tutor asks again.
 */
export async function issueResetToken(tutorId: string): Promise<string | null> {
  const now = new Date();

  const [recent] = await db
    .select({ createdAt: passwordResetTokens.createdAt })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tutorId, tutorId),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    )
    .orderBy(desc(passwordResetTokens.createdAt))
    .limit(1);

  if (recent && now.getTime() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return null;
  }

  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.tutorId, tutorId));

  const token = randomBytes(32).toString("base64url");
  await db.insert(passwordResetTokens).values({
    tutorId,
    tokenHash: hashToken(token),
    expiresAt: new Date(now.getTime() + RESET_TTL_MINUTES * 60_000),
  });

  return token;
}

export type ResetTokenCheck =
  | { ok: true; tutorId: string; email: string; name: string }
  | { ok: false };

/**
 * Look up an unused, unexpired token. Read-only — call `consumeResetToken` to
 * actually spend it. Used by the /reset page so an expired link can say so
 * before the tutor types a new password.
 */
export async function checkResetToken(token: string): Promise<ResetTokenCheck> {
  if (!token) return { ok: false };

  const [row] = await db
    .select({
      tutorId: tutors.id,
      email: tutors.email,
      name: tutors.name,
      expiresAt: passwordResetTokens.expiresAt,
      usedAt: passwordResetTokens.usedAt,
    })
    .from(passwordResetTokens)
    .innerJoin(tutors, eq(tutors.id, passwordResetTokens.tutorId))
    .where(eq(passwordResetTokens.tokenHash, hashToken(token)))
    .limit(1);

  if (!row || row.usedAt || row.expiresAt.getTime() <= Date.now()) return { ok: false };
  return { ok: true, tutorId: row.tutorId, email: row.email, name: row.name };
}

/**
 * Spend the token and hand back the tutor it belongs to, or null.
 *
 * The `used_at is null` predicate lives in the UPDATE itself so two submissions
 * racing each other can't both come back a winner — Postgres serializes them on
 * the row, and the loser matches nothing.
 */
export async function consumeResetToken(token: string): Promise<string | null> {
  if (!token) return null;

  const [spent] = await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .returning({ tutorId: passwordResetTokens.tutorId });

  return spent?.tutorId ?? null;
}
