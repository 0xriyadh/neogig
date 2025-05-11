import { db } from "../db";
import { NewUser, User, users } from "../db/schema/user";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { CreateUserInput, UpdateUserInput } from "../models/user.models";
import { UpdateJobSeekerInput } from "../models/jobSeeker.models";
import schema from "../db/schema";
import { TRPCError } from "@trpc/server";

export const getAllUsers = async (): Promise<Omit<User, "password">[]> => {
    const allUsers = await db
        .select({
            id: users.id,
            email: users.email,
            role: users.role,
            profileCompleted: users.profileCompleted,
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
            profileCompleted: users.profileCompleted,
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
        profileCompleted: users.profileCompleted,
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
            profileCompleted: users.profileCompleted,
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

export const getUserProfileDetails = async (userId: string, role: string) => {
    try {
        const baseUser = await db
            .select({
                id: schema.users.id,
                email: schema.users.email,
                role: schema.users.role,
                profileCompleted: schema.users.profileCompleted,
                createdAt: schema.users.createdAt,
                updatedAt: schema.users.updatedAt,
            })
            .from(schema.users)
            .where(eq(schema.users.id, userId))
            .limit(1);

        if (!baseUser || baseUser.length === 0) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found.",
            });
        }

        let profileData: any = null;
        let applications: any[] = [];
        let savedJobs: any[] = [];

        if (role === "jobseeker") {
            // Get jobseeker profile
            const jobSeekerProfile = await db
                .select()
                .from(schema.jobSeekers)
                .where(eq(schema.jobSeekers.userId, userId))
                .limit(1);

            if (jobSeekerProfile.length > 0) {
                profileData = jobSeekerProfile[0];

                // Get applications with job details
                applications = await db
                    .select({
                        id: schema.applications.id,
                        status: schema.applications.status,
                        appliedAt: schema.applications.appliedAt,
                        job: {
                            id: schema.jobs.id,
                            title: schema.jobs.title,
                            company: schema.companies.name,
                        },
                    })
                    .from(schema.applications)
                    .leftJoin(
                        schema.jobs,
                        eq(schema.applications.jobId, schema.jobs.id)
                    )
                    .leftJoin(
                        schema.companies,
                        eq(schema.jobs.companyId, schema.companies.userId)
                    )
                    .where(eq(schema.applications.jobSeekerId, userId))
                    .orderBy(schema.applications.appliedAt);

                // Get saved jobs with details
                savedJobs = await db
                    .select({
                        id: schema.savedJobs.id,
                        savedAt: schema.savedJobs.savedAt,
                        job: {
                            id: schema.jobs.id,
                            title: schema.jobs.title,
                            company: schema.companies.name,
                            location: schema.jobs.location,
                        },
                    })
                    .from(schema.savedJobs)
                    .leftJoin(
                        schema.jobs,
                        eq(schema.savedJobs.jobId, schema.jobs.id)
                    )
                    .leftJoin(
                        schema.companies,
                        eq(schema.jobs.companyId, schema.companies.userId)
                    )
                    .where(eq(schema.savedJobs.jobSeekerId, userId))
                    .orderBy(schema.savedJobs.savedAt);
            } else {
                console.warn(
                    `Job seeker profile not found for user ID: ${userId}`
                );
            }
        } else if (role === "company") {
            const companyProfile = await db
                .select()
                .from(schema.companies)
                .where(eq(schema.companies.userId, userId))
                .limit(1);
            if (companyProfile.length > 0) {
                profileData = companyProfile[0];
            } else {
                console.warn(
                    `Company profile not found for user ID: ${userId}`
                );
            }
        }

        return {
            ...baseUser[0],
            profile: profileData,
            applications: role === "jobseeker" ? applications : undefined,
            savedJobs: role === "jobseeker" ? savedJobs : undefined,
        };
    } catch (error: any) {
        console.error("Error in getUserProfileDetails:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch user details.",
        });
    }
};

export const updateJobSeekerProfile = async (
    userId: string,
    profileData: Omit<UpdateJobSeekerInput, "userId">
) => {
    try {
        // Check if jobseeker profile exists
        const existingProfile = await db
            .select()
            .from(schema.jobSeekers)
            .where(eq(schema.jobSeekers.userId, userId))
            .limit(1);

        if (existingProfile.length === 0) {
            // Create new profile if it doesn't exist
            if (!profileData.name) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Name is required to create a job seeker profile.",
                });
            }
            const newProfile = await db
                .insert(schema.jobSeekers)
                .values({
                    userId,
                    name: profileData.name,
                    address: profileData.address,
                    gender: profileData.gender,
                    mobile: profileData.mobile,
                    description: profileData.description,
                    preferredJobType: profileData.preferredJobType,
                    availableSchedule: profileData.availableSchedule,
                    currentlyLookingForJob: profileData.currentlyLookingForJob,
                })
                .returning();
            return newProfile[0];
        }

        // Update existing profile
        const updatedProfile = await db
            .update(schema.jobSeekers)
            .set({
                name: profileData.name,
                address: profileData.address,
                gender: profileData.gender,
                mobile: profileData.mobile,
                description: profileData.description,
                preferredJobType: profileData.preferredJobType,
                availableSchedule: profileData.availableSchedule,
                currentlyLookingForJob: profileData.currentlyLookingForJob,
                updatedAt: new Date(),
            })
            .where(eq(schema.jobSeekers.userId, userId))
            .returning();

        return updatedProfile[0];
    } catch (error: any) {
        console.error("Error updating jobseeker profile:", error);
        throw new Error(error.message || "Failed to update jobseeker profile");
    }
};
