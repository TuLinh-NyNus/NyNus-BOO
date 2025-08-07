/**
 * Enhanced Lazy Loading Utility
 * 
 * Provides intelligent component lazy loading with performance monitoring,
 * error boundaries, and loading states for the NyNus application
 */

import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';

import { ErrorBoundary, ErrorFallbackProps } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';
import logger from '@/lib/utils/logger';
import performanceMonitor from '@/lib/utils/performance-monitor';

interface LazyLoadOptions {
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<ErrorFallbackProps>;
  preload?: boolean;
  timeout?: number;
  retryCount?: number;
  chunkName?: string;
}

interface LazyComponentProps {
  [key: string]: unknown;
}

/**
 * Enhanced lazy loading with performance monitoring and error handling
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const {
    fallback = LoadingSpinner,
    errorFallback,
    preload = false,
    timeout = 10000,
    retryCount = 3,
    chunkName = 'unknown'
  } = options;

  // Create lazy component with timeout and retry logic
  const LazyComponent = React.lazy(() => {
    const startTime = performance.now();
    
    return Promise.race([
      // Main import with retry logic
      retryImport(importFn, retryCount),
      // Timeout promise
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Lazy loading timeout for ${chunkName} after ${timeout}ms`));
        }, timeout);
      })
    ]).then((module) => {
      const loadTime = performance.now() - startTime;
      
      // Record performance metric
      performanceMonitor.recordMetric(
        `lazy-load.${chunkName}`,
        loadTime,
        'custom',
        { success: true, chunkName }
      );
      
      logger.info(`📦 Lazy loaded ${chunkName} in ${loadTime.toFixed(2)}ms`);
      
      return module;
    }).catch((error) => {
      const loadTime = performance.now() - startTime;
      
      // Record failed load
      performanceMonitor.recordMetric(
        `lazy-load.${chunkName}`,
        loadTime,
        'custom',
        { success: false, error: error.message, chunkName }
      );
      
      logger.error(`❌ Failed to lazy load ${chunkName}:`, error);
      throw error;
    });
  });

  // Preload if requested
  if (preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFn().catch((error) => {
        logger.warn(`⚠️ Preload failed for ${chunkName}:`, error);
      });
    }, 100);
  }

  return LazyComponent;
}

/**
 * Retry import with exponential backoff
 */
async function retryImport<T>(
  importFn: () => Promise<T>,
  retryCount: number,
  delay = 1000
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    if (retryCount <= 0) {
      throw error;
    }
    
    logger.warn(`🔄 Retrying import, ${retryCount} attempts remaining`);
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryImport(importFn, retryCount - 1, delay * 2);
  }
}

/**
 * Higher-order component for lazy loading with enhanced features
 */
export function withLazyLoading<P extends LazyComponentProps>(
  LazyComponent: LazyExoticComponent<ComponentType<P>>,
  options: LazyLoadOptions = {}
): React.FC<P> {
  const {
    fallback = LoadingSpinner,
    errorFallback
  } = options;

  const WrappedComponent: React.FC<P> = (props): JSX.Element => {
    const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, retry }): JSX.Element => (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Lỗi tải component
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message || 'Không thể tải component này'}
        </p>
        <button
          onClick={retry || resetError}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );

    const ErrorFallback = errorFallback || DefaultErrorFallback;

    const FallbackComponent = fallback;

    return (
      <ErrorBoundary fallback={ErrorFallback}>
        <Suspense fallback={<FallbackComponent />}>
          <LazyComponent {...(props as any)} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withLazyLoading(${(LazyComponent as any).displayName || 'Component'})`;

  return WrappedComponent;
}

/**
 * Preload multiple components
 */
export function preloadComponents(
  components: Array<() => Promise<{ default: ComponentType<any> }>>
): Promise<void[]> {
  logger.info(`🚀 Preloading ${components.length} components`);
  
  const startTime = performance.now();
  
  return Promise.allSettled(
    components.map(importFn => importFn())
  ).then((results) => {
    const loadTime = performance.now() - startTime;
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - successful;
    
    performanceMonitor.recordMetric(
      'preload.batch',
      loadTime,
      'custom',
      { total: results.length, successful, failed }
    );
    
    logger.info(`📦 Preloaded ${successful}/${results.length} components in ${loadTime.toFixed(2)}ms`);
    
    if (failed > 0) {
      logger.warn(`⚠️ ${failed} components failed to preload`);
    }
    
    return results.map(() => undefined);
  });
}

/**
 * Create lazy route component with route-specific optimizations
 */
export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  routeName: string,
  Options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    ...options,
    chunkName: `route.${routeName}`,
    timeout: 15000, // Longer timeout for routes
    retryCount: 2
  });
}

/**
 * Lazy load hook for dynamic imports
 */
export function useLazyImport<T>(
  importFn: () => Promise<T>,
  deps: React.DependencyList = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
} {
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const load = React.useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await importFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error('Import failed') 
      });
    }
  }, deps);

  React.useEffect(() => {
    load();
  }, [load]);

  return {
    ...state,
    retry: load
  };
}

// Export common lazy loading patterns
export const LazyPatterns = {
  /**
   * Create lazy admin component
   */
  admin: <T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>, name: string): LazyExoticComponent<T> =>
    createLazyComponent(importFn, {
      chunkName: `admin.${name}`,
      preload: false,
      timeout: 12000
    }),

  /**
   * Create lazy modal component
   */
  modal: <T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>, name: string): LazyExoticComponent<T> =>
    createLazyComponent(importFn, {
      chunkName: `modal.${name}`,
      preload: false,
      timeout: 8000
    }),

  /**
   * Create lazy feature component
   */
  feature: <T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>, name: string): LazyExoticComponent<T> =>
    createLazyComponent(importFn, {
      chunkName: `feature.${name}`,
      preload: true,
      timeout: 10000
    })
};

export default {
  createLazyComponent,
  withLazyLoading,
  preloadComponents,
  createLazyRoute,
  useLazyImport,
  LazyPatterns
};
