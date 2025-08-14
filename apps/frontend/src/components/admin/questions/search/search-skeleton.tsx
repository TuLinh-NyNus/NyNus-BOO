/**
 * Search Skeleton Component
 * Loading skeletons cho search functionality
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Skeleton, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface SearchSkeletonProps {
  /** Skeleton variant */
  variant?: 'search-input' | 'search-results' | 'search-stats' | 'full-search';
  /** Number of result items */
  resultCount?: number;
  /** Show search input skeleton */
  showInput?: boolean;
  /** Show stats skeleton */
  showStats?: boolean;
  /** Show advanced options skeleton */
  showAdvancedOptions?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ===== COMPONENTS =====

/**
 * Search Input Skeleton
 * Skeleton cho search input field
 */
export function SearchInputSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={cn('search-input-skeleton space-y-3', className)}>
      {/* Search input */}
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
  );
}

/**
 * Search Stats Skeleton
 * Skeleton cho search statistics
 */
export function SearchStatsSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={cn('search-stats-skeleton flex items-center gap-4', className)}>
      <div className="flex items-center gap-1">
        <Skeleton className="h-3 w-3 rounded" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-3 w-3 rounded" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

/**
 * Search Result Item Skeleton
 * Skeleton cho individual search result
 */
export function SearchResultItemSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={cn('search-result-item-skeleton', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-12 rounded" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>

          {/* Solution preview */}
          <div className="bg-muted/50 p-2 rounded space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-3/4" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-10 rounded" />
          </div>

          {/* Match details */}
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-4 w-14 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Search Results Skeleton
 * Skeleton cho search results list
 */
export function SearchResultsSkeleton({ 
  resultCount = 5, 
  className = '' 
}: { 
  resultCount?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('search-results-skeleton space-y-3', className)}>
      {/* Stats skeleton */}
      <SearchStatsSkeleton />
      
      {/* Results list */}
      <div className="space-y-3">
        {Array.from({ length: resultCount }).map((_, index) => (
          <SearchResultItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

/**
 * Advanced Options Skeleton
 * Skeleton cho advanced search options
 */
export function AdvancedOptionsSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={cn('advanced-options-skeleton', className)}>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-32" />
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Search Skeleton Component
 * Comprehensive skeleton cho search functionality
 */
export function SearchSkeleton({
  variant = 'full-search',
  resultCount = 5,
  showInput = true,
  showStats: _showStats = true,
  showAdvancedOptions = false,
  className = ''
}: SearchSkeletonProps) {
  // ===== RENDER HELPERS =====

  const renderByVariant = () => {
    switch (variant) {
      case 'search-input':
        return <SearchInputSkeleton />;
        
      case 'search-results':
        return <SearchResultsSkeleton resultCount={resultCount} />;
        
      case 'search-stats':
        return <SearchStatsSkeleton />;
        
      case 'full-search':
      default:
        return (
          <div className="space-y-4">
            {/* Search input */}
            {showInput && <SearchInputSkeleton />}
            
            {/* Advanced options */}
            {showAdvancedOptions && <AdvancedOptionsSkeleton />}
            
            {/* Search results */}
            <SearchResultsSkeleton resultCount={resultCount} />
          </div>
        );
    }
  };

  // ===== MAIN RENDER =====

  return (
    <div className={cn('search-skeleton', className)}>
      {renderByVariant()}
    </div>
  );
}

// ===== SPECIALIZED SKELETONS =====

/**
 * Quick Search Skeleton
 * Compact skeleton cho quick search
 */
export function QuickSearchSkeleton({ className = '' }: { className?: string }) {
  return (
    <SearchSkeleton
      variant="full-search"
      resultCount={3}
      showInput={true}
      showStats={true}
      showAdvancedOptions={false}
      className={cn('quick-search-skeleton', className)}
    />
  );
}

/**
 * Advanced Search Skeleton
 * Full skeleton cho advanced search
 */
export function AdvancedSearchSkeleton({ className = '' }: { className?: string }) {
  return (
    <SearchSkeleton
      variant="full-search"
      resultCount={8}
      showInput={true}
      showStats={true}
      showAdvancedOptions={true}
      className={cn('advanced-search-skeleton', className)}
    />
  );
}

/**
 * Search Loading Indicator
 * Animated loading indicator cho search
 */
export function SearchLoadingIndicator({ 
  message = 'Đang tìm kiếm...', 
  className = '' 
}: { 
  message?: string; 
  className?: string; 
}) {
  return (
    <div className={cn('search-loading-indicator flex items-center justify-center py-8', className)}>
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}
