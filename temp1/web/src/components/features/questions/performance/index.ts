/**
 * Question Performance Optimization
 * 
 * Task 2.2 - Frontend Performance Optimization:
 * - Bundle optimization with lazy loading and code splitting
 * - Component performance with virtual scrolling and memoization
 * - Performance monitoring and analytics
 */

// =====================================================
// LAZY LOADING EXPORTS
// =====================================================

// Lazy components
export * from './lazy/lazy-question-components';
export * from './lazy/lazy-question-routes';

// Re-export lazy components for convenience
export {
  LazyQuestionFormWithFallback,
  LazyQuestionListWithFallback,
  LazyQuestionBankWithFallback,
  LazyMapIDDecoderWithFallback,
  LazyQuestionIDInfoWithFallback,
  LazyQuestionSearchWithFallback,
  preloadQuestionComponents,
  preloadAllQuestionComponents,
  preloadCriticalComponents
} from './lazy/lazy-question-components';

export {
  LazyQuestionInputPageWithFallback,
  LazyQuestionListPageWithFallback,
  LazyQuestionBankPageWithFallback,
  LazyQuestionSearchPageWithFallback,
  preloadQuestionRoutes,
  preloadCriticalRoutes,
  SmartRoutePreloader
} from './lazy/lazy-question-routes';

// =====================================================
// VIRTUAL SCROLLING EXPORTS
// =====================================================

export {
  VirtualScrollList,
  VariableSizeVirtualScrollList,
  VirtualQuestionList,
  VirtualScrollPerformanceMonitor,
  calculateItemHeight,
  optimizeVirtualScroll,
  useVirtualScroll
} from './virtual-scrolling';

export type {
  VirtualScrollItem,
  VirtualScrollProps,
  QuestionVirtualScrollProps
} from './virtual-scrolling';

// =====================================================
// MEMOIZATION EXPORTS
// =====================================================

export {
  OptimizedQuestionItem,
  OptimizedQuestionList,
  useAdvancedMemo,
  useExpensiveComputation,
  useRenderPerformance,
  useWhyDidYouUpdate,
  createMemoizedSelector,
  shallowEqual,
  memoWithCustomEqual
} from './memoization-optimization';

export type {
  OptimizedQuestionItemProps,
  OptimizedQuestionListProps
} from './memoization-optimization';

// =====================================================
// BUNDLE ANALYZER EXPORTS
// =====================================================

export {
  BundleAnalyzer,
  PerformanceMonitor,
  bundleAnalyzer,
  performanceMonitor,
  formatFileSize,
  calculateCompressionRatio,
  getBundleSizeStatus
} from '../../../lib/performance/bundle-analyzer';

export type {
  BundleMetrics,
  ChunkInfo,
  ModuleInfo,
  AssetInfo,
  PerformanceMetrics
} from '../../../lib/performance/bundle-analyzer';

// =====================================================
// PERFORMANCE UTILITIES
// =====================================================

/**
 * Initialize performance optimization for Question components
 */
export const initializeQuestionPerformance = async () => {
  // Start performance monitoring
  performanceMonitor.startMonitoring();
  
  // Preload critical components
  await preloadCriticalComponents();
  
  // Preload critical routes
  await preloadCriticalRoutes();
  
  // Initialize smart route preloader
  await SmartRoutePreloader.preloadBasedOnPriority();
  
  console.log('Question performance optimization initialized');
};

/**
 * Get performance summary for Question components
 */
export const getQuestionPerformanceSummary = async () => {
  const bundleMetrics = await bundleAnalyzer.analyzeBundleSize();
  const performanceMetrics = performanceMonitor.getPerformanceSummary();
  const bundleTrends = bundleAnalyzer.getBundleTrends();
  const optimizationRecommendations = bundleAnalyzer.getOptimizationRecommendations();
  
  return {
    bundle: {
      size: bundleMetrics.totalSize,
      gzippedSize: bundleMetrics.gzippedSize,
      status: getBundleSizeStatus(bundleMetrics.totalSize),
      trends: bundleTrends
    },
    performance: {
      averageBundleLoadTime: performanceMetrics.averageBundleLoadTime,
      averageRenderTime: performanceMetrics.averageRenderTime,
      averageMemoryUsage: performanceMetrics.averageMemoryUsage
    },
    recommendations: [
      ...optimizationRecommendations,
      ...performanceMetrics.recommendations
    ]
  };
};

/**
 * Performance optimization configuration
 */
export const PerformanceConfig = {
  // Bundle optimization settings
  bundle: {
    targetSize: 1024 * 1024, // 1MB target
    chunkSizeThreshold: 500 * 1024, // 500KB chunk threshold
    moduleThreshold: 100 * 1024, // 100KB module threshold
    compressionRatioThreshold: 0.7
  },
  
  // Virtual scrolling settings
  virtualScroll: {
    defaultItemHeight: 80,
    defaultContainerHeight: 400,
    overscanCount: 5,
    estimatedItemSize: 80
  },
  
  // Memoization settings
  memoization: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 100,
    performanceThreshold: 10 // ms
  },
  
  // Performance monitoring settings
  monitoring: {
    enableLogging: process.env.NODE_ENV === 'development',
    slowRenderThreshold: 16, // ms (60fps)
    slowBundleLoadThreshold: 3000, // ms
    memoryUsageThreshold: 100 * 1024 * 1024 // 100MB
  }
};

/**
 * Performance optimization hooks
 */
export const useQuestionPerformance = () => {
  const [isOptimized, setIsOptimized] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  
  useEffect(() => {
    const initializePerformance = async () => {
      try {
        await initializeQuestionPerformance();
        setIsOptimized(true);
        
        // Get initial performance data
        const summary = await getQuestionPerformanceSummary();
        setPerformanceData(summary);
      } catch (error) {
        console.error('Failed to initialize performance optimization:', error);
      }
    };
    
    initializePerformance();
  }, []);
  
  const refreshPerformanceData = useCallback(async () => {
    try {
      const summary = await getQuestionPerformanceSummary();
      setPerformanceData(summary);
    } catch (error) {
      console.error('Failed to refresh performance data:', error);
    }
  }, []);
  
  return {
    isOptimized,
    performanceData,
    refreshPerformanceData
  };
};

// =====================================================
// PERFORMANCE TESTING UTILITIES
// =====================================================

/**
 * Test component rendering performance
 */
export const testComponentPerformance = async (
  componentName: string,
  renderFn: () => void,
  iterations: number = 100
) => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    times.push(endTime - startTime);
  }
  
  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log(`Performance test for ${componentName}:`, {
    averageTime: `${averageTime.toFixed(2)}ms`,
    minTime: `${minTime.toFixed(2)}ms`,
    maxTime: `${maxTime.toFixed(2)}ms`,
    iterations
  });
  
  return {
    averageTime,
    minTime,
    maxTime,
    times
  };
};

/**
 * Test bundle loading performance
 */
export const testBundleLoadingPerformance = () => {
  const startTime = performance.now();
  
  return {
    finish: () => {
      const loadTime = performance.now() - startTime;
      console.log(`Bundle loading time: ${loadTime.toFixed(2)}ms`);
      return loadTime;
    }
  };
};

// =====================================================
// DEVELOPMENT HELPERS
// =====================================================

/**
 * Development performance dashboard
 */
export const PerformanceDashboard = {
  async showBundleAnalysis() {
    const metrics = await bundleAnalyzer.analyzeBundleSize();
    console.table({
      'Total Size': formatFileSize(metrics.totalSize),
      'Gzipped Size': formatFileSize(metrics.gzippedSize),
      'Compression Ratio': `${(calculateCompressionRatio(metrics.totalSize, metrics.gzippedSize) * 100).toFixed(1)}%`,
      'Chunks': metrics.chunks.length,
      'Assets': metrics.assets.length
    });
  },
  
  showPerformanceMetrics() {
    const summary = performanceMonitor.getPerformanceSummary();
    console.table({
      'Avg Bundle Load Time': `${summary.averageBundleLoadTime.toFixed(2)}ms`,
      'Avg Render Time': `${summary.averageRenderTime.toFixed(2)}ms`,
      'Avg Memory Usage': formatFileSize(summary.averageMemoryUsage)
    });
  },
  
  showOptimizationRecommendations() {
    const recommendations = bundleAnalyzer.getOptimizationRecommendations();
    console.log('Optimization Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
};

// Make dashboard available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).QuestionPerformanceDashboard = PerformanceDashboard;
}
