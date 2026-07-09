// Admin recovery for lesson uploads whose background processing failed.
//
// When the worker (netlify/functions/process.mts) errors AFTER the audio has
// been uploaded — e.g. the "fetch failed" on the Claude drafting step for a long
// lesson — it writes a `status: "error"` blob but, crucially, does NOT delete the
// audio chunks (deletion only happens on the success path). So the raw two-track
// audio is still in Netlify Blobs and the whole pipeline can be re-run against it.
//
//   GET  /api/admin/recover   → list failed jobs and whether their audio survives
//   POST /api/admin/recover?uploadId=... → re-fire the worker for that upload
//
// Auth: any signed-in tutor (session cookie). The regenerated draft is always
// created under the JOB's tutorId (createDraftLessonCore), so it lands in the
// correct tutor's review queue regardless of who triggers the recovery.

import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { resolveTutorId } from "@/lib/upload-auth";
import { getStudentById } from "@/db/queries";
import {
  uploadStore,
  jobKey,
  statusKey,
  chunkKey,
  type UploadJob,
  type UploadStatus,
  type Parts,
} from "@/lib/upload-store";

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

/** True only if every audio chunk this job expects is still in the store. */
async function audioPresent(
  store: ReturnType<typeof uploadStore>,
  uploadId: string,
  parts: Parts,
): Promise<boolean> {
  for (const track of ["student", "tutor"] as const) {
    for (let i = 0; i < parts[track]; i++) {
      const meta = await store.getMetadata(chunkKey(uploadId, track, i));
      if (!meta) return false;
    }
  }
  return true;
}

/** GET — list jobs that failed (or are stuck processing) and whether audio survives. */
export async function GET(req: NextRequest): Promise<Response> {
  const tutorId = await resolveTutorId(req);
  if (!tutorId) return json({ error: "Sign in first." }, 401);

  const store = uploadStore();
  const { blobs } = await store.list();

  // Every upload writes a `{uploadId}/status` blob — use those as the index.
  const uploadIds = blobs
    .map((b) => b.key)
    .filter((k) => k.endsWith("/status"))
    .map((k) => k.slice(0, -"/status".length));

  const recoverable = [];
  for (const uploadId of uploadIds) {
    const status = (await store.get(statusKey(uploadId), {
      type: "json",
      consistency: "strong",
    })) as UploadStatus | null;
    if (!status) continue;

    const job = (await store.get(jobKey(uploadId), {
      type: "json",
      consistency: "strong",
    })) as UploadJob | null;
    if (!job) continue;

    // "done" jobs have their audio deleted, so they aren't re-runnable — but we
    // list them (with lessonId) so that after a recovery you can re-GET and grab
    // the link to the freshly-created draft.
    const present = status.state === "done" ? false : await audioPresent(store, uploadId, job.parts);
    let studentName = job.studentId;
    try {
      const student = await getStudentById(job.studentId);
      if (student) studentName = student.name;
    } catch {
      // best-effort display only
    }

    recoverable.push({
      uploadId,
      state: status.state,
      error: status.state === "error" ? status.error : undefined,
      lessonId: status.state === "done" ? status.lessonId : undefined,
      tutorId: job.tutorId,
      studentId: job.studentId,
      studentName,
      durationMin: job.durationMin,
      audioPresent: present,
      recoverable: present,
    });
  }

  return json({ jobs: recoverable });
}

/** POST ?uploadId=... — reset the job to processing and re-fire the background worker. */
export async function POST(req: NextRequest): Promise<Response> {
  const tutorId = await resolveTutorId(req);
  if (!tutorId) return json({ error: "Sign in first." }, 401);

  const uploadId = req.nextUrl.searchParams.get("uploadId")?.trim();
  if (!uploadId) return json({ error: "Missing uploadId." }, 400);

  const store = uploadStore();
  const job = (await store.get(jobKey(uploadId), {
    type: "json",
    consistency: "strong",
  })) as UploadJob | null;
  if (!job) return json({ error: "No job found for that uploadId." }, 404);

  if (!(await audioPresent(store, uploadId, job.parts))) {
    return json(
      { error: "The audio for this upload is no longer in storage — it can't be recovered." },
      409,
    );
  }

  // Flip status back to processing so the client poll (and the list above) reflect
  // the retry, then re-trigger the same background worker /api/upload/complete uses.
  // Restamp startedAt too, or the stall check in /api/upload/status would judge the
  // retry against the original attempt's clock and call it dead on arrival.
  await Promise.all([
    store.setJSON(jobKey(uploadId), { ...job, startedAt: Date.now() } satisfies UploadJob),
    store.setJSON(statusKey(uploadId), { state: "processing" } satisfies UploadStatus),
  ]);

  try {
    const res = await fetch(`${req.nextUrl.origin}/.netlify/functions/process`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-secret": env.INTERNAL_TASK_SECRET,
      },
      body: JSON.stringify({ uploadId }),
    });
    if (!res.ok && res.status !== 202) {
      throw new Error(`Processing worker returned ${res.status}.`);
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : "Couldn't start processing.";
    await store.setJSON(statusKey(uploadId), { state: "error", error } satisfies UploadStatus);
    return json({ error }, 502);
  }

  return json({
    ok: true,
    uploadId,
    message:
      "Reprocessing started. Poll /api/upload/status?uploadId=" +
      uploadId +
      " — on success it returns the new lessonId.",
  });
}
