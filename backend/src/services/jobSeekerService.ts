import { db } from "../db";
import { JobSeeker, NewJobSeeker, jobSeekers } from "../db/schema/jobSeeker";
import { eq } from "drizzle-orm";
import {
    CreateJobSeekerInput,
    UpdateJobSeekerInput,
} from "../models/jobSeeker.models";

// Service to get all job seeker profiles
export const getAllJobSeekers = async (): Promise<JobSeeker[]> => {
    return await db.select().from(jobSeekers);
};

// Service to get a single job seeker profile by userId
export const getJobSeekerById = async (
    userId: string
): Promise<JobSeeker | undefined> => {
    const seeker = await db
        .select()
        .from(jobSeekers)
        .where(eq(jobSeekers.userId, userId))
        .limit(1);
    return seeker[0];
};

// Service to create a new job seeker profile
export const createJobSeeker = async (
    seekerData: CreateJobSeekerInput
): Promise<JobSeeker> => {
    const existing = await getJobSeekerById(seekerData.userId);
    if (existing) {
        throw new Error("Job seeker profile already exists for this user");
    }

    // Optional: Further check if the user exists and has the 'applicant' role in the users table

    const newSeeker: NewJobSeeker = {
        ...seekerData,
        availableSchedule: seekerData.availableSchedule ?? null, // Handle optional JSON
    };

    const insertedSeeker = await db
        .insert(jobSeekers)
        .values(newSeeker)
        .returning();

    if (!insertedSeeker[0]) {
        throw new Error("Failed to create job seeker profile");
    }
    return insertedSeeker[0];
};

// Service to update an existing job seeker profile
export const updateJobSeeker = async (
    userId: string,
    seekerData: Omit<UpdateJobSeekerInput, "userId">
): Promise<JobSeeker | undefined> => {
    if (Object.keys(seekerData).length === 0) {
        throw new Error("No update data provided");
    }

    const existingSeeker = await getJobSeekerById(userId);
    if (!existingSeeker) {
        return undefined; // Or throw: Job seeker profile not found
    }

    const updatedData: Partial<
        Omit<NewJobSeeker, "userId" | "createdAt"> & { updatedAt: Date }
    > = {
        ...seekerData,
        availableSchedule: seekerData.availableSchedule ?? null,
        updatedAt: new Date(),
    };

    const updatedSeeker = await db
        .update(jobSeekers)
        .set(updatedData)
        .where(eq(jobSeekers.userId, userId))
        .returning();

    return updatedSeeker[0];
};

// Service to delete a job seeker profile by userId
export const deleteJobSeeker = async (userId: string): Promise<boolean> => {
    const deletedSeekers = await db
        .delete(jobSeekers)
        .where(eq(jobSeekers.userId, userId))
        .returning({ userId: jobSeekers.userId });
    return deletedSeekers.length > 0;
};
