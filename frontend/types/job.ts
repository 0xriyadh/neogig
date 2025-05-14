export type JobType = "REMOTE" | "ONSITE" | "HYBRID";
export type ExperienceLevel = "ENTRY" | "MID" | "SENIOR";
export type JobContractType = "PART_TIME" | "CONTRACT";

export interface TimeSlot {
    start: string;
    end: string;
}

export interface Schedule {
    [key: string]: TimeSlot;
}

export interface Job {
    id: string;
    companyId: string;
    title: string;
    description: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    jobType?: JobType;
    probableSchedule?: Schedule;
    jobContractType: JobContractType;
    experienceLevel?: ExperienceLevel;
    minimumWeeklyHourCommitment?: number;
    requiredSkills?: string[];
    isActive?: boolean;
    isUrgent?: boolean;
    createdAt: string;
    updatedAt: string;
}
