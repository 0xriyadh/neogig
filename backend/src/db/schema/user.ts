import {
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
    pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["jobseeker", "company"]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
