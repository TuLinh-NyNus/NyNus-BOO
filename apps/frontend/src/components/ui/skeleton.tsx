import { cn } from "@/lib/utils";

/**
 * Skeleton component - Hiển thị placeholder loading animation
 * Sử dụng để tạo hiệu ứng loading khi đang tải dữ liệu
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/**
 * Dashboard Card Skeleton
 * Skeleton cho dashboard cards
 */
function DashboardCardSkeleton() {
  return (
    <div className="p-6 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

/**
 * Feature Card Skeleton
 * Skeleton cho feature cards
 */
function FeatureCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <Skeleton className="h-12 w-12 rounded-full mb-4" />
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export { Skeleton, DashboardCardSkeleton, FeatureCardSkeleton };

