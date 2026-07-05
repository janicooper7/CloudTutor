// Receive one ~4 MB slice of a lesson audio track and store it as a single blob.
// Each request stays well under Netlify's 6 MB function-body limit; the parts are
// reassembled later by the background worker. Auth: session (web) or Bearer
// capture token (extension), via resolveTutorId.

import type { NextRequest } from "next/server";
import { resolveTutorId } from "@/lib/upload-auth";
import { uploadStore, chunkKey, type Track } from "@/lib/upload-store";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: CORS });
}

// uploadId is used as a blob key segment — keep it to an unguessable, safe charset.
const ID_RE = /^[A-Za-z0-9_-]{8,100}$/;

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest): Promise<Response> {
  const tutorId = await resolveTutorId(req);
  if (!tutorId) return json({ error: "Unauthorized." }, 401);

  const { searchParams } = req.nextUrl;
  const uploadId = searchParams.get("uploadId") ?? "";
  const track = searchParams.get("track") as Track | null;
  const part = Number(searchParams.get("part"));

  if (!ID_RE.test(uploadId)) return json({ error: "Bad uploadId." }, 400);
  if (track !== "student" && track !== "tutor") return json({ error: "Bad track." }, 400);
  if (!Number.isInteger(part) || part < 0 || part > 10000) {
    return json({ error: "Bad part index." }, 400);
  }

  const body = await req.arrayBuffer();
  if (body.byteLength === 0) return json({ error: "Empty chunk." }, 400);

  await uploadStore().set(chunkKey(uploadId, track, part), body);
  return json({ ok: true });
}
