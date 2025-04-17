import { db } from "../db";
import { Company, NewCompany, companies } from "../db/schema/company";
import { eq } from "drizzle-orm";
import {
    CreateCompanyInput,
    UpdateCompanyInput,
} from "../models/company.models";

// Service to get all company profiles
export const getAllCompanies = async (): Promise<Company[]> => {
    return await db.select().from(companies);
};

// Service to get a single company profile by userId
export const getCompanyById = async (
    userId: string
): Promise<Company | undefined> => {
    const company = await db
        .select()
        .from(companies)
        .where(eq(companies.userId, userId))
        .limit(1);
    return company[0];
};

// Service to create a new company profile
export const createCompany = async (
    companyData: CreateCompanyInput
): Promise<Company> => {
    // Optional: Check if a company profile already exists for this userId
    const existing = await getCompanyById(companyData.userId);
    if (existing) {
        throw new Error("Company profile already exists for this user");
    }

    // Optional: Further check if the user exists and has the 'company' role in the users table

    const newCompany: NewCompany = {
        ...companyData,
        // registrationDate can be tricky, ensure it's in 'YYYY-MM-DD' if DB expects date type
        registrationDate: companyData.registrationDate || null, // Handle optional date
    };

    const insertedCompany = await db
        .insert(companies)
        .values(newCompany)
        .returning();

    if (!insertedCompany[0]) {
        throw new Error("Failed to create company profile");
    }
    return insertedCompany[0];
};

// Service to update an existing company profile
export const updateCompany = async (
    userId: string,
    companyData: Omit<UpdateCompanyInput, "userId">
): Promise<Company | undefined> => {
    // Ensure there's data to update besides the userId
    if (Object.keys(companyData).length === 0) {
        throw new Error("No update data provided");
    }

    // Check if the company profile exists
    const existingCompany = await getCompanyById(userId);
    if (!existingCompany) {
        return undefined; // Or throw: Company profile not found
    }

    const updatedData: Partial<
        Omit<NewCompany, "userId" | "createdAt"> & { updatedAt: Date }
    > = {
        ...companyData,
        registrationDate: companyData.registrationDate || null,
        updatedAt: new Date(),
    };

    const updatedCompany = await db
        .update(companies)
        .set(updatedData)
        .where(eq(companies.userId, userId))
        .returning();

    return updatedCompany[0];
};

// Service to delete a company profile by userId
export const deleteCompany = async (userId: string): Promise<boolean> => {
    const deletedCompanies = await db
        .delete(companies)
        .where(eq(companies.userId, userId))
        .returning({ userId: companies.userId });
    return deletedCompanies.length > 0;
};
