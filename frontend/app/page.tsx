"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        } else {
            // If not authenticated, redirect to login page
            router.push("/auth/login");
        }
    }, [loading, isAuthenticated, user, router]);

    // Return null or a loading indicator while redirecting
    return null;
}
