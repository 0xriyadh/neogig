'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Job } from '@/types/job';
import Link from 'next/link';

interface JobCardProps {
  job: Job & { company: {
    name: string;
  } };
}

export function JobCard({ job }: JobCardProps) {
  console.log(job);
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="mt-1">{job.company.name}</CardDescription>
          </div>
          <Badge variant="secondary">{job.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{job.location || 'Remote'}</span>
            {(job.salaryMin || job.salaryMax) && (
              <span>• ${job.salaryMin?.toLocaleString() || '0'} - ${job.salaryMax?.toLocaleString() || '∞'}</span>
            )}
            {job.experienceLevel && <span>• {job.experienceLevel}</span>}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

          <Link href={`/jobs/${job.id}`} className="w-full">
            <Button
              variant="outline"
              className="w-full "
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 