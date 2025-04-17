import {
    pgTable,
    text,
    varchar,
    pgEnum,
    uuid,
    timestamp,
    date,
} from "drizzle-orm/pg-core";
import { users } from "./user";

// Define industry enum based on the diagram (add more as needed)
export const industryEnum = pgEnum("industry", [
    "TECH",
    "AGRI",
    "HEALTH",
    "FINANCE",
    "EDUCATION",
    "OTHER",
]);

export const companies = pgTable("companies", {
    userId: uuid("user_id")
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    location: text("location"),
    phone: varchar("phone", { length: 20 }),
    industry: industryEnum("industry"),
    description: text("description"),
    registrationDate: date("registration_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
