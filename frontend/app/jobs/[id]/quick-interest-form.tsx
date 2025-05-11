"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
interface QuickInterestFormProps {
    jobId: string;
}

export function QuickInterestForm({ jobId }: QuickInterestFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const utils = trpc.useUtils();

    const submitInterest = trpc.application.submitInterest.useMutation({
        onSuccess: () => {
            toast.success("Interest Submitted");
            router.refresh();
        },
        onError: (error: any) => {
            toast.error(error.message);
        },
    });

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const availability = formData.get("availability") as string;
        const skills = formData.get("skills") as string;

        try {
            await submitInterest.mutateAsync({
                jobId,
                availability,
                skills,
            });
            utils.application.getByJobId.invalidate();
            trpc.application.withdraw;
        } finally {
            setIsSubmitting(false);
        }
    }

    const { data: applications, isLoading: isApplicationsLoading } =
        trpc.application.getByJobId.useQuery(
            { jobId: jobId },
            { enabled: !!jobId }
        );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Interest Form</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="availability">Your Availability</Label>
                        <Textarea
                            id="availability"
                            name="availability"
                            placeholder="When are you available to start? What's your preferred schedule?"
                            disabled={
                                isSubmitting ||
                                isApplicationsLoading ||
                                applications?.length === 0
                            }
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="skills">Your Skills</Label>
                        <Textarea
                            id="skills"
                            name="skills"
                            placeholder="List your relevant skills and experience"
                            disabled={
                                isSubmitting ||
                                isApplicationsLoading ||
                                applications?.length === 0
                            }
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            isApplicationsLoading ||
                            applications?.length === 0
                        }
                    >
                        {isSubmitting ? "Submitting..." : "Submit Interest"}
                        {applications && applications?.length > 0 && (
                            <span className="text-xs text-gray-500">
                                You have already applied for this job
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
