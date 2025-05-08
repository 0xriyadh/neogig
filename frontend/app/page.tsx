"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import LandingPage from "./landing-page/page";

export default function HomePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (isAuthenticated) {
            if (user?.role === "jobseeker") {
                router.push("/dashboard/jobseeker");
            } else if (user?.role === "employer") {
                router.push("/dashboard/company");
            } else {
                // For any other role or if role is not defined
                router.push("/dashboard/jobseeker");
            }
        }
    }, [loading, isAuthenticated, user, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Redirecting to dashboard...
            </div>
        );
    }

    return <LandingPage />;
}
