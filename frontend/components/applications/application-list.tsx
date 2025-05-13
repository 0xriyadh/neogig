"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTrpc, trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicationListProps {
    jobId: string;
}

interface JobSeeker {
    id: string;
    name: string;
    skills: string[];
    availability: {
        startDate: string;
        endDate: string;
        preferredHours: string[];
    };
}

interface Application {
    id: string;
    jobId: string;
    jobSeekerId: string;
    status: "PENDING" | "REVIEWED" | "INTERVIEWING" | "OFFERED" | "WITHDRAWN";
    coverLetter: string | null;
    appliedAt: string;
    updatedAt: string;
    jobSeeker: JobSeeker;
    scheduleCompatibility?: number;
}

export function ApplicationList({ jobId }: ApplicationListProps) {
    const queryClient = useQueryClient();
    const [selectedApplication, setSelectedApplication] = useState<
        string | null
    >(null);
    const [response, setResponse] = useState("");

    const { data: applications, isLoading } =
        trpc.application.getByJobId.useQuery(
            {
                jobId,
            },
            {
                staleTime: 5 * 60 * 1000,
            }
        );

    const updateStatusMutation = useMutation({
        mutationFn: async (data: {
            id: string;
            status: string;
            response?: string;
        }) => {
            return await fetchTrpc<Application>("application.updateStatus", {
                id: data.id,
                status: data.status,
                response: data.response,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["applications", jobId],
            });
            toast.success("Application status updated");
            setSelectedApplication(null);
            setResponse("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update status");
        },
    });

    const handleStatusChange = (applicationId: string, status: string) => {
        updateStatusMutation.mutate({
            id: applicationId,
            status,
            response: response || undefined,
        });
    };

    const handleScheduleCompatibility = (
        applicationId: string,
        score: number
    ) => {
        // TODO: Implement schedule compatibility scoring
        toast.info("Schedule compatibility scoring will be implemented");
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-[100px]" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-[100px]" />
                                    <Skeleton className="h-8 w-[100px]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!applications?.length) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No applications received yet
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {applications?.map((application) => (
                <Card key={application.id}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            {/* <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage
                                        src=""
                                        alt={application.jobSeeker.name}
                                    />
                                    <AvatarFallback>
                                        {application.jobSeeker.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>
                                        {application.jobSeeker.name}
                                    </CardTitle>
                                    <CardDescription>
                                        Applied:{" "}
                                        {new Date(
                                            application.appliedAt
                                        ).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                            </div> */}
                            <Badge
                                variant={
                                    application.status === "OFFERED"
                                        ? "default"
                                        : application.status === "WITHDRAWN"
                                        ? "destructive"
                                        : "secondary"
                                }
                            >
                                {application.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {application.coverLetter && (
                                <div>
                                    <h4 className="font-medium mb-2">
                                        Cover Letter
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {application.coverLetter}
                                    </p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-medium mb-2">Skills</h4>
                                {/* <div className="flex flex-wrap gap-2">
                                    {application.jobSeeker.skills.map(
                                        (skill) => (
                                            <Badge
                                                key={skill}
                                                variant="secondary"
                                            >
                                                {skill}
                                            </Badge>
                                        )
                                    )}
                                </div> */}
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">
                                    Availability
                                </h4>
                                {/* <p className="text-sm text-muted-foreground">
                                    {new Date(
                                        application.jobSeeker.availability.startDate
                                    ).toLocaleDateString()}{" "}
                                    to{" "}
                                    {new Date(
                                        application.jobSeeker.availability.endDate
                                    ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Preferred Hours:{" "}
                                    {application.jobSeeker.availability.preferredHours.join(
                                        ", "
                                    )}
                                </p> */}
                            </div>

                            {selectedApplication === application.id && (
                                <div className="space-y-4">
                                    <Textarea
                                        placeholder="Enter your response to the candidate..."
                                        value={response}
                                        onChange={(e) =>
                                            setResponse(e.target.value)
                                        }
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setSelectedApplication(null)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                handleStatusChange(
                                                    application.id,
                                                    "REVIEWED"
                                                )
                                            }
                                        >
                                            Review
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                handleStatusChange(
                                                    application.id,
                                                    "INTERVIEWING"
                                                )
                                            }
                                        >
                                            Interview
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                handleStatusChange(
                                                    application.id,
                                                    "WITHDRAWN"
                                                )
                                            }
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedApplication !== application.id && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setSelectedApplication(
                                                application.id
                                            )
                                        }
                                    >
                                        Respond
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            handleScheduleCompatibility(
                                                application.id,
                                                0
                                            )
                                        }
                                    >
                                        Update Schedule Compatibility
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Helper function to calculate schedule compatibility
function calculateScheduleCompatibility(
    availability: JobSeeker["availability"]
): number {
    // TODO: Implement actual schedule compatibility calculation
    // This is a placeholder that returns a random score
    return Math.floor(Math.random() * 100);
}
