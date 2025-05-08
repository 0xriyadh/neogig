import { router, publicProcedure } from "../config/trpc";
import * as applicationService from "../services/applicationService";
import {
    createApplicationInputSchema,
    updateApplicationInputSchema,
    applicationIdInputSchema,
    applicationsByJobIdInputSchema,
    applicationsBySeekerIdInputSchema,
} from "../models/application.models";
import { TRPCError } from "@trpc/server";

export const applicationRouter = router({
    // Query to get a single application by ID (protected? depends on who can view)
    getById: publicProcedure // TODO: Add protection (jobseeker or company owner)
        .input(applicationIdInputSchema)
        .query(async ({ input, ctx }) => {
            try {
                const application = await applicationService.getApplicationById(
                    input.id
                );
                if (!application) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Application with ID ${input.id} not found`,
                    });
                }
                // TODO: Add check: application.jobSeekerId === ctx.user.id || companyOwnsJob(application.jobId, ctx.user.id)
                return application;
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message || "Failed to fetch application",
                });
            }
        }),

    // Query to get applications for a specific job (protected - company owner)
    getByJobId: publicProcedure // TODO: Add protection (company owner)
        .input(applicationsByJobIdInputSchema)
        .query(async ({ input, ctx }) => {
            // TODO: Add check: companyOwnsJob(input.jobId, ctx.user.id)
            try {
                return await applicationService.getApplicationsByJobId(
                    input.jobId
                );
            } catch (error: any) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        error.message || "Failed to fetch applications for job",
                });
            }
        }),

    // Query to get applications by a specific job seeker (protected - jobseeker only)
    getBySeekerId: publicProcedure // TODO: Add protection (jobseeker)
        .input(applicationsBySeekerIdInputSchema)
        .query(async ({ input, ctx }) => {
            // TODO: Add check: input.jobSeekerId === ctx.user.id
            try {
                return await applicationService.getApplicationsBySeekerId(
                    input.jobSeekerId
                );
            } catch (error: any) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        error.message ||
                        "Failed to fetch applications for seeker",
                });
            }
        }),

    // --- Mutations (potentially protected) ---

    // Mutation to create a new application (protected - jobseeker only)
    create: publicProcedure // TODO: Replace with protectedProcedure (jobseeker role)
        .input(createApplicationInputSchema)
        .mutation(async ({ input, ctx }) => {
            // TODO: Add check: ctx.user.role === 'jobseeker' && ctx.user.id === input.jobSeekerId
            try {
                return await applicationService.createApplication(input);
            } catch (error: any) {
                if (error.message?.includes("already applied")) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: error.message,
                    });
                }
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: error.message || "Failed to submit application",
                });
            }
        }),

    // Mutation to update an application status (protected - company owner)
    updateStatus: publicProcedure // TODO: Replace with protectedProcedure (company owner)
        .input(updateApplicationInputSchema) // Requires application ID and new status
        .mutation(async ({ input, ctx }) => {
            // TODO: Add check: companyOwnsJobAssociatedWithApplication(input.id, ctx.user.id)
            try {
                const { id, ...updateData } = input;
                const updatedApplication =
                    await applicationService.updateApplication(id, updateData);
                if (!updatedApplication) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Application with ID ${id} not found for update`,
                    });
                }
                return updatedApplication;
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
                        error.message || "Failed to update application status",
                });
            }
        }),

    // Mutation to delete/withdraw an application (protected - jobseeker only)
    delete: publicProcedure // TODO: Replace with protectedProcedure (jobseeker)
        .input(applicationIdInputSchema)
        .mutation(async ({ input, ctx }) => {
            // TODO: Add check: applicationBelongsToUser(input.id, ctx.user.id)
            try {
                const success = await applicationService.deleteApplication(
                    input.id
                );
                if (!success) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Application with ID ${input.id} not found or already deleted`,
                    });
                }
                return {
                    success: true,
                    message: "Application withdrawn successfully",
                };
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message || "Failed to withdraw application",
                });
            }
        }),
});
