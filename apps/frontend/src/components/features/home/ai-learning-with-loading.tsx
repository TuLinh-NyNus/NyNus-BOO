'use client';

import { useState, useEffect } from 'react';
import { useLoadingState } from '@/hooks';
import { DashboardCardSkeleton, FeatureCardSkeleton } from '@/components/ui/skeleton';
import AILearning from './ai-learning';

/**
 * AI Learning Section Skeleton
 * Complete skeleton for the entire AI Learning section
 */
function AILearningSkeleton() {
  return (
    <section 
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background"
      aria-label="Loading AI Learning content"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content Skeleton */}
          <div className="order-2 lg:order-1 space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-muted/50 animate-pulse" />
                <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
              </div>
              <div className="h-8 w-3/4 bg-muted/50 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted/50 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted/50 rounded animate-pulse" />
              </div>
            </div>

            {/* Feature Cards Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <FeatureCardSkeleton key={item} />
              ))}
            </div>

            {/* CTA Button Skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
              <div className="w-4 h-4 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>

          {/* Right Dashboard Skeleton */}
          <div className="order-1 lg:order-2 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-2xl blur-lg" aria-hidden="true"></div>
            
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <DashboardCardSkeleton />
              
              {/* Floating Notification Skeleton */}
              <div className="absolute -bottom-3 sm:-bottom-5 -right-3 sm:-right-5">
                <div className="bg-card border border-border rounded-xl p-3 sm:p-4 backdrop-blur-sm shadow-lg w-56 sm:w-64 animate-pulse">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted/50 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-muted/50 rounded" />
                      <div className="space-y-1">
                        <div className="h-3 w-full bg-muted/50 rounded" />
                        <div className="h-3 w-3/4 bg-muted/50 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * AI Learning with Loading States
 * Wraps the AI Learning component with loading states and smooth transitions
 */
export default function AILearningWithLoading() {
  const { isLoading, executeWithLoading } = useLoadingState({
    minLoadingTime: 800, // Minimum loading time for smooth UX
    initialLoading: true
  });

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Simulate loading AI Learning data
    executeWithLoading(async () => {
      // Simulate API call or data fetching
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    }).then(() => {
      setShowContent(true);
    }).catch((error) => {
      console.error('Failed to load AI Learning content:', error);
      // Still show content even if there's an error
      setShowContent(true);
    });
  }, [executeWithLoading]);

  // Show skeleton while loading
  if (isLoading || !showContent) {
    return <AILearningSkeleton />;
  }

  // Show actual content with fade-in animation
  return (
    <div className="loading-fade-in">
      <AILearning />
    </div>
  );
}

/**
 * AI Learning with Simulated Loading
 * Version with manual trigger for demonstration purposes
 */
export function AILearningWithSimulatedLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);

  const simulateLoading = async () => {
    setShowContent(false);
    setIsLoading(true);
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setShowContent(true);
  };

  if (isLoading || !showContent) {
    return (
      <div>
        <AILearningSkeleton />
        {/* Debug button for testing */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={simulateLoading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Reload Section'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-fade-in">
      <AILearning />
      {/* Debug button for testing */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={simulateLoading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          Reload Section
        </button>
      </div>
    </div>
  );
}
