ALTER TYPE "public"."job_category" RENAME TO "job_contract_type";--> statement-breakpoint
ALTER TABLE "jobs" RENAME COLUMN "job_category" TO "job_contract_type";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "experience_level" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."experience_level";--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('ENTRY', 'MID', 'SENIOR');--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "experience_level" SET DATA TYPE "public"."experience_level" USING "experience_level"::"public"."experience_level";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "job_contract_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."job_contract_type";--> statement-breakpoint
CREATE TYPE "public"."job_contract_type" AS ENUM('PART_TIME', 'CONTRACT');--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "job_contract_type" SET DATA TYPE "public"."job_contract_type" USING "job_contract_type"::"public"."job_contract_type";