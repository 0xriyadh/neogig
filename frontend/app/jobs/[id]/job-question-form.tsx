'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface JobQuestionFormProps {
  jobId: string;
  companyId: string;
}

export function JobQuestionForm({ jobId, companyId }: JobQuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: questions } = trpc.jobQuestion.getByJobId.useQuery({ jobId });

  const submitQuestion = trpc.jobQuestion.create.useMutation({
    onSuccess: () => {
      toast.success('Question submitted successfully');
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const question = formData.get('question') as string;

    try {
      await submitQuestion.mutateAsync({
        jobId,
        question,
      });
      event.currentTarget.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            {isSubmitting ? 'Submitting...' : 'Submit Question'}
          </Button>
        </form>

        {questions && questions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Previous Questions</h3>
            {questions.map((q) => (
              <div key={q.id} className="p-4 bg-muted rounded-lg">
                <p className="font-medium">Q: {q.question}</p>
                {q.answer && (
                  <p className="mt-2 text-muted-foreground">A: {q.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 