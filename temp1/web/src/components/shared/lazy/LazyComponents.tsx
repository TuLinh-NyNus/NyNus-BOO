'use client';

import { Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

import { Skeleton } from "@/components/ui/display/skeleton";
import logger from '@/lib/utils/logger';

// Lazy load large components
export const LazyUnifiedLatexRenderer = React.lazy(() => 
  import('@/components/latex/unified-latex-renderer').then(module => ({
    default: module.UnifiedLatexRenderer
  }))
);

export const LazyUnifiedMapIDDecoder = React.lazy(() => 
  import('@/components/questions/mapid/UnifiedMapIDDecoder').then(module => ({
    default: module.UnifiedMapIDDecoder
  }))
);

export const LazyUnifiedQuestionIDInfo = React.lazy(() => 
  import('@/components/questions/mapid/UnifiedQuestionIDInfo').then(module => ({
    default: module.UnifiedQuestionIDInfo
  }))
);

export const LazyLatexExtractor = React.lazy(() => 
  import('@/components/latex/latex-extractor')
);

export const LazyLargeFileUploader = React.lazy(() => 
  import('@/components/shared/large-file-uploader')
);

// Loading fallback components
export const LatexRendererSkeleton = (): JSX.Element => (
  <div className="space-y-4">
    <Skeleton className="h-20 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-8 w-2/3" />
    </div>
  </div>
);
LatexRendererSkeleton.displayName = 'LatexRendererSkeleton';

export const MapIDDecoderSkeleton = (): JSX.Element => (
  <div className="p-4 border rounded-lg space-y-4">
    <div className="flex items-center space-x-2">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-20" />
    </div>
    <Skeleton className="h-32 w-full" />
  </div>
);
MapIDDecoderSkeleton.displayName = 'MapIDDecoderSkeleton';

export const QuestionIDInfoSkeleton = (): JSX.Element => (
  <div className="p-4 border rounded-lg space-y-3">
    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-6 w-8" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  </div>
);
QuestionIDInfoSkeleton.displayName = 'QuestionIDInfoSkeleton';

export const FileUploaderSkeleton = (): JSX.Element => (
  <div className="p-6 border-2 border-dashed rounded-lg space-y-4">
    <div className="flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
    <div className="text-center space-y-2">
      <Skeleton className="h-4 w-48 mx-auto" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  </div>
);
FileUploaderSkeleton.displayName = 'FileUploaderSkeleton';

// Wrapper components with Suspense
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper = ({ children, fallback }: LazyWrapperProps): JSX.Element => (
  <Suspense fallback={fallback || <div>Loading...</div>}>
    {children}
  </Suspense>
);
LazyWrapper.displayName = 'LazyWrapper';

// Pre-configured lazy components with appropriate fallbacks
export const LazyLatexRendererWithFallback = (props: Record<string, unknown>): JSX.Element => (
  <LazyWrapper fallback={<LatexRendererSkeleton />}>
    <LazyUnifiedLatexRenderer content={props.content as string || ''} {...props} />
  </LazyWrapper>
);
LazyLatexRendererWithFallback.displayName = 'LazyLatexRendererWithFallback';

export const LazyMapIDDecoderWithFallback = (props: Record<string, unknown>): JSX.Element => (
  <LazyWrapper fallback={<MapIDDecoderSkeleton />}>
    <LazyUnifiedMapIDDecoder {...props} />
  </LazyWrapper>
);
LazyMapIDDecoderWithFallback.displayName = 'LazyMapIDDecoderWithFallback';

export const LazyQuestionIDInfoWithFallback = (props: Record<string, unknown>): JSX.Element => (
  <LazyWrapper fallback={<QuestionIDInfoSkeleton />}>
    <LazyUnifiedQuestionIDInfo questionID={props.QuestionID as any} {...props} />
  </LazyWrapper>
);
LazyQuestionIDInfoWithFallback.displayName = 'LazyQuestionIDInfoWithFallback';

export const LazyFileUploaderWithFallback = (props: Record<string, unknown>): JSX.Element => (
  <LazyWrapper fallback={<FileUploaderSkeleton />}>
    <LazyLargeFileUploader {...props} />
  </LazyWrapper>
);
LazyFileUploaderWithFallback.displayName = 'LazyFileUploaderWithFallback';

// Preload functions for better UX
export const preloadLatexRenderer = () => {
  const componentImport = import('@/components/latex/unified-latex-renderer');
  return componentImport;
};

export const preloadMapIDDecoder = () => {
  const componentImport = import('@/components/questions/mapid/UnifiedMapIDDecoder');
  return componentImport;
};

export const preloadQuestionIDInfo = () => {
  const componentImport = import('@/components/questions/mapid/UnifiedQuestionIDInfo');
  return componentImport;
};

export const preloadFileUploader = () => {
  const componentImport = import('@/components/shared/large-file-uploader');
  return componentImport;
};

// Utility hook for preloading on hover/focus
export const usePreloadOnInteraction = (preloadFn: () => Promise<unknown>) => {
  const preload = React.useCallback(() => {
    preloadFn().catch(logger.error);
  }, [preloadFn]);

  return {
    onMouseEnter: preload,
    onFocus: preload
  };
};
