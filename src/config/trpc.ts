import { initTRPC } from "@trpc/server";

// You can add context type generation here if needed later
// export type Context = { /* ... */ };

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
// export const middleware = t.middleware; // Uncomment if needed
