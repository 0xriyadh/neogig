import { db } from "../db";
import { Job, NewJob, jobs } from "../db/schema/job";
import { eq, desc, asc } from "drizzle-orm"; // Import ordering functions if needed
import { CreateJobInput, UpdateJobInput } from "../models/job.models";

// Service to get all jobs (consider pagination and filtering later)
export const getAllJobs = async (): Promise<Job[]> => {
    // Example: Order by creation date descending
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
};

// Service to get a single job by ID
export const getJobById = async (id: string): Promise<Job | undefined> => {
    const job = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return job[0];
};

// Service to get jobs by company ID
export const getJobsByCompanyId = async (companyId: string): Promise<Job[]> => {
    return await db
        .select()
        .from(jobs)
        .where(eq(jobs.companyId, companyId))
        .orderBy(desc(jobs.createdAt));
};

// Service to create a new job
export const createJob = async (jobData: CreateJobInput): Promise<Job> => {
    // Optional: Check if the companyId exists in the companies table
    // const companyExists = await db.select().from(companies).where(eq(companies.userId, jobData.companyId)).limit(1);
    // if (companyExists.length === 0) {
    //     throw new Error('Company posting this job does not exist');
    // }

    const newJob: NewJob = {
        ...jobData,
        jobContractType: jobData.jobCategory, // Map jobCategory to jobContractType
        // Ensure defaults or nulls are handled for optional fields if necessary
    };

    const insertedJob = await db.insert(jobs).values(newJob).returning();

    if (!insertedJob[0]) {
        throw new Error("Failed to create job");
    }
    return insertedJob[0];
};

// Service to update an existing job
export const updateJob = async (
    id: string,
    jobData: Omit<UpdateJobInput, "id">
): Promise<Job | undefined> => {
    if (Object.keys(jobData).length === 0) {
        throw new Error("No update data provided");
    }

    const existingJob = await getJobById(id);
    if (!existingJob) {
        return undefined; // Or throw: Job not found
    }

    // Add company check - ensure only the company that owns the job can update it (needs context/auth)

    const updatedData: Partial<
        Omit<NewJob, "id" | "companyId" | "createdAt"> & { updatedAt: Date }
    > = {
        ...jobData,
        updatedAt: new Date(),
    };

    const updatedJob = await db
        .update(jobs)
        .set(updatedData)
        .where(eq(jobs.id, id))
        .returning();

    return updatedJob[0];
};

// Service to delete a job by ID
export const deleteJob = async (id: string): Promise<boolean> => {
    // Add company check - ensure only the company that owns the job can delete it (needs context/auth)
    const deletedJobs = await db
        .delete(jobs)
        .where(eq(jobs.id, id))
        .returning({ id: jobs.id });
    return deletedJobs.length > 0;
};

export class JobService {
    static async createJob(job: NewJob): Promise<Job> {
        const [newJob] = await db.insert(jobs).values(job).returning();
        return newJob;
    }

    static async getJobs(): Promise<Job[]> {
        return await db.select().from(jobs).orderBy(jobs.createdAt);
    }

    static async getJobById(id: string): Promise<Job | undefined> {
        const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
        return job;
    }

    static async updateJob(
        id: string,
        job: Partial<NewJob>
    ): Promise<Job | undefined> {
        const [updatedJob] = await db
            .update(jobs)
            .set({ ...job, updatedAt: new Date() })
            .where(eq(jobs.id, id))
            .returning();
        return updatedJob;
    }

    static async deleteJob(id: string): Promise<Job | undefined> {
        const [deletedJob] = await db
            .delete(jobs)
            .where(eq(jobs.id, id))
            .returning();
        return deletedJob;
    }
}
