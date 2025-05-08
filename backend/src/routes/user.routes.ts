import { router, publicProcedure, protectedProcedure } from "../config/trpc";
import * as userService from "../services/userService";
import {
    createUserInputSchema,
    updateUserInputSchema,
    userIdInputSchema,
} from "../models/user.models";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import schema from "../db/schema";
import { eq } from "drizzle-orm";

export const userRouter = router({
    getMe: protectedProcedure.query(async ({ ctx }) => {
        const { id: userId, role } = ctx.user;

        try {
            const baseUser = await db
                .select({
                    id: schema.users.id,
                    email: schema.users.email,
                    role: schema.users.role,
                    createdAt: schema.users.createdAt,
                    updatedAt: schema.users.updatedAt,
                })
                .from(schema.users)
                .where(eq(schema.users.id, userId))
                .limit(1);

            if (!baseUser || baseUser.length === 0) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found.",
                });
            }

            let profileData: any = null;

            if (role === "applicant") {
                const jobSeekerProfile = await db
                    .select()
                    .from(schema.jobSeekers)
                    .where(eq(schema.jobSeekers.userId, userId))
                    .limit(1);
                if (jobSeekerProfile.length > 0) {
                    profileData = jobSeekerProfile[0];
                } else {
                    console.warn(
                        `Job seeker profile not found for user ID: ${userId}`
                    );
                }
            } else if (role === "company") {
                const companyProfile = await db
                    .select()
                    .from(schema.companies)
                    .where(eq(schema.companies.userId, userId))
                    .limit(1);
                if (companyProfile.length > 0) {
                    profileData = companyProfile[0];
                } else {
                    console.warn(
                        `Company profile not found for user ID: ${userId}`
                    );
                }
            }

            return {
                ...baseUser[0],
                profile: profileData,
            };
        } catch (error: any) {
            console.error("Error in getMe:", error);
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
    update: publicProcedure
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
});
