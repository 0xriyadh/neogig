import { initTRPC, TRPCError } from "@trpc/server";
import { type Context } from "../server"; // Import the Context type

// You can add context type generation here if needed later
// export type Context = { /* ... */ };

// Initialize tRPC with the defined context
const t = initTRPC.context<Context>().create();

// Middleware to check if the user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
        });
    }
    return next({
        ctx: {
            // Pass down the context, now with a guaranteed user
            ...ctx,
            user: ctx.user,
        },
    });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware; // Exporting the base middleware

// Export a new protected procedure that uses the isAuthed middleware
export const protectedProcedure = t.procedure.use(isAuthed);
