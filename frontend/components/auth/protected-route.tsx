"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "jobseeker" | "employer" | "admin";
}

export function ProtectedRoute({
    children,
    requiredRole,
}: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If not loading and not authenticated, redirect to login
        if (!loading && !isAuthenticated) {
            router.push("/auth/login");
        }

        // If role is required and user doesn't have that role, redirect
        if (
            !loading &&
            isAuthenticated &&
            requiredRole &&
            user?.role !== requiredRole
        ) {
            // Redirect to the appropriate dashboard based on role
            if (user?.role === "jobseeker") {
                router.push("/dashboard/jobseeker");
            } else if (user?.role === "employer") {
                router.push("/dashboard/employer");
            } else {
                router.push("/auth/login");
            }
        }
    }, [loading, isAuthenticated, requiredRole, user, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-5xl">
                <div className="mb-6 flex justify-between items-center">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full md:col-span-2" />
                </div>
            </div>
        );
    }

    // If not authenticated or doesn't have required role, don't render children
    // (Redirect will happen in useEffect)
    if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return null;
    }

    // If authenticated and has the correct role, render children
    return <>{children}</>;
}
