// Next-free lesson-creation core. Server-only, but crucially imports NOTHING from
// `next/*` — so it can be bundled into the standalone Netlify background worker
// (netlify/functions/process.mts) without dragging in `next/cache`, which isn't
// resolvable outside the Next.js runtime and crashes the function at import time.
//
// The Next.js callers use `createDraftLesson` from ./lessons (which wraps this and
// calls revalidatePath); the worker imports `createDraftLessonCore` from here.

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, students } from "@/db/schema";
import { generateLessonFeedback } from "@/lib/ai";

export type CreateDraftLessonInput = {
  studentId: string;
  transcript: string;
  durationMin: number;
};

/** Split a student's "B1 → B2" level into from/to, tolerant of odd input. */
function splitLevel(level: string): { from: string; to: string } {
  const parts = level.split(/→|->/).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { from: parts[0], to: parts[1] };
  const only = parts[0] ?? level.trim();
  return { from: only, to: only };
}

async function uniqueSessionId(base: string, tutorId: string): Promise<string> {
  const existing = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(eq(sessions.tutorId, tutorId));
  const taken = new Set(existing.map((r) => r.id));
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
}

/**
 * Insert a draft lesson — the Next-free core. Does everything except
 * `revalidatePath`, so it can run inside a raw Netlify background function (where
 * `next/cache` has no request context and would throw). Next.js callers should
 * use `createDraftLesson` (./lessons), which wraps this and revalidates the cache.
 */
export async function createDraftLessonCore(
  tutorId: string,
  input: CreateDraftLessonInput,
): Promise<{ id: string }> {
  const transcript = input.transcript.trim();
  if (transcript.length < 40) {
    throw new Error("Please paste a fuller lesson transcript.");
  }

  const [student] = await db
    .select()
    .from(students)
    .where(and(eq(students.tutorId, tutorId), eq(students.id, input.studentId)))
    .limit(1);
  if (!student) throw new Error("Student not found.");

  const feedback = await generateLessonFeedback(transcript, {
    studentName: student.name,
    native: student.native,
    level: student.level,
    goal: student.goal,
    focus: student.focus,
    interests: student.interests ?? undefined,
  });

  // Lesson number = how many sessions this student already has, plus one.
  const priorCount = (
    await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(eq(sessions.tutorId, tutorId), eq(sessions.studentId, student.id)))
  ).length;
  const lessonNo = priorCount + 1;

  const now = new Date();
  const isoDate = now.toISOString().slice(0, 10);
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(now);

  const { from, to } = splitLevel(student.level);
  const durationMin =
    Number.isFinite(input.durationMin) && input.durationMin > 0
      ? Math.round(input.durationMin)
      : 45;

  const id = await uniqueSessionId(`s-${student.id}-${lessonNo}`, tutorId);

  await db.insert(sessions).values({
    id,
    tutorId,
    studentId: student.id,
    studentName: student.name,
    studentInitial: student.initial,
    title: `Lesson ${lessonNo} · ${feedback.topic}`,
    date,
    isoDate,
    durationMin,
    status: "draft",
    levelFrom: from,
    levelTo: to,
    observedLevel: feedback.observedLevel,
    talkTime: feedback.talkTime,
    vocab: feedback.vocab,
    wentWell: feedback.wentWell,
    focus: feedback.focus,
    homework: feedback.homework,
    additionalInfo: feedback.additionalInfo,
    nextLesson: feedback.nextLesson,
    lessonEndedAt: feedback.lessonEndedAt,
    tutorNotes: feedback.tutorNotes,
  });

  return { id };
}
