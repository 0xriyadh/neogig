"use client";

import { ReactNode } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}

function DashboardLayoutClient({ children }: { children: ReactNode }) {
    const { user, loading: isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If not authenticated, redirect to login
        if (!isLoading && !user) {
            router.push("/auth/login");
            return;
        }

        // Check if profile is completed and redirect to appropriate onboarding if not
        if (!isLoading && user && !user.profileCompleted) {
            if (user.role === "company") {
                router.push("/onboarding/company");
            } else if (user.role === "jobseeker") {
                router.push("/onboarding/jobseeker");
            }
        }
    }, [user, isLoading, router]);

    // If still loading, show a loading state
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Only render children if user is authenticated and profile is completed
    if (!user) {
        return <div>Redirecting to login...</div>;
    }

    if (!user.profileCompleted) {
        return <div>Redirecting to onboarding...</div>;
    }

    return <div className="dashboard-layout">{children}</div>;
}
