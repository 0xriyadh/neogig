"use client";

import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchTrpc, trpc } from "@/lib/trpc";
import { Job, TimeSlot } from "@/types/job";
import { ArrowLeft, Bookmark, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Company } from "@/types/company";
import { JobActions } from "./job-actions";
import { JobQuestionForm } from "./job-question-form";
import { QuickInterestForm } from "./quick-interest-form";
import { use } from "react";

interface JobPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function JobPage({ params }: JobPageProps) {
    const { id } = use(params);
    const jobData = trpc.job.getById.useQuery({ id: id });

    const companyData = trpc.company.getById.useQuery(
        {
            userId: jobData.data?.companyId || "",
        },
        {
            enabled: !!jobData.data?.companyId, // Only run this query when we have a companyId
        }
    );

    if (jobData.isLoading) {
        return <div>Loading job details...</div>;
    }

    if (jobData.isError) {
        return <div>Error loading job details</div>;
    }

    const job = jobData.data;
    const company = companyData.data;

    if (!job) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/jobs"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Link>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl">
                                        {job?.title}
                                    </CardTitle>
                                    <p className="text-muted-foreground mt-1">
                                        {company?.name || "Company not found"}
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="text-base px-4 py-1"
                                >
                                    {job?.jobContractType}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span>{job?.location || "Remote"}</span>
                                </div>
                                {job?.salaryMin && job?.salaryMax && (
                                    <div className="flex items-center gap-2">
                                        <span>
                                            {`${job?.salaryMin?.toLocaleString()} - ${job?.salaryMax?.toLocaleString()}`}{" "}
                                            BDT
                                        </span>
                                    </div>
                                )}
                                {job?.experienceLevel && (
                                    <div className="flex items-center gap-2">
                                        <span>{job?.experienceLevel}</span>
                                    </div>
                                )}
                                {job?.jobType && (
                                    <div className="flex items-center gap-2">
                                        <span>{job?.jobType}</span>
                                    </div>
                                )}
                                {job?.isUrgent && (
                                    <div>
                                        <Badge variant="destructive">
                                            Urgent
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Job Description
                            </h2>
                            <div className="prose prose-sm max-w-none">
                                {job?.description
                                    .split("\n")
                                    .map((paragraph, index) => (
                                        <p key={index} className="mb-4">
                                            {paragraph}
                                        </p>
                                    ))}
                            </div>
                        </div>

                        {((job?.requiredSkills &&
                            job.requiredSkills.length > 0) ||
                            job?.minimumWeeklyHourCommitment) && (
                            <>
                                <Separator />
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">
                                        Job Details
                                    </h2>

                                    {job?.requiredSkills &&
                                        job.requiredSkills.length > 0 && (
                                            <div className="mb-4">
                                                <h3 className="font-medium mb-2">
                                                    Required Skills
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.requiredSkills.map(
                                                        (skill, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline"
                                                            >
                                                                {skill}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {job?.minimumWeeklyHourCommitment && (
                                        <div className="mb-4">
                                            <h3 className="font-medium mb-2">
                                                Weekly Commitment
                                            </h3>
                                            <p>
                                                {
                                                    job.minimumWeeklyHourCommitment
                                                }{" "}
                                                hours per week
                                            </p>
                                        </div>
                                    )}

                                    {job?.probableSchedule
                                        ? Object.keys(job.probableSchedule)
                                              .length > 0 && (
                                              <div className="mb-4">
                                                  <h3 className="font-medium mb-2">
                                                      Probable Schedule
                                                  </h3>
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                      {Object.entries(
                                                          job.probableSchedule
                                                      ).map(
                                                          ([day, timeSlot]) => {
                                                              const slot =
                                                                  timeSlot as TimeSlot;
                                                              return (
                                                                  <div
                                                                      key={day}
                                                                      className="flex justify-between border p-2 rounded"
                                                                  >
                                                                      <span className="font-medium">
                                                                          {day}
                                                                      </span>
                                                                      <span>
                                                                          {
                                                                              slot.start
                                                                          }{" "}
                                                                          -{" "}
                                                                          {
                                                                              slot.end
                                                                          }
                                                                      </span>
                                                                  </div>
                                                              );
                                                          }
                                                      )}
                                                  </div>
                                              </div>
                                          )
                                        : null}
                                </div>
                            </>
                        )}

                        <Separator />

                        <div className="space-y-6">
                            <QuickInterestForm jobId={job?.id} />

                            <div className="flex flex-col sm:flex-row gap-4">
                                <JobActions jobId={job?.id} />
                            </div>

                            <JobQuestionForm
                                jobId={job?.id}
                                companyId={job?.companyId}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
