import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function JobNotFound() {
  return (
    <div className="container mx-auto py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Job Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The job you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/jobs">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    </div>
  );
} 