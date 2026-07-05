"use server";

// Server Actions for student mutations. These replace the localStorage
// studentsStore writes. Each is scoped to the current tutor and revalidates the
// dashboard subtree so Server Components re-read fresh data.

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { students } from "@/db/schema";
import { currentTutorId } from "@/auth";

export type NewStudentInput = {
  name: string;
  native: string;
  email?: string;
  level: string;
  goal: string;
  targetExam?: string;
  interests?: string[];
  focus?: string[];
  notes?: string;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueStudentId(base: string, tutorId: string): Promise<string> {
  const existing = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.tutorId, tutorId));
  const taken = new Set(existing.map((r) => r.id));
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
}

export async function createStudent(input: NewStudentInput): Promise<{ id: string }> {
  const tutorId = await currentTutorId();
  const name = input.name.trim();
  const id = await uniqueStudentId(slugify(name) || "student", tutorId);

  await db.insert(students).values({
    id,
    tutorId,
    name,
    initial: (name[0] || "?").toUpperCase(),
    level: input.level,
    goal: input.goal,
    native: input.native.trim() || "—",
    email: input.email?.trim() || null,
    lessonCount: 0,
    vocabCount: 0,
    lastSeen: "New",
    focus: input.focus?.filter(Boolean) ?? [],
    trend: "steady",
    active: true,
    notes: input.notes?.trim() || "",
    targetExam: input.targetExam?.trim() || null,
    interests: input.interests?.filter(Boolean) ?? null,
  });

  revalidatePath("/dashboard", "layout");
  return { id };
}

export async function deleteStudent(id: string): Promise<void> {
  const tutorId = await currentTutorId();
  await db.delete(students).where(and(eq(students.tutorId, tutorId), eq(students.id, id)));
  revalidatePath("/dashboard", "layout");
}

export async function setStudentActive(id: string, active: boolean): Promise<void> {
  const tutorId = await currentTutorId();
  await db
    .update(students)
    .set({ active })
    .where(and(eq(students.tutorId, tutorId), eq(students.id, id)));
  revalidatePath("/dashboard", "layout");
}

export async function setStudentNotes(id: string, notes: string): Promise<void> {
  const tutorId = await currentTutorId();
  await db
    .update(students)
    .set({ notes })
    .where(and(eq(students.tutorId, tutorId), eq(students.id, id)));
  revalidatePath("/dashboard", "layout");
}

export async function setStudentEmail(id: string, email: string): Promise<void> {
  const tutorId = await currentTutorId();
  const trimmed = email.trim();
  await db
    .update(students)
    .set({ email: trimmed || null })
    .where(and(eq(students.tutorId, tutorId), eq(students.id, id)));
  revalidatePath("/dashboard", "layout");
}
