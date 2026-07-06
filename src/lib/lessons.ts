// Next.js-side lesson creation. Wraps the Next-free core (./lessons-core) and
// revalidates the dashboard cache so a new draft shows immediately.
//
// The `next/cache` import lives HERE, not in lessons-core, so the standalone
// Netlify background worker can import the core without pulling in `next/cache`
// (which isn't resolvable outside the Next.js runtime — it crashed the worker at
// import time). Server Actions and route handlers use this; the worker uses the
// core directly.

import { revalidatePath } from "next/cache";
import {
  createDraftLessonCore,
  type CreateDraftLessonInput,
} from "@/lib/lessons-core";

export type { CreateDraftLessonInput } from "@/lib/lessons-core";
export { createDraftLessonCore } from "@/lib/lessons-core";

/**
 * Insert a draft lesson and revalidate the dashboard cache so the new draft
 * shows immediately. Use this from Next.js server contexts (Server Actions,
 * route handlers). Background/worker code should call `createDraftLessonCore`.
 */
export async function createDraftLesson(
  tutorId: string,
  input: CreateDraftLessonInput,
): Promise<{ id: string }> {
  const result = await createDraftLessonCore(tutorId, input);
  revalidatePath("/dashboard", "layout");
  return result;
}
