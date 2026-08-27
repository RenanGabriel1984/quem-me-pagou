import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton", className)}
      {...props}
    />
  );
}

export function SubscriptionCardSkeleton() {
  return (
    <div className="bg-card/60 border border-border/40 rounded-xl p-5">
      <div className="flex items-start gap-3.5">
        <Skeleton className="size-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-7 w-20 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Savings card skeleton */}
      <Skeleton className="h-20 rounded-xl" />
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      {/* Subscription cards */}
      <div className="space-y-3">
        <SubscriptionCardSkeleton />
        <SubscriptionCardSkeleton />
        <SubscriptionCardSkeleton />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      {/* Comparison card */}
      <Skeleton className="h-32 rounded-xl" />
      {/* People list */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card/60 border border-border/40 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
