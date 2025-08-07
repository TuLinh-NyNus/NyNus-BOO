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

export { Skeleton };

