/**
 * Question List Skeleton Component
 * Loading skeleton cho question list với different view modes
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Skeleton, Card, CardContent } from "@/components/ui";

// ===== TYPES =====

export interface QuestionListSkeletonProps {
  viewMode?: 'table' | 'cards' | 'virtual' | 'search';
  layout?: 'desktop' | 'tablet' | 'mobile';
  itemCount?: number;
  showHeader?: boolean;
  showSearchInput?: boolean;
  showSearchStats?: boolean;
  className?: string;
}

// ===== SKELETON COMPONENTS =====

/**
 * Table skeleton row
 */
function TableSkeletonRow() {
  return (
    <tr className="border-b">
      <td className="p-4">
        <Skeleton className="h-4 w-4" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-full max-w-md" />
      </td>
      <td className="p-4">
        <Skeleton className="h-6 w-16" />
      </td>
      <td className="p-4">
        <Skeleton className="h-6 w-20" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-8" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-4">
        <Skeleton className="h-8 w-8" />
      </td>
    </tr>
  );
}

/**
 * Table skeleton
 */
function TableSkeleton({ itemCount = 10, showHeader = true }: { itemCount?: number; showHeader?: boolean }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        {showHeader && (
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-4" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: itemCount }).map((_, index) => (
            <TableSkeletonRow key={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Card skeleton
 */
function CardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Cards grid skeleton
 */
function CardsGridSkeleton({ itemCount = 12, layout = 'desktop' }: { itemCount?: number; layout?: 'desktop' | 'tablet' | 'mobile' }) {
  const getGridCols = () => {
    switch (layout) {
      case 'mobile':
        return 'grid-cols-1';
      case 'tablet':
        return 'grid-cols-2';
      case 'desktop':
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Virtual list skeleton
 */
function VirtualListSkeleton({ itemCount = 20, containerHeight = 600 }: { itemCount?: number; containerHeight?: number }) {
  return (
    <div 
      className="border rounded-lg overflow-hidden bg-background"
      style={{ height: containerHeight }}
    >
      <div className="space-y-2 p-4">
        {Array.from({ length: Math.min(itemCount, 10) }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-3 border rounded">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
        
        {/* Fade effect để indicate more items */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
          <div className="text-center py-4 text-sm text-muted-foreground">
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Question List Skeleton
 * Adaptive skeleton dựa trên view mode và layout
 */
export function QuestionListSkeleton({
  viewMode = 'table',
  layout = 'desktop',
  itemCount,
  showHeader = true,
  showSearchInput = false,
  showSearchStats = false,
  className = ""
}: QuestionListSkeletonProps) {
  // Determine default item count dựa trên view mode và layout
  const getDefaultItemCount = () => {
    if (itemCount) return itemCount;

    switch (viewMode) {
      case 'virtual':
        return 20;
      case 'cards':
        return layout === 'mobile' ? 6 : layout === 'tablet' ? 8 : 12;
      case 'search':
        return layout === 'mobile' ? 3 : layout === 'tablet' ? 5 : 8;
      case 'table':
      default:
        return layout === 'mobile' ? 5 : layout === 'tablet' ? 8 : 10;
    }
  };

  const defaultItemCount = getDefaultItemCount();

  // Render appropriate skeleton dựa trên view mode
  const renderSkeleton = () => {
    switch (viewMode) {
      case 'virtual':
        return <VirtualListSkeleton itemCount={defaultItemCount} />;
      case 'cards':
        return <CardsGridSkeleton itemCount={defaultItemCount} layout={layout} />;
      case 'table':
      default:
        return <TableSkeleton itemCount={defaultItemCount} showHeader={showHeader} />;
    }
  };

  return (
    <div className={`question-list-skeleton ${className}`}>
      {/* Search input skeleton */}
      {showSearchInput && (
        <div className="mb-4">
          <div className="relative">
            <Skeleton className="h-10 w-full rounded-md" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Search stats skeleton */}
      {showSearchStats && (
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      )}

      {renderSkeleton()}

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Đang tải câu hỏi...</span>
        </div>
      </div>
    </div>
  );
}

// ===== SPECIALIZED SKELETONS =====

/**
 * Quick skeleton cho table mode
 */
export function QuestionTableSkeleton({ rows = 10 }: { rows?: number }) {
  return <QuestionListSkeleton viewMode="table" itemCount={rows} />;
}

/**
 * Quick skeleton cho cards mode
 */
export function QuestionCardsSkeleton({ cards = 12, layout = 'desktop' }: { cards?: number; layout?: 'desktop' | 'tablet' | 'mobile' }) {
  return <QuestionListSkeleton viewMode="cards" itemCount={cards} layout={layout} />;
}

/**
 * Quick skeleton cho virtual mode
 */
export function QuestionVirtualSkeleton({ items = 20 }: { items?: number }) {
  return <QuestionListSkeleton viewMode="virtual" itemCount={items} />;
}
