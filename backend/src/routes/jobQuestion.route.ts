import { z } from 'zod';
import { protectedProcedure, router } from '../config/trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, desc } from 'drizzle-orm';
import { jobQuestions } from '../db/schema/jobQuestion';
import { db } from '../db';
import { jobs } from '../db/schema/job';
export const jobQuestionRouter = router({
  getByJobId: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const questions = await db.select().from(jobQuestions).where(
        eq(jobQuestions.jobId, input.jobId),
      ).orderBy(desc(jobQuestions.createdAt));
      return questions;
    }),

  create: protectedProcedure
    .input(z.object({
      jobId: z.string(),
      question: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const [question] = await db
        .insert(jobQuestions)
        .values({
          jobId: input.jobId,
          jobSeekerId: ctx.user.id,
          question: input.question,
        })
        .returning();

      return question;
    }),

  answer: protectedProcedure
    .input(z.object({
      questionId: z.string(),
      answer: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const question = await db.select().from(jobQuestions).where(
        eq(jobQuestions.id, input.questionId),
      );

      if (!question) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Question not found',
        });
      }

      // Verify that the user is the company that posted the job
      const job = await db.select().from(jobs).where(
        eq(jobs.id, question[0].jobId),
      );

      if (!job || job[0].companyId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to answer this question',
        });
      }

      const [updatedQuestion] = await db
        .update(jobQuestions)
        .set({
          answer: input.answer,
          isAnswered: true,
          updatedAt: new Date(),
        })
        .where(eq(jobQuestions.id, input.questionId))
        .returning();

      return updatedQuestion;
    }),
}); 