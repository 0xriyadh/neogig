// Enums derived from backend/src/db/schema/job.ts

export const jobTypeEnum = {
    name: "job_type",
    enumValues: ["REMOTE", "ONSITE", "HYBRID"],
} as const;

export type JobType = (typeof jobTypeEnum.enumValues)[number];

export const experienceLevelEnum = {
    name: "experience_level",
    enumValues: ["ENTRY", "MID", "SENIOR", "LEAD"],
} as const;

export type ExperienceLevel = (typeof experienceLevelEnum.enumValues)[number];
