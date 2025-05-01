CREATE TYPE "public"."industry" AS ENUM('TECH', 'AGRI', 'HEALTH', 'FINANCE', 'EDUCATION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."preferred_job_type" AS ENUM('REMOTE', 'ONSITE', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('applicant', 'company');--> statement-breakpoint
CREATE TABLE "companies" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" text,
	"phone" varchar(20),
	"industry" "industry",
	"description" text,
	"registration_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_seekers" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"gender" varchar(50),
	"mobile" varchar(20),
	"description" text,
	"preferred_job_type" "preferred_job_type",
	"available_schedule" json,
	"currently_looking_for_job" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seekers" ADD CONSTRAINT "job_seekers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;