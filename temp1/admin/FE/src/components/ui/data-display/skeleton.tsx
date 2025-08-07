/**
 * Skeleton Component
 * Loading skeleton component cho admin interface
 *
 * @author NyNus Team
 * @version 1.0.0
 */

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Props for Skeleton component
 */
interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton Component
 * Simple loading skeleton với animation
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />;
}
