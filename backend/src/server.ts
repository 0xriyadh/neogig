import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./routes";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Enable CORS for frontend requests
app.use(
    cors({
        origin: "http://localhost:9000", // The port your frontend is running on
        credentials: true,
    })
);
app.use(express.json());

// Create tRPC context (can be expanded later)
const createContext = ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) => ({});

app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    })
);

app.get("/", (req, res) => {
    res.send("Hello from NeoGig Backend!");
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
