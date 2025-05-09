import { Suspense } from 'react';
import { JobList } from '@/components/jobs/job-list';
import { JobFilters } from '@/components/jobs/job-filters';
import { JobListSkeleton } from '@/components/jobs/job-list-skeleton';

export const metadata = {
  title: 'Jobs | NeoGig',
  description: 'Browse and find your next opportunity',
};

export default function JobsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Find Your Next Opportunity</h1>
          <p className="mt-2 text-muted-foreground">
            Browse through our curated list of jobs and find your perfect match
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <aside className="hidden md:block sticky top-20">
            <JobFilters />
          </aside>

          <main>
            <Suspense fallback={<JobListSkeleton />}>
              <JobList />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
