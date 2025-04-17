import { db } from "../db";
import {
    Application,
    NewApplication,
    applications,
} from "../db/schema/application";
import { eq, desc, and } from "drizzle-orm";
import {
    CreateApplicationInput,
    UpdateApplicationInput,
} from "../models/application.models";

// Service to get all applications (admin use? needs filtering/pagination)
export const getAllApplications = async (): Promise<Application[]> => {
    return await db
        .select()
        .from(applications)
        .orderBy(desc(applications.appliedAt));
};

// Service to get a single application by ID
export const getApplicationById = async (
    id: string
): Promise<Application | undefined> => {
    const app = await db
        .select()
        .from(applications)
        .where(eq(applications.id, id))
        .limit(1);
    return app[0];
};

// Service to get applications for a specific job
export const getApplicationsByJobId = async (
    jobId: string
): Promise<Application[]> => {
    return await db
        .select()
        .from(applications)
        .where(eq(applications.jobId, jobId))
        .orderBy(desc(applications.appliedAt));
};

// Service to get applications submitted by a specific job seeker
export const getApplicationsBySeekerId = async (
    jobSeekerId: string
): Promise<Application[]> => {
    return await db
        .select()
        .from(applications)
        .where(eq(applications.jobSeekerId, jobSeekerId))
        .orderBy(desc(applications.appliedAt));
};

// Service to create a new application
export const createApplication = async (
    appData: CreateApplicationInput
): Promise<Application> => {
    // Check if seeker has already applied for this job
    const existing = await db
        .select()
        .from(applications)
        .where(
            and(
                eq(applications.jobId, appData.jobId),
                eq(applications.jobSeekerId, appData.jobSeekerId)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        throw new Error("You have already applied for this job");
    }

    // Optional: Check if job exists and is active
    // Optional: Check if job seeker profile exists

    const newApplication: NewApplication = {
        ...appData,
        status: "PENDING", // Explicitly set default status
    };

    const insertedApp = await db
        .insert(applications)
        .values(newApplication)
        .returning();

    if (!insertedApp[0]) {
        throw new Error("Failed to create application");
    }
    return insertedApp[0];
};

// Service to update an application (e.g., update status)
export const updateApplication = async (
    id: string,
    appData: Omit<UpdateApplicationInput, "id">
): Promise<Application | undefined> => {
    if (Object.keys(appData).length === 0) {
        throw new Error(
            "No update data provided (only status can be updated here)"
        );
    }

    const existingApp = await getApplicationById(id);
    if (!existingApp) {
        return undefined; // Or throw: Application not found
    }

    // Add permission checks: Only the company that owns the job or the applicant should update?
    // For now, only allowing status update:
    const updatedData: Partial<
        Omit<
            NewApplication,
            "id" | "jobId" | "jobSeekerId" | "appliedAt" | "coverLetter"
        > & { updatedAt: Date }
    > = {
        status: appData.status,
        updatedAt: new Date(),
    };

    const updatedApp = await db
        .update(applications)
        .set(updatedData)
        .where(eq(applications.id, id))
        .returning();

    return updatedApp[0];
};

// Service to delete an application (e.g., applicant withdraws)
export const deleteApplication = async (id: string): Promise<boolean> => {
    // Add permission check: Only the applicant who made the application can delete?
    const deletedApps = await db
        .delete(applications)
        .where(eq(applications.id, id))
        .returning({ id: applications.id });
    return deletedApps.length > 0;
};
