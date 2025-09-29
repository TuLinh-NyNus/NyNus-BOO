/**
 * Memory Usage Monitor
 * Monitors memory usage during exam taking to prevent performance issues
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React from 'react';

// ===== TYPES =====

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryMetrics {
  current: MemoryInfo;
  peak: MemoryInfo;
  average: MemoryInfo;
  samples: number;
  timestamp: number;
}

interface MemoryAlert {
  type: 'warning' | 'critical';
  message: string;
  usage: number;
  threshold: number;
  timestamp: number;
}

// ===== CONSTANTS =====

const MEMORY_WARNING_THRESHOLD = 0.8; // 80% of heap limit
const MEMORY_CRITICAL_THRESHOLD = 0.9; // 90% of heap limit
const MONITORING_INTERVAL = 5000; // 5 seconds
const MAX_SAMPLES = 100; // Keep last 100 samples

// ===== MEMORY MONITOR CLASS =====

class MemoryMonitor {
  private metrics: MemoryMetrics | null = null;
  private alerts: MemoryAlert[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: ((metrics: MemoryMetrics) => void)[] = [];
  private alertCallbacks: ((alert: MemoryAlert) => void)[] = [];

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    if (!this.isMemoryAPIAvailable()) {
      console.warn('Memory API not available in this browser');
      return;
    }

    const memory = this.getCurrentMemoryInfo();
    this.metrics = {
      current: memory,
      peak: { ...memory },
      average: { ...memory },
      samples: 1,
      timestamp: Date.now(),
    };
  }

  private isMemoryAPIAvailable(): boolean {
    return 'memory' in performance && 'usedJSHeapSize' in (performance as Performance & { memory: MemoryInfo }).memory;
  }

  private getCurrentMemoryInfo(): MemoryInfo {
    if (!this.isMemoryAPIAvailable()) {
      return {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
      };
    }

    const memory = (performance as Performance & { memory: MemoryInfo }).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }

  private updateMetrics(): void {
    if (!this.metrics) return;

    const current = this.getCurrentMemoryInfo();
    const samples = this.metrics.samples + 1;

    // Update current
    this.metrics.current = current;

    // Update peak
    if (current.usedJSHeapSize > this.metrics.peak.usedJSHeapSize) {
      this.metrics.peak = { ...current };
    }

    // Update average
    this.metrics.average = {
      usedJSHeapSize: (this.metrics.average.usedJSHeapSize * this.metrics.samples + current.usedJSHeapSize) / samples,
      totalJSHeapSize: (this.metrics.average.totalJSHeapSize * this.metrics.samples + current.totalJSHeapSize) / samples,
      jsHeapSizeLimit: current.jsHeapSizeLimit, // This doesn't change
    };

    this.metrics.samples = Math.min(samples, MAX_SAMPLES);
    this.metrics.timestamp = Date.now();

    // Check for alerts
    this.checkMemoryAlerts(current);

    // Notify callbacks
    this.callbacks.forEach(callback => callback(this.metrics!));
  }

  private checkMemoryAlerts(memory: MemoryInfo): void {
    if (memory.jsHeapSizeLimit === 0) return;

    const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

    if (usage >= MEMORY_CRITICAL_THRESHOLD) {
      this.addAlert({
        type: 'critical',
        message: 'Critical memory usage detected. Consider refreshing the page.',
        usage,
        threshold: MEMORY_CRITICAL_THRESHOLD,
        timestamp: Date.now(),
      });
    } else if (usage >= MEMORY_WARNING_THRESHOLD) {
      this.addAlert({
        type: 'warning',
        message: 'High memory usage detected. Performance may be affected.',
        usage,
        threshold: MEMORY_WARNING_THRESHOLD,
        timestamp: Date.now(),
      });
    }
  }

  private addAlert(alert: MemoryAlert): void {
    // Avoid duplicate alerts within 30 seconds
    const recentAlert = this.alerts.find(
      a => a.type === alert.type && Date.now() - a.timestamp < 30000
    );

    if (recentAlert) return;

    this.alerts.push(alert);
    
    // Keep only last 10 alerts
    if (this.alerts.length > 10) {
      this.alerts = this.alerts.slice(-10);
    }

    // Notify alert callbacks
    this.alertCallbacks.forEach(callback => callback(alert));
  }

  // ===== PUBLIC METHODS =====

  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.updateMetrics();
    }, MONITORING_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getMetrics(): MemoryMetrics | null {
    return this.metrics;
  }

  getAlerts(): MemoryAlert[] {
    return [...this.alerts];
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  onMetricsUpdate(callback: (metrics: MemoryMetrics) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  onAlert(callback: (alert: MemoryAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  // Force garbage collection if available (Chrome DevTools)
  forceGC(): void {
    if ('gc' in window && typeof (window as Window & { gc?: () => void }).gc === 'function') {
      (window as Window & { gc: () => void }).gc();
    }
  }

  // Get formatted memory usage string
  getFormattedUsage(): string {
    if (!this.metrics) return 'Memory monitoring not available';

    const { current } = this.metrics;
    const usedMB = Math.round(current.usedJSHeapSize / 1024 / 1024);
    const totalMB = Math.round(current.totalJSHeapSize / 1024 / 1024);
    const limitMB = Math.round(current.jsHeapSizeLimit / 1024 / 1024);

    return `${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`;
  }
}

// ===== SINGLETON INSTANCE =====

export const memoryMonitor = new MemoryMonitor();

// ===== REACT HOOKS =====

export function useMemoryMonitor() {
  const [metrics, setMetrics] = React.useState<MemoryMetrics | null>(null);
  const [alerts, setAlerts] = React.useState<MemoryAlert[]>([]);

  React.useEffect(() => {
    // Start monitoring
    memoryMonitor.start();

    // Subscribe to updates
    const unsubscribeMetrics = memoryMonitor.onMetricsUpdate(setMetrics);
    const unsubscribeAlerts = memoryMonitor.onAlert((alert) => {
      setAlerts(prev => [...prev, alert]);
    });

    // Initial state
    setMetrics(memoryMonitor.getMetrics());
    setAlerts(memoryMonitor.getAlerts());

    return () => {
      unsubscribeMetrics();
      unsubscribeAlerts();
      memoryMonitor.stop();
    };
  }, []);

  return {
    metrics,
    alerts,
    clearAlerts: () => {
      memoryMonitor.clearAlerts();
      setAlerts([]);
    },
    forceGC: memoryMonitor.forceGC,
    getFormattedUsage: memoryMonitor.getFormattedUsage,
  };
}

// ===== EXPORTS =====

export type { MemoryInfo, MemoryMetrics, MemoryAlert };
export { MEMORY_WARNING_THRESHOLD, MEMORY_CRITICAL_THRESHOLD };
