import { router } from "../config/trpc";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";
import { companyRouter } from "./company.routes";
import { jobSeekerRouter } from "./jobSeeker.routes";
import { jobRouter } from "./job.routes";
import { applicationRouter } from "./application.routes";

export const appRouter = router({
    auth: authRouter,
    user: userRouter,
    company: companyRouter,
    jobSeeker: jobSeekerRouter,
    job: jobRouter,
    application: applicationRouter,
});

export type AppRouter = typeof appRouter;
