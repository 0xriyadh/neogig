import { z } from "zod";
import { userRoleEnum } from "../db/schema/user";

// Common login schema
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6), // Basic password validation
});

// Base signup schema with common fields
const BaseSignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Applicant specific signup fields
export const ApplicantSignupSchema = BaseSignupSchema.extend({
    role: z.literal(userRoleEnum.enumValues[0]), // 'jobseeker'
    name: z.string().min(1, "Name is required"),
    // Add other required jobseeker fields from JobSeeker schema if needed for signup
    // e.g., mobile: z.string().optional(),
});

// Company specific signup fields
export const CompanySignupSchema = BaseSignupSchema.extend({
    role: z.literal(userRoleEnum.enumValues[1]), // 'company'
    name: z.string().min(1, "Company name is required"),
    // Add other required company fields from Company schema if needed for signup
    // e.g., location: z.string().optional(),
});

// Union schema for signup to handle both types
export const SignupSchema = z.union([
    ApplicantSignupSchema,
    CompanySignupSchema,
]);

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type ApplicantSignupInput = z.infer<typeof ApplicantSignupSchema>;
export type CompanySignupInput = z.infer<typeof CompanySignupSchema>;
