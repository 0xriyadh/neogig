CREATE TYPE "public"."job_category" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE');--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "job_category" "job_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "required_skills" text[];--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "is_urgent" boolean DEFAULT false NOT NULL;