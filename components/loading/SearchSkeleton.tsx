import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SearchSkeleton() {
  return (
    <Card className="p-6 space-y-4 border-[hsl(var(--color-border))]">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <div className="grid gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </Card>
  );
}

export function ClientCardSkeleton() {
  return (
    <Card className="p-6 space-y-4 border-[hsl(var(--color-border))]">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
      </div>
    </Card>
  );
}

export function FeatureCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6 space-y-4 border-[hsl(var(--color-border))]">
          <Skeleton className="h-14 w-14 rounded-2xl mx-auto" />
          <Skeleton className="h-5 w-32 mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5 mx-auto" />
          </div>
        </Card>
      ))}
    </div>
  );
}
