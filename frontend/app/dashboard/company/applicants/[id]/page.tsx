"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobSeekerProfile {
    userId: string;
    name: string;
    description: string | null;
    address: string | null;
    gender: string | null;
    mobile: string | null;
    preferredJobType: "REMOTE" | "ONSITE" | "HYBRID" | null;
    availableSchedule: any | null;
    skills: string | null;
    currentlyLookingForJob: boolean;
    openToUrgentJobs: boolean;
    lastMinuteAvailability: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function ApplicantProfile() {
    const params = useParams();
    const jobSeekerId = params.id as string;

    const { data: profile, isLoading,error } = trpc.jobSeeker.getById.useQuery(
        { userId: jobSeekerId },
        { enabled: !!jobSeekerId }
    );

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Skeleton className="h-8 w-32 mb-6" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-4xl text-center">
                <h2 className="text-2xl font-bold mb-4">Error Loading Profile</h2>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto p-6 max-w-4xl text-center">
                <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
                <Button variant="link" asChild>
                    <Link href="/dashboard/company">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    const skills = profile.skills ? profile.skills.split(",").map(s => s.trim()) : [];

    return (
        <ProtectedRoute requiredRole="company">
            <div className="container mx-auto p-6 max-w-4xl">
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

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarFallback>
                                        {profile.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                                    <CardDescription className="text-base">
                                        {profile.preferredJobType || "Job Seeker"}
                                    </CardDescription>
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        {profile.mobile && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                {profile.mobile}
                                            </div>
                                        )}
                                        {profile.address && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                {profile.address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <Tabs defaultValue="about" className="w-full">
                        <TabsList>
                            <TabsTrigger value="about">About</TabsTrigger>
                            <TabsTrigger value="skills">Skills</TabsTrigger>
                            <TabsTrigger value="availability">Availability</TabsTrigger>
                        </TabsList>

                        <TabsContent value="about">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {profile.description || "No description provided"}
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="skills">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Skills</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.length > 0 ? (
                                            skills.map((skill: string, index: number) => (
                                                <Badge key={index} variant="secondary">
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground">No skills listed</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="availability">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Availability</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={profile.currentlyLookingForJob ? "default" : "secondary"}>
                                            {profile.currentlyLookingForJob ? "Actively Looking" : "Not Currently Looking"}
                                        </Badge>
                                        {profile.openToUrgentJobs && (
                                            <Badge variant="destructive">Open to Urgent Jobs</Badge>
                                        )}
                                        {profile.lastMinuteAvailability && (
                                            <Badge variant="outline">Available Last Minute</Badge>
                                        )}
                                    </div>
                                    {profile.availableSchedule && (
                                        <div className="mt-4">
                                            <h4 className="font-medium mb-2">Schedule</h4>
                                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {JSON.stringify(profile.availableSchedule, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </ProtectedRoute>
    );
} 