"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoleBasedRedirect({
    params,
}: {
    params: { role: string };
}) {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the appropriate onboarding page based on the role
        if (params.role === "applicant") {
            router.push("/onboarding/applicant");
        } else if (params.role === "company") {
            router.push("/onboarding/company");
        } else {
            // Redirect to a general error or home page if role is not recognized
            router.push("/");
        }
    }, [params.role, router]);

    // Show a loading state while redirecting
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
