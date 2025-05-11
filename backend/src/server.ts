import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./routes";
import * as dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import logger from "./utility/logger";
import { jobRouter } from "./routes/job.routes";

dotenv.config();

// Custom logger utility

const app = express();
const port = process.env.PORT || 8000;

// Enable CORS for frontend requests
app.use(
    cors({
        origin: true, // The port your frontend is running on
        credentials: true,
    })
);
app.use(express.json());

// Define a type for the user payload in the context
interface UserPayload {
    id: string;
    role: string;
}

// Define a type for our context
export interface Context {
    req: trpcExpress.CreateExpressContextOptions["req"];
    res: trpcExpress.CreateExpressContextOptions["res"];
    user: UserPayload | null;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    // Ensure JWT_SECRET is loaded, or throw an error.
    // Consider a more robust secret management strategy for production.
    logger.error("FATAL ERROR: JWT_SECRET environment variable is not set.");
    process.exit(1);
}

// Create tRPC context
const createContext = ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions): Context => {
    let user: UserPayload | null = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            // Ensure decoded token has the expected fields before assigning
            // The payload from auth.service.ts is { userId: string, role: string }
            const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
                userId: string;
                role: string;
            };
            if (
                decoded &&
                typeof decoded.userId === "string" &&
                typeof decoded.role === "string"
            ) {
                user = { id: decoded.userId, role: decoded.role };
                logger.info(`User authenticated: ${user.id} (${user.role})`);
            }
        } catch (error) {
            // Token verification failed (e.g., expired, invalid)
            logger.warn("JWT verification failed:", error);
            // user remains null
        }
    }

    return { req, res, user };
};

// Mount tRPC router
app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    })
);


app.get("/", (req, res) => {
    logger.info("Root endpoint accessed");
    res.send("Hello from NeoGig Backend!");
});

app.listen(port, () => {
    logger.info(`Server listening at http://localhost:${port}`);
});