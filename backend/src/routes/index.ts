import { authRouter } from './auth.routes';
import { jobRouter } from './job.routes';
import { companyRouter } from './company.routes';
import { applicationRouter } from './application.route';
import { savedJobRouter } from './savedJob.route';
import { jobQuestionRouter } from './jobQuestion.route';
import { userRouter } from './user.routes';
import { router } from '../config/trpc';

export const appRouter = router({
  auth: authRouter,
  job: jobRouter,
  company: companyRouter,
  application: applicationRouter,
  savedJob: savedJobRouter,
  jobQuestion: jobQuestionRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
