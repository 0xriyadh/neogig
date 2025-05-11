"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job } from "@/types/job";
import Link from "next/link";
import { Briefcase, Coins, MapPin } from "lucide-react";

interface JobCardProps {
    job: Job & {
        company: {
            name: string;
        };
    };
}

export function JobCard({ job }: JobCardProps) {
    console.log(job);
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-1">
                            {job.company.name}
                        </CardDescription>
                    </div>
                    {job.isUrgent && (
                        <Badge variant="destructive">Urgent</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mb-2">
                    <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location || "Remote"}
                        </p>
                        {(job.salaryMin || job.salaryMax) && (
                            <p className="flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                {job.salaryMin?.toLocaleString() || "0"} -
                                {job.salaryMax?.toLocaleString() || "∞"} BDT
                            </p>
                        )}
                        {job.experienceLevel && (
                            <p className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {job.experienceLevel} Level
                            </p>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                    </p>
                </div>
                <Link href={`/jobs/${job.id}`} className="w-full">
                    <Button variant="outline" className="w-full ">
                        View Details
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
