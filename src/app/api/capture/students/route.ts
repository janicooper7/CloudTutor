// Returns the token-owning tutor's active students, for the extension's picker.

import type { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { tutorIdByCaptureToken } from "@/lib/capture-auth";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: CORS });
}

function bearer(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : null;
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest): Promise<Response> {
  const token = bearer(req);
  const tutorId = token ? await tutorIdByCaptureToken(token) : null;
  if (!tutorId) return json({ error: "Invalid or missing capture token." }, 401);

  const rows = await db
    .select({ id: students.id, name: students.name, initial: students.initial })
    .from(students)
    .where(and(eq(students.tutorId, tutorId), eq(students.active, true)))
    .orderBy(students.createdAt);

  return json({ students: rows });
}
