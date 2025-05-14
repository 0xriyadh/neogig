"use client";

import { useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { trpc } from "@/lib/trpc";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Application {
    id: string;
    jobId: string;
    jobSeekerId: string;
    status: "PENDING" | "REVIEWED" | "INTERVIEWING" | "OFFERED" | "REJECTED" | "WITHDRAWN";
    coverLetter: string | null;
    appliedAt: string;
    updatedAt: string;
}

export default function AllApplicantsPage() {
    const { data: user } = trpc.user.getMe.useQuery();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Fetch company's jobs
    const { data: jobs, isLoading: isJobsLoading } = trpc.job.getByCompanyId.useQuery(
        { userId: user?.id || "" },
        { enabled: !!user?.id }
    );

    // Fetch applications for each job
    const jobQueries = jobs?.map(job => 
        trpc.application.getByJobId.useQuery(
            { jobId: job.id },
            { enabled: !!job.id }
        )
    ) || [];

    const isLoadingApplications = jobQueries.some(query => query.isLoading);
    const applications = jobQueries
        .map(query => query.data)
        .filter((data): data is NonNullable<typeof data> => !!data)
        .flat();

    const filteredApplications = applications?.filter((application: Application) => {
        const matchesStatus = statusFilter === "ALL" || application.status === statusFilter;
        const matchesSearch = searchQuery === "" || 
            application.jobSeekerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            jobs?.find(job => job.id === application.jobId)?.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const loadingContent = (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-6">
                <Skeleton className="h-10 w-40 mb-4" />
                <div className="flex gap-4 mb-6">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-64" />
                </div>
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
        </div>
    );

    const mainContent = (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-4">All Applicants</h1>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Input
                        placeholder="Search by name or job title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="REVIEWED">Reviewed</SelectItem>
                            <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
                            <SelectItem value="OFFERED">Offered</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Applicants List</CardTitle>
                    <CardDescription>
                        View and manage all applicants across your job postings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredApplications && filteredApplications.length > 0 ? (
                        <div className="space-y-4">
                            {filteredApplications.map((application: Application) => {
                                const job = jobs?.find(j => j.id === application.jobId);
                                return (
                                    <div
                                        key={application.id}
                                        className="flex justify-between items-center border-b pb-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>
                                                    {application.jobSeekerId
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-medium">
                                                    {application.jobSeekerId}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {job?.title}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                    application.status === "PENDING"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : application.status === "REVIEWED"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : application.status === "INTERVIEWING"
                                                        ? "bg-amber-100 text-amber-800"
                                                        : application.status === "OFFERED"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {application.status}
                                            </span>
                                            <div className="flex gap-2 justify-end mt-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-auto p-0"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/dashboard/company/applications/${application.id}`}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View Application
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="link"
                                                    className="h-auto p-0"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/applicants/${application.jobSeekerId}`}
                                                    >
                                                        View Profile
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center py-4 text-muted-foreground">
                            No applicants found
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    if (isJobsLoading || isLoadingApplications) {
        return loadingContent;
    }

    return (
        <ProtectedRoute requiredRole="company">
            {mainContent}
        </ProtectedRoute>
    );
} 
