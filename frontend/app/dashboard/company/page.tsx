"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
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
import { ApplicationList } from "@/components/applications/application-list";
import { RecentApplicants } from "@/components/applications/recent-applicants";
import { trpc } from "@/lib/trpc";
import { Car, Eye } from "lucide-react";

export default function CompanyDashboard() {
    const router = useRouter();

    const { data: user } = trpc.user.getMe.useQuery();
    const { logout } = useAuth();
    // Fetch company profile
    const {
        data: profile,
        isLoading: isProfileLoading,
        error: profileError,
    } = trpc.company.getById.useQuery(
        { userId: user?.id || "" },
        { enabled: !!user?.id }
    );

    // Fetch company's jobs
    const { data: jobs, isLoading: isJobsLoading } =
        trpc.job.getByCompanyId.useQuery(
            { userId: user?.id || "" },
            { enabled: !!user?.id }
        );

    // Fetch applications for all jobs
    // const { data: applications, isLoading: isApplicationsLoading } =
    //     trpc.application.getByJobId.useQuery(
    //         { jobId: jobs?.[0]?.id || "" },
    //         { enabled: !!jobs?.[0]?.id }
    //     );

    const dashboardContent = (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Company Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Company Profile */}
                <Card className="h-fit sticky top-20">
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
                                {profile?.industry}
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
                            <Link href="/profile/edit">Edit Profile</Link>
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
                            <Button
                                size="sm"
                                className="cursor-pointer"
                                onClick={() =>
                                    router.push(
                                        `/companies/${user?.id}/jobs/create`
                                    )
                                }
                            >
                                Post New Job
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {jobs && jobs.length > 0 ? (
                                <div className="space-y-4">
                                    {jobs.map((job) => (
                                        <div
                                            key={job.id}
                                            className="flex justify-between items-center border-b pb-3"
                                        >
                                            <div>
                                                <h3 className="font-medium">
                                                    {job.title}
                                                </h3>
                                                {/* <p className="text-sm text-muted-foreground">
                                                    {applications?.length || 0}{" "}
                                                    applicants
                                                </p> */}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        router.push(
                                                            `/jobs/${job.id}/edit`
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <div className="text-right">
                                                    <span
                                                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                            job.isActive
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {job.isActive
                                                            ? "Active"
                                                            : "Draft"}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Posted:{" "}
                                                        {new Date(
                                                            job.createdAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
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

                    {/* Applications Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Applications</CardTitle>
                            <CardDescription>
                                Review and manage job applications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {jobs && jobs.length > 0 ? (
                                <div className="space-y-6">
                                    {jobs.map((job) => (
                                        <div key={job.id} className="space-y-4">
                                            <h3 className="font-medium text-lg">
                                                {job.title}
                                            </h3>
                                            <ApplicationList jobId={job.id} />
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Applicants</CardTitle>
                            <CardDescription>
                                Track candidates for your job listings
                            </CardDescription>
                        </CardHeader>
                        {jobs?.map((job) => (
                            <RecentApplicants jobId={job.id} />
                        ))}
                        <CardFooter>
                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href="/dashboard/company/applicants">
                                    View All Applicants
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );

    if (isProfileLoading || isJobsLoading) {
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

    if (profileError) {
        return (
            <div className="container mx-auto p-6 max-w-5xl text-center">
                <h2 className="text-2xl font-bold mb-4">Error</h2>
                <p className="text-muted-foreground mb-6">
                    {profileError.message}
                </p>
                <Button variant="link" asChild className="mt-4">
                    <Link href="/auth/login">Back to Login</Link>
                </Button>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRole="company">
            {dashboardContent}
        </ProtectedRoute>
    );
}
