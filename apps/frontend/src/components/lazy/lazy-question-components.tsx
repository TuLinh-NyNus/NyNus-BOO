/**
 * Lazy Loading Components for Questions
 * React.lazy() implementation cho các components lớn với loading fallbacks
 * Optimized cho performance và user experience
 */

import React, { Suspense, lazy } from 'react';
import { Loader2, FileText, Database, Eye } from 'lucide-react';

// ===== LOADING FALLBACK COMPONENTS =====

/**
 * Generic loading fallback với spinner
 */
const LoadingSpinner = ({ message = "Đang tải..." }: { message?: string }) => (
  <div className="flex items-center justify-center p-8 min-h-[200px]">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

/**
 * Form loading fallback với form icon
 */
const FormLoadingFallback = () => (
  <div className="flex items-center justify-center p-8 min-h-[400px] border rounded-lg bg-muted/20">
    <div className="flex flex-col items-center gap-4">
      <div className="p-3 rounded-full bg-primary/10">
        <FileText className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="font-medium">Đang tải form câu hỏi</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Vui lòng chờ trong giây lát...
        </p>
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  </div>
);

/**
 * Bank loading fallback với database icon
 */
const BankLoadingFallback = () => (
  <div className="flex items-center justify-center p-8 min-h-[500px] border rounded-lg bg-muted/20">
    <div className="flex flex-col items-center gap-4">
      <div className="p-3 rounded-full bg-primary/10">
        <Database className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="font-medium">Đang tải ngân hàng câu hỏi</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Đang chuẩn bị dữ liệu...
        </p>
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  </div>
);

/**
 * Preview loading fallback với eye icon
 */
const PreviewLoadingFallback = () => (
  <div className="flex items-center justify-center p-8 min-h-[300px] border rounded-lg bg-muted/20">
    <div className="flex flex-col items-center gap-4">
      <div className="p-3 rounded-full bg-primary/10">
        <Eye className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="font-medium">Đang tải preview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Đang render nội dung...
        </p>
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  </div>
);

// ===== LAZY LOADED COMPONENTS =====

/**
 * Lazy load QuestionFormTabs component
 */
const LazyQuestionFormTabs = lazy(() => 
  import('@/components/admin/questions/form/questionFormTabs').then(module => ({
    default: module.QuestionFormTabs
  }))
);

/**
 * Lazy load QuestionBank component
 */
const LazyQuestionBank = lazy(() => 
  import('@/components/admin/questions/bank/questionBank').then(module => ({
    default: module.QuestionBank
  }))
);

/**
 * Lazy load QuestionPreview component
 */
const LazyQuestionPreview = lazy(() => 
  import('@/components/admin/questions/preview/questionPreview').then(module => ({
    default: module.QuestionPreview
  }))
);

/**
 * Lazy load QuestionForm component
 */
const LazyQuestionForm = lazy(() => 
  import('@/components/admin/questions/form/questionForm').then(module => ({
    default: module.QuestionForm
  }))
);

/**
 * Lazy load MapIdDecoder component
 */
const LazyMapIdDecoder = lazy(() => 
  import('@/components/admin/questions/mapid/mapIdDecoder').then(module => ({
    default: module.MapIdDecoder
  }))
);

// ===== WRAPPED COMPONENTS WITH SUSPENSE =====

/**
 * QuestionFormTabs với Suspense wrapper
 */
export const QuestionFormTabsWithSuspense = (props: React.ComponentProps<typeof LazyQuestionFormTabs>) => (
  <Suspense fallback={<FormLoadingFallback />}>
    <LazyQuestionFormTabs {...props} />
  </Suspense>
);

/**
 * QuestionBank với Suspense wrapper
 */
export const QuestionBankWithSuspense = (props: React.ComponentProps<typeof LazyQuestionBank>) => (
  <Suspense fallback={<BankLoadingFallback />}>
    <LazyQuestionBank {...props} />
  </Suspense>
);

/**
 * QuestionPreview với Suspense wrapper
 */
export const QuestionPreviewWithSuspense = (props: React.ComponentProps<typeof LazyQuestionPreview>) => (
  <Suspense fallback={<PreviewLoadingFallback />}>
    <LazyQuestionPreview {...props} />
  </Suspense>
);

/**
 * QuestionForm với Suspense wrapper
 */
export const QuestionFormWithSuspense = (props: React.ComponentProps<typeof LazyQuestionForm>) => (
  <Suspense fallback={<FormLoadingFallback />}>
    <LazyQuestionForm {...props} />
  </Suspense>
);

/**
 * MapIdDecoder với Suspense wrapper
 */
export const MapIdDecoderWithSuspense = (props: React.ComponentProps<typeof LazyMapIdDecoder>) => (
  <Suspense fallback={<LoadingSpinner message="Đang tải MapID decoder..." />}>
    <LazyMapIdDecoder {...props} />
  </Suspense>
);

// ===== PRELOADING UTILITIES =====

/**
 * Preload critical components
 */
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  import('@/components/admin/questions/form/questionFormTabs');
  import('@/components/admin/questions/preview/questionPreview');
};

/**
 * Preload all question components
 */
export const preloadAllQuestionComponents = () => {
  import('@/components/admin/questions/form/questionFormTabs');
  import('@/components/admin/questions/bank/questionBank');
  import('@/components/admin/questions/preview/questionPreview');
  import('@/components/admin/questions/form/questionForm');
  import('@/components/admin/questions/mapid/mapIdDecoder');
};

/**
 * Conditional preloading based on user interaction
 */
export const preloadOnHover = (componentName: string) => {
  switch (componentName) {
    case 'formTabs':
      import('@/components/admin/questions/form/questionFormTabs');
      break;
    case 'bank':
      import('@/components/admin/questions/bank/questionBank');
      break;
    case 'preview':
      import('@/components/admin/questions/preview/questionPreview');
      break;
    case 'form':
      import('@/components/admin/questions/form/questionForm');
      break;
    case 'mapid':
      import('@/components/admin/questions/mapid/mapIdDecoder');
      break;
  }
};

// ===== PERFORMANCE MONITORING =====

/**
 * Track lazy loading performance
 */
export const trackLazyLoadingPerformance = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    onLoad: () => {
      const loadTime = performance.now() - startTime;
      console.log(`[Lazy Loading] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // In production, send to analytics
      if (process.env.NODE_ENV === 'production') {
        // Analytics tracking code here
      }
    }
  };
};

// ===== ERROR BOUNDARIES FOR LAZY COMPONENTS =====

/**
 * Error boundary cho lazy loaded components
 */
export class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Lazy Component Error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8 min-h-[200px] border rounded-lg bg-destructive/10">
          <div className="text-center">
            <h3 className="font-medium text-destructive">Lỗi tải component</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vui lòng thử lại sau
            </p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===== EXPORTS =====

export {
  LazyQuestionFormTabs,
  LazyQuestionBank,
  LazyQuestionPreview,
  LazyQuestionForm,
  LazyMapIdDecoder,
};

// Default exports for easier importing
const LazyQuestionComponents = {
  QuestionFormTabs: QuestionFormTabsWithSuspense,
  QuestionBank: QuestionBankWithSuspense,
  QuestionPreview: QuestionPreviewWithSuspense,
  QuestionForm: QuestionFormWithSuspense,
  MapIdDecoder: MapIdDecoderWithSuspense,
};

export default LazyQuestionComponents;
