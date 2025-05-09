import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { jobs } from "./job";
import { jobSeekers } from "./jobSeeker";

export const jobQuestions = pgTable("job_questions", {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
        .notNull()
        .references(() => jobs.id, { onDelete: "cascade" }),
    jobSeekerId: uuid("job_seeker_id")
        .notNull()
        .references(() => jobSeekers.userId, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer"),
    isAnswered: boolean("is_answered").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type JobQuestion = typeof jobQuestions.$inferSelect;
export type NewJobQuestion = typeof jobQuestions.$inferInsert; 