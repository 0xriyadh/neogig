CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'REVIEWED', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('ENTRY', 'MID', 'SENIOR', 'LEAD');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('REMOTE', 'ONSITE', 'HYBRID');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"job_seeker_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"cover_letter" text,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"location" text,
	"salary_min" integer,
	"salary_max" integer,
	"job_type" "job_type",
	"experience_level" "experience_level",
	"minimum_weekly_hour_commitment" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_seeker_id_job_seekers_user_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seekers"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_user_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("user_id") ON DELETE cascade ON UPDATE no action;