/**
 * Question List Performance Utilities
 * Utilities cho performance monitoring và optimization của question lists
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// ===== TYPES =====

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  recommendation: string;
  shouldUseVirtualScrolling: boolean;
  itemsPerSecond: number;
  estimatedScrollTime: number;
}

export interface PerformanceThresholds {
  virtualScrollingThreshold: number;
  maxRenderTime: number;
  maxMemoryUsage: number;
  targetItemsPerSecond: number;
}

export interface PerformanceMonitor {
  startTime: number;
  endTime?: number;
  itemCount: number;
  operation: string;
}

// ===== CONSTANTS =====

export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  virtualScrollingThreshold: 100,
  maxRenderTime: 100, // ms
  maxMemoryUsage: 50, // MB
  targetItemsPerSecond: 1000
};

export const PERFORMANCE_RECOMMENDATIONS = {
  VIRTUAL_SCROLLING: 'Nên sử dụng virtual scrolling cho hiệu suất tốt hơn',
  REDUCE_ITEMS: 'Giảm số lượng items hiển thị để cải thiện hiệu suất',
  OPTIMIZE_RENDERING: 'Tối ưu hóa rendering components',
  GOOD_PERFORMANCE: 'Hiệu suất tốt, không cần thay đổi'
};

// ===== PERFORMANCE CALCULATION FUNCTIONS =====

/**
 * Calculate comprehensive performance metrics cho question list
 */
export function calculateQuestionListPerformance(
  questionCount: number,
  thresholds: PerformanceThresholds = DEFAULT_PERFORMANCE_THRESHOLDS
): PerformanceMetrics {
  // Estimate render time dựa trên số lượng questions
  const baseRenderTime = 0.1; // ms per item
  const complexityFactor = questionCount > 1000 ? 1.5 : 1.0;
  const renderTime = questionCount * baseRenderTime * complexityFactor;
  
  // Estimate memory usage
  const baseMemoryPerItem = 0.5; // KB per item
  const memoryUsage = (questionCount * baseMemoryPerItem) / 1024; // Convert to MB
  
  // Calculate items per second
  const itemsPerSecond = renderTime > 0 ? (questionCount / renderTime) * 1000 : 0;
  
  // Estimate scroll time cho virtual scrolling
  const estimatedScrollTime = questionCount > 100 ? questionCount * 0.01 : 0;
  
  // Determine recommendation
  let recommendation = PERFORMANCE_RECOMMENDATIONS.GOOD_PERFORMANCE;
  let shouldUseVirtualScrolling = false;
  
  if (questionCount > thresholds.virtualScrollingThreshold) {
    recommendation = PERFORMANCE_RECOMMENDATIONS.VIRTUAL_SCROLLING;
    shouldUseVirtualScrolling = true;
  } else if (renderTime > thresholds.maxRenderTime) {
    recommendation = PERFORMANCE_RECOMMENDATIONS.OPTIMIZE_RENDERING;
  } else if (memoryUsage > thresholds.maxMemoryUsage) {
    recommendation = PERFORMANCE_RECOMMENDATIONS.REDUCE_ITEMS;
  }
  
  return {
    renderTime,
    memoryUsage,
    recommendation,
    shouldUseVirtualScrolling,
    itemsPerSecond,
    estimatedScrollTime
  };
}

/**
 * Create performance monitor cho tracking operations
 */
export function createPerformanceMonitor(operation: string, itemCount: number): PerformanceMonitor {
  return {
    startTime: performance.now(),
    itemCount,
    operation
  };
}

/**
 * Complete performance monitoring và return metrics
 */
export function completePerformanceMonitor(monitor: PerformanceMonitor): PerformanceMetrics & { actualTime: number } {
  const endTime = performance.now();
  const actualTime = endTime - monitor.startTime;
  
  const metrics = calculateQuestionListPerformance(monitor.itemCount);
  
  return {
    ...metrics,
    actualTime,
    renderTime: actualTime // Use actual time instead of estimated
  };
}

/**
 * Get performance recommendation dựa trên current metrics
 */
export function getPerformanceRecommendation(
  questionCount: number,
  currentRenderTime: number,
  viewMode: 'table' | 'cards' | 'virtual'
): string {
  if (questionCount > 1000 && viewMode !== 'virtual') {
    return 'Với hơn 1000 câu hỏi, nên sử dụng virtual scrolling để tối ưu hiệu suất';
  }
  
  if (questionCount > 500 && viewMode === 'cards') {
    return 'Card view với nhiều items có thể chậm, hãy thử table view hoặc virtual scrolling';
  }
  
  if (currentRenderTime > 200) {
    return 'Thời gian render cao, hãy giảm số items hoặc sử dụng virtual scrolling';
  }
  
  if (questionCount > 100 && viewMode === 'table') {
    return 'Có thể cân nhắc virtual scrolling để cải thiện trải nghiệm cuộn';
  }
  
  return 'Hiệu suất tốt với cấu hình hiện tại';
}

/**
 * Check if virtual scrolling should be enabled
 */
export function shouldEnableVirtualScrolling(
  questionCount: number,
  currentLayout: 'desktop' | 'tablet' | 'mobile',
  userPreference?: boolean
): boolean {
  // User preference có priority cao nhất
  if (userPreference !== undefined) {
    return userPreference;
  }
  
  // Mobile devices - enable sớm hơn do performance constraints
  if (currentLayout === 'mobile' && questionCount > 50) {
    return true;
  }
  
  // Tablet - moderate threshold
  if (currentLayout === 'tablet' && questionCount > 75) {
    return true;
  }
  
  // Desktop - higher threshold
  if (currentLayout === 'desktop' && questionCount > 100) {
    return true;
  }
  
  return false;
}

/**
 * Get optimal page size dựa trên performance metrics
 */
export function getOptimalPageSize(
  questionCount: number,
  currentLayout: 'desktop' | 'tablet' | 'mobile',
  viewMode: 'table' | 'cards' | 'virtual'
): number {
  // Virtual scrolling không cần pagination
  if (viewMode === 'virtual') {
    return questionCount; // Return all items
  }
  
  // Mobile - smaller page sizes
  if (currentLayout === 'mobile') {
    return viewMode === 'cards' ? 10 : 15;
  }
  
  // Tablet - moderate page sizes
  if (currentLayout === 'tablet') {
    return viewMode === 'cards' ? 15 : 25;
  }
  
  // Desktop - larger page sizes
  return viewMode === 'cards' ? 20 : 50;
}

/**
 * Performance monitoring hook utilities
 */
export class QuestionListPerformanceTracker {
  private monitors: Map<string, PerformanceMonitor> = new Map();
  private metrics: PerformanceMetrics[] = [];
  
  /**
   * Start monitoring operation
   */
  startMonitoring(operationId: string, operation: string, itemCount: number): void {
    const monitor = createPerformanceMonitor(operation, itemCount);
    this.monitors.set(operationId, monitor);
  }
  
  /**
   * End monitoring và return metrics
   */
  endMonitoring(operationId: string): PerformanceMetrics & { actualTime: number } | null {
    const monitor = this.monitors.get(operationId);
    if (!monitor) return null;
    
    const result = completePerformanceMonitor(monitor);
    this.metrics.push(result);
    this.monitors.delete(operationId);
    
    return result;
  }
  
  /**
   * Get average performance metrics
   */
  getAverageMetrics(): Partial<PerformanceMetrics> | null {
    if (this.metrics.length === 0) return null;
    
    const totals = this.metrics.reduce(
      (acc, metric) => ({
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        itemsPerSecond: acc.itemsPerSecond + metric.itemsPerSecond
      }),
      { renderTime: 0, memoryUsage: 0, itemsPerSecond: 0 }
    );
    
    const count = this.metrics.length;
    return {
      renderTime: totals.renderTime / count,
      memoryUsage: totals.memoryUsage / count,
      itemsPerSecond: totals.itemsPerSecond / count
    };
  }
  
  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.monitors.clear();
    this.metrics = [];
  }
}

// ===== EXPORT SINGLETON TRACKER =====

export const questionListPerformanceTracker = new QuestionListPerformanceTracker();
