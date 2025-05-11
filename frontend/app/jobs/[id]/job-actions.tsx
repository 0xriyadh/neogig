"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Bookmark, X } from "lucide-react";
import { toast } from "sonner";

interface JobActionsProps {
    jobId: string;
}

export function JobActions({ jobId }: JobActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { data: savedJob } = trpc.savedJob.getByJobId.useQuery({ jobId });
    const { data: application } = trpc.application.getByJobId.useQuery({
        jobId,
    });
    const utils = trpc.useUtils();

    const saveJob = trpc.savedJob.toggle.useMutation({
        onSuccess: () => {
            toast.success(savedJob ? "Job Unsaved" : "Job Saved");
            router.refresh();
        },
        onError: (error: any) => {
            toast.error(error.message);
        },
    });

    const withdrawInterest = trpc.application.withdraw.useMutation({
        onSuccess: () => {
            toast.success("Interest Withdrawn");
            router.refresh();
        },
        onError: (error: any) => {
            toast.error(error.message);
        },
    });

    async function handleSaveJob() {
        setIsLoading(true);
        try {
            await saveJob.mutateAsync(
                { jobId },
                {
                    onSuccess: () => {
                        utils.savedJob.getByJobId.invalidate();
                        toast.success("Job Saved");
                        router.refresh();
                    },
                    onError: (error: any) => {
                        toast.error(error.message);
                    },
                }
            );
        } finally {
            setIsLoading(false);
        }
    }

    async function handleWithdrawInterest() {
        if (!application) return;

        setIsLoading(true);
        try {
            await withdrawInterest.mutateAsync({
                applicationId: application[0].id,
            });
            utils.application.getByJobId.invalidate();
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Button
                size="lg"
                variant={
                    savedJob && savedJob?.length > 0 ? "secondary" : "default"
                }
                className="flex-1"
                onClick={handleSaveJob}
                disabled={isLoading}
            >
                <Bookmark className="w-4 h-4 mr-2" />
                {savedJob && savedJob?.length > 0 ? "Unsave Job" : "Save Job"}
            </Button>

            {application && application?.length > 0 && (
                <Button
                    size="lg"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleWithdrawInterest}
                    disabled={isLoading}
                >
                    <X className="w-4 h-4 mr-2" />
                    Withdraw Interest
                </Button>
            )}
        </>
    );
}
