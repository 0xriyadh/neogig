import { z } from "zod";
import { userRoleEnum } from "../db/schema/user";

export const userResponseSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(userRoleEnum.enumValues),
    profileCompleted: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createUserInputSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 6 characters long" }),
    role: z.enum(userRoleEnum.enumValues, {
        errorMap: () => ({ message: "Invalid role" }),
    }),
});

export const updateUserInputSchema = z.object({
    id: z.string().uuid({ message: "Invalid user ID format" }), // ID is now part of the input object
    email: z.string().email({ message: "Invalid email address" }).optional(),
    profileCompleted: z.boolean().optional(),
    role: z
        .enum(userRoleEnum.enumValues, {
            errorMap: () => ({ message: "Invalid role" }),
        })
        .optional(),
});

export const userIdInputSchema = z.object({
    id: z.string().uuid({ message: "Invalid user ID format" }),
});

export const updateJobSeekerProfileSchema = z.object({
    id: z.string().uuid({ message: "Invalid user ID format" }),
    profile: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        address: z.string().min(5, "Address must be at least 5 characters"),
        gender: z.string().min(1, "Please select a gender"),
        mobile: z.string().min(10, "Please enter a valid mobile number"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        preferredJobType: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
        availableSchedule: z.string().optional(),
        currentlyLookingForJob: z.boolean().default(true),
        openToUrgentJobs: z.boolean().default(false),
        lastMinuteAvailability: z.boolean().default(false),
    }),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type UserIdInput = z.infer<typeof userIdInputSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UpdateJobSeekerProfileInput = z.infer<typeof updateJobSeekerProfileSchema>;
