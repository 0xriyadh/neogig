"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "jobseeker" | "company" | "admin";
}

export function ProtectedRoute({
    children,
    requiredRole,
}: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
            router.push("/auth/login");
        }
    }, [loading, isAuthenticated, requiredRole, user, router]);

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

    return <>{children}</>;
}
