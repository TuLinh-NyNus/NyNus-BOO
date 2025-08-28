import { Skeleton } from "@/components/ui/skeleton";

const CourseCardSkeleton = () => {
  return (
    <div className="relative h-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-xl overflow-hidden border border-border/40">
      <div className="relative">
        {/* Enhanced Header Skeleton - Cao hơn */}
        <div className="relative h-40 overflow-hidden">
          <Skeleton className="h-full w-full bg-muted/50" />
          
          {/* Subtle Geometric Pattern Skeletons */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-white/25 blur-sm"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-white/20 blur-sm"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 blur-md"></div>
          </div>

          {/* Enhanced Hover Icon Skeleton - Lớn hơn */}
          <div className="absolute bottom-3 right-3">
            <Skeleton className="w-10 h-10 rounded-full bg-white/25" />
          </div>
        </div>

        {/* Enhanced Content Skeleton - Padding lớn hơn */}
        <div className="p-5 flex flex-col h-full">
          {/* Title Skeleton */}
          <Skeleton className="h-5 w-3/4 bg-muted/50 mb-2" />
          <Skeleton className="h-5 w-full bg-muted/50 mb-2" />
          
          {/* Description Skeleton */}
          <Skeleton className="h-4 w-full bg-muted/50 mb-2" />
          <Skeleton className="h-4 w-2/3 bg-muted/50 mb-4 flex-grow" />
          
          {/* Stats Skeleton */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center">
              <Skeleton className="h-3.5 w-3.5 mr-1.5 bg-muted/50" />
              <Skeleton className="h-3.5 w-16 bg-muted/50" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-3.5 w-3.5 mr-1.5 bg-muted/50" />
              <Skeleton className="h-3.5 w-12 bg-muted/50" />
            </div>
          </div>
          
          {/* Enhanced Button Skeleton - Cao hơn */}
          <div className="mt-auto">
            <Skeleton className="h-12 w-full bg-muted/50 rounded-lg" />
          </div>
        </div>

        {/* Hover Overlay Skeleton */}
        <div className="absolute inset-0 bg-black/60 opacity-0">
          <div className="text-center text-white">
            <Skeleton className="w-16 h-16 rounded-full bg-white/20 mx-auto mb-3" />
            <Skeleton className="h-4 w-24 bg-white/20 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
