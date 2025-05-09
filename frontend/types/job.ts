export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance';
export type WorkType = 'REMOTE' | 'ONSITE' | 'HYBRID';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead';
export type JobCategory = 'engineering' | 'design' | 'marketing' | 'sales' | 'product' | 'other';

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  type: JobType;
  jobType?: WorkType;
  jobCategory: JobCategory;
  experienceLevel?: ExperienceLevel;
  requiredSkills?: string[] | string;
  isUrgent?: boolean;
  isActive: boolean;
  minimumWeeklyHourCommitment?: number;
  createdAt: string;
  updatedAt: string;
} 