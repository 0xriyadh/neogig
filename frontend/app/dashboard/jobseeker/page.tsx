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

export default function JobSeekerDashboard() {
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
                // await fetchTrpc("jobSeeker.getById", { userId: "current-user-id" });

                // Mock data for demonstration
                setTimeout(() => {
                    setProfile({
                        name: "Jane Doe",
                        address: "New York, USA",
                        gender: "female",
                        preferredJobType: "REMOTE",
                        description:
                            "Experienced software developer with expertise in React, Node.js, and cloud technologies.",
                        applications: [
                            {
                                id: "1",
                                jobTitle: "Frontend Developer",
                                company: "Tech Co",
                                status: "Applied",
                                date: "2025-04-28",
                            },
                            {
                                id: "2",
                                jobTitle: "Full Stack Engineer",
                                company: "StartupX",
                                status: "Interviewing",
                                date: "2025-04-25",
                            },
                        ],
                        savedJobs: [
                            {
                                id: "3",
                                title: "UI/UX Designer",
                                company: "Design Studio",
                                location: "Remote",
                            },
                            {
                                id: "4",
                                title: "Product Manager",
                                company: "InnovateCorp",
                                location: "New York, NY",
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
        router.push("/login");
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
                <h1 className="text-3xl font-bold">Job Seeker Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Summary */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src="" alt={profile?.name} />
                                <AvatarFallback>
                                    {profile?.name
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{profile?.name}</CardTitle>
                                <CardDescription>
                                    {profile?.address}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-1">
                                Preferred Job Type
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {profile?.preferredJobType}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-1">About Me</h3>
                            <p className="text-sm text-muted-foreground">
                                {profile?.description}
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/profile/edit">Edit Profile</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Main Dashboard Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Job Applications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Applications</CardTitle>
                            <CardDescription>
                                Track your job application status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profile?.applications?.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.applications.map((app: any) => (
                                        <div
                                            key={app.id}
                                            className="flex justify-between items-center border-b pb-3"
                                        >
                                            <div>
                                                <h3 className="font-medium">
                                                    {app.jobTitle}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {app.company}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                        app.status === "Applied"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : app.status ===
                                                              "Interviewing"
                                                            ? "bg-amber-100 text-amber-800"
                                                            : "bg-green-100 text-green-800"
                                                    }`}
                                                >
                                                    {app.status}
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {app.date}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-4 text-muted-foreground">
                                    No applications yet
                                </p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href="/jobs">Find Jobs</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Saved Jobs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Saved Jobs</CardTitle>
                            <CardDescription>
                                Jobs you've bookmarked for later
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profile?.savedJobs?.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.savedJobs.map((job: any) => (
                                        <div
                                            key={job.id}
                                            className="flex justify-between items-center border-b pb-3"
                                        >
                                            <div>
                                                <h3 className="font-medium">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {job.company}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm">
                                                    {job.location}
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="link"
                                                    className="h-auto p-0"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/jobs/${job.id}`}
                                                    >
                                                        View Job
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-4 text-muted-foreground">
                                    No saved jobs
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
