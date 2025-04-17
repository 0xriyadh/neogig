import { router } from "../config/trpc";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";
import { companyRouter } from "./company.routes";
import { jobSeekerRouter } from "./jobSeeker.routes";

export const appRouter = router({
    auth: authRouter,
    user: userRouter,
    company: companyRouter,
    jobSeeker: jobSeekerRouter,
});

export type AppRouter = typeof appRouter;
