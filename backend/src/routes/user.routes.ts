import { router, publicProcedure, protectedProcedure } from "../config/trpc";
import * as userService from "../services/userService";
import {
    createUserInputSchema,
    updateUserInputSchema,
    userIdInputSchema,
    updateJobSeekerProfileSchema,
} from "../models/user.models";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const userRouter = router({
    getMe: protectedProcedure.query(async ({ ctx }) => {
        const { id: userId, role } = ctx.user;

        try {
            return await userService.getUserProfileDetails(userId, role);
        } catch (error: any) {
            console.error("Error in getMe route:", error);
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch user details.",
            });
        }
    }),

    // Query to get all users
    getAll: publicProcedure.query(async () => {
        try {
            return await userService.getAllUsers();
        } catch (error: any) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: error.message || "Failed to fetch users",
            });
        }
    }),

    // Query to get a single user by ID
    getById: publicProcedure
        .input(userIdInputSchema) // Validate input using Zod schema
        .query(async ({ input }) => {
            try {
                const user = await userService.getUserById(input.id);
                if (!user) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `User with ID ${input.id} not found`,
                    });
                }
                return user;
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message || "Failed to fetch user",
                });
            }
        }),

    // Mutation to create a new user
    create: publicProcedure
        .input(createUserInputSchema) // Validate input using Zod schema
        .mutation(async ({ input }) => {
            try {
                return await userService.createUser(input);
            } catch (error: any) {
                if (error.message?.includes("already exists")) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: error.message,
                    });
                }
                throw new TRPCError({
                    code: "BAD_REQUEST", // Or INTERNAL_SERVER_ERROR depending on cause
                    message: error.message || "Failed to create user",
                });
            }
        }),

    // Mutation to update an existing user
    update: protectedProcedure
        .input(updateUserInputSchema) // Validate input using Zod schema
        .mutation(async ({ input }) => {
            try {
                const { id, ...updateData } = input;
                const updatedUser = await userService.updateUser(
                    id,
                    updateData
                );
                if (!updatedUser) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `User with ID ${id} not found for update`,
                    });
                }
                return updatedUser;
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                // Handle specific errors like "No update data provided"
                if (
                    error.message?.includes("No update data") ||
                    error.message?.includes("Password updates")
                ) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: error.message,
                    });
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR", // Or BAD_REQUEST depending on the exact error
                    message: error.message || "Failed to update user",
                });
            }
        }),

    // Mutation to delete a user
    delete: publicProcedure
        .input(userIdInputSchema) // Validate input using Zod schema
        .mutation(async ({ input }) => {
            try {
                const success = await userService.deleteUser(input.id);
                if (!success) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `User with ID ${input.id} not found or already deleted`,
                    });
                }
                // tRPC mutations typically return the result or confirmation
                // Returning null or a success message is common for deletions
                return { success: true, message: "User deleted successfully" };
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message || "Failed to delete user",
                });
            }
        }),

    updateJobSeekerProfile: protectedProcedure
        .input(updateJobSeekerProfileSchema)
        .mutation(async ({ ctx, input }) => {
            if (ctx.user.role !== "JOBSEEKER") {
                throw new Error("Only jobseekers can update their profile");
            }

            const updatedProfile = await userService.updateJobSeekerProfile(
                ctx.user.id,
                input.profile
            );

            return updatedProfile;
        }),
});
