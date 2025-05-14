import { z } from "zod";
import { preferredJobTypeEnum } from "../db/schema/jobSeeker";

// Schema for the response
export const jobSeekerResponseSchema = z.object({
    userId: z.string().uuid(),
    name: z.string(),
    address: z.string().nullish(),
    gender: z.string().nullish(),
    mobile: z.string().nullish(),
    description: z.string().nullish(),
    preferredJobType: z.enum(preferredJobTypeEnum.enumValues).nullish(),
    availableSchedule: z.any().nullish(), // Keep as any for now, refine if specific structure emerges
    currentlyLookingForJob: z.boolean().nullish(),
    openToUrgentJobs: z.boolean().nullish(),
    lastMinuteAvailability: z.boolean().nullish(),
    skills: z.string().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Input schema for creating a job seeker profile
export const createJobSeekerInputSchema = z.object({
    userId: z.string().uuid({ message: "Valid user ID required" }),
    name: z.string().min(1, { message: "Name is required" }),
    address: z.string().optional(),
    gender: z.string().optional(),
    mobile: z.string().optional(),
    description: z.string().optional(),
    preferredJobType: z.enum(preferredJobTypeEnum.enumValues).optional(),
    openToUrgentJobs: z.boolean().optional(),
    lastMinuteAvailability: z.boolean().optional(),
    skills: z.string().optional(),
    availableSchedule: z.any().optional(),
    currentlyLookingForJob: z.boolean().optional(),
});

// Input schema for updating a job seeker profile
export const updateJobSeekerInputSchema = z
    .object({
        userId: z.string().uuid({ message: "User ID is required for update" }),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        gender: z.string().optional(),
        mobile: z.string().optional(),
        description: z.string().optional(),
        preferredJobType: z.enum(preferredJobTypeEnum.enumValues).optional(),
        availableSchedule: z.any().optional(),
        currentlyLookingForJob: z.boolean().optional(),
        openToUrgentJobs: z.boolean().optional(),
        lastMinuteAvailability: z.boolean().optional(),
        skills: z.string().optional(),
    })
    // Specify fields to make optional, keeping userId required
    .partial({
        name: true,
        address: true,
        gender: true,
        mobile: true,
        description: true,
        preferredJobType: true,
        availableSchedule: true,
        currentlyLookingForJob: true,
        openToUrgentJobs: true,
        lastMinuteAvailability: true,
        skills: true,
    })
    .refine(
        (data) =>
            Object.keys(data).some(
                (key) =>
                    key !== "userId" &&
                    data[key as keyof typeof data] !== undefined
            ),
        {
            message: "At least one field must be provided for update",
        }
    );

// Input schema for fetching/deleting by userId
export const jobSeekerIdInputSchema = z.object({
    userId: z.string().uuid({ message: "Invalid User ID format" }),
});

// Export types
export type CreateJobSeekerInput = z.infer<typeof createJobSeekerInputSchema>;
export type UpdateJobSeekerInput = z.infer<typeof updateJobSeekerInputSchema>;
export type JobSeekerIdInput = z.infer<typeof jobSeekerIdInputSchema>;
export type JobSeekerResponse = z.infer<typeof jobSeekerResponseSchema>;
