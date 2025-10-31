import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ClientOverviewSkeleton() {
  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full max-w-xs" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectVolumeSkeleton() {
  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 rounded-xl border-2 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceMetricsSkeleton() {
  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <Skeleton className="h-6 w-44" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 flex-1 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivitiesSkeleton() {
  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-5 rounded-xl border-2 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ClientDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Client Overview - Full Width */}
      <div className="lg:col-span-2">
        <ClientOverviewSkeleton />
      </div>

      {/* Special Note - Full Width */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Project Volume */}
      <ProjectVolumeSkeleton />

      {/* Performance Metrics */}
      <PerformanceMetricsSkeleton />

      {/* Recent Activities - Full Width */}
      <div className="lg:col-span-2">
        <RecentActivitiesSkeleton />
      </div>
    </div>
  );
}
