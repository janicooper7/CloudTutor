"use server";

// Server Actions for session mutations. Scoped to the current tutor and
// revalidate the dashboard subtree so Server Components re-read fresh data.

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions, tutors } from "@/db/schema";
import { currentTutorId } from "@/auth";
import { getSessionById, getStudentById } from "@/db/queries";
import { renderLessonReportPDF } from "@/lib/pdf";
import { sendLessonReportEmail } from "@/lib/email";
import type { SessionStatus, VocabItem } from "@/lib/mock";

export async function setSessionStatus(id: string, status: SessionStatus): Promise<void> {
  const tutorId = await currentTutorId();
  await db
    .update(sessions)
    .set({ status })
    .where(and(eq(sessions.tutorId, tutorId), eq(sessions.id, id)));
  revalidatePath("/dashboard", "layout");
}

export async function setSessionTitle(id: string, title: string): Promise<void> {
  const tutorId = await currentTutorId();
  const trimmed = title.trim();
  if (!trimmed) return;
  await db
    .update(sessions)
    .set({ title: trimmed })
    .where(and(eq(sessions.tutorId, tutorId), eq(sessions.id, id)));
  revalidatePath("/dashboard", "layout");
}

/**
 * Permanently delete a session (e.g. a bad recording the tutor doesn't want to
 * keep). Scoped to the current tutor so one tutor can't delete another's rows,
 * then redirects back to the dashboard since the review page no longer exists.
 */
export async function deleteSession(id: string): Promise<void> {
  const tutorId = await currentTutorId();
  await db
    .delete(sessions)
    .where(and(eq(sessions.tutorId, tutorId), eq(sessions.id, id)));
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

// The editable feedback fields on a session (talkTime + observedLevel are AI
// output and not tutor-editable, so they're excluded).
export type SessionFeedbackInput = {
  vocab: VocabItem[];
  wentWell: string[];
  focus: string[];
  homework: string;
  additionalInfo: string;
  nextLesson: string[];
  lessonEndedAt: string;
  tutorNotes: string;
};

/** Persist all edited feedback fields and set the session's status in one write. */
export async function saveSessionFeedback(
  id: string,
  data: SessionFeedbackInput,
  status: SessionStatus,
): Promise<void> {
  const tutorId = await currentTutorId();
  await db
    .update(sessions)
    .set({ ...data, status })
    .where(and(eq(sessions.tutorId, tutorId), eq(sessions.id, id)));
  revalidatePath("/dashboard", "layout");
}

/**
 * Confirm & send: persist the edited feedback, then generate the lesson-report
 * PDF and email it to the student. Edits are saved as "confirmed" first, so a
 * delivery failure (missing email, bad key) never leaves the lesson falsely
 * marked "sent" — the tutor can fix the cause and retry.
 */
export type SendLessonReportResult = { ok: true } | { ok: false; error: string };

export async function sendLessonReport(
  id: string,
  data: SessionFeedbackInput,
): Promise<SendLessonReportResult> {
  const tutorId = await currentTutorId();

  await db
    .update(sessions)
    .set({ ...data, status: "confirmed" })
    .where(and(eq(sessions.tutorId, tutorId), eq(sessions.id, id)));

  try {
    const session = await getSessionById(id);
    if (!session) throw new Error("Lesson not found.");
    const student = await getStudentById(session.studentId);
    if (!student) throw new Error("Student not found.");
    if (!student.email) {
      throw new Error(`Add an email address for ${student.name} before sending.`);
    }

    const [tutor] = await db
      .select({ name: tutors.name })
      .from(tutors)
      .where(eq(tutors.id, tutorId))
      .limit(1);
    const tutorName = tutor?.name ?? "Your tutor";

    const pdf = await renderLessonReportPDF(session, student, { tutorName });
    await sendLessonReportEmail({
      to: student.email,
      studentName: student.name,
      tutorName,
      session,
      pdf,
    });

    await db
      .update(sessions)
      .set({ status: "sent" })
      .where(and(eq(sessions.tutorId, tutorId), eq(sessions.id, id)));
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (err) {
    // Return the real reason instead of throwing: Next.js sanitizes thrown
    // server-action messages in production to a generic 500, hiding exactly the
    // detail the tutor needs ("add an email", "verify a domain", etc.). The row
    // stays "confirmed" (saved but not sent), so the tutor can fix it and retry.
    revalidatePath("/dashboard", "layout");
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Couldn't send the report.",
    };
  }
}
