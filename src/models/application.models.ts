import { z } from "zod";
import { applicationStatusEnum } from "../db/schema/application";

// Base response schema
export const applicationResponseSchema = z.object({
    id: z.string().uuid(),
    jobId: z.string().uuid(),
    jobSeekerId: z.string().uuid(),
    status: z.enum(applicationStatusEnum.enumValues),
    coverLetter: z.string().nullish(),
    appliedAt: z.date(),
    updatedAt: z.date(),
});

// Input for creating an application (job seeker applies for a job)
export const createApplicationInputSchema = z.object({
    jobId: z.string().uuid({ message: "Valid Job ID required" }),
    jobSeekerId: z
        .string()
        .uuid({ message: "Valid Job Seeker user ID required" }),
    coverLetter: z.string().optional(),
    // Status is typically defaulted to PENDING on creation
});

// Input for updating an application (e.g., company changes status)
export const updateApplicationInputSchema = z.object({
    id: z.string().uuid({ message: "Application ID is required for update" }),
    status: z.enum(applicationStatusEnum.enumValues, {
        errorMap: () => ({ message: "Invalid application status" }),
    }),
    // Maybe allow updating cover letter? Decide based on requirements.
    // coverLetter: z.string().optional(),
});

// Input for fetching/deleting by application ID
export const applicationIdInputSchema = z.object({
    id: z.string().uuid({ message: "Invalid Application ID format" }),
});

// Input for fetching applications by Job ID
export const applicationsByJobIdInputSchema = z.object({
    jobId: z.string().uuid({ message: "Invalid Job ID format" }),
});

// Input for fetching applications by Job Seeker ID
export const applicationsBySeekerIdInputSchema = z.object({
    jobSeekerId: z
        .string()
        .uuid({ message: "Invalid Job Seeker user ID format" }),
});

// Export types
export type CreateApplicationInput = z.infer<
    typeof createApplicationInputSchema
>;
export type UpdateApplicationInput = z.infer<
    typeof updateApplicationInputSchema
>;
export type ApplicationIdInput = z.infer<typeof applicationIdInputSchema>;
export type ApplicationsByJobIdInput = z.infer<
    typeof applicationsByJobIdInputSchema
>;
export type ApplicationsBySeekerIdInput = z.infer<
    typeof applicationsBySeekerIdInputSchema
>;
export type ApplicationResponse = z.infer<typeof applicationResponseSchema>;
