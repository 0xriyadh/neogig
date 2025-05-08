"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function RoleBasedRedirect({
    params,
}: {
    params: { role: string };
}) {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        // Redirect to the appropriate onboarding page based on the role parameter
        // and check if it matches the user's role
        if (params.role === "applicant") {
            if (user?.role === "jobseeker") {
                router.push("/onboarding/applicant");
            } else {
                // If roles don't match, redirect to the appropriate dashboard
                router.push(
                    user?.role === "employer"
                        ? "/dashboard/company"
                        : "/auth/login"
                );
            }
        } else if (params.role === "company") {
            if (user?.role === "employer") {
                router.push("/onboarding/company");
            } else {
                // If roles don't match, redirect to the appropriate dashboard
                router.push(
                    user?.role === "jobseeker"
                        ? "/dashboard/jobseeker"
                        : "/auth/login"
                );
            }
        } else {
            // Redirect to login if role is not recognized
            router.push("/auth/login");
        }
    }, [params.role, router, user]);

    // Show a loading state while redirecting
    const redirectContent = (
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

    return <ProtectedRoute>{redirectContent}</ProtectedRoute>;
}
