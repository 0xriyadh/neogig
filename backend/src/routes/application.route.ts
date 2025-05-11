import { z } from 'zod';
import { protectedProcedure, router } from '../config/trpc';
import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';
import { applications } from '../db/schema/application';
import { db } from '../db';

export const applicationRouter = router({
  getByJobId: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const application = await db.select().from(applications).where(
        and(
          eq(applications.jobId, input.jobId),
          eq(applications.jobSeekerId, ctx.user.id)
        ),
      );
      return application;
    }),

  submitInterest: protectedProcedure
    .input(z.object({
      jobId: z.string(),
      availability: z.string(),
      skills: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already has an application
      const existingApplication = await db.select().from(applications).where(
        and(
          eq(applications.jobId, input.jobId),
          eq(applications.jobSeekerId, ctx.user.id)
        ),
      );

      if (existingApplication) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already submitted interest for this job',
        });
      }

      const [application] = await db
        .insert(applications)
        .values({
          jobId: input.jobId,
          jobSeekerId: ctx.user.id,
          status: 'PENDING',
          coverLetter: `Availability: ${input.availability}\nSkills: ${input.skills}`,
        })
        .returning();

      return application;
    }),

  withdraw: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const application = await db.select().from(applications).where(
        eq(applications.id, input.applicationId),
      );

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found',
        });
      }


      const [updatedApplication] = await db
        .update(applications)
        .set({
          status: 'WITHDRAWN',
          updatedAt: new Date(),
        })
        .where(eq(applications.id, input.applicationId))
        .returning();

      return updatedApplication;
    }),
}); 