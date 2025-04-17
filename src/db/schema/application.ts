import { pgTable, uuid, pgEnum, text, timestamp } from "drizzle-orm/pg-core";
import { jobs } from "./job";
import { jobSeekers } from "./jobSeeker";

export const applicationStatusEnum = pgEnum("application_status", [
    "PENDING",
    "REVIEWED",
    "INTERVIEWING",
    "OFFERED",
    "REJECTED",
    "WITHDRAWN",
]);

export const applications = pgTable("applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
        .notNull()
        .references(() => jobs.id, { onDelete: "cascade" }), // Application for a specific job
    jobSeekerId: uuid("job_seeker_id")
        .notNull()
        .references(() => jobSeekers.userId, { onDelete: "cascade" }), // Application by a specific seeker
    status: applicationStatusEnum("status").default("PENDING").notNull(),
    coverLetter: text("cover_letter"),
    appliedAt: timestamp("applied_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Status updates, etc.
});

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
