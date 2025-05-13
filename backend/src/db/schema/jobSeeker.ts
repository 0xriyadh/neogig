import {
    pgTable,
    text,
    varchar,
    boolean,
    json,
    pgEnum,
    uuid,
    timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const preferredJobTypeEnum = pgEnum("preferred_job_type", [
    "REMOTE",
    "ONSITE",
    "HYBRID",
]);

export const jobSeekers = pgTable("job_seekers", {
    userId: uuid("user_id")
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    address: text("address"),
    gender: varchar("gender", { length: 50 }),
    mobile: varchar("mobile", { length: 20 }),
    description: text("description"),
    preferredJobType: preferredJobTypeEnum("preferred_job_type"),
    availableSchedule: json("available_schedule"), // Consider a more structured type later if needed
    skills: text("skills"),
    currentlyLookingForJob: boolean("currently_looking_for_job").default(true),
    openToUrgentJobs: boolean("open_to_urgent_jobs").default(false),
    lastMinuteAvailability: boolean("last_minute_availability").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type JobSeeker = typeof jobSeekers.$inferSelect;
export type NewJobSeeker = typeof jobSeekers.$inferInsert;
