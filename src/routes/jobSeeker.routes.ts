import { router, publicProcedure } from "../config/trpc";
import * as jobSeekerService from "../services/jobSeekerService";
import {
    createJobSeekerInputSchema,
    updateJobSeekerInputSchema,
    jobSeekerIdInputSchema,
} from "../models/jobSeeker.models";
import { TRPCError } from "@trpc/server";

export const jobSeekerRouter = router({
    // Query to get all job seeker profiles
    getAll: publicProcedure.query(async () => {
        try {
            return await jobSeekerService.getAllJobSeekers();
        } catch (error: any) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: error.message || "Failed to fetch job seekers",
            });
        }
    }),

    // Query to get a single job seeker profile by userId
    getById: publicProcedure
        .input(jobSeekerIdInputSchema)
        .query(async ({ input }) => {
            try {
                const seeker = await jobSeekerService.getJobSeekerById(
                    input.userId
                );
                if (!seeker) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Job seeker profile for user ID ${input.userId} not found`,
                    });
                }
                return seeker;
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        error.message || "Failed to fetch job seeker profile",
                });
            }
        }),

    // Mutation to create a new job seeker profile
    create: publicProcedure
        .input(createJobSeekerInputSchema)
        .mutation(async ({ input }) => {
            try {
                return await jobSeekerService.createJobSeeker(input);
            } catch (error: any) {
                if (error.message?.includes("already exists")) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: error.message,
                    });
                }
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message:
                        error.message || "Failed to create job seeker profile",
                });
            }
        }),

    // Mutation to update an existing job seeker profile
    update: publicProcedure
        .input(updateJobSeekerInputSchema)
        .mutation(async ({ input }) => {
            try {
                const { userId, ...updateData } = input;
                const updatedSeeker = await jobSeekerService.updateJobSeeker(
                    userId,
                    updateData
                );
                if (!updatedSeeker) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Job seeker profile for user ID ${userId} not found for update`,
                    });
                }
                return updatedSeeker;
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                if (error.message?.includes("No update data")) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: error.message,
                    });
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        error.message || "Failed to update job seeker profile",
                });
            }
        }),

    // Mutation to delete a job seeker profile
    delete: publicProcedure
        .input(jobSeekerIdInputSchema)
        .mutation(async ({ input }) => {
            try {
                const success = await jobSeekerService.deleteJobSeeker(
                    input.userId
                );
                if (!success) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Job seeker profile for user ID ${input.userId} not found or already deleted`,
                    });
                }
                return {
                    success: true,
                    message: "Job seeker profile deleted successfully",
                };
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        error.message || "Failed to delete job seeker profile",
                });
            }
        }),
});
