ALTER TABLE "tutors" ADD COLUMN "capture_token" text;--> statement-breakpoint
ALTER TABLE "tutors" ADD CONSTRAINT "tutors_capture_token_unique" UNIQUE("capture_token");