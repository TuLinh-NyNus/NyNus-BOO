/**
 * usePerformanceMonitoring Hook
 * Hook cho performance monitoring functionality
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DatabasePerformanceMetrics,
  APIPerformanceMetrics,
  SystemResourceMetrics,
  PerformanceAlertInstance,
  PerformanceMetric,
  PerformanceMetricType,
  PerformanceMonitoringState,
  DEFAULT_PERFORMANCE_CONFIG,
} from "../types/performance-monitoring";
import { PerformanceMetricsService } from "../services/performance-metrics.service";

/**
 * Performance monitoring hook
 * Hook cho performance monitoring
 */
export function usePerformanceMonitoring() {
  const [state, setState] = useState<PerformanceMonitoringState>({
    isLoading: false,
    error: null,
    lastUpdated: null,
    databaseMetrics: null,
    apiMetrics: null,
    systemMetrics: null,
    activeAlerts: [],
    alertHistory: [],
    currentBenchmark: null,
    benchmarkHistory: [],
    config: DEFAULT_PERFORMANCE_CONFIG,
  });

  const metricsService = useRef(PerformanceMetricsService.getInstance());
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load all performance metrics
   * Tải tất cả performance metrics
   */
  const loadMetrics = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [databaseMetrics, apiMetrics, systemMetrics] = await Promise.all([
        metricsService.current.getDatabaseMetrics(),
        metricsService.current.getAPIMetrics(),
        metricsService.current.getSystemMetrics(),
      ]);

      const activeAlerts = metricsService.current.getActiveAlerts();

      setState((prev) => ({
        ...prev,
        isLoading: false,
        databaseMetrics,
        apiMetrics,
        systemMetrics,
        activeAlerts,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load performance metrics",
      }));
    }
  }, []);

  /**
   * Load database metrics only
   * Tải chỉ database metrics
   */
  const loadDatabaseMetrics = useCallback(async () => {
    try {
      const databaseMetrics = await metricsService.current.getDatabaseMetrics();
      setState((prev) => ({
        ...prev,
        databaseMetrics,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      console.error("Failed to load database metrics:", error);
    }
  }, []);

  /**
   * Load API metrics only
   * Tải chỉ API metrics
   */
  const loadAPIMetrics = useCallback(async () => {
    try {
      const apiMetrics = await metricsService.current.getAPIMetrics();
      setState((prev) => ({
        ...prev,
        apiMetrics,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      console.error("Failed to load API metrics:", error);
    }
  }, []);

  /**
   * Load system metrics only
   * Tải chỉ system metrics
   */
  const loadSystemMetrics = useCallback(async () => {
    try {
      const systemMetrics = await metricsService.current.getSystemMetrics();
      setState((prev) => ({
        ...prev,
        systemMetrics,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      console.error("Failed to load system metrics:", error);
    }
  }, []);

  /**
   * Get recent metrics for specific type
   * Lấy metrics gần đây cho loại cụ thể
   */
  const getRecentMetrics = useCallback((type: PerformanceMetricType): PerformanceMetric[] => {
    return metricsService.current.getRecentMetrics(type);
  }, []);

  /**
   * Acknowledge alert
   * Xác nhận alert
   */
  const acknowledgeAlert = useCallback((alertId: string) => {
    setState((prev) => ({
      ...prev,
      activeAlerts: prev.activeAlerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, status: "ACKNOWLEDGED", acknowledgedAt: new Date() }
          : alert
      ),
    }));
  }, []);

  /**
   * Resolve alert
   * Giải quyết alert
   */
  const resolveAlert = useCallback((alertId: string) => {
    setState((prev) => ({
      ...prev,
      activeAlerts: prev.activeAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, status: "RESOLVED", resolvedAt: new Date() } : alert
      ),
    }));
  }, []);

  /**
   * Start real-time monitoring
   * Bắt đầu monitoring real-time
   */
  const startMonitoring = useCallback(() => {
    if (refreshInterval.current) return;

    // Start metrics collection service
    metricsService.current.startCollection();

    // Set up periodic refresh
    refreshInterval.current = setInterval(() => {
      if (state.config.enableRealTimeUpdates) {
        loadMetrics();
      }
    }, state.config.dashboardRefreshRate * 1000);

    // Initial load
    loadMetrics();
  }, [loadMetrics, state.config.enableRealTimeUpdates, state.config.dashboardRefreshRate]);

  /**
   * Stop real-time monitoring
   * Dừng monitoring real-time
   */
  const stopMonitoring = useCallback(() => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }

    // Stop metrics collection service
    metricsService.current.stopCollection();
  }, []);

  /**
   * Update monitoring configuration
   * Cập nhật cấu hình monitoring
   */
  const updateConfig = useCallback(
    (newConfig: Partial<typeof DEFAULT_PERFORMANCE_CONFIG>) => {
      setState((prev) => ({
        ...prev,
        config: { ...prev.config, ...newConfig },
      }));

      // Restart monitoring if refresh rate changed
      if (newConfig.dashboardRefreshRate && refreshInterval.current) {
        stopMonitoring();
        startMonitoring();
      }
    },
    [startMonitoring, stopMonitoring]
  );

  /**
   * Get performance summary
   * Lấy tóm tắt performance
   */
  const getPerformanceSummary = useCallback(() => {
    const { databaseMetrics, apiMetrics, systemMetrics, activeAlerts } = state;

    if (!databaseMetrics || !apiMetrics || !systemMetrics) {
      return null;
    }

    const criticalAlerts = activeAlerts.filter((alert) => alert.severity === "CRITICAL").length;
    const warningAlerts = activeAlerts.filter(
      (alert) => alert.severity === "HIGH" || alert.severity === "MEDIUM"
    ).length;

    return {
      database: {
        status: databaseMetrics.queryPerformance.averageQueryTime > 100 ? "WARNING" : "GOOD",
        averageQueryTime: databaseMetrics.queryPerformance.averageQueryTime,
        connectionPoolUsage: databaseMetrics.connectionPool.usage,
      },
      api: {
        status: apiMetrics.responseTime.average > 200 ? "WARNING" : "GOOD",
        averageResponseTime: apiMetrics.responseTime.average,
        errorRate: apiMetrics.errorRate.percentage,
      },
      system: {
        status:
          Math.max(systemMetrics.cpu.usage, systemMetrics.memory.percentage) > 80
            ? "WARNING"
            : "GOOD",
        cpuUsage: systemMetrics.cpu.usage,
        memoryUsage: systemMetrics.memory.percentage,
        diskUsage: systemMetrics.disk.percentage,
      },
      alerts: {
        critical: criticalAlerts,
        warning: warningAlerts,
        total: activeAlerts.length,
      },
    };
  }, [state]);

  /**
   * Check if monitoring is healthy
   * Kiểm tra monitoring có healthy không
   */
  const isHealthy = useCallback(() => {
    const summary = getPerformanceSummary();
    if (!summary) return false;

    return (
      summary.alerts.critical === 0 &&
      summary.database.status === "GOOD" &&
      summary.api.status === "GOOD" &&
      summary.system.status === "GOOD"
    );
  }, [getPerformanceSummary]);

  // Auto-start monitoring on mount
  useEffect(() => {
    if (state.config.isEnabled) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [state.config.isEnabled, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  return {
    // State
    ...state,

    // Actions
    loadMetrics,
    loadDatabaseMetrics,
    loadAPIMetrics,
    loadSystemMetrics,
    getRecentMetrics,
    acknowledgeAlert,
    resolveAlert,
    startMonitoring,
    stopMonitoring,
    updateConfig,

    // Computed values
    getPerformanceSummary,
    isHealthy: isHealthy(),

    // Utils
    refresh: loadMetrics,
  };
}
