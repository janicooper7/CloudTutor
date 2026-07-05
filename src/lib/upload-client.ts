// Client-side driver for the chunked lesson-audio upload (web app).
//
// Slices each track into sub-6 MB parts (so every request clears Netlify's
// function-body limit), uploads them to /api/upload/chunk, finalizes via
// /api/upload/complete, then polls /api/upload/status until the background worker
// has produced the draft. Returns the new lesson id to navigate to.
//
// The capture extension implements the same three-step flow in plain JS against
// the same endpoints (see extension/offscreen.js) — keep them in sync.

const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB — comfortably under the 6 MB limit.
const UPLOAD_CONCURRENCY = 4;
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000; // background function's own ceiling.

type Track = "student" | "tutor";

/** Number of CHUNK_SIZE slices for a blob (at least 1, even if empty-ish). */
function partCount(blob: Blob): number {
  return Math.max(1, Math.ceil(blob.size / CHUNK_SIZE));
}

/** Run tasks with bounded concurrency, preserving rejection. */
async function runPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

export type UploadLessonAudioOptions = {
  studentId: string;
  durationMin: number;
  student: Blob;
  tutor: Blob;
  /** Bearer token for the extension; the web app relies on session cookies. */
  authToken?: string;
  signal?: AbortSignal;
};

export async function uploadLessonAudio(
  opts: UploadLessonAudioOptions,
): Promise<{ lessonId: string }> {
  const { studentId, durationMin, student, tutor, authToken, signal } = opts;
  const uploadId = crypto.randomUUID();
  const authHeader: Record<string, string> = authToken
    ? { authorization: `Bearer ${authToken}` }
    : {};

  const tracks: Record<Track, Blob> = { student, tutor };
  const parts = { student: partCount(student), tutor: partCount(tutor) };

  // Build the flat list of chunk uploads across both tracks, then run the pool.
  const jobs: { track: Track; part: number; blob: Blob }[] = [];
  for (const track of ["student", "tutor"] as const) {
    const blob = tracks[track];
    for (let i = 0; i < parts[track]; i++) {
      jobs.push({ track, part: i, blob: blob.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE) });
    }
  }

  await runPool(jobs, UPLOAD_CONCURRENCY, async ({ track, part, blob }) => {
    const url = `/api/upload/chunk?uploadId=${uploadId}&track=${track}&part=${part}`;
    const res = await fetch(url, {
      method: "POST",
      headers: authHeader,
      body: blob,
      signal,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Upload failed (${res.status}).`);
    }
  });

  const completeRes = await fetch("/api/upload/complete", {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeader },
    body: JSON.stringify({ uploadId, studentId, durationMin, parts }),
    signal,
  });
  const completeData = await completeRes.json().catch(() => ({}));
  if (!completeRes.ok) {
    throw new Error(completeData.error || `Couldn't start processing (${completeRes.status}).`);
  }

  // Poll until the worker reports done or error.
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    if (signal?.aborted) throw new Error("Upload cancelled.");

    const res = await fetch(`/api/upload/status?uploadId=${uploadId}`, {
      headers: authHeader,
      signal,
    });
    if (!res.ok) continue; // transient (e.g. eventual-consistency 404); keep polling.
    const status = await res.json();
    if (status.state === "done") return { lessonId: status.lessonId };
    if (status.state === "error") throw new Error(status.error || "Processing failed.");
  }
  throw new Error("Processing timed out — please try again.");
}
