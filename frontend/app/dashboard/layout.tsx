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
    const { currentUser, loading: isLoading } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        // If not authenticated, redirect to login
        if (!isLoading && !currentUser) {
            router.push("/auth/login");
            return;
        }
        // Check if profile is completed and redirect to appropriate onboarding if not
        if (!isLoading && currentUser && !currentUser.profileCompleted) {
            if (currentUser.role === "company") {
                router.push("/onboarding/company");
            } else if (currentUser.role === "jobseeker") {
                router.push("/onboarding/jobseeker");
            }
        }
    }, [currentUser, isLoading, router]);

    // If still loading, show a loading state
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Only render children if user is authenticated and profile is completed
    if (!currentUser) {
        return <div>Redirecting to login...</div>;
    }

    if (!currentUser.profileCompleted) {
        return <div>Redirecting to onboarding...</div>;
    }

    return <div className="dashboard-layout">{children}</div>;
}
