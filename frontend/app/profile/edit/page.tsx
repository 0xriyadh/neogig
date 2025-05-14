"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { JobSeeker, Company } from "@/types/user-types";
import JobSeekerProfileForm from "./components/JobSeekerProfileForm";
import CompanyProfileForm from "./components/CompanyProfileForm";

export default function EditProfilePage() {
    const router = useRouter();
    const { currentUser, loading: isLoadingUser } = useCurrentUser();
    console.log("currentUser", currentUser);

    if (isLoadingUser) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg font-medium">
                    Access denied. You must be logged in to edit your profile.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            {currentUser.role === "jobseeker" && (
                <JobSeekerProfileForm jobSeeker={currentUser as JobSeeker} />
            )}
            {currentUser.role === "company" && (
                <CompanyProfileForm company={currentUser as Company} />
            )}
            {currentUser.role !== "jobseeker" &&
                currentUser.role !== "company" && (
                    <div className="flex h-screen items-center justify-center">
                        <p className="text-lg font-medium">
                            Access denied. Profile editing is only available for
                            jobseekers and companies.
                        </p>
                    </div>
                )}
        </div>
    );
}
