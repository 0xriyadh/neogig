import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchTrpc } from "@/lib/trpc";
import { Job } from "@/types/job";
import { ArrowLeft, Bookmark, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Company } from "@/types/company";
import { JobActions } from "./job-actions";
import { JobQuestionForm } from "./job-question-form";
import { QuickInterestForm } from "./quick-interest-form";

interface JobPageProps {
    params: {
        id: string;
    };
}

export const metadata = {
    title: "Job Details | NeoGig",
    description: "View detailed information about the job posting",
};

export default async function JobPage({ params }: JobPageProps) {
    const job = await fetchTrpc<Job>("job.getById", { id: params.id }).catch(
        () => null
    );
    const company = await fetchTrpc<Company>("company.getById", {
        userId: job?.companyId,
    }).catch(() => null);

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
                                        {job.title}
                                    </CardTitle>
                                    <p className="text-muted-foreground mt-1">
                                        {company?.name || "Company not found"}
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="text-base px-4 py-1"
                                >
                                    {job.jobContractType}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span>{job.location || "Remote"}</span>
                                </div>
                                {job.salaryMin && job.salaryMax && (
                                    <div className="flex items-center gap-2">
                                        <span>
                                            {`${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}`}{" "}
                                            BDT
                                        </span>
                                    </div>
                                )}
                                {job.experienceLevel && (
                                    <div className="flex items-center gap-2">
                                        <span>{job.experienceLevel}</span>
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
                                {job.description
                                    .split("\n")
                                    .map((paragraph, index) => (
                                        <p key={index} className="mb-4">
                                            {paragraph}
                                        </p>
                                    ))}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                            <QuickInterestForm jobId={job.id} />

                            <div className="flex flex-col sm:flex-row gap-4">
                                <JobActions jobId={job.id} />
                            </div>

                            <JobQuestionForm
                                jobId={job.id}
                                companyId={job.companyId}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
