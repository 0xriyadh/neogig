import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    pgEnum,
    boolean,
    timestamp,
} from "drizzle-orm/pg-core";
import { companies } from "./company";

// Enum for job type - reusing from jobSeeker for consistency if applicable, or define anew
export const jobTypeEnum = pgEnum("job_type", ["REMOTE", "ONSITE", "HYBRID"]);

// Enum for job contract type (full-time, part-time, etc.)
export const jobContractTypeEnum = pgEnum("job_contract_type", [
    "PART_TIME",
    "CONTRACT",
]);

// Optional: Enum for experience level
export const experienceLevelEnum = pgEnum("experience_level", [
    "ENTRY",
    "MID",
    "SENIOR",
]);

export const jobs = pgTable("jobs", {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.userId, { onDelete: "cascade" }), // Jobs belong to a company
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    location: text("location"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    jobType: jobTypeEnum("job_type"),
    jobContractType: jobContractTypeEnum("job_contract_type").notNull(),
    experienceLevel: experienceLevelEnum("experience_level"),
    minimumWeeklyHourCommitment: integer("minimum_weekly_hour_commitment"),
    requiredSkills: text("required_skills").array(),
    isUrgent: boolean("is_urgent").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
