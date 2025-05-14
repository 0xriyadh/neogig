ALTER TABLE "jobs" ADD COLUMN "probable_schedule" json;--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "probable_schedule";