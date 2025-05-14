import { z } from "zod";
import { industryEnum } from "../db/schema/company";

// Schema for the response (excluding potentially sensitive or redundant data)
export const companyResponseSchema = z.object({
    userId: z.string().uuid(),
    name: z.string(),
    location: z.string().nullish(),
    phone: z.string().nullish(),
    contactEmail: z.string().nullish(),
    website: z.string().nullish(),
    companySize: z.string().nullish(),
    industry: z.enum(industryEnum.enumValues).nullish(),
    description: z.string().nullish(),
    registrationDate: z.string().nullish(),
    activelyHiring: z.boolean().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Input schema for creating a company profile (associates with an existing user)
export const createCompanyInputSchema = z.object({
    userId: z.string().uuid({ message: "Valid user ID required" }),
    name: z.string().min(1, { message: "Company name is required" }),
    location: z.string().optional(),
    phone: z.string().optional(),
    contactEmail: z.string().optional(),
    website: z.string().optional(),
    companySize: z.string().optional(),
    industry: z.enum(industryEnum.enumValues).optional(),
    description: z.string().optional(),
    registrationDate: z.string().optional(),
    activelyHiring: z.boolean().optional(),
});

// Input schema for updating a company profile
export const updateCompanyInputSchema = z
    .object({
        userId: z.string().uuid({ message: "User ID is required for update" }),
        name: z
            .string()
            .min(1, { message: "Company name cannot be empty" })
            .optional(),
        location: z.string().optional(),
        phone: z.string().optional(),
        contactEmail: z.string().optional(),
        website: z.string().optional(),
        companySize: z.string().optional(),
        industry: z.enum(industryEnum.enumValues).optional(),
        description: z.string().optional(),
        registrationDate: z.string().optional(),
        activelyHiring: z.boolean().optional(),
    })
    .partial({
        name: true,
        location: true,
        phone: true,
        contactEmail: true,
        website: true,
        companySize: true,
        industry: true,
        description: true,
        registrationDate: true,
        activelyHiring: true,
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
export const companyIdInputSchema = z.object({
    userId: z.string().uuid({ message: "Invalid User ID format" }),
});

// Export types inferred from schemas
export type CreateCompanyInput = z.infer<typeof createCompanyInputSchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanyInputSchema>;
export type CompanyIdInput = z.infer<typeof companyIdInputSchema>;
export type CompanyResponse = z.infer<typeof companyResponseSchema>;
