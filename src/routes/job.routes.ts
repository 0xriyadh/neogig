import { router, publicProcedure } from "../config/trpc";
import * as jobService from "../services/jobService";
import {
    createJobInputSchema,
    updateJobInputSchema,
    jobIdInputSchema,
} from "../models/job.models";
import { companyIdInputSchema } from "../models/company.models"; // For fetching jobs by company
import { TRPCError } from "@trpc/server";

export const jobRouter = router({
    // Query to get all jobs (publicly accessible)
    getAll: publicProcedure.query(async () => {
        try {
            return await jobService.getAllJobs();
        } catch (error: any) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: error.message || "Failed to fetch jobs",
            });
        }
    }),

    // Query to get a single job by ID (publicly accessible)
    getById: publicProcedure
        .input(jobIdInputSchema)
        .query(async ({ input }) => {
            try {
                const job = await jobService.getJobById(input.id);
                if (!job) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Job with ID ${input.id} not found`,
                    });
                }
                return job;
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message || "Failed to fetch job",
                });
            }
        }),

    // Query to get jobs posted by a specific company
    getByCompanyId: publicProcedure
        .input(companyIdInputSchema) // Reuse companyId schema
        .query(async ({ input }) => {
            try {
                // Note: companyId in jobs table references the userId from companies table
                return await jobService.getJobsByCompanyId(input.userId);
            } catch (error: any) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        error.message || "Failed to fetch jobs for company",
                });
            }
        }),

    // --- Mutations (potentially protected) ---
    // Consider adding authentication/authorization middleware here

    // Mutation to create a new job (protected - only companies)
    create: publicProcedure // TODO: Replace with protectedProcedure (company role)
        .input(createJobInputSchema)
        .mutation(async ({ input, ctx }) => {
            // Assuming context provides user info
            // TODO: Add check: ctx.user.role === 'company' && ctx.user.id === input.companyId
            try {
                return await jobService.createJob(input);
            } catch (error: any) {
                throw new TRPCError({
                    code: "BAD_REQUEST", // Or INTERNAL_SERVER_ERROR
                    message: error.message || "Failed to create job",
                });
            }
        }),

    // Mutation to update an existing job (protected - only owning company)
    update: publicProcedure // TODO: Replace with protectedProcedure (owning company)
        .input(updateJobInputSchema)
        .mutation(async ({ input, ctx }) => {
            // TODO: Add check: Fetch job, verify existingJob.companyId === ctx.user.id
            try {
                const { id, ...updateData } = input;
                const updatedJob = await jobService.updateJob(id, updateData);
                if (!updatedJob) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Job with ID ${id} not found for update`,
                    });
                }
                return updatedJob;
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
                    message: error.message || "Failed to update job",
                });
            }
        }),

    // Mutation to delete a job (protected - only owning company)
    delete: publicProcedure // TODO: Replace with protectedProcedure (owning company)
        .input(jobIdInputSchema)
        .mutation(async ({ input, ctx }) => {
            // TODO: Add check: Fetch job, verify existingJob.companyId === ctx.user.id
            try {
                const success = await jobService.deleteJob(input.id);
                if (!success) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Job with ID ${input.id} not found or already deleted`,
                    });
                }
                return { success: true, message: "Job deleted successfully" };
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message || "Failed to delete job",
                });
            }
        }),
});
