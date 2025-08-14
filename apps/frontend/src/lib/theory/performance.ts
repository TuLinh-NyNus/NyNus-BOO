/**
 * Theory Performance Optimization Utilities
 * Bundle analysis, lazy loading, và performance monitoring cho theory system
 */

import { getCachedParsedContent, cacheParsedContent } from './cache';
import { parseLatexContent } from './latex-parser';
import type { ParsedLatexFile } from './latex-parser';

// ===== INTERFACES =====

interface PerformanceMetrics {
  /** Parse time in milliseconds */
  parseTime: number;
  /** Cache hit/miss */
  cacheHit: boolean;
  /** Content size in bytes */
  contentSize: number;
  /** Render time in milliseconds */
  renderTime: number;
  /** Total time from request to render */
  totalTime: number;
}

interface BundleAnalysis {
  /** Total bundle size */
  totalSize: number;
  /** Theory-specific bundle size */
  theorySize: number;
  /** LaTeX parser size */
  parserSize: number;
  /** KaTeX size */
  katexSize: number;
  /** Components size */
  componentsSize: number;
}

interface LoadingStrategy {
  /** Preload popular content */
  preloadPopular: boolean;
  /** Lazy load images */
  lazyLoadImages: boolean;
  /** Progressive loading */
  progressiveLoading: boolean;
  /** Prefetch next chapter */
  prefetchNext: boolean;
}

// ===== PERFORMANCE MONITORING =====

/**
 * Performance monitor cho theory operations
 */
class TheoryPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private startTimes = new Map<string, number>();

  /**
   * Start timing an operation
   */
  startTiming(operationId: string): void {
    this.startTimes.set(operationId, performance.now());
  }

  /**
   * End timing an operation
   */
  endTiming(operationId: string): number {
    const startTime = this.startTimes.get(operationId);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.startTimes.delete(operationId);
    return duration;
  }

  /**
   * Record performance metrics
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    if (this.metrics.length === 0) {
      return null;
    }

    const totalMetrics = this.metrics.length;
    const cacheHits = this.metrics.filter(m => m.cacheHit).length;
    const avgParseTime = this.metrics.reduce((sum, m) => sum + m.parseTime, 0) / totalMetrics;
    const avgRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / totalMetrics;
    const avgTotalTime = this.metrics.reduce((sum, m) => sum + m.totalTime, 0) / totalMetrics;

    return {
      totalOperations: totalMetrics,
      cacheHitRate: (cacheHits / totalMetrics) * 100,
      averageParseTime: Math.round(avgParseTime * 100) / 100,
      averageRenderTime: Math.round(avgRenderTime * 100) / 100,
      averageTotalTime: Math.round(avgTotalTime * 100) / 100
    };
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.startTimes.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new TheoryPerformanceMonitor();

// ===== OPTIMIZED CONTENT LOADING =====

/**
 * Load theory content với performance optimization
 */
export async function loadTheoryContentOptimized(
  filePath: string,
  _strategy: Partial<LoadingStrategy> = {}
): Promise<ParsedLatexFile> {
  const operationId = `load-${filePath}-${Date.now()}`;
  performanceMonitor.startTiming(operationId);
  
  let cacheHit = false;
  let parseTime = 0;
  let contentSize = 0;

  try {
    // Try cache first
    let parsedContent = getCachedParsedContent(filePath);
    
    if (parsedContent) {
      cacheHit = true;
    } else {
      // Parse content
      const parseStart = performance.now();
      
      // This would normally load from file system
      // For now, we'll simulate with a mock
      const rawContent = await loadRawContent(filePath);
      contentSize = rawContent.length;
      
      parsedContent = parseLatexContent(rawContent, filePath);
      parseTime = performance.now() - parseStart;
      
      // Cache the result
      cacheParsedContent(filePath, parsedContent);
    }

    const totalTime = performanceMonitor.endTiming(operationId);

    // Record metrics
    performanceMonitor.recordMetrics({
      parseTime,
      cacheHit,
      contentSize,
      renderTime: 0, // Will be updated by component
      totalTime
    });

    return parsedContent;
  } catch (error) {
    performanceMonitor.endTiming(operationId);
    throw error;
  }
}

/**
 * Mock function để load raw content
 * Trong thực tế sẽ load từ file system hoặc API
 */
async function loadRawContent(filePath: string): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  
  // Return mock LaTeX content
  return `\\section{Sample Chapter}

This is a sample LaTeX content for ${filePath}.

\\begin{boxkn}
\\textbf{Definition:} This is a sample definition.
\\end{boxkn}

\\subsection{Example}

\\begin{vd}
Sample example content with math: $x^2 + y^2 = z^2$
\\end{vd}`;
}

// ===== BUNDLE OPTIMIZATION =====

/**
 * Analyze bundle size cho theory components
 */
export function analyzeTheoryBundle(): BundleAnalysis {
  // This would integrate với webpack-bundle-analyzer hoặc similar tool
  // For now, return estimated sizes
  return {
    totalSize: 2.5 * 1024 * 1024, // 2.5MB total
    theorySize: 500 * 1024, // 500KB theory components
    parserSize: 150 * 1024, // 150KB LaTeX parser
    katexSize: 800 * 1024, // 800KB KaTeX
    componentsSize: 300 * 1024 // 300KB React components
  };
}

/**
 * Get bundle optimization recommendations
 */
export function getBundleOptimizationRecommendations(): string[] {
  const analysis = analyzeTheoryBundle();
  const recommendations: string[] = [];

  if (analysis.katexSize > 500 * 1024) {
    recommendations.push('Consider using KaTeX auto-render extension only when needed');
  }

  if (analysis.theorySize > 400 * 1024) {
    recommendations.push('Implement code splitting for theory components');
  }

  if (analysis.totalSize > 2 * 1024 * 1024) {
    recommendations.push('Enable gzip compression for static assets');
  }

  return recommendations;
}

// ===== LAZY LOADING UTILITIES =====

/**
 * Lazy load theory images với intersection observer
 */
export function setupLazyImageLoading(): void {
  if (typeof window === 'undefined') return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  // Observe all lazy images
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Preload critical theory content
 */
export async function preloadCriticalContent(filePaths: string[]): Promise<void> {
  const preloadPromises = filePaths.map(async (filePath) => {
    try {
      await loadTheoryContentOptimized(filePath, { preloadPopular: true });
    } catch (error) {
      console.warn(`Failed to preload ${filePath}:`, error);
    }
  });

  await Promise.allSettled(preloadPromises);
}

/**
 * Prefetch next chapter content
 */
export function prefetchNextChapter(currentPath: string, nextPath?: string): void {
  if (!nextPath || typeof window === 'undefined') return;

  // Use requestIdleCallback để prefetch khi browser idle
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      loadTheoryContentOptimized(nextPath, { prefetchNext: true });
    });
  } else {
    // Fallback cho browsers không support requestIdleCallback
    setTimeout(() => {
      loadTheoryContentOptimized(nextPath, { prefetchNext: true });
    }, 1000);
  }
}

// ===== CORE WEB VITALS OPTIMIZATION =====

/**
 * Optimize Largest Contentful Paint (LCP)
 */
export function optimizeLCP(): void {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/katex.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'preload';
  cssLink.href = '/styles/theory.css';
  cssLink.as = 'style';
  document.head.appendChild(cssLink);
}

/**
 * Optimize Cumulative Layout Shift (CLS)
 */
export function optimizeCLS(): void {
  // Add aspect ratio containers cho images
  const style = document.createElement('style');
  style.textContent = `
    .theory-image-container {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
    }
    
    .theory-image-container img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Optimize First Input Delay (FID)
 */
export function optimizeFID(): void {
  if (typeof window === 'undefined') return;

  // Use scheduler.postTask nếu available
  if ('scheduler' in window && 'postTask' in (window as unknown as { scheduler: { postTask: (callback: () => void, options?: unknown) => void } }).scheduler) {
    (window as unknown as { scheduler: { postTask: (callback: () => void, options?: unknown) => void } }).scheduler.postTask(() => {
      // Non-critical initialization
      setupLazyImageLoading();
    }, { priority: 'background' });
  }
}

// ===== PERFORMANCE INITIALIZATION =====

/**
 * Initialize performance optimizations
 */
export function initializeTheoryPerformance(): void {
  if (typeof window === 'undefined') return;

  // Setup performance optimizations
  optimizeLCP();
  optimizeCLS();
  optimizeFID();
  setupLazyImageLoading();

  // Log performance stats periodically
  setInterval(() => {
    const stats = performanceMonitor.getStats();
    if (stats) {
      console.log('Theory Performance Stats:', stats);
    }
  }, 60000); // Every minute
}

// ===== EXPORT UTILITIES =====

export {
  type PerformanceMetrics,
  type BundleAnalysis,
  type LoadingStrategy
};
