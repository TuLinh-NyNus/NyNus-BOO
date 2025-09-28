/**
 * Question List Performance Optimizations
 * Advanced optimization utilities cho question list performance
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { Question } from '@/lib/types/question';

// ===== TYPES =====

export interface OptimizationConfig {
  enableMemoization: boolean;
  enableVirtualization: boolean;
  enableLazyLoading: boolean;
  enableDebouncing: boolean;
  batchSize: number;
  debounceDelay: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  itemsRendered: number;
  scrollPosition: number;
  lastUpdate: number;
}

// ===== CONSTANTS =====

export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
  enableMemoization: true,
  enableVirtualization: true,
  enableLazyLoading: true,
  enableDebouncing: true,
  batchSize: 50,
  debounceDelay: 300
};

// ===== MEMOIZATION UTILITIES =====

/**
 * Memoized question list với smart comparison
 */
export function useMemoizedQuestions(
  questions: Question[],
  dependencies: unknown[] = []
): Question[] {
  const dependenciesKey = useMemo(() => JSON.stringify(dependencies), [dependencies]);
  return useMemo(() => {
    // Deep comparison cho questions array
    return questions.map(question => ({
      ...question,
      // Ensure consistent object references
      _memoKey: `${question.id}-${question.updatedAt || question.createdAt}`
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, dependenciesKey]);
}

/**
 * Memoized question filtering
 */
export function useMemoizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: unknown[] = []
): T[] {
  const dependenciesKey = useMemo(() => JSON.stringify(dependencies), [dependencies]);
  return useMemo(() => {
    return items.filter(filterFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filterFn, dependenciesKey]);
}

/**
 * Memoized question sorting
 */
export function useMemoizedSort<T>(
  items: T[],
  sortFn: (a: T, b: T) => number,
  dependencies: unknown[] = []
): T[] {
  const dependenciesKey = useMemo(() => JSON.stringify(dependencies), [dependencies]);
  return useMemo(() => {
    return [...items].sort(sortFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, sortFn, dependenciesKey]);
}

// ===== DEBOUNCING UTILITIES =====

/**
 * Advanced debounce hook với immediate execution option
 */
export function useAdvancedDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  immediate: boolean = false
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const immediateRef = useRef<boolean>(immediate);

  return useCallback((...args: Parameters<T>) => {
    const callNow = immediateRef.current && !timeoutRef.current;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = undefined;
      if (!immediateRef.current) callback(...args);
    }, delay);

    if (callNow) callback(...args);
  }, [callback, delay]) as T;
}

/**
 * Debounced search với cancel support
 */
export function useDebouncedSearch(
  searchTerm: string,
  delay: number = 300
): {
  debouncedSearchTerm: string;
  isSearching: boolean;
  cancelSearch: () => void;
} {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setIsSearching(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, delay]);

  const cancelSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsSearching(false);
    }
  }, []);

  return { debouncedSearchTerm, isSearching, cancelSearch };
}

// ===== LAZY LOADING UTILITIES =====

/**
 * Intersection Observer hook cho lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

/**
 * Lazy loading cho question images
 */
export function useLazyQuestionImages(_questions: Question[]): {
  loadedImages: Set<string>;
  loadImage: (questionId: string) => void;
} {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const loadImage = useCallback((questionId: string) => {
    setLoadedImages(prev => new Set([...prev, questionId]));
  }, []);

  return { loadedImages, loadImage };
}

// ===== BATCH PROCESSING UTILITIES =====

/**
 * Batch processing cho large operations
 */
export function useBatchProcessor<T>(
  items: T[],
  batchSize: number = 50,
  processingDelay: number = 10
): {
  processedItems: T[];
  isProcessing: boolean;
  progress: number;
  startProcessing: () => void;
  stopProcessing: () => void;
} {
  const [processedItems, setProcessedItems] = useState<T[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const processingRef = useRef<boolean>(false);

  const progress = items.length > 0 ? (currentIndex / items.length) * 100 : 0;

  const startProcessing = useCallback(() => {
    setIsProcessing(true);
    setCurrentIndex(0);
    setProcessedItems([]);
    processingRef.current = true;

    const processBatch = () => {
      if (!processingRef.current) return;

      setCurrentIndex(prevIndex => {
        const endIndex = Math.min(prevIndex + batchSize, items.length);
        const batch = items.slice(prevIndex, endIndex);
        
        setProcessedItems(prev => [...prev, ...batch]);

        if (endIndex < items.length) {
          setTimeout(processBatch, processingDelay);
          return endIndex;
        } else {
          setIsProcessing(false);
          processingRef.current = false;
          return endIndex;
        }
      });
    };

    processBatch();
  }, [items, batchSize, processingDelay]);

  const stopProcessing = useCallback(() => {
    processingRef.current = false;
    setIsProcessing(false);
  }, []);

  return {
    processedItems,
    isProcessing,
    progress,
    startProcessing,
    stopProcessing
  };
}

// ===== PERFORMANCE MONITORING =====

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(): {
  metrics: PerformanceMetrics;
  startMeasure: (label: string) => void;
  endMeasure: (label: string) => number;
  recordMetric: (key: keyof PerformanceMetrics, value: number) => void;
} {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    itemsRendered: 0,
    scrollPosition: 0,
    lastUpdate: Date.now()
  });

  const measurementsRef = useRef<Map<string, number>>(new Map());

  const startMeasure = useCallback((label: string) => {
    measurementsRef.current.set(label, performance.now());
  }, []);

  const endMeasure = useCallback((label: string): number => {
    const startTime = measurementsRef.current.get(label);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    measurementsRef.current.delete(label);
    
    return duration;
  }, []);

  const recordMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [key]: value,
      lastUpdate: Date.now()
    }));
  }, []);

  return { metrics, startMeasure, endMeasure, recordMetric };
}

// ===== MEMORY OPTIMIZATION =====

/**
 * Memory-efficient question list với cleanup
 */
export function useMemoryEfficientQuestionList(
  questions: Question[],
  maxCacheSize: number = 1000
): {
  visibleQuestions: Question[];
  cacheSize: number;
  clearCache: () => void;
} {
  const cacheRef = useRef<Map<string, Question>>(new Map());
  
  const visibleQuestions = useMemo(() => {
    const cache = cacheRef.current;
    
    // Add new questions to cache
    questions.forEach(question => {
      if (!cache.has(question.id)) {
        cache.set(question.id, question);
      }
    });
    
    // Remove old questions if cache is too large
    if (cache.size > maxCacheSize) {
      const entries = Array.from(cache.entries());
      const toRemove = entries.slice(0, cache.size - maxCacheSize);
      toRemove.forEach(([id]) => cache.delete(id));
    }
    
    return questions;
  }, [questions, maxCacheSize]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    visibleQuestions,
    cacheSize: cacheRef.current.size,
    clearCache
  };
}

// ===== SCROLL OPTIMIZATION =====

/**
 * Optimized scroll handling
 */
export function useOptimizedScroll(
  onScroll: (scrollTop: number, scrollDirection: 'up' | 'down') => void,
  throttleDelay: number = 16
): {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  scrollTop: number;
  scrollDirection: 'up' | 'down' | null;
} {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollTopRef = useRef(0);
  const throttleRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }

      throttleRef.current = setTimeout(() => {
        const currentScrollTop = element.scrollTop;
        const direction = currentScrollTop > lastScrollTopRef.current ? 'down' : 'up';
        
        setScrollTop(currentScrollTop);
        setScrollDirection(direction);
        lastScrollTopRef.current = currentScrollTop;
        
        onScroll(currentScrollTop, direction);
      }, throttleDelay);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, [onScroll, throttleDelay]);

  return { scrollRef, scrollTop, scrollDirection };
}

// ===== EXPORT OPTIMIZATION HOOK =====

/**
 * Main optimization hook combining all optimizations
 */
export function useQuestionListOptimizations(
  questions: Question[],
  config: Partial<OptimizationConfig> = {}
) {
  const optimizationConfig = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };
  
  const memoizedQuestions = useMemoizedQuestions(questions);
    
  const { metrics, startMeasure, endMeasure, recordMetric } = usePerformanceMonitor();
  
  const { visibleQuestions, cacheSize, clearCache } = useMemoryEfficientQuestionList(
    memoizedQuestions,
    1000
  );

  return {
    optimizedQuestions: visibleQuestions,
    performanceMetrics: metrics,
    cacheSize,
    clearCache,
    startMeasure,
    endMeasure,
    recordMetric,
    config: optimizationConfig
  };
}
