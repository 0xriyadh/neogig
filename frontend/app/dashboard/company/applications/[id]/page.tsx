"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function ApplicationDetails() {
    const params = useParams();
    const applicationId = params.id as string;

    const { data: applications, isLoading } = trpc.application.getByJobId.useQuery(
        { jobId: "" }, // We'll filter the specific application client-side
        { enabled: !!applicationId }
    );

    const application = applications?.find(app => app.id === applicationId);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 max-w-3xl">
                <Skeleton className="h-8 w-32 mb-6" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="container mx-auto p-6 max-w-3xl text-center">
                <h2 className="text-2xl font-bold mb-4">Application Not Found</h2>
                <Button variant="link" asChild>
                    <Link href="/dashboard/company">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRole="company">
            <div className="container mx-auto p-6 max-w-3xl">
                <Button
                    variant="ghost"
                    className="mb-6"
                    asChild
                >
                    <Link href="/dashboard/company">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Application Details</CardTitle>
                                <CardDescription>
                                    Submitted {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
                                </CardDescription>
                            </div>
                            <Badge
                                variant={
                                    application.status === "PENDING"
                                        ? "secondary"
                                        : application.status === "REVIEWED"
                                        ? "default"
                                        : application.status === "INTERVIEWING"
                                        ? "outline"
                                        : "secondary"
                                }
                            >
                                {application.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback>
                                    {application.jobSeekerId.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-medium text-lg">Applicant</h3>
                                <p className="text-sm text-muted-foreground">
                                    {application.jobSeekerId}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium mb-2">Cover Letter</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {application.coverLetter || "No cover letter provided"}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" asChild>
                                <Link href={`/applicants/${application.jobSeekerId}`}>
                                    View Applicant Profile
                                </Link>
                            </Button>
                            <Button>
                                Update Status
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
} 