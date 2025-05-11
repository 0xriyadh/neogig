"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { Job } from "@/types/job";
import { fetchTrpc } from "@/lib/trpc";
import { JobCard } from "./job-card";
import { JobListSkeleton } from "./job-list-skeleton";
import { Company } from "../../../backend/src/db/schema/company";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export function JobList() {
    const [selectedJobTypes] = useQueryState("jobTypes", {
        defaultValue: [],
        parse: (value) => value.split(",").filter(Boolean),
    });

    const [location] = useQueryState("location", {
        defaultValue: "",
    });

    const [jobContractType] = useQueryState("jobContractType", {
        defaultValue: "",
    });

    const [selectedSkills] = useQueryState("skills", {
        defaultValue: [],
        parse: (value) => value.split(",").filter(Boolean),
    });

    const [showUrgentOnly] = useQueryState("urgent", {
        defaultValue: false,
        parse: (value) => value === "true",
    });

    const [experienceLevel] = useQueryState("experience", {
        defaultValue: "",
    });

    const [salaryRange] = useQueryState("salary", {
        defaultValue: { min: 0, max: 100000 },
        parse: (value) => {
            const [min, max] = value.split("-").map(Number);
            return { min, max };
        },
    });

    const {
        data: jobs,
        isLoading,
        error,
    } = useQuery({
        queryKey: [
            "jobs",
            selectedJobTypes,
            experienceLevel,
            salaryRange,
            location,
            jobContractType,
            selectedSkills,
            showUrgentOnly,
        ],
        queryFn: async () => {
            const data = await fetchTrpc<Job[]>("job.getAll");

            const dataWithCompany = await Promise.all(
                data.map(async (job) => {
                    const company = await fetchTrpc<Company>(
                        "company.getById",
                        { userId: job.companyId }
                    ).catch(() => null);
                    return { ...job, company };
                })
            );

            return dataWithCompany.filter((job) => {
                if (selectedJobTypes.length > 0) {
                    console.log("selectedJobTypes", selectedJobTypes);
                    console.log("selectedJobTypes job.jobType", job.jobType);
                    console.log(
                        "selectedJobTypes job.jobType.toLowerCase()",
                        job.jobType?.toLowerCase()
                    );
                    if (!selectedJobTypes.includes(job.jobType ?? "")) {
                        return false;
                    }
                }

                if (
                    experienceLevel &&
                    job?.experienceLevel?.toLowerCase() !==
                        experienceLevel.toLowerCase()
                ) {
                    return false;
                }

                // Salary range filter
                if (job.salaryMin || job.salaryMax) {
                    const jobMinSalary = Number(job.salaryMin || 0);
                    const jobMaxSalary = Number(job.salaryMax || Infinity);
                    const minSalary = Number(salaryRange.min);
                    const maxSalary = Number(salaryRange.max);

                    if (jobMinSalary > maxSalary || jobMaxSalary < minSalary) {
                        return false;
                    }
                }

                // Location filter
                if (location && job.location) {
                    const jobLocation = job.location.toLowerCase();
                    const searchLocation = location.toLowerCase();
                    if (!jobLocation.includes(searchLocation)) {
                        return false;
                    }
                }

                // Job contract type filter
                if (
                    jobContractType &&
                    job.jobContractType?.toLowerCase() !==
                        jobContractType.toLowerCase()
                ) {
                    return false;
                }

                // Skills filter
                if (selectedSkills.length > 0 && job.requiredSkills) {
                    const jobSkills = Array.isArray(job.requiredSkills)
                        ? job.requiredSkills.map((skill) => skill.toLowerCase())
                        : job.requiredSkills
                              .split(",")
                              .map((s: string) => s.trim().toLowerCase());

                    const hasRequiredSkills = selectedSkills.every((skill) =>
                        jobSkills.some((jobSkill: string) =>
                            jobSkill.includes(skill.toLowerCase())
                        )
                    );

                    if (!hasRequiredSkills) {
                        return false;
                    }
                }

                // Urgent filter
                if (showUrgentOnly && !job.isUrgent) {
                    return false;
                }

                return true;
            });
        },
    });

    if (isLoading) {
        return <JobListSkeleton />;
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>
                    {error instanceof Error
                        ? error.message
                        : "Failed to fetch jobs"}
                </span>
            </div>
        );
    }

    if (!jobs?.length) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">
                    No jobs found matching your criteria
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
                <div key={job.id} className="relative">
                    {job.isUrgent && (
                        <Badge
                            variant="destructive"
                            className="absolute top-2 right-2 z-10"
                        >
                            Urgent
                        </Badge>
                    )}
                    <JobCard job={job as Job & { company: { name: string } }} />
                </div>
            ))}
        </div>
    );
}
