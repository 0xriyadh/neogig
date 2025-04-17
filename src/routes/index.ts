import { router } from "../config/trpc";
import { authRouter } from "./auth.routes";

export const appRouter = router({
    auth: authRouter,
});

export type AppRouter = typeof appRouter;
