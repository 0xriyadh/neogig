import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema"; // Import all schemas

dotenv.config({ path: ".env" });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required.");
}

const connectionString = process.env.DATABASE_URL;

// Disable prefetch as it is not supported for "Transaction" pool mode
// See https://github.com/porsager/postgres/issues/601 for more details
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// Export the schema along with the db instance
export * as schema from "./schema";
