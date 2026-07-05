// Background worker for the lesson-audio pipeline.
//
// The web app / extension chunk-upload two audio tracks to Netlify Blobs, then
// /api/upload/complete kicks this function. Running as a *background* function
// gives us the 15-minute budget the synchronous 26–60 s routes don't have, so we
// can transcribe (Deepgram) + draft (Claude) a full lesson here. On finish we
// write the poll status and delete the audio — implementing the "audio is
// transient" privacy rule in PLAN.md §9.
//
// Reuses the exact same app code the local dev path uses:
//   - transcribeLesson       (@/lib/stt)
//   - createDraftLessonCore  (@/lib/lessons) — the revalidatePath-free variant,
//                             since next/cache has no request context out here.
//
// Netlify auto-retries a background function that throws, which would double-
// insert lessons — so every path here is caught and reported via the status blob,
// and the function never throws.

import type { Config } from "@netlify/functions";
import { env } from "@/lib/env";
import { transcribeLesson } from "@/lib/stt";
import { createDraftLessonCore } from "@/lib/lessons";
import {
  uploadStore,
  chunkKey,
  jobKey,
  statusKey,
  allChunkKeys,
  type Track,
  type UploadJob,
  type UploadStatus,
} from "@/lib/upload-store";

export const config: Config = {
  background: true,
  path: "/internal/process",
};

async function readTrack(
  store: ReturnType<typeof uploadStore>,
  uploadId: string,
  track: Track,
  count: number,
): Promise<Buffer> {
  const parts: Buffer[] = [];
  for (let i = 0; i < count; i++) {
    const buf = (await store.get(chunkKey(uploadId, track, i), {
      type: "arrayBuffer",
      consistency: "strong",
    })) as ArrayBuffer | null;
    if (!buf) throw new Error(`Missing ${track} audio chunk ${i}.`);
    parts.push(Buffer.from(buf));
  }
  return Buffer.concat(parts);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.headers.get("x-internal-secret") !== env.INTERNAL_TASK_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  let uploadId = "";
  const store = uploadStore();

  try {
    ({ uploadId } = (await req.json()) as { uploadId: string });
    if (!uploadId) return new Response("Missing uploadId", { status: 400 });

    const job = (await store.get(jobKey(uploadId), {
      type: "json",
      consistency: "strong",
    })) as UploadJob | null;
    if (!job) return new Response("Unknown job", { status: 404 });

    const [studentAudio, tutorAudio] = await Promise.all([
      readTrack(store, uploadId, "student", job.parts.student),
      readTrack(store, uploadId, "tutor", job.parts.tutor),
    ]);

    const transcript = await transcribeLesson({ studentAudio, tutorAudio });
    const { id } = await createDraftLessonCore(job.tutorId, {
      studentId: job.studentId,
      transcript,
      durationMin: job.durationMin,
    });

    await store.setJSON(statusKey(uploadId), {
      state: "done",
      lessonId: id,
    } satisfies UploadStatus);

    // Drop the audio; keep the tiny job + status blobs for the client's poll.
    await Promise.all(
      allChunkKeys(uploadId, job.parts).map((key) => store.delete(key)),
    );
  } catch (err) {
    const error = err instanceof Error ? err.message : "Processing failed.";
    if (uploadId) {
      await store
        .setJSON(statusKey(uploadId), { state: "error", error } satisfies UploadStatus)
        .catch(() => {});
    }
  }

  // Always 202: never throw, or Netlify retries and we double-insert.
  return new Response(null, { status: 202 });
};

export default handler;
