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

interface TimeSlot {
    start: string;
    end: string;
}

interface AvailableSchedule {
    monday: TimeSlot;
    tuesday: TimeSlot;
    wednesday: TimeSlot;
    thursday: TimeSlot;
    friday: TimeSlot;
}

interface JobSeeker {
    id: string;
    name: string;
    description: string | null;
    preferredJobType: "REMOTE" | "ONSITE" | "HYBRID" | null;
    availableSchedule: AvailableSchedule | null;
}

interface Application {
    id: string;
    jobId: string;
    jobSeekerId: string;
    status: "PENDING" | "REVIEWED" | "INTERVIEWING" | "OFFERED" | "WITHDRAWN";
    coverLetter: string | null;
    appliedAt: string;
    updatedAt: string;
    jobSeeker: JobSeeker | null;
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
        const application = applications?.find(app => app.id === applicationId);
        if (!application?.jobSeeker?.availableSchedule) {
            toast.error("No availability information found for this candidate");
            return;
        }

        const schedule = application.jobSeeker.availableSchedule as AvailableSchedule;
        const compatibilityScore = calculateScheduleCompatibility(schedule);
        toast.success(`Schedule compatibility score: ${compatibilityScore}%`);
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
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage
                                        src=""
                                        alt={application.jobSeeker?.name ?? "Unknown"}
                                    />
                                    <AvatarFallback>
                                        {application.jobSeeker?.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("") ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>
                                        {application.jobSeeker?.name ?? "Unknown"}
                                    </CardTitle>
                                    <CardDescription>
                                        Applied:{" "}
                                        {new Date(
                                            application.appliedAt
                                        ).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                            </div>
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
                                <div className="flex flex-wrap gap-2">
                                    {application.jobSeeker?.description && (
                                        <Badge variant="secondary">
                                            {application.jobSeeker.description}
                                        </Badge>
                                    )}
                                    {application.jobSeeker?.preferredJobType && (
                                        <Badge variant="secondary">
                                            {application.jobSeeker.preferredJobType}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">
                                    Availability
                                </h4>
                                {application.jobSeeker?.availableSchedule ? (
                                    <div className="space-y-2">
                                        {Object.entries(application.jobSeeker.availableSchedule).map(([day, schedule]) => (
                                            <p key={day} className="text-sm text-muted-foreground">
                                                {day.charAt(0).toUpperCase() + day.slice(1)}: {schedule.start} - {schedule.end}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No availability information provided
                                    </p>
                                )}
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
                                                    "REJECTED"
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

const calculateScheduleCompatibility = (schedule: AvailableSchedule): number => {
    const standardHours = {
        start: "09:00",
        end: "17:00"
    };

    let totalOverlap = 0;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

    for (const day of days) {
        const daySchedule = schedule[day];
        if (!daySchedule) continue;

        const standardStart = new Date(`2000-01-01T${standardHours.start}`);
        const standardEnd = new Date(`2000-01-01T${standardHours.end}`);
        const availableStart = new Date(`2000-01-01T${daySchedule.start}`);
        const availableEnd = new Date(`2000-01-01T${daySchedule.end}`);

        const overlapStart = new Date(Math.max(standardStart.getTime(), availableStart.getTime()));
        const overlapEnd = new Date(Math.min(standardEnd.getTime(), availableEnd.getTime()));

        if (overlapEnd > overlapStart) {
            const overlapHours = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60);
            totalOverlap += overlapHours;
        }
    }

    // Calculate percentage of overlap with standard 40-hour work week
    const standardWorkWeek = 8 * 5; // 8 hours * 5 days
    return Math.round((totalOverlap / standardWorkWeek) * 100);
}; 