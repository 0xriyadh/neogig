import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="p-4 min-h-[200px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-[250px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <Skeleton className="h-4 w-[200px]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 