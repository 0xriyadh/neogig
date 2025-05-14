"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface JobQuestionFormProps {
    jobId: string;
    companyId: string;
}

export function JobQuestionForm({ jobId, companyId }: JobQuestionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answeringId, setAnsweringId] = useState<string | null>(null);
    const [answer, setAnswer] = useState("");
    const router = useRouter();
    const utils = trpc.useUtils();
    const { currentUser } = useCurrentUser();

    const isCompanyOwner =
        currentUser?.id === companyId && currentUser?.role === "company";

    const { data: questions } = trpc.jobQuestion.getByJobId.useQuery({ jobId });

    const submitQuestion = trpc.jobQuestion.create.useMutation({
        onSuccess: () => {
            toast.success("Question submitted successfully");
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const submitAnswer = trpc.jobQuestion.answer.useMutation({
        onSuccess: () => {
            toast.success("Answer submitted successfully");
            setAnsweringId(null);
            setAnswer("");
            utils.jobQuestion.getByJobId.invalidate({ jobId });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        const currentTarget = event.currentTarget;
        const formData = new FormData(currentTarget);
        const question = formData.get("question") as string;

        try {
            await submitQuestion.mutateAsync({
                jobId,
                question,
            });
            utils.jobQuestion.getByJobId.invalidate();
            currentTarget.reset();
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleAnswerSubmit(questionId: string) {
        if (!answer.trim()) return;

        try {
            await submitAnswer.mutateAsync({
                questionId,
                answer: answer.trim(),
            });
        } catch (error) {
            console.error("Failed to submit answer:", error);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {isCompanyOwner ? "Job Questions" : "Ask a Question"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!isCompanyOwner && (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Textarea
                                id="question"
                                name="question"
                                placeholder="Ask the company about this job posting..."
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Question"}
                        </Button>
                    </form>
                )}

                {questions && questions.length > 0 && (
                    <div
                        className={`${!isCompanyOwner ? "mt-6" : ""} space-y-4`}
                    >
                        <h3 className="font-semibold">
                            {isCompanyOwner
                                ? "Questions from Job Seekers"
                                : "Previous Questions"}
                        </h3>
                        {questions.map((q) => (
                            <div key={q.id} className="p-4 bg-muted rounded-lg">
                                <p className="font-medium">Q: {q.question}</p>
                                {q.answer && (
                                    <p className="mt-2 text-muted-foreground">
                                        A: {q.answer}
                                    </p>
                                )}

                                {isCompanyOwner && !q.answer && (
                                    <>
                                        {answeringId === q.id ? (
                                            <div className="mt-2 space-y-2">
                                                <Textarea
                                                    value={answer}
                                                    onChange={(e) =>
                                                        setAnswer(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Type your answer here..."
                                                    className="w-full"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleAnswerSubmit(
                                                                q.id
                                                            )
                                                        }
                                                        disabled={
                                                            submitAnswer.isPending
                                                        }
                                                    >
                                                        {submitAnswer.isPending
                                                            ? "Submitting..."
                                                            : "Submit Answer"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setAnsweringId(
                                                                null
                                                            );
                                                            setAnswer("");
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-2"
                                                onClick={() =>
                                                    setAnsweringId(q.id)
                                                }
                                            >
                                                Answer this question
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
