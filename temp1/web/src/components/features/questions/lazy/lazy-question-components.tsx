'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import { Skeleton } from '@/components/ui/display/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/display/card';

/**
 * Lazy Question Components
 * 
 * Task 2.2.1 - Bundle Optimization:
 * - Implement lazy loading for Question components
 * - Add code splitting for heavy components
 * - Optimize bundle size from 2.5MB to <1MB
 */

// =====================================================
// LOADING SKELETONS
// =====================================================

export const QuestionFormSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-96" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </CardContent>
  </Card>
);

export const QuestionListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const MapIDDecoderSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-8 w-32" />
    </CardContent>
  </Card>
);

export const LaTeXRendererSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

// =====================================================
// LAZY LOADED COMPONENTS
// =====================================================

// Question Form Components
export const LazyQuestionForm = React.lazy(() => 
  import('../components/question-form/question-form').then(module => ({
    default: module.default
  }))
);

export const LazyQuestionFormTabs = React.lazy(() => 
  import('../components/question-form/question-form-tabs').then(module => ({
    default: module.default
  }))
);

// Question Bank Components
export const LazyQuestionList = React.lazy(() => 
  import('../components/question-bank/question-list').then(module => ({
    default: module.default
  }))
);

export const LazyQuestionBank = React.lazy(() => 
  import('../components/question-bank/question-bank').then(module => ({
    default: module.default
  }))
);

// MapID Components
export const LazyUnifiedMapIDDecoder = React.lazy(() => 
  import('../mapid/unified-map-id-decoder').then(module => ({
    default: module.UnifiedMapIDDecoder
  }))
);

export const LazyUnifiedQuestionIDInfo = React.lazy(() => 
  import('../mapid/unified-question-id-info').then(module => ({
    default: module.UnifiedQuestionIDInfo
  }))
);

export const LazyQuestionIDForm = React.lazy(() => 
  import('../mapid/QuestionIDForm').then(module => ({
    default: module.default
  }))
);

export const LazyQuestionIDDisplay = React.lazy(() => 
  import('../mapid/QuestionIDDisplay').then(module => ({
    default: module.default
  }))
);

// Search Components
export const LazyQuestionSearchTabs = React.lazy(() => 
  import('../search/question-search-tabs').then(module => ({
    default: module.default
  }))
);

// =====================================================
// LAZY WRAPPER COMPONENT
// =====================================================

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyWrapper = ({ 
  children, 
  fallback = <QuestionFormSkeleton />,
  errorFallback = <div className="text-red-500">Lỗi tải component</div>
}: LazyWrapperProps) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// =====================================================
// LAZY COMPONENTS WITH FALLBACKS
// =====================================================

export const LazyQuestionFormWithFallback = (props: any) => (
  <LazyWrapper fallback={<QuestionFormSkeleton />}>
    <LazyQuestionForm {...props} />
  </LazyWrapper>
);

export const LazyQuestionFormTabsWithFallback = (props: any) => (
  <LazyWrapper fallback={<QuestionFormSkeleton />}>
    <LazyQuestionFormTabs {...props} />
  </LazyWrapper>
);

export const LazyQuestionListWithFallback = (props: any) => (
  <LazyWrapper fallback={<QuestionListSkeleton />}>
    <LazyQuestionList {...props} />
  </LazyWrapper>
);

export const LazyQuestionBankWithFallback = (props: any) => (
  <LazyWrapper fallback={<QuestionListSkeleton />}>
    <LazyQuestionBank {...props} />
  </LazyWrapper>
);

export const LazyMapIDDecoderWithFallback = (props: any) => (
  <LazyWrapper fallback={<MapIDDecoderSkeleton />}>
    <LazyUnifiedMapIDDecoder {...props} />
  </LazyWrapper>
);

export const LazyQuestionIDInfoWithFallback = (props: any) => (
  <LazyWrapper fallback={<MapIDDecoderSkeleton />}>
    <LazyUnifiedQuestionIDInfo {...props} />
  </LazyWrapper>
);

export const LazyQuestionSearchWithFallback = (props: any) => (
  <LazyWrapper fallback={<QuestionListSkeleton />}>
    <LazyQuestionSearchTabs {...props} />
  </LazyWrapper>
);

// =====================================================
// PRELOADING UTILITIES
// =====================================================

/**
 * Preload components for better UX
 */
export const preloadQuestionComponents = {
  form: () => import('../components/question-form/question-form'),
  formTabs: () => import('../components/question-form/question-form-tabs'),
  list: () => import('../components/question-bank/question-list'),
  bank: () => import('../components/question-bank/question-bank'),
  mapIdDecoder: () => import('../mapid/unified-map-id-decoder'),
  questionIdInfo: () => import('../mapid/unified-question-id-info'),
  search: () => import('../search/question-search-tabs'),
};

/**
 * Preload all question components
 */
export const preloadAllQuestionComponents = async () => {
  const preloadPromises = Object.values(preloadQuestionComponents).map(preload => 
    preload().catch(error => {
      console.warn('Failed to preload component:', error);
      return null;
    })
  );
  
  await Promise.allSettled(preloadPromises);
};

/**
 * Preload critical components on user interaction
 */
export const preloadCriticalComponents = () => {
  // Preload most commonly used components
  preloadQuestionComponents.form();
  preloadQuestionComponents.list();
  preloadQuestionComponents.mapIdDecoder();
};

// =====================================================
// COMPONENT SIZE MONITORING
// =====================================================

/**
 * Monitor component loading performance
 */
export const ComponentLoadingMonitor = {
  startTime: 0,
  
  start() {
    this.startTime = performance.now();
  },
  
  end(componentName: string) {
    const loadTime = performance.now() - this.startTime;
    console.log(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    
    // Report to analytics if needed
    if (loadTime > 1000) {
      console.warn(`Slow component loading: ${componentName} took ${loadTime.toFixed(2)}ms`);
    }
  }
};

// =====================================================
// BUNDLE SIZE OPTIMIZATION UTILITIES
// =====================================================

/**
 * Dynamic import with error handling
 */
export const safeDynamicImport = async <T extends unknown>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T | null> => {
  try {
    return await importFn();
  } catch (error) {
    console.error('Dynamic import failed:', error);
    return fallback || null;
  }
};
