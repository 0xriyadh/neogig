"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LandingPage from "./landing-page/page";

export default function HomePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (isAuthenticated) {
            // Redirect based on user role
            if (user?.role === "jobseeker") {
                router.push("/dashboard/jobseeker");
            } else if (user?.role === "employer") {
                router.push("/dashboard/company");
            } else {
                // For any other role or if role is not defined
                router.push("/dashboard/jobseeker");
            }
        }
        // Removed redirection for unauthenticated users
    }, [loading, isAuthenticated, user, router]);

    // Show loading state while authentication is being checked
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );
    }

    // If authenticated, we're redirecting so we can show a loading state
    if (isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Redirecting to dashboard...
            </div>
        );
    }

    // Landing page content for unauthenticated users
    return <LandingPage />;
}
