// Shared rules for the tutor's own display name. Lives here rather than in
// src/app/actions/tutor.ts because a "use server" module may only export async
// functions — and because the settings form needs the same limit the action
// enforces, instead of a second copy that can drift.

export const MAX_NAME_LENGTH = 80;

/** Collapse runs of whitespace and trim, so " Ada   Lovelace " → "Ada Lovelace". */
export function normalizeTutorName(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
