/**
 * Bundle Analyzer and Optimization Tools
 * 
 * Task 2.2.1 - Bundle Optimization:
 * - Analyze bundle size and composition
 * - Identify optimization opportunities
 * - Monitor bundle size changes
 * - Track performance metrics
 */

// =====================================================
// BUNDLE SIZE MONITORING
// =====================================================

export interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  assets: AssetInfo[];
  timestamp: number;
}

export interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: ModuleInfo[];
}

export interface ModuleInfo {
  name: string;
  size: number;
  reasons: string[];
}

export interface AssetInfo {
  name: string;
  size: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
}

/**
 * Bundle Size Analyzer
 */
export class BundleAnalyzer {
  private metrics: BundleMetrics[] = [];
  private readonly maxHistorySize = 50;

  /**
   * Analyze current bundle composition
   */
  async analyzeBundleSize(): Promise<BundleMetrics> {
    try {
      // In a real implementation, this would analyze the actual bundle
      // For now, we'll simulate the analysis
      const metrics = await this.simulateBundleAnalysis();
      
      this.addMetrics(metrics);
      return metrics;
    } catch (error) {
      console.error('Bundle analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get bundle size trends
   */
  getBundleTrends(): {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (this.metrics.length < 2) {
      return {
        current: this.metrics[0]?.totalSize || 0,
        previous: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable'
      };
    }

    const current = this.metrics[this.metrics.length - 1].totalSize;
    const previous = this.metrics[this.metrics.length - 2].totalSize;
    const change = current - previous;
    const changePercent = (change / previous) * 100;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 5) {
      trend = changePercent > 0 ? 'increasing' : 'decreasing';
    }

    return {
      current,
      previous,
      change,
      changePercent,
      trend
    };
  }

  /**
   * Identify large modules that could be optimized
   */
  getLargeModules(threshold: number = 100000): ModuleInfo[] {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) return [];

    const largeModules: ModuleInfo[] = [];
    
    latestMetrics.chunks.forEach(chunk => {
      chunk.modules.forEach(module => {
        if (module.size > threshold) {
          largeModules.push(module);
        }
      });
    });

    return largeModules.sort((a, b) => b.size - a.size);
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const latestMetrics = this.metrics[this.metrics.length - 1];
    
    if (!latestMetrics) {
      return ['No bundle metrics available'];
    }

    // Check total bundle size
    if (latestMetrics.totalSize > 1024 * 1024) { // 1MB
      recommendations.push('Bundle size exceeds 1MB target - consider code splitting');
    }

    // Check for large chunks
    const largeChunks = latestMetrics.chunks.filter(chunk => chunk.size > 500000); // 500KB
    if (largeChunks.length > 0) {
      recommendations.push(`${largeChunks.length} chunks exceed 500KB - consider splitting`);
    }

    // Check for large modules
    const largeModules = this.getLargeModules(100000); // 100KB
    if (largeModules.length > 0) {
      recommendations.push(`${largeModules.length} modules exceed 100KB - consider lazy loading`);
    }

    // Check compression ratio
    const compressionRatio = latestMetrics.gzippedSize / latestMetrics.totalSize;
    if (compressionRatio > 0.7) {
      recommendations.push('Poor compression ratio - check for duplicate code or large assets');
    }

    return recommendations;
  }

  /**
   * Add metrics to history
   */
  private addMetrics(metrics: BundleMetrics): void {
    this.metrics.push(metrics);
    
    // Maintain history size
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics.shift();
    }
  }

  /**
   * Simulate bundle analysis (replace with real implementation)
   */
  private async simulateBundleAnalysis(): Promise<BundleMetrics> {
    // This would be replaced with actual bundle analysis
    return {
      totalSize: 2500000, // 2.5MB - current size
      gzippedSize: 800000, // 800KB gzipped
      chunks: [
        {
          name: 'main',
          size: 1200000,
          gzippedSize: 400000,
          modules: [
            {
              name: 'question-components',
              size: 500000,
              reasons: ['question-form', 'question-list', 'question-bank']
            },
            {
              name: 'latex-renderer',
              size: 300000,
              reasons: ['question-content', 'latex-extractor']
            },
            {
              name: 'mapid-decoder',
              size: 200000,
              reasons: ['question-id-info', 'unified-decoder']
            }
          ]
        },
        {
          name: 'vendor',
          size: 800000,
          gzippedSize: 250000,
          modules: [
            {
              name: 'react',
              size: 150000,
              reasons: ['framework']
            },
            {
              name: 'next',
              size: 200000,
              reasons: ['framework']
            }
          ]
        }
      ],
      assets: [
        { name: 'main.js', size: 1200000, type: 'js' },
        { name: 'vendor.js', size: 800000, type: 'js' },
        { name: 'styles.css', size: 150000, type: 'css' }
      ],
      timestamp: Date.now()
    };
  }
}

// =====================================================
// PERFORMANCE MONITORING
// =====================================================

export interface PerformanceMetrics {
  bundleLoadTime: number;
  componentRenderTime: number;
  memoryUsage: number;
  timestamp: number;
}

/**
 * Performance Monitor
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  /**
   * Start monitoring performance
   */
  startMonitoring(): void {
    // Monitor bundle loading
    this.monitorBundleLoading();
    
    // Monitor component rendering
    this.monitorComponentRendering();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageBundleLoadTime: number;
    averageRenderTime: number;
    averageMemoryUsage: number;
    recommendations: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageBundleLoadTime: 0,
        averageRenderTime: 0,
        averageMemoryUsage: 0,
        recommendations: ['No performance data available']
      };
    }

    const avgBundleLoadTime = this.metrics.reduce((sum, m) => sum + m.bundleLoadTime, 0) / this.metrics.length;
    const avgRenderTime = this.metrics.reduce((sum, m) => sum + m.componentRenderTime, 0) / this.metrics.length;
    const avgMemoryUsage = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length;

    const recommendations: string[] = [];
    
    if (avgBundleLoadTime > 3000) {
      recommendations.push('Bundle load time is slow - consider code splitting');
    }
    
    if (avgRenderTime > 16) {
      recommendations.push('Component rendering is slow - consider memoization');
    }
    
    if (avgMemoryUsage > 100 * 1024 * 1024) { // 100MB
      recommendations.push('High memory usage - check for memory leaks');
    }

    return {
      averageBundleLoadTime: avgBundleLoadTime,
      averageRenderTime: avgRenderTime,
      averageMemoryUsage: avgMemoryUsage,
      recommendations
    };
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            this.recordBundleLoadTime(entry.duration);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    }
  }

  /**
   * Monitor bundle loading performance
   */
  private monitorBundleLoading(): void {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();
    
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      this.recordBundleLoadTime(loadTime);
    });
  }

  /**
   * Monitor component rendering performance
   */
  private monitorComponentRendering(): void {
    // This would integrate with React DevTools or custom profiling
    // For now, we'll simulate the monitoring
    setInterval(() => {
      const renderTime = Math.random() * 20; // Simulate render time
      this.recordComponentRenderTime(renderTime);
    }, 5000);
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        this.recordMemoryUsage(memory.usedJSHeapSize);
      }
    }, 10000);
  }

  /**
   * Record bundle load time
   */
  private recordBundleLoadTime(loadTime: number): void {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (latestMetrics && Date.now() - latestMetrics.timestamp < 1000) {
      latestMetrics.bundleLoadTime = loadTime;
    } else {
      this.addMetrics({ bundleLoadTime: loadTime });
    }
  }

  /**
   * Record component render time
   */
  private recordComponentRenderTime(renderTime: number): void {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (latestMetrics && Date.now() - latestMetrics.timestamp < 1000) {
      latestMetrics.componentRenderTime = renderTime;
    } else {
      this.addMetrics({ componentRenderTime: renderTime });
    }
  }

  /**
   * Record memory usage
   */
  private recordMemoryUsage(memoryUsage: number): void {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (latestMetrics && Date.now() - latestMetrics.timestamp < 1000) {
      latestMetrics.memoryUsage = memoryUsage;
    } else {
      this.addMetrics({ memoryUsage });
    }
  }

  /**
   * Add performance metrics
   */
  private addMetrics(partial: Partial<PerformanceMetrics>): void {
    const metrics: PerformanceMetrics = {
      bundleLoadTime: 0,
      componentRenderTime: 0,
      memoryUsage: 0,
      timestamp: Date.now(),
      ...partial
    };

    this.metrics.push(metrics);

    // Maintain history size
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }
}

// =====================================================
// SINGLETON INSTANCES
// =====================================================

export const bundleAnalyzer = new BundleAnalyzer();
export const performanceMonitor = new PerformanceMonitor();

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  return compressedSize / originalSize;
}

/**
 * Get bundle size status
 */
export function getBundleSizeStatus(size: number): 'good' | 'warning' | 'error' {
  if (size < 1024 * 1024) return 'good'; // < 1MB
  if (size < 2 * 1024 * 1024) return 'warning'; // < 2MB
  return 'error'; // >= 2MB
}
