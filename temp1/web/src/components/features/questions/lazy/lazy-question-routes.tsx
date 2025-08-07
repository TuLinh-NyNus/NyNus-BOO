'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import { Skeleton } from '@/components/ui/display/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/display/card';

/**
 * Lazy Question Routes
 * 
 * Task 2.2.1 - Bundle Optimization:
 * - Code splitting for question routes
 * - Lazy loading for page-level components
 * - Optimize route-based bundle chunks
 */

// =====================================================
// PAGE LOADING SKELETONS
// =====================================================

export const QuestionPageSkeleton = () => (
  <div className="container mx-auto p-6 space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export const QuestionListPageSkeleton = () => (
  <div className="container mx-auto p-6 space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-3 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export const QuestionFormPageSkeleton = () => (
  <div className="container mx-auto p-6 space-y-6">
    <Skeleton className="h-8 w-56" />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

// =====================================================
// LAZY LOADED PAGES
// =====================================================

// Question Management Pages
export const LazyQuestionInputPage = React.lazy(() => 
  import('@/app/3141592654/admin/questions/inputques/page').then(module => ({
    default: module.default
  }))
);

export const LazyQuestionListPage = React.lazy(() => 
  import('@/app/3141592654/admin/questions/page').then(module => ({
    default: module.default
  }))
);

export const LazyQuestionBankPage = React.lazy(() =>
  import('@/app/3141592654/admin/questions/page').then(module => ({
    default: module.default
  }))
);

// Question Search Pages
export const LazyQuestionSearchPage = React.lazy(() =>
  import('@/app/3141592654/admin/questions/page').then(module => ({
    default: module.default
  }))
);

// Question Import/Export Pages
export const LazyQuestionImportPage = React.lazy(() =>
  import('@/app/3141592654/admin/questions/inputauto/page').then(module => ({
    default: module.default
  }))
);

export const LazyQuestionExportPage = React.lazy(() =>
  import('@/app/3141592654/admin/questions/database/page').then(module => ({
    default: module.default
  }))
);

// =====================================================
// ROUTE-BASED LAZY WRAPPERS
// =====================================================

interface LazyPageWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  pageName?: string;
}

export const LazyPageWrapper = ({ 
  children, 
  fallback = <QuestionPageSkeleton />,
  pageName = 'Unknown'
}: LazyPageWrapperProps) => {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen">
          {fallback}
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            Đang tải {pageName}...
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

// =====================================================
// PAGE COMPONENTS WITH FALLBACKS
// =====================================================

export const LazyQuestionInputPageWithFallback = (props: any) => (
  <LazyPageWrapper fallback={<QuestionFormPageSkeleton />} pageName="Tạo câu hỏi">
    <LazyQuestionInputPage {...props} />
  </LazyPageWrapper>
);

export const LazyQuestionListPageWithFallback = (props: any) => (
  <LazyPageWrapper fallback={<QuestionListPageSkeleton />} pageName="Danh sách câu hỏi">
    <LazyQuestionListPage {...props} />
  </LazyPageWrapper>
);

export const LazyQuestionBankPageWithFallback = (props: any) => (
  <LazyPageWrapper fallback={<QuestionListPageSkeleton />} pageName="Ngân hàng câu hỏi">
    <LazyQuestionBankPage {...props} />
  </LazyPageWrapper>
);

export const LazyQuestionSearchPageWithFallback = (props: any) => (
  <LazyPageWrapper fallback={<QuestionListPageSkeleton />} pageName="Tìm kiếm câu hỏi">
    <LazyQuestionSearchPage {...props} />
  </LazyPageWrapper>
);

export const LazyQuestionImportPageWithFallback = (props: any) => (
  <LazyPageWrapper fallback={<QuestionFormPageSkeleton />} pageName="Import câu hỏi">
    <LazyQuestionImportPage {...props} />
  </LazyPageWrapper>
);

export const LazyQuestionExportPageWithFallback = (props: any) => (
  <LazyPageWrapper fallback={<QuestionFormPageSkeleton />} pageName="Export câu hỏi">
    <LazyQuestionExportPage {...props} />
  </LazyPageWrapper>
);

// =====================================================
// ROUTE PRELOADING UTILITIES
// =====================================================

/**
 * Preload question routes
 */
export const preloadQuestionRoutes = {
  input: () => import('@/app/3141592654/admin/questions/inputques/page'),
  list: () => import('@/app/3141592654/admin/questions/page'),
  bank: () => import('@/app/3141592654/admin/questions/page'),
  search: () => import('@/app/3141592654/admin/questions/page'),
  import: () => import('@/app/3141592654/admin/questions/inputauto/page'),
  export: () => import('@/app/3141592654/admin/questions/database/page'),
};

/**
 * Preload critical routes on app initialization
 */
export const preloadCriticalRoutes = async () => {
  // Preload most commonly accessed routes
  const criticalRoutes = [
    preloadQuestionRoutes.input(),
    preloadQuestionRoutes.list(),
  ];
  
  await Promise.allSettled(criticalRoutes.map(route => 
    route.catch(error => {
      console.warn('Failed to preload route:', error);
      return null;
    })
  ));
};

/**
 * Preload route on user interaction (hover, focus)
 */
export const preloadRouteOnInteraction = (routeName: keyof typeof preloadQuestionRoutes) => {
  const preloadFn = preloadQuestionRoutes[routeName];
  if (preloadFn) {
    preloadFn().catch(error => {
      console.warn(`Failed to preload route ${routeName}:`, error);
    });
  }
};

// =====================================================
// ROUTE PERFORMANCE MONITORING
// =====================================================

/**
 * Monitor route loading performance
 */
export const RouteLoadingMonitor = {
  routeStartTimes: new Map<string, number>(),
  
  startRouteLoad(routeName: string) {
    this.routeStartTimes.set(routeName, performance.now());
  },
  
  endRouteLoad(routeName: string) {
    const startTime = this.routeStartTimes.get(routeName);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      console.log(`Route ${routeName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Report slow routes
      if (loadTime > 2000) {
        console.warn(`Slow route loading: ${routeName} took ${loadTime.toFixed(2)}ms`);
      }
      
      this.routeStartTimes.delete(routeName);
    }
  }
};

// =====================================================
// BUNDLE CHUNK OPTIMIZATION
// =====================================================

/**
 * Route-based chunk configuration
 */
export const RouteChunkConfig = {
  // Critical routes - loaded immediately
  critical: ['input', 'list'],
  
  // Secondary routes - preloaded on interaction
  secondary: ['bank', 'search'],
  
  // Tertiary routes - loaded on demand
  tertiary: ['import', 'export'],
  
  getChunkPriority(routeName: string): 'critical' | 'secondary' | 'tertiary' {
    if (this.critical.includes(routeName)) return 'critical';
    if (this.secondary.includes(routeName)) return 'secondary';
    return 'tertiary';
  }
};

/**
 * Smart route preloading based on user behavior
 */
export const SmartRoutePreloader = {
  preloadedRoutes: new Set<string>(),
  
  async preloadBasedOnPriority() {
    // Preload critical routes immediately
    for (const routeName of RouteChunkConfig.critical) {
      if (!this.preloadedRoutes.has(routeName)) {
        await this.preloadRoute(routeName);
      }
    }
    
    // Preload secondary routes after a delay
    setTimeout(() => {
      RouteChunkConfig.secondary.forEach(routeName => {
        if (!this.preloadedRoutes.has(routeName)) {
          this.preloadRoute(routeName);
        }
      });
    }, 2000);
  },
  
  async preloadRoute(routeName: string) {
    try {
      const preloadFn = preloadQuestionRoutes[routeName as keyof typeof preloadQuestionRoutes];
      if (preloadFn) {
        await preloadFn();
        this.preloadedRoutes.add(routeName);
        console.log(`Route ${routeName} preloaded successfully`);
      }
    } catch (error) {
      console.warn(`Failed to preload route ${routeName}:`, error);
    }
  }
};
