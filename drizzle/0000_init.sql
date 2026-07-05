CREATE TYPE "public"."cefr_level" AS ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('draft', 'confirmed', 'sent');--> statement-breakpoint
CREATE TYPE "public"."student_trend" AS ENUM('up', 'steady');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"tutor_id" uuid NOT NULL,
	"student_id" text NOT NULL,
	"student_name" text NOT NULL,
	"student_initial" text NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"iso_date" date NOT NULL,
	"duration_min" integer NOT NULL,
	"status" "session_status" DEFAULT 'draft' NOT NULL,
	"level_from" text NOT NULL,
	"level_to" text NOT NULL,
	"observed_level" "cefr_level" NOT NULL,
	"talk_time" jsonb NOT NULL,
	"vocab" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"went_well" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"focus" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"homework" text DEFAULT '' NOT NULL,
	"additional_info" text DEFAULT '' NOT NULL,
	"next_lesson" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lesson_ended_at" text DEFAULT '' NOT NULL,
	"tutor_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"tutor_id" uuid NOT NULL,
	"name" text NOT NULL,
	"initial" text NOT NULL,
	"level" text NOT NULL,
	"goal" text NOT NULL,
	"native" text NOT NULL,
	"lesson_count" integer DEFAULT 0 NOT NULL,
	"vocab_count" integer DEFAULT 0 NOT NULL,
	"last_seen" text NOT NULL,
	"focus" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"trend" "student_trend" DEFAULT 'steady' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"target_exam" text,
	"interests" jsonb,
	"start_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tutors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tutor_id_tutors_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_tutor_id_tutors_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("id") ON DELETE cascade ON UPDATE no action;