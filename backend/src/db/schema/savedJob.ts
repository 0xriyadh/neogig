import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { jobs } from "./job";
import { jobSeekers } from "./jobSeeker";

export const savedJobs = pgTable("saved_jobs", {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
        .notNull()
        .references(() => jobs.id, { onDelete: "cascade" }),
    jobSeekerId: uuid("job_seeker_id")
        .notNull()
        .references(() => jobSeekers.userId, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export type SavedJob = typeof savedJobs.$inferSelect;
export type NewSavedJob = typeof savedJobs.$inferInsert; 