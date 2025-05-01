import { db } from "../db";
import schema from "../db/schema";
import {
    LoginInput,
    ApplicantSignupInput,
    CompanySignupInput,
} from "../models/auth.models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required.");
}

const SALT_ROUNDS = 10;

export class AuthService {
    async signup(
        input: ApplicantSignupInput | CompanySignupInput
    ): Promise<{ userId: string; token: string }> {
        const { email, password, role, name, ...profileData } = input;

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .limit(1);
        if (existingUser.length > 0) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "Email already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Use transaction to ensure atomicity
        const result = await db.transaction(async (tx) => {
            // Create user
            const [newUser] = await tx
                .insert(schema.users)
                .values({
                    email,
                    password: hashedPassword,
                    role,
                })
                .returning({ id: schema.users.id });

            const userId = newUser.id;

            // Create profile (JobSeeker or Company)
            if (role === "applicant") {
                await tx.insert(schema.jobSeekers).values({
                    userId,
                    name,
                    ...(profileData as Omit<
                        ApplicantSignupInput,
                        "email" | "password" | "role" | "name"
                    >),
                });
            } else if (role === "company") {
                await tx.insert(schema.companies).values({
                    userId,
                    name,
                    ...(profileData as Omit<
                        CompanySignupInput,
                        "email" | "password" | "role" | "name"
                    >),
                });
            }

            return { userId };
        });

        // Generate JWT
        const token = jwt.sign({ userId: result.userId, role }, JWT_SECRET!, {
            expiresIn: "1d",
        });

        return { userId: result.userId, token };
    }

    async login(input: LoginInput): Promise<{
        token: string;
        user: { id: string; email: string; role: string };
    }> {
        const { email, password } = input;

        const [user] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .limit(1);

        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Invalid email or password",
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET!,
            { expiresIn: "1d" }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }
}
