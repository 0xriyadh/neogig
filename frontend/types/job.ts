export type WorkType = "REMOTE" | "ONSITE" | "HYBRID";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead";
export type JobContractType = "PART_TIME" | "CONTRACT";
export interface Job {
    id: string;
    companyId: string;
    title: string;
    description: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    jobType?: WorkType;
    jobContractType: JobContractType;
    experienceLevel?: ExperienceLevel;
    requiredSkills?: string[] | string;
    isUrgent?: boolean;
    isActive: boolean;
    minimumWeeklyHourCommitment?: number;
    createdAt: string;
    updatedAt: string;
}
