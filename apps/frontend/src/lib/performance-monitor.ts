/**
 * Performance Monitor
 * Đo lường và track performance improvements
 */

import { hasMemoryAPI, isNumber, PerformanceMemory } from './type-guards';
import { logger } from './utils/logger';

interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
  
  // Custom metrics
  hydrationTime?: number;
  rerenderCount?: number;
  memoryUsage?: number;
  bundleSize?: number;
  
  // Timestamps
  timestamp: number;
  pathname: string;
  userAgent: string;
}

interface PerformanceBenchmark {
  before: Partial<PerformanceMetrics>;
  after: Partial<PerformanceMetrics>;
  improvement: Record<string, number>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;
  private rerenderCounts = new Map<string, number>();
  private enabled: boolean;

  constructor() {
    this.enabled = typeof window !== 'undefined' && 
                   (process.env.NODE_ENV === 'development' || 
                    window.localStorage.getItem('perf-monitor') === 'true');
    
    if (this.enabled) {
      this.initializeObserver();
      this.setupMemoryMonitoring();
    }
  }

  private initializeObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe Core Web Vitals
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.processEntry(entry);
        });
      });

      // Observe different entry types
      const entryTypes = ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'];
      
      entryTypes.forEach(type => {
        try {
          this.observer?.observe({ entryTypes: [type] });
        } catch (error) {
          console.debug(`Performance Observer type ${type} not supported:`, error);
        }
      });

    } catch (error) {
      console.debug('Performance Observer không được hỗ trợ:', error);
    }
  }

  private processEntry(entry: PerformanceEntry): void {
    const pathname = window.location.pathname;
    const userAgent = navigator.userAgent;

    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric({
            fcp: entry.startTime,
            timestamp: Date.now(),
            pathname,
            userAgent
          });
        }
        break;

      case 'largest-contentful-paint':
        this.recordMetric({
          lcp: entry.startTime,
          timestamp: Date.now(),
          pathname,
          userAgent
        });
        break;

      case 'layout-shift':
        const layoutShiftEntry = entry as PerformanceEntry & { 
          value: number; 
          hadRecentInput: boolean; 
        };
        
        if (!layoutShiftEntry.hadRecentInput) {
          this.recordMetric({
            cls: layoutShiftEntry.value,
            timestamp: Date.now(),
            pathname,
            userAgent
          });
        }
        break;

      case 'first-input':
        const fidEntry = entry as PerformanceEntry & { processingStart: number };
        this.recordMetric({
          fid: fidEntry.processingStart - entry.startTime,
          timestamp: Date.now(),
          pathname,
          userAgent
        });
        break;
    }
  }

  private setupMemoryMonitoring(): void {
    if (!hasMemoryAPI()) return;

    // Monitor memory usage mỗi 30 giây
    setInterval(() => {
      const memoryInfo = (performance as Performance & { memory: PerformanceMemory }).memory;
      this.recordMetric({
        memoryUsage: memoryInfo.usedJSHeapSize,
        timestamp: Date.now(),
        pathname: window.location.pathname,
        userAgent: navigator.userAgent
      });
    }, 30000);
  }

  /**
   * Record performance metric
   */
  recordMetric(metric: Partial<PerformanceMetrics> & { 
    timestamp: number; 
    pathname: string; 
    userAgent: string; 
  }): void {
    if (!this.enabled) return;

    this.metrics.push(metric as PerformanceMetrics);

    // Giữ chỉ 100 entries gần nhất
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log trong development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[PerformanceMonitor] Performance metric recorded', {
        operation: 'recordMetric',
        ...metric,
      });
    }
  }

  /**
   * Track re-render count cho component
   */
  trackRerender(componentName: string): void {
    if (!this.enabled) return;

    const current = this.rerenderCounts.get(componentName) || 0;
    this.rerenderCounts.set(componentName, current + 1);
  }

  /**
   * Measure hydration time
   */
  measureHydrationTime(): void {
    if (!this.enabled || typeof window === 'undefined') return;

    // Measure time từ DOMContentLoaded đến React hydration
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const hydrationStart = performance.now();
        
        // Wait for React hydration
        setTimeout(() => {
          const hydrationTime = performance.now() - hydrationStart;
          this.recordMetric({
            hydrationTime,
            timestamp: Date.now(),
            pathname: window.location.pathname,
            userAgent: navigator.userAgent
          });
        }, 100);
      });
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    metrics: PerformanceMetrics[];
    averages: Partial<PerformanceMetrics>;
    rerenderCounts: Map<string, number>;
  } {
    if (!this.enabled) {
      return { 
        metrics: [], 
        averages: {}, 
        rerenderCounts: new Map() 
      };
    }

    const averages: Partial<PerformanceMetrics> = {};
    const keys = ['fcp', 'lcp', 'cls', 'fid', 'hydrationTime', 'memoryUsage'] as const;

    keys.forEach(key => {
      const values = this.metrics
        .map(m => m[key])
        .filter((v): v is number => isNumber(v));
      
      if (values.length > 0) {
        averages[key] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    });

    return {
      metrics: [...this.metrics],
      averages,
      rerenderCounts: new Map(this.rerenderCounts)
    };
  }

  /**
   * Compare performance before/after improvements
   */
  createBenchmark(
    beforeMetrics: Partial<PerformanceMetrics>,
    afterMetrics: Partial<PerformanceMetrics>
  ): PerformanceBenchmark {
    const improvement: Record<string, number> = {};

    Object.keys(beforeMetrics).forEach(key => {
      const before = beforeMetrics[key as keyof PerformanceMetrics];
      const after = afterMetrics[key as keyof PerformanceMetrics];

      if (isNumber(before) && isNumber(after)) {
        // Calculate percentage improvement
        const percentChange = ((before - after) / before) * 100;
        improvement[key] = Math.round(percentChange * 100) / 100;
      }
    });

    return {
      before: beforeMetrics,
      after: afterMetrics,
      improvement
    };
  }

  /**
   * Export performance data
   */
  exportData(): string {
    if (!this.enabled) return JSON.stringify([]);

    const data = {
      metrics: this.metrics,
      rerenderCounts: Object.fromEntries(this.rerenderCounts),
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Clear all data
   */
  clearData(): void {
    this.metrics = [];
    this.rerenderCounts.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    if (typeof window !== 'undefined') {
      if (enabled) {
        window.localStorage.setItem('perf-monitor', 'true');
        this.initializeObserver();
        this.setupMemoryMonitoring();
      } else {
        window.localStorage.removeItem('perf-monitor');
        this.observer?.disconnect();
        this.observer = null;
      }
    }
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): number | null {
    if (hasMemoryAPI()) {
      return (performance as Performance & { memory: PerformanceMemory }).memory.usedJSHeapSize;
    }
    return null;
  }

  /**
   * Measure function execution time
   */
  measureFunction<T>(
    name: string, 
    fn: () => T
  ): { result: T; duration: number } {
    const startTime = performance.now();
    const result = fn();
    const duration = performance.now() - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name} took ${duration.toFixed(2)}ms`);
    }

    return { result, duration };
  }

  /**
   * Measure async function execution time
   */
  async measureAsyncFunction<T>(
    name: string, 
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await fn();
    const duration = performance.now() - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name} took ${duration.toFixed(2)}ms`);
    }

    return { result, duration };
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React hooks
export function usePerformanceMonitor() {
  return {
    trackRerender: (componentName: string) => {
      performanceMonitor.trackRerender(componentName);
    },
    
    getStats: () => {
      return performanceMonitor.getStats();
    },
    
    measureFunction: <T>(name: string, fn: () => T) => {
      return performanceMonitor.measureFunction(name, fn);
    },
    
    measureAsyncFunction: async <T>(name: string, fn: () => Promise<T>) => {
      return performanceMonitor.measureAsyncFunction(name, fn);
    }
  };
}

// Benchmark utilities
export function createPerformanceBenchmark() {
  const stats = performanceMonitor.getStats();
  
  return {
    baseline: stats.averages,
    
    compare: (newMetrics: Partial<PerformanceMetrics>) => {
      return performanceMonitor.createBenchmark(stats.averages, newMetrics);
    }
  };
}

export type { PerformanceMetrics, PerformanceBenchmark };
