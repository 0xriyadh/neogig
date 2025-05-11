import { z } from "zod";
import {
    jobTypeEnum,
    experienceLevelEnum,
    jobContractTypeEnum,
} from "../db/schema/job";

// Base response schema
export const jobResponseSchema = z.object({
    id: z.string().uuid(),
    companyId: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    location: z.string().nullish(),
    salaryMin: z.number().int().nullish(),
    salaryMax: z.number().int().nullish(),
    jobType: z.enum(jobTypeEnum.enumValues).nullish(),
    jobContractType: z.enum(jobContractTypeEnum.enumValues),
    experienceLevel: z.enum(experienceLevelEnum.enumValues).nullish(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Input for creating a job
export const createJobInputSchema = z
    .object({
        companyId: z
            .string()
            .uuid({ message: "Valid company user ID required" }),
        title: z.string().min(1, { message: "Job title is required" }),
        description: z
            .string()
            .min(1, { message: "Job description is required" }),
        location: z.string().optional(),
        salaryMin: z.number().int().positive().optional(),
        salaryMax: z.number().int().positive().optional(),
        jobType: z.enum(jobTypeEnum.enumValues).optional(),
        jobContractType: z.enum(jobContractTypeEnum.enumValues, {
            required_error: "Job contract type is required",
            invalid_type_error: "Invalid job contract type",
        }),
        experienceLevel: z.enum(experienceLevelEnum.enumValues).optional(),
        isActive: z.boolean().optional(), // Default is true in schema
    })
    .refine(
        (data) =>
            !data.salaryMin ||
            !data.salaryMax ||
            data.salaryMax >= data.salaryMin,
        {
            message:
                "Maximum salary must be greater than or equal to minimum salary",
            path: ["salaryMax"], // or ["salaryMin", "salaryMax"]
        }
    );

// Input for updating a job
export const updateJobInputSchema = z
    .object({
        id: z.string().uuid({ message: "Job ID is required for update" }), // ID to identify the job
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        location: z.string().optional(),
        salaryMin: z.number().int().positive().optional(),
        salaryMax: z.number().int().positive().optional(),
        jobType: z.enum(jobTypeEnum.enumValues).optional(),
        experienceLevel: z.enum(experienceLevelEnum.enumValues).optional(),
        isActive: z.boolean().optional(),
    })
    .partial({
        // Make all fields optional except id
        title: true,
        description: true,
        location: true,
        salaryMin: true,
        salaryMax: true,
        jobType: true,
        experienceLevel: true,
        isActive: true,
    })
    .refine(
        (data) =>
            Object.keys(data).some(
                (key) =>
                    key !== "id" && data[key as keyof typeof data] !== undefined
            ),
        { message: "At least one field must be provided for update" }
    )
    .refine(
        (data) =>
            !data.salaryMin ||
            !data.salaryMax ||
            data.salaryMax >= data.salaryMin,
        {
            message:
                "Maximum salary must be greater than or equal to minimum salary",
            path: ["salaryMax"],
        }
    );

// Input for fetching/deleting by job ID
export const jobIdInputSchema = z.object({
    id: z.string().uuid({ message: "Invalid Job ID format" }),
});

// Export types
export type CreateJobInput = z.infer<typeof createJobInputSchema>;
export type UpdateJobInput = z.infer<typeof updateJobInputSchema>;
export type JobIdInput = z.infer<typeof jobIdInputSchema>;
export type JobResponse = z.infer<typeof jobResponseSchema>;
