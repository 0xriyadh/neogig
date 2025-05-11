import { z } from "zod";
import { protectedProcedure, router } from "../config/trpc";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { savedJobs } from "../db/schema/savedJob";
import { db } from "../db";

export const savedJobRouter = router({
    getByJobId: protectedProcedure
        .input(z.object({ jobId: z.string() }))
        .query(async ({ ctx, input }) => {
            const savedJob = await db
                .select()
                .from(savedJobs)
                .where(
                    and(
                        eq(savedJobs.jobId, input.jobId),
                        eq(savedJobs.jobSeekerId, ctx.user.id)
                    )
                );
            return savedJob;
        }),

    toggle: protectedProcedure
        .input(z.object({ jobId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const existingSavedJob = await db
                .select()
                .from(savedJobs)
                .where(
                    and(
                        eq(savedJobs.jobId, input.jobId),
                        eq(savedJobs.jobSeekerId, ctx.user.id)
                    )
                );

            if (existingSavedJob && existingSavedJob.length > 0) {
                await db
                    .delete(savedJobs)
                    .where(eq(savedJobs.id, existingSavedJob[0].id));
                return null;
            }

            const [savedJob] = await db
                .insert(savedJobs)
                .values({
                    jobId: input.jobId,
                    jobSeekerId: ctx.user.id,
                })
                .returning();

            return savedJob;
        }),
});
