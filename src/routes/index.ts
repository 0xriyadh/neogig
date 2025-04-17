import { router } from "../config/trpc";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";

export const appRouter = router({
    auth: authRouter,
    user: userRouter,
});

export type AppRouter = typeof appRouter;
