import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });

async function runMigrations() {
    console.log("Running database migrations...");
    try {
        await migrate(db, { migrationsFolder: "src/db/migrations" });
        console.log("Migrations applied successfully!");
        // Manually exit the process, otherwise it might hang
        process.exit(0);
    } catch (error) {
        console.error("Error applying migrations:", error);
        process.exit(1);
    }
}

runMigrations();
