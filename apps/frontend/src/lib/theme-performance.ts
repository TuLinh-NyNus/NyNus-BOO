/**
 * Theme Performance Monitor
 * Tracks theme switching performance and CSS loading metrics
 */

interface ThemePerformanceMetrics {
  themeChangeStartTime: number;
  themeChangeEndTime: number;
  cssLoadTime: number;
  hydrationTime: number;
  renderTime: number;
}

interface ThemePerformanceEntry {
  theme: string;
  timestamp: number;
  metrics: Partial<ThemePerformanceMetrics>;
  userAgent?: string;
}

interface LayoutShift extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

class ThemePerformanceMonitor {
  private entries: ThemePerformanceEntry[] = [];
  private currentMetrics: Partial<ThemePerformanceMetrics> = {};
  private enabled: boolean = false;

  constructor() {
    // Only enable in development or when explicitly enabled
    this.enabled = process.env.NODE_ENV === 'development' || 
                   (typeof window !== 'undefined' && window.localStorage.getItem('theme-perf-monitor') === 'true');
  }

  /**
   * Start tracking theme change performance
   */
  startThemeChange(_theme: string): void {
    if (!this.enabled) return;

    this.currentMetrics = {
      themeChangeStartTime: performance.now(),
    };
  }

  /**
   * End tracking theme change performance
   */
  endThemeChange(theme: string): void {
    if (!this.enabled || !this.currentMetrics.themeChangeStartTime) return;

    const endTime = performance.now();
    const entry: ThemePerformanceEntry = {
      theme,
      timestamp: Date.now(),
      metrics: {
        ...this.currentMetrics,
        themeChangeEndTime: endTime,
        renderTime: endTime - this.currentMetrics.themeChangeStartTime!,
      },
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    this.entries.push(entry);
    this.currentMetrics = {};

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Theme Performance] Changed to ${theme}:`, {
        duration: `${entry.metrics.renderTime?.toFixed(2)}ms`,
        timestamp: new Date(entry.timestamp).toISOString(),
      });
    }
  }

  /**
   * Track CSS loading performance
   */
  trackCSSLoad(loadTime: number): void {
    if (!this.enabled) return;

    this.currentMetrics.cssLoadTime = loadTime;
  }

  /**
   * Track hydration performance
   */
  trackHydration(hydrationTime: number): void {
    if (!this.enabled) return;

    this.currentMetrics.hydrationTime = hydrationTime;
  }

  /**
   * Get performance statistics
   */
  getStats() {
    if (!this.enabled) return null;

    const entries = this.entries.filter(e => e.metrics.renderTime !== undefined);
    if (entries.length === 0) return null;

    const renderTimes = entries.map(e => e.metrics.renderTime!);
    const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);

    return {
      totalThemeChanges: entries.length,
      avgRenderTime: Number(avgRenderTime.toFixed(2)),
      maxRenderTime: Number(maxRenderTime.toFixed(2)),
      minRenderTime: Number(minRenderTime.toFixed(2)),
      recentEntries: entries.slice(-5), // Last 5 entries
    };
  }

  /**
   * Export performance data for analysis
   */
  exportData(): string {
    if (!this.enabled) return JSON.stringify([]);

    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Clear performance data
   */
  clearData(): void {
    this.entries = [];
    this.currentMetrics = {};
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      if (enabled) {
        window.localStorage.setItem('theme-perf-monitor', 'true');
      } else {
        window.localStorage.removeItem('theme-perf-monitor');
      }
    }
  }
}

/**
 * Global theme performance monitor instance
 */
export const themePerformanceMonitor = new ThemePerformanceMonitor();

/**
 * React hook for theme performance monitoring
 */
export function useThemePerformance() {
  const startThemeChange = (theme: string) => {
    themePerformanceMonitor.startThemeChange(theme);
  };

  const endThemeChange = (theme: string) => {
    themePerformanceMonitor.endThemeChange(theme);
  };

  const getStats = () => {
    return themePerformanceMonitor.getStats();
  };

  return {
    startThemeChange,
    endThemeChange,
    getStats,
  };
}

/**
 * Performance measurement utilities
 */
export class PerformanceUtils {
  /**
   * Measure CSS loading time
   */
  static measureCSSLoad(cssFile: string): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssFile;
      
      link.onload = () => {
        const loadTime = performance.now() - startTime;
        resolve(loadTime);
      };
      
      link.onerror = () => {
        resolve(-1); // Error loading
      };
      
      document.head.appendChild(link);
    });
  }

  /**
   * Measure render performance
   */
  static measureRender(callback: () => void): number {
    const startTime = performance.now();
    callback();
    return performance.now() - startTime;
  }

  /**
   * Get Web Vitals related to theme changes
   */
  static getThemeVitals() {
    if (typeof window === 'undefined') return null;

    // Measure Cumulative Layout Shift (CLS) after theme change
    const getCLS = () => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as LayoutShift).hadRecentInput) {
              clsValue += (entry as LayoutShift).value;
            }
          }
          resolve(clsValue);
        }).observe({ type: 'layout-shift', buffered: true });

        // Resolve after 1 second if no layout shifts
        setTimeout(() => resolve(0), 1000);
      });
    };

    return {
      getCLS,
    };
  }
}
