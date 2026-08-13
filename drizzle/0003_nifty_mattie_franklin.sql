CREATE TYPE "public"."tutor_plan" AS ENUM('free', 'starter', 'pro', 'unlimited');--> statement-breakpoint
--> Grandfathering: the column is added with a default of 'unlimited' so every
--> tutor that existed before billing was introduced keeps working uninterrupted,
--> then the default flips to 'free' for everyone who signs up from here on. Doing
--> it in this order (rather than adding 'free' and UPDATE-ing afterwards) means
--> there is never an instant where an existing tutor is capped.
ALTER TABLE "tutors" ADD COLUMN "plan" "tutor_plan" DEFAULT 'unlimited' NOT NULL;--> statement-breakpoint
ALTER TABLE "tutors" ALTER COLUMN "plan" SET DEFAULT 'free';
