/**
 * Theory Content Skeleton Component
 * Loading skeletons được tối ưu cho theory content với smooth animations
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/display/card";
import { Skeleton } from "@/components/ui/display/skeleton";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface TheoryContentSkeletonProps {
  /** Skeleton variant */
  variant?: 'content' | 'navigation' | 'chapter-list' | 'full-page' | 'mobile-viewer' | 'bottom-nav';
  
  /** Show header skeleton */
  showHeader?: boolean;
  
  /** Show progress skeleton */
  showProgress?: boolean;
  
  /** Number of items to show */
  itemCount?: number;
  
  /** Enable shimmer animation */
  animated?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_ITEM_COUNT = 3;

// ===== SKELETON VARIANTS =====

/**
 * Content Skeleton
 * Skeleton cho theory content area
 */
function ContentSkeleton({ 
  showHeader = true, 
  showProgress = true,
  animated = true 
}: Pick<TheoryContentSkeletonProps, 'showHeader' | 'showProgress' | 'animated'>) {
  return (
    <Card className="theory-content-skeleton">
      {showHeader && (
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton 
                height={24} 
                width="60%" 
                animated={animated}
                className="title-skeleton"
              />
              <div className="flex items-center gap-2">
                <Skeleton height={16} width={80} animated={animated} />
                <Skeleton height={16} width={60} animated={animated} />
                <Skeleton height={16} width={40} animated={animated} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton height={32} width={32} animated={animated} className="rounded-full" />
              <Skeleton height={32} width={32} animated={animated} className="rounded-full" />
            </div>
          </div>
          
          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton height={12} width={80} animated={animated} />
                <Skeleton height={12} width={40} animated={animated} />
              </div>
              <Skeleton height={4} width="100%" animated={animated} className="rounded-full" />
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* LaTeX Content Area */}
        <div className="space-y-3">
          <Skeleton height={20} width="90%" animated={animated} />
          <Skeleton height={20} width="95%" animated={animated} />
          <Skeleton height={20} width="85%" animated={animated} />
          
          {/* Math Expression Placeholder */}
          <div className="flex justify-center my-6">
            <Skeleton 
              height={60} 
              width={200} 
              animated={animated} 
              className="rounded-lg bg-blue-100 dark:bg-blue-900/20"
            />
          </div>
          
          <Skeleton height={20} width="92%" animated={animated} />
          <Skeleton height={20} width="88%" animated={animated} />
          <Skeleton height={20} width="90%" animated={animated} />
          
          {/* Another Math Expression */}
          <div className="flex justify-center my-6">
            <Skeleton 
              height={40} 
              width={150} 
              animated={animated} 
              className="rounded-lg bg-green-100 dark:bg-green-900/20"
            />
          </div>
          
          <Skeleton height={20} width="87%" animated={animated} />
          <Skeleton height={20} width="93%" animated={animated} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Navigation Skeleton
 * Skeleton cho navigation components
 */
function NavigationSkeleton({
  animated = true
}: Pick<TheoryContentSkeletonProps, 'animated'>) {
  return (
    <Card className="navigation-skeleton">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <Skeleton height={32} width={32} animated={animated} className="rounded" />
          
          <div className="flex-1 mx-4 text-center">
            <Skeleton height={16} width={120} animated={animated} className="mx-auto mb-1" />
            <Skeleton height={12} width={80} animated={animated} className="mx-auto" />
          </div>
          
          <div className="flex items-center gap-2">
            <Skeleton height={32} width={32} animated={animated} className="rounded" />
            <Skeleton height={32} width={32} animated={animated} className="rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Chapter List Skeleton
 * Skeleton cho swipeable chapter list
 */
function ChapterListSkeleton({ 
  itemCount = DEFAULT_ITEM_COUNT,
  animated = true 
}: Pick<TheoryContentSkeletonProps, 'itemCount' | 'animated'>) {
  return (
    <div className="chapter-list-skeleton space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height={20} width={150} animated={animated} />
          <Skeleton height={14} width={200} animated={animated} />
        </div>
        <div className="flex gap-2">
          <Skeleton height={32} width={32} animated={animated} className="rounded" />
          <Skeleton height={32} width={32} animated={animated} className="rounded" />
        </div>
      </div>
      
      {/* Chapter Items */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: itemCount }).map((_, index) => (
          <Card key={index} className="flex-shrink-0 w-[280px]">
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton height={32} width={32} animated={animated} className="rounded-full" />
                  <Skeleton height={16} width={16} animated={animated} className="rounded-full" />
                </div>
                <Skeleton height={20} width={40} animated={animated} className="rounded-full" />
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <Skeleton height={16} width="90%" animated={animated} />
                <Skeleton height={12} width="70%" animated={animated} />
              </div>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton height={10} width={40} animated={animated} />
                  <Skeleton height={10} width={30} animated={animated} />
                </div>
                <Skeleton height={4} width="100%" animated={animated} className="rounded-full" />
              </div>
              
              {/* Footer */}
              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <Skeleton height={12} width={12} animated={animated} />
                  <Skeleton height={12} width={50} animated={animated} />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton height={12} width={12} animated={animated} />
                  <Skeleton height={12} width={60} animated={animated} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Mobile Viewer Skeleton
 * Skeleton cho mobile theory viewer
 */
function MobileViewerSkeleton({ 
  showHeader = true,
  showProgress = true,
  animated = true 
}: Pick<TheoryContentSkeletonProps, 'showHeader' | 'showProgress' | 'animated'>) {
  return (
    <div className="mobile-viewer-skeleton space-y-4">
      {/* Device Info Header */}
      {showHeader && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton height={16} width={16} animated={animated} />
                <div className="space-y-1">
                  <Skeleton height={18} width={120} animated={animated} />
                  <div className="flex gap-2">
                    <Skeleton height={14} width={60} animated={animated} className="rounded-full" />
                    <Skeleton height={14} width={50} animated={animated} className="rounded-full" />
                    <Skeleton height={14} width={70} animated={animated} className="rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton height={20} width={60} animated={animated} className="rounded-full" />
                <Skeleton height={32} width={32} animated={animated} className="rounded" />
              </div>
            </div>
          </CardHeader>
        </Card>
      )}
      
      {/* Performance Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton height={16} width={16} animated={animated} />
            <Skeleton height={16} width={120} animated={animated} />
            <Skeleton height={14} width={80} animated={animated} className="rounded-full" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center space-y-1">
                <Skeleton height={24} width={40} animated={animated} className="mx-auto" />
                <Skeleton height={12} width={60} animated={animated} className="mx-auto" />
                <Skeleton height={16} width={50} animated={animated} className="mx-auto rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Content */}
      <ContentSkeleton 
        showHeader={false} 
        showProgress={showProgress} 
        animated={animated} 
      />
    </div>
  );
}

/**
 * Bottom Navigation Skeleton
 * Skeleton cho bottom navigation bar
 */
function BottomNavSkeleton({ animated = true }: Pick<TheoryContentSkeletonProps, 'animated'>) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Skeleton height={32} width={80} animated={animated} className="rounded" />
          
          <div className="flex-1 mx-4 text-center space-y-1">
            <Skeleton height={14} width={120} animated={animated} className="mx-auto" />
            <Skeleton height={12} width={80} animated={animated} className="mx-auto" />
          </div>
          
          <div className="flex items-center gap-2">
            <Skeleton height={32} width={32} animated={animated} className="rounded" />
            <Skeleton height={32} width={32} animated={animated} className="rounded" />
            <Skeleton height={32} width={80} animated={animated} className="rounded" />
          </div>
        </div>
      </div>
      <div className="h-16" />
    </div>
  );
}

/**
 * Full Page Skeleton
 * Skeleton cho full page loading
 */
function FullPageSkeleton({ 
  showHeader = true,
  showProgress = true,
  animated = true 
}: Pick<TheoryContentSkeletonProps, 'showHeader' | 'showProgress' | 'animated'>) {
  return (
    <div className="full-page-skeleton space-y-4">
      <NavigationSkeleton animated={animated} />
      <ChapterListSkeleton itemCount={2} animated={animated} />
      <ContentSkeleton
        showHeader={showHeader}
        showProgress={showProgress}
        animated={animated}
      />
      <BottomNavSkeleton animated={animated} />
    </div>
  );
}

// ===== MAIN COMPONENT =====

export function TheoryContentSkeleton({
  variant = 'content',
  showHeader = true,
  showProgress = true,
  itemCount = DEFAULT_ITEM_COUNT,
  animated = true,
  className
}: TheoryContentSkeletonProps) {
  
  const renderSkeleton = () => {
    switch (variant) {
      case 'navigation':
        return <NavigationSkeleton animated={animated} />;
        
      case 'chapter-list':
        return <ChapterListSkeleton itemCount={itemCount} animated={animated} />;
        
      case 'mobile-viewer':
        return (
          <MobileViewerSkeleton 
            showHeader={showHeader} 
            showProgress={showProgress} 
            animated={animated} 
          />
        );
        
      case 'bottom-nav':
        return <BottomNavSkeleton animated={animated} />;
        
      case 'full-page':
        return (
          <FullPageSkeleton 
            showHeader={showHeader} 
            showProgress={showProgress} 
            animated={animated} 
          />
        );
        
      case 'content':
      default:
        return (
          <ContentSkeleton 
            showHeader={showHeader} 
            showProgress={showProgress} 
            animated={animated} 
          />
        );
    }
  };

  return (
    <div className={cn("theory-content-skeleton", className)}>
      {renderSkeleton()}
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Quick Loading Skeleton
 * Skeleton nhanh cho instant feedback
 */
export function QuickTheorySkeleton(props: TheoryContentSkeletonProps) {
  return (
    <TheoryContentSkeleton
      {...props}
      variant="content"
      showHeader={false}
      showProgress={false}
      animated={true}
      className={cn("quick-theory-skeleton", props.className)}
    />
  );
}

/**
 * Detailed Loading Skeleton
 * Skeleton chi tiết cho full experience
 */
export function DetailedTheorySkeleton(props: TheoryContentSkeletonProps) {
  return (
    <TheoryContentSkeleton
      {...props}
      variant="full-page"
      showHeader={true}
      showProgress={true}
      animated={true}
      className={cn("detailed-theory-skeleton", props.className)}
    />
  );
}
