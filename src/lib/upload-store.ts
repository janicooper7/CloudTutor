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
  /**
   * Epoch ms the worker was (re)triggered. The worker can be killed outright —
   * platform timeout, OOM, a deploy mid-run — and a killed process runs no catch
   * block, so it never writes a terminal status. Without this, such a job sits on
   * "processing" forever and the client polls until its own deadline. Optional so
   * jobs written before this field existed still parse.
   */
  startedAt?: number;
};

/**
 * How long a job may stay "processing" before /api/upload/status calls it dead.
 * Above the worker's realistic worst case (~10 min: transcribe, then Claude at
 * 2 x 300s) and below both the platform's 15-min kill and the client's 15-min
 * poll deadline — so the client still has time to see the error we report.
 */
export const STALL_AFTER_MS = 13 * 60 * 1000;

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

/**
 * The labelled transcript, cached after speech-to-text succeeds. Transcription is
 * the expensive, deterministic half of the pipeline; the drafting step after it is
 * the one that fails. Caching lets a retry skip Deepgram entirely instead of
 * re-billing both tracks. Deleted alongside the audio on success — see the
 * "audio is transient" rule in PLAN.md §9.
 */
export function transcriptKey(uploadId: string): string {
  return `${uploadId}/transcript`;
}

/** All chunk keys for a completed upload, in read order. */
export function allChunkKeys(uploadId: string, parts: Parts): string[] {
  const keys: string[] = [];
  for (const track of ["student", "tutor"] as const) {
    for (let i = 0; i < parts[track]; i++) keys.push(chunkKey(uploadId, track, i));
  }
  return keys;
}
