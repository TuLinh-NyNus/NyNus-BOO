/**
 * Public Question Loading Skeletons
 * Loading skeletons adapted cho public interface theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React from "react";
import { Skeleton, Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface PublicQuestionLoadingProps {
  /** Loading variant matching PublicQuestionCard variants */
  variant?: 'compact' | 'default' | 'featured';
  /** Number of skeleton items */
  count?: number;
  /** Show action buttons skeleton */
  showActions?: boolean;
  /** Show metadata skeleton */
  showMetadata?: boolean;
  /** Show rating skeleton */
  showRating?: boolean;
  /** Show views skeleton */
  showViews?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface PublicQuestionListLoadingProps {
  /** Layout mode */
  layout?: 'grid' | 'list';
  /** Number of items */
  itemCount?: number;
  /** Grid columns (for grid layout) */
  columns?: 1 | 2 | 3 | 4;
  /** Show search skeleton */
  showSearch?: boolean;
  /** Show filters skeleton */
  showFilters?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ===== INDIVIDUAL SKELETON COMPONENTS =====

/**
 * Compact Question Card Skeleton
 */
function CompactQuestionSkeleton({ 
  showActions = true, 
  className = "" 
}: Pick<PublicQuestionLoadingProps, 'showActions' | 'className'>) {
  return (
    <Card className={cn("public-question-skeleton-compact", className)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Question content */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            
            {/* Badges */}
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          
          {/* Actions */}
          {showActions && (
            <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Default Question Card Skeleton
 */
function DefaultQuestionSkeleton({ 
  showActions = true, 
  showMetadata = true,
  showRating = true,
  showViews = true,
  className = "" 
}: Pick<PublicQuestionLoadingProps, 'showActions' | 'showMetadata' | 'showRating' | 'showViews' | 'className'>) {
  return (
    <Card className={cn("public-question-skeleton-default", className)}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Category badges */}
            {showMetadata && (
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            )}
            
            {/* Question content */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            
            {/* Metadata badges */}
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              {showRating && <Skeleton className="h-6 w-12" />}
              {showViews && <Skeleton className="h-6 w-24" />}
            </div>
          </div>
          
          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Featured Question Card Skeleton
 */
function FeaturedQuestionSkeleton({ 
  showActions = true, 
  showMetadata = true,
  showRating = true,
  showViews = true,
  className = "" 
}: Pick<PublicQuestionLoadingProps, 'showActions' | 'showMetadata' | 'showRating' | 'showViews' | 'className'>) {
  return (
    <Card className={cn("public-question-skeleton-featured", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header với category và subject */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          
          {/* Rating và views */}
          <div className="flex items-center gap-3">
            {showRating && (
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-6" />
              </div>
            )}
            {showViews && (
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-8" />
              </div>
            )}
          </div>
        </div>
        
        {/* Question content */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* Question metadata */}
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-18" />
            <Skeleton className="h-6 w-24" />
          </div>
          
          {/* Tags */}
          {showMetadata && (
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-8" />
            </div>
          )}
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
            </div>
            
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        )}
        
        {/* Footer với date */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Skeleton className="h-3 w-36" />
        </div>
      </CardContent>
    </Card>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Public Question Loading Skeleton
 */
export function PublicQuestionLoading({
  variant = 'default',
  count = 1,
  showActions = true,
  showMetadata = true,
  showRating = true,
  showViews = true,
  className = ""
}: PublicQuestionLoadingProps) {
  
  const renderSkeleton = () => {
    switch (variant) {
      case 'compact':
        return (
          <CompactQuestionSkeleton 
            showActions={showActions}
            className={className}
          />
        );
        
      case 'featured':
        return (
          <FeaturedQuestionSkeleton
            showActions={showActions}
            showMetadata={showMetadata}
            showRating={showRating}
            showViews={showViews}
            className={className}
          />
        );
        
      case 'default':
      default:
        return (
          <DefaultQuestionSkeleton
            showActions={showActions}
            showMetadata={showMetadata}
            showRating={showRating}
            showViews={showViews}
            className={className}
          />
        );
    }
  };

  return (
    <div className="public-question-loading space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}

// ===== SPECIALIZED LOADING COMPONENTS =====

/**
 * Public Question List Loading
 */
export function PublicQuestionListLoading({
  layout = 'list',
  itemCount = 6,
  columns = 3,
  showSearch = false,
  showFilters = false,
  className = ""
}: PublicQuestionListLoadingProps) {
  
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={cn("public-question-list-loading space-y-6", className)}>
      {/* Search skeleton */}
      {showSearch && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      )}
      
      {/* Filters skeleton */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-16" />
        </div>
      )}
      
      {/* Questions skeleton */}
      <div className={cn(
        layout === 'grid' 
          ? `grid gap-4 ${gridClasses[columns]}` 
          : 'space-y-4'
      )}>
        {Array.from({ length: itemCount }, (_, index) => (
          <PublicQuestionLoading
            key={index}
            variant={layout === 'grid' ? 'compact' : 'default'}
            count={1}
            showActions={true}
            showMetadata={true}
            showRating={true}
            showViews={true}
          />
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between pt-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact loading cho dense layouts
 */
export function PublicQuestionCompactLoading(props: Omit<PublicQuestionLoadingProps, 'variant'>) {
  return (
    <PublicQuestionLoading
      {...props}
      variant="compact"
      className={cn("compact-loading", props.className)}
    />
  );
}

/**
 * Featured loading cho highlighted content
 */
export function PublicQuestionFeaturedLoading(props: Omit<PublicQuestionLoadingProps, 'variant'>) {
  return (
    <PublicQuestionLoading
      {...props}
      variant="featured"
      className={cn("featured-loading", props.className)}
    />
  );
}

// ===== DEFAULT EXPORTS =====

export default PublicQuestionLoading;
