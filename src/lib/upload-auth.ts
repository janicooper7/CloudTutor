// Resolves the acting tutor for the chunked-upload routes, which are hit by BOTH
// the web app (NextAuth session cookie) and the capture extension (Bearer token).
// Server-only. Mirrors how /api/capture authenticates, but as a shared helper the
// three /api/upload/* routes reuse.

import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { tutorIdByCaptureToken } from "@/lib/capture-auth";

/**
 * Resolve the tutorId for the request from either a signed-in session or a
 * `Authorization: Bearer <captureToken>` header. Returns null if neither
 * identifies a tutor.
 */
export async function resolveTutorId(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Bearer ")) {
    const token = header.slice(7).trim();
    if (token) return tutorIdByCaptureToken(token);
  }

  const session = await auth();
  return session?.user?.tutorId ?? null;
}
