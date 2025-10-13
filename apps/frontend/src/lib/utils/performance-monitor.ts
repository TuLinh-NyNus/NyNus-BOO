/**
 * Performance Monitor Utilities
 * Utilities cho performance monitoring và optimization
 *
 * @author NyNus Team
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/utils/logger';

// ===== TYPES =====

export interface PerformanceEntry {
  /** Operation name */
  name: string;
  /** Start time */
  startTime: number;
  /** End time */
  endTime: number;
  /** Duration */
  duration: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface PerformanceReport {
  /** Total operations */
  totalOperations: number;
  /** Average duration */
  averageDuration: number;
  /** Min duration */
  minDuration: number;
  /** Max duration */
  maxDuration: number;
  /** Operations per second */
  operationsPerSecond: number;
  /** Slow operations (> threshold) */
  slowOperations: PerformanceEntry[];
  /** Performance entries */
  entries: PerformanceEntry[];
}

export interface PerformanceMonitorOptions {
  /** Max entries để store */
  maxEntries?: number;
  /** Slow operation threshold (ms) */
  slowThreshold?: number;
  /** Enable console logging */
  enableLogging?: boolean;
  /** Auto-clear old entries */
  autoClear?: boolean;
}

// ===== CONSTANTS =====

const DEFAULT_OPTIONS: Required<PerformanceMonitorOptions> = {
  maxEntries: 1000,
  slowThreshold: 100,
  enableLogging: process.env.NODE_ENV === 'development',
  autoClear: true
};

// ===== PERFORMANCE MONITOR CLASS =====

/**
 * Performance Monitor Class
 * Centralized performance monitoring system
 */
export class PerformanceMonitor {
  private entries: PerformanceEntry[] = [];
  private activeOperations = new Map<string, number>();
  private options: Required<PerformanceMonitorOptions>;

  constructor(options: PerformanceMonitorOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Start measuring an operation
   * Business Logic: Bắt đầu đo performance cho một operation
   */
  start(name: string, _metadata?: Record<string, unknown>): void {
    const startTime = performance.now();
    this.activeOperations.set(name, startTime);

    if (this.options.enableLogging) {
      logger.debug('[PerformanceMonitor] Started measuring operation', {
        operation: name,
        startTime,
      });
    }
  }

  /**
   * End measuring an operation
   * Business Logic: Kết thúc đo performance và log kết quả
   * - Tính duration
   * - Detect slow operations (> threshold)
   * - Auto-clear old entries nếu vượt quá maxEntries
   */
  end(name: string, metadata?: Record<string, unknown>): PerformanceEntry | null {
    const endTime = performance.now();
    const startTime = this.activeOperations.get(name);

    if (!startTime) {
      logger.warn('[PerformanceMonitor] No start time found for operation', {
        operation: name,
      });
      return null;
    }

    const duration = endTime - startTime;
    const entry: PerformanceEntry = {
      name,
      startTime,
      endTime,
      duration,
      metadata
    };

    // Add to entries
    this.entries.push(entry);

    // Remove from active operations
    this.activeOperations.delete(name);

    // Auto-clear nếu needed
    if (this.options.autoClear && this.entries.length > this.options.maxEntries) {
      this.entries = this.entries.slice(-this.options.maxEntries);
    }

    // Log nếu enabled
    if (this.options.enableLogging) {
      logger.debug('[PerformanceMonitor] Completed measuring operation', {
        operation: name,
        duration: `${duration.toFixed(2)}ms`,
        ...metadata,
      });

      if (duration > this.options.slowThreshold) {
        logger.warn('[PerformanceMonitor] Slow operation detected', {
          operation: name,
          duration: `${duration.toFixed(2)}ms`,
          threshold: `${this.options.slowThreshold}ms`,
          ...metadata,
        });
      }
    }

    return entry;
  }

  /**
   * Measure a function execution
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(name, metadata);
    
    try {
      const result = await fn();
      this.end(name, metadata);
      return result;
    } catch (error) {
      this.end(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get performance report
   */
  getReport(operationName?: string): PerformanceReport {
    const filteredEntries = operationName 
      ? this.entries.filter(entry => entry.name === operationName)
      : this.entries;
    
    if (filteredEntries.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        operationsPerSecond: 0,
        slowOperations: [],
        entries: []
      };
    }
    
    const durations = filteredEntries.map(entry => entry.duration);
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    const averageDuration = totalDuration / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    // Calculate operations per second
    const timeSpan = filteredEntries[filteredEntries.length - 1].endTime - filteredEntries[0].startTime;
    const operationsPerSecond = timeSpan > 0 ? (filteredEntries.length / timeSpan) * 1000 : 0;
    
    // Find slow operations
    const slowOperations = filteredEntries.filter(
      entry => entry.duration > this.options.slowThreshold
    );
    
    return {
      totalOperations: filteredEntries.length,
      averageDuration,
      minDuration,
      maxDuration,
      operationsPerSecond,
      slowOperations,
      entries: filteredEntries
    };
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
    this.activeOperations.clear();
  }

  /**
   * Get all operation names
   */
  getOperationNames(): string[] {
    const names = new Set(this.entries.map(entry => entry.name));
    return Array.from(names);
  }

  /**
   * Export data cho analysis
   */
  exportData(): {
    entries: PerformanceEntry[];
    summary: PerformanceReport;
  } {
    return {
      entries: this.entries,
      summary: this.getReport()
    };
  }
}

// ===== GLOBAL INSTANCE =====

/** Global performance monitor instance */
export const globalPerformanceMonitor = new PerformanceMonitor();

// ===== UTILITY FUNCTIONS =====

/**
 * Quick performance measurement
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  return globalPerformanceMonitor.measure(name, fn);
}

/**
 * Performance decorator function
 */
// Define proper types for decorator
type DecoratorFunction = (...args: unknown[]) => unknown;
type DecoratorTarget = Record<string, unknown>;

export function performanceDecorator(operationName?: string) {
  return function <T extends DecoratorFunction>(
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value;
    const name = operationName || `${(target.constructor as { name: string }).name}.${propertyKey}`;

    descriptor.value = async function (this: DecoratorTarget, ...args: unknown[]) {
      return globalPerformanceMonitor.measure(name, () => originalMethod?.apply(this, args));
    } as T;

    return descriptor;
  };
}

/**
 * React component performance wrapper
 */
export function measureComponentRender<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
): React.ComponentType<T> {
  const name = componentName || Component.displayName || Component.name || 'Unknown';

  return function MeasuredComponent(props: T) {
    globalPerformanceMonitor.start(`${name}.render`);

    try {
      const result = React.createElement(Component, props);
      globalPerformanceMonitor.end(`${name}.render`);
      return result;
    } catch (error) {
      globalPerformanceMonitor.end(`${name}.render`, { error: true });
      throw error;
    }
  };
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if ('memory' in performance) {
    const memInfo = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    return {
      used: memInfo.usedJSHeapSize,
      total: memInfo.totalJSHeapSize,
      percentage: (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100
    };
  }
  return null;
}

/**
 * FPS monitoring
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = 0;
  private isRunning = false;

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
  }

  private tick = (): void => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;
    
    this.frames.push(1000 / delta);
    if (this.frames.length > 60) {
      this.frames.shift();
    }
    
    this.lastTime = currentTime;
    requestAnimationFrame(this.tick);
  };

  getFPS(): number {
    if (this.frames.length === 0) return 0;
    return this.frames.reduce((sum, fps) => sum + fps, 0) / this.frames.length;
  }

  getReport(): {
    current: number;
    average: number;
    min: number;
    max: number;
  } {
    if (this.frames.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0 };
    }
    
    const current = this.frames[this.frames.length - 1];
    const average = this.frames.reduce((sum, fps) => sum + fps, 0) / this.frames.length;
    const min = Math.min(...this.frames);
    const max = Math.max(...this.frames);
    
    return { current, average, min, max };
  }
}

/** Global FPS monitor instance */
export const globalFPSMonitor = new FPSMonitor();
