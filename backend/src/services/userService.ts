import { db } from "../db";
import { NewUser, User, users } from "../db/schema/user";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { CreateUserInput, UpdateUserInput } from "../models/user.models";

export const getAllUsers = async (): Promise<Omit<User, "password">[]> => {
    const allUsers = await db
        .select({
            id: users.id,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users);
    return allUsers;
};

export const getUserById = async (
    id: string
): Promise<Omit<User, "password"> | undefined> => {
    const user = await db
        .select({
            id: users.id,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    return user[0];
};

export const createUser = async (
    userData: CreateUserInput
): Promise<Omit<User, "password">> => {
    // Check if user already exists
    const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);
    if (existingUser.length > 0) {
        throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser: NewUser = {
        ...userData,
        password: hashedPassword,
    };

    const insertedUser = await db.insert(users).values(newUser).returning({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
    });

    if (!insertedUser[0]) {
        throw new Error("Failed to create user");
    }

    return insertedUser[0];
};

export const updateUser = async (
    id: string,
    userData: Omit<UpdateUserInput, "id">
): Promise<Omit<User, "password"> | undefined> => {
    // Ensure there's data to update
    if (Object.keys(userData).length === 0) {
        throw new Error("No update data provided");
    }

    // Check if the user exists before updating
    const existingUser = await getUserById(id);
    if (!existingUser) {
        return undefined; // Or throw new Error('User not found') depending on desired behavior
    }

    // Password update prevention is now handled by the type system
    // No runtime check needed here for userData.password

    const updatedUserData: Partial<Omit<User, "id" | "password">> = {
        ...userData,
        updatedAt: new Date(), // Explicitly set updatedAt
    };

    const updatedUser = await db
        .update(users)
        .set(updatedUserData)
        .where(eq(users.id, id))
        .returning({
            id: users.id,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        });

    return updatedUser[0];
};

export const deleteUser = async (id: string): Promise<boolean> => {
    const deletedUsers = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning({ id: users.id });
    // Check if the returning array has any elements, indicating a successful deletion
    return deletedUsers.length > 0;
};
