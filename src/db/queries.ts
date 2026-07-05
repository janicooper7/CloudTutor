// Read queries for the dashboard. Server-only — import these from Server
// Components (and Server Actions), never from a client component.
//
// Every query is scoped to the current tutor. Rows are mapped back to the app's
// types from src/lib/mock.ts (null → undefined for optional fields) so callers
// keep using the same Student/Session shapes the UI already expects.

import { and, desc, eq } from "drizzle-orm";
import { db } from "./index";
import { sessions, students, type DbSession, type DbStudent } from "./schema";
import { currentTutorId } from "@/auth";
import type { Session, Student } from "@/lib/mock";

function toStudent(r: DbStudent): Student {
  return {
    id: r.id,
    name: r.name,
    initial: r.initial,
    level: r.level,
    goal: r.goal,
    native: r.native,
    email: r.email ?? undefined,
    lessonCount: r.lessonCount,
    vocabCount: r.vocabCount,
    lastSeen: r.lastSeen,
    focus: r.focus,
    trend: r.trend,
    active: r.active,
    notes: r.notes,
    targetExam: r.targetExam ?? undefined,
    interests: r.interests ?? undefined,
    startDate: r.startDate ?? undefined,
  };
}

function toSession(r: DbSession): Session {
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    studentInitial: r.studentInitial,
    title: r.title,
    date: r.date,
    isoDate: r.isoDate,
    durationMin: r.durationMin,
    status: r.status,
    levelFrom: r.levelFrom,
    levelTo: r.levelTo,
    observedLevel: r.observedLevel,
    talkTime: r.talkTime,
    vocab: r.vocab,
    wentWell: r.wentWell,
    focus: r.focus,
    homework: r.homework,
    additionalInfo: r.additionalInfo,
    nextLesson: r.nextLesson,
    lessonEndedAt: r.lessonEndedAt,
    tutorNotes: r.tutorNotes,
  };
}

export async function getStudents(): Promise<Student[]> {
  const tutorId = await currentTutorId();
  const rows = await db
    .select()
    .from(students)
    .where(eq(students.tutorId, tutorId))
    .orderBy(students.createdAt);
  return rows.map(toStudent);
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  const tutorId = await currentTutorId();
  const [row] = await db
    .select()
    .from(students)
    .where(and(eq(students.tutorId, tutorId), eq(students.id, id)))
    .limit(1);
  return row ? toStudent(row) : undefined;
}

export async function getSessions(): Promise<Session[]> {
  const tutorId = await currentTutorId();
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tutorId, tutorId))
    .orderBy(desc(sessions.isoDate));
  return rows.map(toSession);
}

export async function getPendingSessions(): Promise<Session[]> {
  const all = await getSessions();
  return all.filter((s) => s.status !== "sent");
}

export async function getSessionsForStudent(studentId: string): Promise<Session[]> {
  const tutorId = await currentTutorId();
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tutorId, tutorId), eq(sessions.studentId, studentId)))
    .orderBy(desc(sessions.isoDate));
  return rows.map(toSession);
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  const tutorId = await currentTutorId();
  const [row] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tutorId, tutorId), eq(sessions.id, id)))
    .limit(1);
  return row ? toSession(row) : undefined;
}
