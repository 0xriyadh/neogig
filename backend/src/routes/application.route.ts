import { z } from "zod";
import { protectedProcedure, router } from "../config/trpc";
import { TRPCError } from "@trpc/server";
import { eq, and, not } from "drizzle-orm";
import { applications } from "../db/schema/application";
import { jobSeekers } from "../db/schema/jobSeeker";
import { db } from "../db";
import { type Context } from "../server";

export const applicationRouter = router({
    getByJobId: protectedProcedure
        .input(z.object({ jobId: z.string() }))
        .query(async ({ ctx, input }) => {
            const application = await db
                .select({
                    id: applications.id,
                    jobId: applications.jobId,
                    jobSeekerId: applications.jobSeekerId,
                    status: applications.status,
                    coverLetter: applications.coverLetter,
                    appliedAt: applications.appliedAt,
                    updatedAt: applications.updatedAt,
                    jobSeeker: {
                        id: jobSeekers.userId,
                        name: jobSeekers.name,
                        description: jobSeekers.description,
                        preferredJobType: jobSeekers.preferredJobType,
                        availableSchedule: jobSeekers.availableSchedule,
                        skills: jobSeekers.skills,
                    },
                })
                .from(applications)
                .leftJoin(
                    jobSeekers,
                    eq(applications.jobSeekerId, jobSeekers.userId)
                )
                .where(
                    and(
                        eq(applications.jobId, input.jobId),
                        not(eq(applications.status, "WITHDRAWN"))
                    )
                );
            return application;
        }),

    // getjob by jobId and userId, userId is in the ctx
    getByJobIdAndUserId: protectedProcedure
        .input(z.object({ jobId: z.string() }))
        .query(async ({ ctx, input }) => {
            const application = await db
                .select()
                .from(applications)
                .where(
                    and(
                        eq(applications.jobId, input.jobId),
                        eq(applications.jobSeekerId, ctx.user.id),
                        not(eq(applications.status, "WITHDRAWN"))
                    )
                );
            return application;
        }),

    updateStatus: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                status: z.enum([
                    "PENDING",
                    "REVIEWED",
                    "INTERVIEWING",
                    "OFFERED",
                    "REJECTED",
                    "WITHDRAWN",
                ]),
                response: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const application = await db
                .select()
                .from(applications)
                .where(eq(applications.id, input.id));

            if (!application.length) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Application not found",
                });
            }

            const [updatedApplication] = await db
                .update(applications)
                .set({
                    status: input.status,
                    updatedAt: new Date(),
                    ...(input.response && { response: input.response }),
                })
                .where(eq(applications.id, input.id))
                .returning();

            return updatedApplication;
        }),

    submitInterest: protectedProcedure
        .input(
            z.object({
                jobId: z.string(),
                coverLetter: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if user already has an application
            const existingApplication = await db
                .select()
                .from(applications)
                .where(
                    and(
                        eq(applications.jobId, input.jobId),
                        eq(applications.jobSeekerId, ctx.user.id),
                        not(eq(applications.status, "WITHDRAWN"))
                    )
                );

            if (existingApplication.length > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You have already submitted interest for this job",
                });
            }

            const coverLetterContent = input.coverLetter;

            const [application] = await db
                .insert(applications)
                .values({
                    jobId: input.jobId,
                    jobSeekerId: ctx.user.id,
                    status: "PENDING",
                    coverLetter: coverLetterContent,
                })
                .returning();

            return application;
        }),

    withdraw: protectedProcedure
        .input(z.object({ applicationId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const application = await db
                .select()
                .from(applications)
                .where(eq(applications.id, input.applicationId));

            if (!application) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Application not found",
                });
            }

            const [updatedApplication] = await db
                .update(applications)
                .set({
                    status: "WITHDRAWN",
                    updatedAt: new Date(),
                })
                .where(eq(applications.id, input.applicationId))
                .returning();

            return updatedApplication;
        }),
});
