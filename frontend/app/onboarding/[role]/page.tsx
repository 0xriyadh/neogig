"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { JobSeekerOnboarding } from "../components/JobSeekerOnboarding";
import { CompanyOnboarding } from "../components/CompanyOnboarding";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function RoleBasedOnboarding({
    params,
}: {
    params: Promise<{ role: string }>;
}) {
    const resolvedParams = use(params);
    const { currentUser, loading: isLoading } = useCurrentUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait until auth is finished loading before making any decisions
        if (isLoading) return;

        if (currentUser?.profileCompleted) {
            router.push(
                currentUser.role === "company"
                    ? "/dashboard/company"
                    : "/dashboard/jobseeker"
            );
        }

        // Verify if the user's role matches the requested onboarding role
        if (!currentUser) {
            // If no user, redirect to login
            router.push("/auth/login");
            return;
        }

        // Check if user role matches the requested onboarding role
        const isValidRole =
            (resolvedParams.role === "jobseeker" &&
                currentUser.role === "jobseeker") ||
            (resolvedParams.role === "company" &&
                currentUser.role === "company");

        if (!isValidRole) {
            // If roles don't match, redirect to the appropriate dashboard
            router.push(
                currentUser.role === "company"
                    ? "/dashboard/company"
                    : "/dashboard/jobseeker"
            );
            return;
        }

        setLoading(false);
    }, [currentUser, resolvedParams.role, router, isLoading]);

    // Loading state while checking roles
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="w-full max-w-md space-y-4">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Render the appropriate onboarding component based on the role
    const renderOnboarding = () => {
        switch (resolvedParams.role) {
            case "jobseeker":
                return <JobSeekerOnboarding />;
            case "company":
                return <CompanyOnboarding />;
            default:
                // This should not happen due to the redirect in useEffect
                return null;
        }
    };

    return <ProtectedRoute>{renderOnboarding()}</ProtectedRoute>;
}
