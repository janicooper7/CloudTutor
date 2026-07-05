// Shared contract for the chunked lesson-audio upload, used by the /api/upload/*
// routes AND the netlify/functions/process background worker. Keeping the store
// name, key layout, and payload shapes in one place stops the writer and reader
// from drifting apart.
//
// Flow: the client slices each track into ~4 MB parts and POSTs them to
// /api/upload/chunk (each part -> one blob). /api/upload/complete records a `job`
// + `status` blob and kicks the background function, which concatenates the parts,
// transcribes + drafts, writes the final `status`, and deletes the audio.

import { getStore } from "@netlify/blobs";

export const UPLOAD_STORE = "lesson-uploads";

export type Track = "student" | "tutor";

/** Per-track part counts for one upload. */
export type Parts = { student: number; tutor: number };

/** Authoritative job description written by /api/upload/complete (post-auth). */
export type UploadJob = {
  tutorId: string;
  studentId: string;
  durationMin: number;
  parts: Parts;
};

/** Poll state read by /api/upload/status. */
export type UploadStatus =
  | { state: "processing" }
  | { state: "done"; lessonId: string }
  | { state: "error"; error: string };

export function uploadStore() {
  return getStore(UPLOAD_STORE);
}

export function chunkKey(uploadId: string, track: Track, part: number): string {
  return `${uploadId}/chunk/${track}/${part}`;
}

export function jobKey(uploadId: string): string {
  return `${uploadId}/job`;
}

export function statusKey(uploadId: string): string {
  return `${uploadId}/status`;
}

/** All chunk keys for a completed upload, in read order. */
export function allChunkKeys(uploadId: string, parts: Parts): string[] {
  const keys: string[] = [];
  for (const track of ["student", "tutor"] as const) {
    for (let i = 0; i < parts[track]; i++) keys.push(chunkKey(uploadId, track, i));
  }
  return keys;
}
