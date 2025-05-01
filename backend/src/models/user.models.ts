import { z } from "zod";
import { userRoleEnum } from "../db/schema/user";

// Base schema without password for responses
export const userResponseSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(userRoleEnum.enumValues),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Schema for creating a user (input for tRPC)
export const createUserInputSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
    role: z.enum(userRoleEnum.enumValues, {
        errorMap: () => ({ message: "Invalid role" }),
    }),
});

// Schema for updating a user (input for tRPC)
export const updateUserInputSchema = z
    .object({
        id: z.string().uuid({ message: "Invalid user ID format" }), // ID is now part of the input object
        email: z
            .string()
            .email({ message: "Invalid email address" })
            .optional(),
        // password: z.string().min(6, { message: 'Password must be at least 6 characters long' }).optional(), // Handle password separately
        role: z
            .enum(userRoleEnum.enumValues, {
                errorMap: () => ({ message: "Invalid role" }),
            })
            .optional(),
    })
    .partial({ email: true, role: true }) // Make email and role optional for partial updates
    .refine((data) => data.email !== undefined || data.role !== undefined, {
        message:
            "At least one field (email or role) must be provided for update",
        // Apply refinement only when it matters, typically after ensuring 'id' is present.
        // path: [], // Optional: specify a path for the error, e.g., ['body'] if needed structure
    });

// Schema for fetching/deleting a user by ID (input for tRPC)
export const userIdInputSchema = z.object({
    id: z.string().uuid({ message: "Invalid user ID format" }),
});

// Keep original inferred types if needed elsewhere, or update as necessary
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type UserIdInput = z.infer<typeof userIdInputSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
