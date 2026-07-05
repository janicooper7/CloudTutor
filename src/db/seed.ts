// Seed script: inserts the dev tutor plus the mock students and sessions.
//
// Run with:  npm run db:seed   (after db:migrate/db:push against your Neon DB)
//
// Self-contained connection (doesn't import the app's db client) so it can run
// under tsx without tsconfig path-alias resolution. Idempotent: it clears the
// dev tutor's rows first, so re-running resets to the seed data.

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { sessions, students, tutors } from "./schema";
import { sessions as seedSessions, students as seedStudents } from "../lib/mock";
import { DEV_TUTOR } from "../lib/auth";

// None of the imports above read DATABASE_URL at load time, so it's safe to load
// env after imports (satisfies import/first) but before main() runs.
config({ path: ".env.local" });
config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL not set. Copy .env.example to .env.local first.");
  }
  const db = drizzle(neon(url), { schema: { tutors, students, sessions } });

  // Decide which tutor owns the sample data:
  //   1. SEED_TUTOR_EMAIL if provided (create if missing),
  //   2. else the first existing tutor (e.g. the one you just signed in as),
  //   3. else the fixed dev tutor.
  const targetEmail = process.env.SEED_TUTOR_EMAIL;
  let tutorId: string;
  let tutorEmail: string;

  if (targetEmail) {
    const [row] = await db.select().from(tutors).where(eq(tutors.email, targetEmail)).limit(1);
    if (row) {
      tutorId = row.id;
    } else {
      const [created] = await db
        .insert(tutors)
        .values({ email: targetEmail, name: targetEmail })
        .returning({ id: tutors.id });
      tutorId = created.id;
    }
    tutorEmail = targetEmail;
  } else {
    const [first] = await db.select().from(tutors).orderBy(tutors.createdAt).limit(1);
    if (first) {
      tutorId = first.id;
      tutorEmail = first.email;
    } else {
      await db
        .insert(tutors)
        .values({ id: DEV_TUTOR.id, email: DEV_TUTOR.email, name: DEV_TUTOR.name })
        .onConflictDoNothing();
      tutorId = DEV_TUTOR.id;
      tutorEmail = DEV_TUTOR.email;
    }
  }

  // Reset this tutor's data (sessions first — FK).
  await db.delete(sessions).where(eq(sessions.tutorId, tutorId));
  await db.delete(students).where(eq(students.tutorId, tutorId));

  await db.insert(students).values(
    seedStudents.map((s) => ({
      id: s.id,
      tutorId,
      name: s.name,
      initial: s.initial,
      level: s.level,
      goal: s.goal,
      native: s.native,
      lessonCount: s.lessonCount,
      vocabCount: s.vocabCount,
      lastSeen: s.lastSeen,
      focus: s.focus,
      trend: s.trend,
      active: s.active ?? true,
      notes: s.notes ?? "",
      targetExam: s.targetExam ?? null,
      interests: s.interests ?? null,
      startDate: s.startDate ?? null,
    })),
  );

  await db.insert(sessions).values(
    seedSessions.map((s) => ({
      id: s.id,
      tutorId,
      studentId: s.studentId,
      studentName: s.studentName,
      studentInitial: s.studentInitial,
      title: s.title,
      date: s.date,
      isoDate: s.isoDate,
      durationMin: s.durationMin,
      status: s.status,
      levelFrom: s.levelFrom,
      levelTo: s.levelTo,
      observedLevel: s.observedLevel,
      talkTime: s.talkTime,
      vocab: s.vocab,
      wentWell: s.wentWell,
      focus: s.focus,
      homework: s.homework,
      additionalInfo: s.additionalInfo,
      nextLesson: s.nextLesson,
      lessonEndedAt: s.lessonEndedAt,
      tutorNotes: s.tutorNotes,
    })),
  );

  console.log(
    `Seeded ${seedStudents.length} students and ${seedSessions.length} sessions for ${tutorEmail}.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
