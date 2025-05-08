"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchTrpc } from "@/lib/trpc";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CompanyDashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulating profile fetch
        // In a real app, you would get the user ID from context or cookies
        const mockFetch = async () => {
            try {
                setIsLoading(true);
                // This would be replaced with actual API call
                // await fetchTrpc("company.getById", { userId: "current-user-id" });

                // Mock data for demonstration
                setTimeout(() => {
                    setProfile({
                        name: "TechCorp Solutions",
                        location: "San Francisco, CA",
                        phone: "+1 (555) 123-4567",
                        industry: "TECH",
                        description:
                            "Leading technology solutions provider specializing in web and mobile development, cloud infrastructure, and AI implementations.",
                        jobs: [
                            {
                                id: "1",
                                title: "Frontend Developer",
                                applicants: 12,
                                status: "Active",
                                date: "2025-04-15",
                            },
                            {
                                id: "2",
                                title: "DevOps Engineer",
                                applicants: 8,
                                status: "Draft",
                                date: "2025-04-28",
                            },
                        ],
                        applicants: [
                            {
                                id: "1",
                                name: "John Smith",
                                position: "Frontend Developer",
                                stage: "Screening",
                                date: "2025-04-28",
                            },
                            {
                                id: "2",
                                name: "Sara Williams",
                                position: "Frontend Developer",
                                stage: "Interview",
                                date: "2025-04-26",
                            },
                            {
                                id: "3",
                                name: "Michael Brown",
                                position: "DevOps Engineer",
                                stage: "Applied",
                                date: "2025-04-29",
                            },
                        ],
                    });
                    setIsLoading(false);
                }, 1000);
            } catch (err: any) {
                setError(err.message || "Failed to load profile");
                setIsLoading(false);
            }
        };

        mockFetch();
    }, []);

    const handleLogout = () => {
        // Clear auth state and redirect to login
        router.push("/auth/login");
    };

    if (isLoading) {
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

    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-5xl text-center">
                <h2 className="text-2xl font-bold mb-4">Error</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button variant="link" asChild className="mt-4">
                    <Link href="/auth/login">Back to Login</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Company Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Company Profile */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src="" alt={profile?.name} />
                                <AvatarFallback>
                                    {profile?.name
                                        ?.substring(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{profile?.name}</CardTitle>
                                <CardDescription>
                                    {profile?.location}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-1">Industry</h3>
                            <p className="text-sm text-muted-foreground">
                                {profile?.industry === "TECH"
                                    ? "Technology"
                                    : profile?.industry === "AGRI"
                                    ? "Agriculture"
                                    : profile?.industry === "HEALTH"
                                    ? "Healthcare"
                                    : profile?.industry === "FINANCE"
                                    ? "Finance"
                                    : profile?.industry === "EDUCATION"
                                    ? "Education"
                                    : "Other"}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-1">Phone</h3>
                            <p className="text-sm text-muted-foreground">
                                {profile?.phone}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-1">About Company</h3>
                            <p className="text-sm text-muted-foreground">
                                {profile?.description}
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/company/edit">Edit Profile</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Main Dashboard Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Jobs Posted */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>Job Listings</CardTitle>
                                <CardDescription>
                                    Manage your job postings
                                </CardDescription>
                            </div>
                            <Button size="sm" asChild>
                                <Link href="/jobs/create">Post New Job</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {profile?.jobs?.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.jobs.map((job: any) => (
                                        <div
                                            key={job.id}
                                            className="flex justify-between items-center border-b pb-3"
                                        >
                                            <div>
                                                <h3 className="font-medium">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {job.applicants} applicants
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                        job.status === "Active"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {job.status}
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Posted: {job.date}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-4 text-muted-foreground">
                                    No jobs posted yet
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Applicants */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Applicants</CardTitle>
                            <CardDescription>
                                Track candidates for your job listings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profile?.applicants?.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.applicants.map(
                                        (applicant: any) => (
                                            <div
                                                key={applicant.id}
                                                className="flex justify-between items-center border-b pb-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback>
                                                            {applicant.name
                                                                .split(" ")
                                                                .map(
                                                                    (
                                                                        n: string
                                                                    ) => n[0]
                                                                )
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-medium">
                                                            {applicant.name}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {applicant.position}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                            applicant.stage ===
                                                            "Applied"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : applicant.stage ===
                                                                  "Screening"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : applicant.stage ===
                                                                  "Interview"
                                                                ? "bg-amber-100 text-amber-800"
                                                                : "bg-green-100 text-green-800"
                                                        }`}
                                                    >
                                                        {applicant.stage}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        className="h-auto p-0 block mt-1"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/applicants/${applicant.id}`}
                                                        >
                                                            View Profile
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="text-center py-4 text-muted-foreground">
                                    No applicants yet
                                </p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href="/applicants">
                                    View All Applicants
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
