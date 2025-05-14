"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";

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
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { JobSeeker, JobApplication, SavedJob } from "@/types/user-types";

export default function JobSeekerDashboard() {
    const { currentUser, isLoading, error } = useCurrentUser();
    const router = useRouter();
    const jobSeeker =
        currentUser?.role === "jobseeker" ? (currentUser as JobSeeker) : null;

    const dashboardContent = (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Job Seeker Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Summary */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage
                                    src=""
                                    alt={jobSeeker?.profile?.name}
                                />
                                <AvatarFallback>
                                    {jobSeeker?.profile?.name
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>
                                    {jobSeeker?.profile?.name}
                                </CardTitle>
                                <CardDescription>
                                    {currentUser?.email}
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
                                {jobSeeker?.profile?.preferredJobType}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-1">About Me</h3>
                            <p className="text-sm text-muted-foreground">
                                {jobSeeker?.profile?.description}
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
                            {jobSeeker?.applications &&
                            jobSeeker.applications.length > 0 ? (
                                <div className="space-y-4">
                                    {jobSeeker.applications.map(
                                        (app: JobApplication) => (
                                            <div
                                                key={app.id}
                                                className="flex justify-between items-center border-b pb-3"
                                            >
                                                <div>
                                                    <h3 className="font-medium">
                                                        {app.job.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {app.job.company}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                            app.status ===
                                                            "PENDING"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : app.status ===
                                                                  "INTERVIEWING"
                                                                ? "bg-amber-100 text-amber-800"
                                                                : app.status ===
                                                                  "OFFERED"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {app.status}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(
                                                            app.appliedAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
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
                            {jobSeeker?.savedJobs &&
                            jobSeeker.savedJobs.length > 0 ? (
                                <div className="space-y-4">
                                    {jobSeeker.savedJobs.map(
                                        (savedJob: SavedJob) => (
                                            <div
                                                key={savedJob.id}
                                                className="flex justify-between items-center border-b pb-3 cursor-pointer"
                                                onClick={() => {
                                                    router.push(
                                                        `/jobs/${savedJob.job.id}`
                                                    );
                                                }}
                                            >
                                                <div>
                                                    <h3 className="font-medium">
                                                        {savedJob.job.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {savedJob.job.company}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm">
                                                        {savedJob.job.location}
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        className="h-auto p-0"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/jobs/${savedJob.job.id}`}
                                                        >
                                                            View Job
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    )}
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
                <p className="text-muted-foreground mb-6">
                    {error instanceof Error
                        ? error.message
                        : "Failed to load profile"}
                </p>
                <Button variant="link" asChild className="mt-4">
                    <Link href="/auth/login">Back to Login</Link>
                </Button>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRole="jobseeker">
            {dashboardContent}
        </ProtectedRoute>
    );
}
