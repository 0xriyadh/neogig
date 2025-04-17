import { router, publicProcedure } from "../config/trpc";
import * as companyService from "../services/companyService";
import {
    createCompanyInputSchema,
    updateCompanyInputSchema,
    companyIdInputSchema,
} from "../models/company.models";
import { TRPCError } from "@trpc/server";

export const companyRouter = router({
    // Query to get all company profiles
    getAll: publicProcedure.query(async () => {
        try {
            return await companyService.getAllCompanies();
        } catch (error: any) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: error.message || "Failed to fetch companies",
            });
        }
    }),

    // Query to get a single company profile by userId
    getById: publicProcedure
        .input(companyIdInputSchema)
        .query(async ({ input }) => {
            try {
                const company = await companyService.getCompanyById(
                    input.userId
                );
                if (!company) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Company profile for user ID ${input.userId} not found`,
                    });
                }
                return company;
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message || "Failed to fetch company profile",
                });
            }
        }),

    // Mutation to create a new company profile
    create: publicProcedure
        .input(createCompanyInputSchema)
        .mutation(async ({ input }) => {
            try {
                return await companyService.createCompany(input);
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
                        error.message || "Failed to create company profile",
                });
            }
        }),

    // Mutation to update an existing company profile
    update: publicProcedure
        .input(updateCompanyInputSchema)
        .mutation(async ({ input }) => {
            try {
                const { userId, ...updateData } = input;
                const updatedCompany = await companyService.updateCompany(
                    userId,
                    updateData
                );
                if (!updatedCompany) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Company profile for user ID ${userId} not found for update`,
                    });
                }
                return updatedCompany;
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
                        error.message || "Failed to update company profile",
                });
            }
        }),

    // Mutation to delete a company profile
    delete: publicProcedure
        .input(companyIdInputSchema)
        .mutation(async ({ input }) => {
            try {
                const success = await companyService.deleteCompany(
                    input.userId
                );
                if (!success) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Company profile for user ID ${input.userId} not found or already deleted`,
                    });
                }
                return {
                    success: true,
                    message: "Company profile deleted successfully",
                };
            } catch (error: any) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        error.message || "Failed to delete company profile",
                });
            }
        }),
});
