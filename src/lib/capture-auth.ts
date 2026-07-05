// Resolves a capture Bearer token to a tutor. Used by the extension's API routes,
// which authenticate with a token instead of a session cookie. Server-only.

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tutors } from "@/db/schema";

export async function tutorIdByCaptureToken(token: string): Promise<string | null> {
  if (!token) return null;
  const [row] = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(eq(tutors.captureToken, token))
    .limit(1);
  return row?.id ?? null;
}
