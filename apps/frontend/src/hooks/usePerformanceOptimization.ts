/**
 * usePerformanceOptimization Hook
 * Hook cho performance monitoring và optimization
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

// ===== TYPES =====

export interface PerformanceMetrics {
  /** Component render time */
  renderTime: number;
  /** Memory usage (if available) */
  memoryUsage?: number;
  /** Re-render count */
  rerenderCount: number;
  /** Last render timestamp */
  lastRenderTime: number;
  /** Average render time */
  averageRenderTime: number;
  /** Peak render time */
  peakRenderTime: number;
}

export interface UsePerformanceOptimizationOptions {
  /** Component name cho logging */
  componentName?: string;
  /** Enable performance monitoring */
  enabled?: boolean;
  /** Log performance warnings */
  logWarnings?: boolean;
  /** Warning threshold (ms) */
  warningThreshold?: number;
  /** Max samples để track */
  maxSamples?: number;
  /** Callback khi có performance warning */
  onPerformanceWarning?: (metrics: PerformanceMetrics) => void;
}

export interface UsePerformanceOptimizationReturn {
  /** Current performance metrics */
  metrics: PerformanceMetrics;
  /** Start performance measurement */
  startMeasurement: () => void;
  /** End performance measurement */
  endMeasurement: () => void;
  /** Reset metrics */
  resetMetrics: () => void;
  /** Get performance report */
  getReport: () => string;
  /** Check if component is slow */
  isSlowComponent: boolean;
}

// ===== CONSTANTS =====

const DEFAULT_OPTIONS: Required<UsePerformanceOptimizationOptions> = {
  componentName: 'Unknown',
  enabled: process.env.NODE_ENV === 'development',
  logWarnings: true,
  warningThreshold: 16, // 60fps = 16.67ms per frame
  maxSamples: 100,
  onPerformanceWarning: () => {}
};

// ===== HOOK =====

/**
 * usePerformanceOptimization Hook
 * Comprehensive performance monitoring và optimization
 */
export function usePerformanceOptimization(
  options: UsePerformanceOptimizationOptions = {}
): UsePerformanceOptimizationReturn {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const {
    componentName,
    enabled,
    logWarnings,
    warningThreshold,
    maxSamples,
    onPerformanceWarning
  } = mergedOptions;

  // ===== REFS =====

  const startTimeRef = useRef<number>(0);
  const renderTimesRef = useRef<number[]>([]);
  const rerenderCountRef = useRef<number>(0);

  // ===== STATE =====

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    rerenderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    peakRenderTime: 0
  });

  // ===== CALLBACKS =====

  /**
   * Start performance measurement
   */
  const startMeasurement = useCallback(() => {
    if (!enabled) return;
    startTimeRef.current = performance.now();
  }, [enabled]);

  /**
   * End performance measurement
   */
  const endMeasurement = useCallback(() => {
    if (!enabled || startTimeRef.current === 0) return;

    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    // Update render times array
    renderTimesRef.current.push(renderTime);
    if (renderTimesRef.current.length > maxSamples) {
      renderTimesRef.current.shift();
    }
    
    // Update rerender count
    rerenderCountRef.current += 1;
    
    // Calculate metrics
    const renderTimes = renderTimesRef.current;
    const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    const peakRenderTime = Math.max(...renderTimes);
    
    // Get memory usage nếu available
    let memoryUsage: number | undefined;
    if ('memory' in performance) {
      const memInfo = (performance as { memory: { usedJSHeapSize: number } }).memory;
      memoryUsage = memInfo.usedJSHeapSize;
    }
    
    const newMetrics: PerformanceMetrics = {
      renderTime,
      memoryUsage,
      rerenderCount: rerenderCountRef.current,
      lastRenderTime: endTime,
      averageRenderTime,
      peakRenderTime
    };
    
    setMetrics(newMetrics);
    
    // Check for performance warnings
    if (renderTime > warningThreshold) {
      if (logWarnings) {
        console.warn(
          `[Performance Warning] ${componentName} took ${renderTime.toFixed(2)}ms to render ` +
          `(threshold: ${warningThreshold}ms)`
        );
      }
      onPerformanceWarning(newMetrics);
    }
    
    // Reset start time
    startTimeRef.current = 0;
  }, [enabled, maxSamples, warningThreshold, logWarnings, componentName, onPerformanceWarning]);

  /**
   * Reset metrics
   */
  const resetMetrics = useCallback(() => {
    renderTimesRef.current = [];
    rerenderCountRef.current = 0;
    setMetrics({
      renderTime: 0,
      rerenderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      peakRenderTime: 0
    });
  }, []);

  /**
   * Get performance report
   */
  const getReport = useCallback(() => {
    const { renderTime, rerenderCount, averageRenderTime, peakRenderTime, memoryUsage } = metrics;
    
    let report = `Performance Report for ${componentName}:\n`;
    report += `- Last render time: ${renderTime.toFixed(2)}ms\n`;
    report += `- Average render time: ${averageRenderTime.toFixed(2)}ms\n`;
    report += `- Peak render time: ${peakRenderTime.toFixed(2)}ms\n`;
    report += `- Total re-renders: ${rerenderCount}\n`;
    
    if (memoryUsage) {
      report += `- Memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
    }
    
    return report;
  }, [metrics, componentName]);

  // ===== COMPUTED VALUES =====

  const isSlowComponent = useMemo(() => {
    return metrics.averageRenderTime > warningThreshold;
  }, [metrics.averageRenderTime, warningThreshold]);

  // ===== EFFECTS =====

  /**
   * Auto-start measurement on component mount/update
   */
  useEffect(() => {
    startMeasurement();
    return () => {
      endMeasurement();
    };
  });

  // ===== RETURN =====

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    resetMetrics,
    getReport,
    isSlowComponent
  };
}

// ===== SPECIALIZED HOOKS =====

/**
 * useRenderOptimization Hook
 * Simplified hook cho render optimization
 */
export function useRenderOptimization(componentName: string) {
  return usePerformanceOptimization({
    componentName,
    enabled: true,
    logWarnings: true,
    warningThreshold: 16
  });
}

/**
 * useMemoryOptimization Hook
 * Hook cho memory usage monitoring
 */
export function useMemoryOptimization(componentName: string) {
  const [memoryPressure, setMemoryPressure] = useState(false);
  
  const { metrics } = usePerformanceOptimization({
    componentName,
    enabled: true,
    onPerformanceWarning: (metrics) => {
      if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
        setMemoryPressure(true);
      }
    }
  });
  
  return {
    memoryUsage: metrics.memoryUsage,
    memoryPressure,
    clearMemoryPressure: () => setMemoryPressure(false)
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Performance decorator cho components
 */
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
): React.ComponentType<T> {
  const WrappedComponent: React.ComponentType<T> = (props: T) => {
    const { startMeasurement, endMeasurement } = usePerformanceOptimization({
      componentName: componentName || Component.displayName || Component.name,
      enabled: true
    });

    useEffect(() => {
      startMeasurement();
      return endMeasurement;
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;

  return WrappedComponent;
}
