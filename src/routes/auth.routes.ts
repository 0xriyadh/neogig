import { router, publicProcedure } from "../config/trpc";
import { AuthController } from "../controllers/auth.controller";
import { LoginSchema, SignupSchema } from "../models/auth.models";

const authController = new AuthController();

export const authRouter = router({
    signup: publicProcedure
        .input(SignupSchema) // Use the combined signup schema for input validation
        .mutation(({ input }) => {
            return authController.signup(input);
        }),

    login: publicProcedure.input(LoginSchema).mutation(({ input }) => {
        return authController.login(input);
    }),
});
