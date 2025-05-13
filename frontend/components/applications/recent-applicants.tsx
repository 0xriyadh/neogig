"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";

interface RecentApplicantsProps {
    jobId: string;
}

export function RecentApplicants({ jobId }: RecentApplicantsProps) {
    const { data: applications, isLoading } = trpc.application.getByJobId.useQuery(
        { jobId },
        { enabled: !!jobId }
    );

    console.log(applications);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Applicants</CardTitle>
                    <CardDescription>
                        Track candidates for your job listings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center border-b pb-3 animate-pulse"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-muted rounded" />
                                        <div className="h-3 w-32 bg-muted rounded" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-16 bg-muted rounded" />
                                    <div className="h-3 w-24 bg-muted rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Applicants</CardTitle>
                <CardDescription>
                    Track candidates for your job listings
                </CardDescription>
            </CardHeader>
            <CardContent>
                {applications && applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <div
                                key={application.id}
                                className="flex justify-between items-center border-b pb-3"
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
                                            Applied {new Date(application.appliedAt).toLocaleDateString()}
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
                                                : "bg-green-100 text-green-800"
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
                                                href={`/dashboard/company/applicants/${application.jobSeekerId}`}
                                            >
                                                View Profile
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-4 text-muted-foreground">
                        No applicants yet
                    </p>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/company/applicants">View All Applicants</Link>
                </Button>
            </CardFooter>
        </Card>
    );
} 