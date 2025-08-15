'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * StatCard Skeleton Loading Component
 * Skeleton loading state cho StatCard với smooth animations
 */
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn(
      "relative overflow-hidden border backdrop-blur-sm animate-pulse",
      "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50",
      className
    )}>
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        {/* Title skeleton */}
        <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse" />
        
        {/* Icon skeleton */}
        <div className="h-8 w-8 bg-slate-600/50 rounded-lg animate-pulse" />
      </CardHeader>
      
      <CardContent className="relative z-10">
        {/* Value skeleton */}
        <div className="h-8 w-20 bg-slate-700/50 rounded mb-2 animate-pulse" />
        
        {/* Description skeleton */}
        <div className="h-3 w-32 bg-slate-700/50 rounded animate-pulse" />
        
        {/* Trend skeleton (optional) */}
        <div className="h-5 w-16 bg-slate-700/50 rounded mt-2 animate-pulse" />
      </CardContent>
    </Card>
  );
}

/**
 * Multiple StatCard Skeletons Grid
 * Grid layout cho multiple skeleton cards
 */
export function StatCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * CSS for shimmer animation
 * Add to global CSS or Tailwind config
 */
/*
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
*/
