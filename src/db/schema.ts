// Database schema (Drizzle / Postgres).
//
// Mirrors the shapes in src/lib/mock.ts so the existing UI types line up with
// what the database returns. Everything is tenant-scoped via `tutor_id`; queries
// must always filter by the current tutor (see src/db/queries.ts).
//
// Note: student/session ids are kept as human slugs (e.g. "maria", "s-maria-12")
// to match the current routes and seed data. When real multi-tenancy lands we can
// migrate to composite (tutor_id, id) keys or uuids; for now slugs stay globally
// unique, which the add-student flow already guarantees.

import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { TalkTime, VocabItem } from "../lib/mock";

export const sessionStatus = pgEnum("session_status", ["draft", "confirmed", "sent"]);
export const cefrLevel = pgEnum("cefr_level", ["A1", "A2", "B1", "B2", "C1", "C2"]);
export const studentTrend = pgEnum("student_trend", ["up", "steady"]);

export const tutors = pgTable("tutors", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  // Bearer token the capture browser extension uses to upload lessons.
  captureToken: text("capture_token").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const students = pgTable("students", {
  id: text("id").primaryKey(),
  tutorId: uuid("tutor_id")
    .notNull()
    .references(() => tutors.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  initial: text("initial").notNull(),
  level: text("level").notNull(),
  goal: text("goal").notNull(),
  native: text("native").notNull(),
  email: text("email"), // student's email, for sending lesson-report PDFs
  lessonCount: integer("lesson_count").notNull().default(0),
  vocabCount: integer("vocab_count").notNull().default(0),
  lastSeen: text("last_seen").notNull(),
  focus: jsonb("focus").$type<string[]>().notNull().default([]),
  trend: studentTrend("trend").notNull().default("steady"),
  active: boolean("active").notNull().default(true),
  notes: text("notes").notNull().default(""),
  targetExam: text("target_exam"),
  interests: jsonb("interests").$type<string[]>(),
  startDate: text("start_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  tutorId: uuid("tutor_id")
    .notNull()
    .references(() => tutors.id, { onDelete: "cascade" }),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  studentInitial: text("student_initial").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(), // human readable, e.g. "2 Jul 2026"
  isoDate: date("iso_date", { mode: "string" }).notNull(), // sortable YYYY-MM-DD
  durationMin: integer("duration_min").notNull(),
  status: sessionStatus("status").notNull().default("draft"),
  levelFrom: text("level_from").notNull(),
  levelTo: text("level_to").notNull(),
  observedLevel: cefrLevel("observed_level").notNull(),
  talkTime: jsonb("talk_time").$type<TalkTime>().notNull(),
  vocab: jsonb("vocab").$type<VocabItem[]>().notNull().default([]),
  wentWell: jsonb("went_well").$type<string[]>().notNull().default([]),
  focus: jsonb("focus").$type<string[]>().notNull().default([]),
  homework: text("homework").notNull().default(""),
  additionalInfo: text("additional_info").notNull().default(""),
  nextLesson: jsonb("next_lesson").$type<string[]>().notNull().default([]),
  lessonEndedAt: text("lesson_ended_at").notNull().default(""),
  tutorNotes: text("tutor_notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tutorsRelations = relations(tutors, ({ many }) => ({
  students: many(students),
  sessions: many(sessions),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  tutor: one(tutors, { fields: [students.tutorId], references: [tutors.id] }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  tutor: one(tutors, { fields: [sessions.tutorId], references: [tutors.id] }),
  student: one(students, { fields: [sessions.studentId], references: [students.id] }),
}));

export type DbTutor = typeof tutors.$inferSelect;
export type DbStudent = typeof students.$inferSelect;
export type NewDbStudent = typeof students.$inferInsert;
export type DbSession = typeof sessions.$inferSelect;
export type NewDbSession = typeof sessions.$inferInsert;
