/**
 * Performance Monitoring Utility
 * 
 * Provides comprehensive performance monitoring for the NyNus application
 * including page load times, API response times, and user interaction metrics
 */

import logger from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'navigation' | 'api' | 'interaction' | 'custom';
  metadata?: Record<string, unknown>;
}

interface PageLoadMetrics {
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  /**
   * Initialize performance monitoring
   */
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    this.setupNavigationObserver();
    this.setupPaintObserver();
    this.setupLayoutShiftObserver();
    this.setupLargestContentfulPaintObserver();
    this.setupFirstInputDelayObserver();
    
    this.isInitialized = true;
    logger.info('🚀 Performance monitoring initialized');
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number, type: PerformanceMetric['type'] = 'custom', metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type,
      metadata
    };

    this.metrics.push(metric);
    
    // Log significant metrics
    if (value > 1000) { // Log metrics over 1 second
      logger.warn(`⚠️ Performance: ${name} took ${value}ms`, metadata);
    } else {
      logger.info(`📊 Performance: ${name} = ${value}ms`, metadata);
    }
  }

  /**
   * Measure API call performance
   */
  async measureApiCall<T>(
    name: string, 
    apiCall: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      this.recordMetric(`api.${name}`, duration, 'api', {
        ...metadata,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.recordMetric(`api.${name}`, duration, 'api', {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Measure component render time
   */
  measureRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    renderFn();
    const duration = performance.now() - startTime;
    
    this.recordMetric(`render.${componentName}`, duration, 'interaction');
  }

  /**
   * Get page load metrics
   */
  getPageLoadMetrics(): PageLoadMetrics | null {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstContentfulPaint: this.getMetricValue('first-contentful-paint'),
      largestContentfulPaint: this.getMetricValue('largest-contentful-paint'),
      firstInputDelay: this.getMetricValue('first-input-delay'),
      cumulativeLayoutShift: this.getMetricValue('cumulative-layout-shift'),
      timeToInteractive: navigation.loadEventEnd - navigation.fetchStart
    };
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalMetrics: number;
    averageApiTime: number;
    slowestApi: PerformanceMetric | null;
    pageLoadMetrics: PageLoadMetrics | null;
  } {
    const apiMetrics = this.metrics.filter(m => m.type === 'api');
    const averageApiTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
      : 0;
    
    const slowestApi = apiMetrics.reduce((slowest, current) => 
      !slowest || current.value > slowest.value ? current : slowest, null as PerformanceMetric | null
    );

    return {
      totalMetrics: this.metrics.length,
      averageApiTime,
      slowestApi,
      pageLoadMetrics: this.getPageLoadMetrics()
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    logger.info('🧹 Performance metrics cleared');
  }

  /**
   * Setup navigation observer
   */
  private setupNavigationObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          this.recordMetric('navigation.total', nav.loadEventEnd - nav.fetchStart, 'navigation');
          this.recordMetric('navigation.dns', nav.domainLookupEnd - nav.domainLookupStart, 'navigation');
          this.recordMetric('navigation.tcp', nav.connectEnd - nav.connectStart, 'navigation');
          this.recordMetric('navigation.request', nav.responseStart - nav.requestStart, 'navigation');
          this.recordMetric('navigation.response', nav.responseEnd - nav.responseStart, 'navigation');
          this.recordMetric('navigation.dom', nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart, 'navigation');
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  /**
   * Setup paint observer
   */
  private setupPaintObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(`paint.${entry.name}`, entry.startTime, 'navigation');
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.push(observer);
  }

  /**
   * Setup layout shift observer
   */
  private setupLayoutShiftObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (entry.entryType === 'layout-shift' && !layoutShiftEntry.hadRecentInput) {
          this.recordMetric('layout-shift', layoutShiftEntry.value || 0, 'navigation');
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  /**
   * Setup largest contentful paint observer
   */
  private setupLargestContentfulPaintObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('largest-contentful-paint', lastEntry.startTime, 'navigation');
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }

  /**
   * Setup first input delay observer
   */
  private setupFirstInputDelayObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const firstInputEntry = entry as PerformanceEntry & { processingStart?: number };
        this.recordMetric('first-input-delay', (firstInputEntry.processingStart || 0) - entry.startTime, 'navigation');
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  /**
   * Get metric value by name
   */
  private getMetricValue(name: string): number {
    const metric = this.metrics.find(m => m.name === name || m.name.includes(name));
    return metric ? metric.value : 0;
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isInitialized = false;
    logger.info('🧹 Performance monitoring cleaned up');
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  performanceMonitor.initialize();
}

export default performanceMonitor;
