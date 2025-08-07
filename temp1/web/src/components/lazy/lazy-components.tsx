import { Loader2 } from 'lucide-react';
import React, { lazy, Suspense, ComponentType } from 'react';

import { Skeleton } from "@/components/ui/display/skeleton";

/**
 * Lazy Loading Components
 * 
 * Tối ưu hóa performance bằng cách lazy load các components không critical
 * Giảm bundle size và cải thiện initial load time
 */

// Loading fallback components
const ComponentSkeleton = (): JSX.Element => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const FormSkeleton = (): JSX.Element => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-1/4" />
  </div>
);

const TableSkeleton = (): JSX.Element => (
  <div className="space-y-4">
    <div className="flex space-x-4">
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-10 w-1/4" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
      </div>
    ))}
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
  </div>
);

// Higher-order component for lazy loading with custom fallback
function withLazyLoading<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: ComponentType = ComponentSkeleton
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    const FallbackComponent = fallback;
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

// Auth Components (lazy loaded) - Direct imports for better tree shaking
export const LazyTwoFactorSetup = withLazyLoading(
  () => import('@/components/features/auth/two-factor-setup'),
  FormSkeleton
);

export const LazySessionManagement = withLazyLoading(
  () => import('@/components/features/auth/session-management'),
  TableSkeleton
);

export const LazyLoginModal = withLazyLoading(
  () => import('@/components/features/auth/login-modal'),
  FormSkeleton
);

export const LazyRegisterModal = withLazyLoading(
  () => import('@/components/features/auth/register-modal'),
  FormSkeleton
);

export const LazyForgotPasswordModal = withLazyLoading(
  () => import('@/components/features/auth/forgot-password-modal'),
  FormSkeleton
);

// Dashboard Components (lazy loaded)
export const LazyDashboardStats = withLazyLoading(
  () => import('@/components/features/dashboard/overview/stats'),
  () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  )
);

export const LazyDashboardCharts = withLazyLoading(
  () => import('@/components/features/dashboard/analytics/charts'),
  () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
);

// Course Components (lazy loaded)
export const LazyCourseList = withLazyLoading(
  () => import('@/components/features/courses/display/course-list'),
  TableSkeleton
);

export const LazyCourseForm = withLazyLoading(
  () => import('@/components/features/courses/forms/course-form'),
  FormSkeleton
);

export const LazyCourseDetails = withLazyLoading(
  () => import('@/components/features/courses/display/course-details'),
  ComponentSkeleton
);

// User Management Components (lazy loaded)
export const LazyUserList = withLazyLoading(
  () => import('@/components/features/users/user-list'),
  TableSkeleton
);

export const LazyUserForm = withLazyLoading(
  () => import('@/components/features/users/user-form'),
  FormSkeleton
);

export const LazyUserProfile = withLazyLoading(
  () => import('@/components/features/users/user-profile'),
  ComponentSkeleton
);

// Exam Components (lazy loaded) - DISABLED: Components not yet implemented
// export const LazyExamList = withLazyLoading(
//   () => import('@/components/exams/exam-list'),
//   TableSkeleton
// );

// export const LazyExamForm = withLazyLoading(
//   () => import('@/components/exams/exam-form'),
//   FormSkeleton
// );

// export const LazyExamTaking = withLazyLoading(
//   () => import('@/components/exams/exam-taking'),
//   ComponentSkeleton
// );

// Question Components (lazy loaded)
export const LazyQuestionList = withLazyLoading(
  () => import('@/components/features/questions/components/question-bank/question-list'),
  TableSkeleton
);

export const LazyQuestionForm = withLazyLoading(
  () => import('@/components/features/questions/components/question-form/question-form'),
  FormSkeleton
);

export const LazyQuestionBank = withLazyLoading(
  () => import('@/components/features/questions/components/question-bank/question-bank'),
  ComponentSkeleton
);

// Analytics Components (lazy loaded) - DISABLED: Components not yet implemented
// export const LazyAnalyticsDashboard = withLazyLoading(
//   () => import('@/components/analytics/dashboard'),
//   () => (
//     <div className="space-y-6">
//       <div className="grid gap-4 md:grid-cols-3">
//         {Array.from({ length: 3 }).map((_, i) => (
//           <Skeleton key={i} className="h-24 w-full" />
//         ))}
//       </div>
//       <Skeleton className="h-96 w-full" />
//     </div>
//   )
// );

export const LazyReportsPage = withLazyLoading(
  () => import('@/components/features/reports-page'),
  ComponentSkeleton
);

// Settings Components (lazy loaded)
export const LazySystemSettings = withLazyLoading(
  () => import('@/components/settings/system-settings'),
  FormSkeleton
);

export const LazyEmailSettings = withLazyLoading(
  () => import('@/components/settings/email-settings'),
  FormSkeleton
);

// Utility function to preload components
export const preloadComponent = (importFunc: () => Promise<unknown>) => {
  // Preload component in the background
  importFunc().catch(() => {
    // Ignore preload errors
  });
};

// Preload critical components on app start
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  preloadComponent(() => import('@/components/auth/two-factor-setup'));
  preloadComponent(() => import('@/components/auth/session-management'));
  preloadComponent(() => import('@/components/dashboard/stats'));
};

// Component for handling lazy loading errors
export const LazyErrorBoundary = ({ 
  children, 
  fallback = <div className="p-4 text-center text-red-500">Không thể tải component</div> 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
};

// Hook for dynamic imports with loading state
export const useLazyImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  const [component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadComponent = React.useCallback(async () => {
    if (component) return component;
    
    setLoading(true);
    setError(null);
    
    try {
      const { default: Component } = await importFunc();
      setComponent(() => Component);
      return Component;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [importFunc, component]);

  return { component, loading, error, loadComponent };
};
