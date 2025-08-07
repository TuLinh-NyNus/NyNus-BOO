/**
 * useDashboardData Hook
 * Hook cho dashboard data management với comprehensive analytics integration
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

import { AdminAnalyticsService } from "../lib/api/services/admin.api";
import { useErrorHandler } from "../lib/hooks/use-error-handler";
import { useAdminErrorContext } from "../lib/error-handling/error-context";
import { adminCacheService } from "../lib/api/services/cache.service";

/**
 * Dashboard metrics interface
 * Interface metrics dashboard
 */
interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  sessions: {
    total: number;
    active: number;
    averageDuration: number;
    bounceRate: number;
  };
  security: {
    events: number;
    alerts: number;
    blockedIPs: number;
    riskScore: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    performance: number;
  };
}

/**
 * Dashboard data state
 * State dữ liệu dashboard
 */
interface DashboardDataState {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refreshCount: number;
}

/**
 * Dashboard data options
 * Tùy chọn dashboard data
 */
interface UseDashboardDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableCaching?: boolean;
  onError?: (error: any) => void;
  onSuccess?: (data: DashboardMetrics) => void;
}

/**
 * useDashboardData Hook
 * Hook chính cho dashboard data management
 */
export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableCaching = true,
    onError,
    onSuccess,
  } = options;

  const [state, setState] = useState<DashboardDataState>({
    metrics: null,
    isLoading: true,
    isRefreshing: false,
    lastUpdated: null,
    error: null,
    refreshCount: 0,
  });

  const { handleError } = useErrorHandler({
    showToast: true,
    context: {
      component: "Dashboard",
      action: "DATA_FETCH",
    },
  });

  const analyticsService = useRef(new AdminAnalyticsService());
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  /**
   * Fetch dashboard metrics
   * Lấy metrics dashboard
   */
  const fetchDashboardMetrics = useCallback(
    async (isRefresh = false): Promise<void> => {
      if (isUnmountedRef.current) return;

      try {
        setState((prev) => ({
          ...prev,
          isLoading: !isRefresh,
          isRefreshing: isRefresh,
          error: null,
        }));

        let metrics: DashboardMetrics;

        // Try to get from cache first if enabled
        if (enableCaching && !isRefresh) {
          const cachedData =
            adminCacheService.cacheManager.get<DashboardMetrics>("dashboard_metrics");
          if (cachedData) {
            metrics = cachedData;
          } else {
            metrics = await analyticsService.current.getDashboardMetrics();
            // Cache for 5 minutes
            adminCacheService.cacheManager.set("dashboard_metrics", metrics, 300);
          }
        } else {
          metrics = await analyticsService.current.getDashboardMetrics();
          if (enableCaching) {
            // Update cache
            adminCacheService.cacheManager.set("dashboard_metrics", metrics, 300);
          }
        }

        if (isUnmountedRef.current) return;

        setState((prev) => ({
          ...prev,
          metrics,
          isLoading: false,
          isRefreshing: false,
          lastUpdated: new Date(),
          error: null,
          refreshCount: prev.refreshCount + 1,
        }));

        // Call success callback
        if (onSuccess) {
          onSuccess(metrics);
        }

        // Show success toast for manual refresh
        if (isRefresh) {
          toast.success("Dashboard đã được cập nhật!");
        }
      } catch (error) {
        if (isUnmountedRef.current) return;

        console.error("Failed to fetch dashboard metrics:", error);

        const errorMessage =
          error instanceof Error ? error.message : "Không thể tải dữ liệu dashboard";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: errorMessage,
        }));

        // Handle error through global error handler
        await handleError(error, {
          action: "FETCH_DASHBOARD_METRICS",
          resource: "DASHBOARD_DATA",
          isRefresh,
        });

        // Call error callback
        if (onError) {
          onError(error);
        }
      }
    },
    [enableCaching, onSuccess, onError, handleError]
  );

  /**
   * Manual refresh dashboard data
   * Refresh thủ công dữ liệu dashboard
   */
  const refreshData = useCallback(async (): Promise<void> => {
    await fetchDashboardMetrics(true);
  }, [fetchDashboardMetrics]);

  /**
   * Clear dashboard data
   * Xóa dữ liệu dashboard
   */
  const clearData = useCallback((): void => {
    setState({
      metrics: null,
      isLoading: false,
      isRefreshing: false,
      lastUpdated: null,
      error: null,
      refreshCount: 0,
    });

    // Clear cache
    if (enableCaching) {
      adminCacheService.cacheManager.delete("dashboard_metrics");
    }
  }, [enableCaching]);

  /**
   * Retry failed data fetch
   * Thử lại fetch data thất bại
   */
  const retryFetch = useCallback(async (): Promise<void> => {
    await fetchDashboardMetrics(false);
  }, [fetchDashboardMetrics]);

  /**
   * Setup auto-refresh
   * Thiết lập auto-refresh
   */
  const setupAutoRefresh = useCallback(() => {
    if (!autoRefresh || refreshTimeoutRef.current) return;

    const scheduleNextRefresh = () => {
      refreshTimeoutRef.current = setTimeout(async () => {
        if (!isUnmountedRef.current) {
          // Call fetchDashboardMetrics directly to avoid dependency issues
          try {
            setState((prev) => ({
              ...prev,
              isRefreshing: true,
              error: null,
            }));

            const metrics = await analyticsService.current.getDashboardMetrics();

            if (!isUnmountedRef.current) {
              setState((prev) => ({
                ...prev,
                metrics,
                isLoading: false,
                isRefreshing: false,
                lastUpdated: new Date(),
                refreshCount: prev.refreshCount + 1,
              }));

              if (enableCaching) {
                adminCacheService.cacheManager.set("dashboard_metrics", metrics, 300);
              }
            }
          } catch (error) {
            if (!isUnmountedRef.current) {
              setState((prev) => ({
                ...prev,
                isLoading: false,
                isRefreshing: false,
                error: error instanceof Error ? error.message : "Không thể tải dữ liệu dashboard",
              }));
            }
          }

          scheduleNextRefresh();
        }
      }, refreshInterval);
    };

    scheduleNextRefresh();
  }, [autoRefresh, refreshInterval, enableCaching]);

  /**
   * Clear auto-refresh
   * Xóa auto-refresh
   */
  const clearAutoRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  /**
   * Get formatted metrics for display
   * Lấy metrics đã format để hiển thị
   */
  const getFormattedMetrics = useCallback(() => {
    if (!state.metrics) return null;

    return {
      users: {
        ...state.metrics.users,
        totalFormatted: state.metrics.users.total.toLocaleString(),
        activeFormatted: state.metrics.users.active.toLocaleString(),
        growthFormatted: `${state.metrics.users.growth > 0 ? "+" : ""}${state.metrics.users.growth.toFixed(1)}%`,
      },
      sessions: {
        ...state.metrics.sessions,
        totalFormatted: state.metrics.sessions.total.toLocaleString(),
        activeFormatted: state.metrics.sessions.active.toLocaleString(),
        durationFormatted: `${Math.round(state.metrics.sessions.averageDuration / 60)}m`,
        bounceRateFormatted: `${state.metrics.sessions.bounceRate.toFixed(1)}%`,
      },
      security: {
        ...state.metrics.security,
        eventsFormatted: state.metrics.security.events.toLocaleString(),
        alertsFormatted: state.metrics.security.alerts.toLocaleString(),
        riskScoreFormatted: `${state.metrics.security.riskScore}/100`,
      },
      system: {
        ...state.metrics.system,
        uptimeFormatted: `${(state.metrics.system.uptime * 100).toFixed(2)}%`,
        responseTimeFormatted: `${state.metrics.system.responseTime}ms`,
        errorRateFormatted: `${(state.metrics.system.errorRate * 100).toFixed(2)}%`,
        performanceFormatted: `${state.metrics.system.performance}/100`,
      },
    };
  }, [state.metrics]);

  /**
   * Get dashboard status
   * Lấy trạng thái dashboard
   */
  const getDashboardStatus = useCallback(() => {
    if (state.error) return "error";
    if (state.isLoading) return "loading";
    if (state.isRefreshing) return "refreshing";
    if (state.metrics) return "success";
    return "idle";
  }, [state.error, state.isLoading, state.isRefreshing, state.metrics]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardMetrics(false);
  }, []); // Empty dependency array to run only once on mount

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && state.metrics && !state.error) {
      setupAutoRefresh();
    }

    return () => {
      clearAutoRefresh();
    };
  }, [autoRefresh, state.metrics, state.error, setupAutoRefresh, clearAutoRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      clearAutoRefresh();
    };
  }, [clearAutoRefresh]);

  return {
    // Data state
    metrics: state.metrics,
    formattedMetrics: getFormattedMetrics(),
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    lastUpdated: state.lastUpdated,
    error: state.error,
    refreshCount: state.refreshCount,

    // Status
    status: getDashboardStatus(),
    hasData: !!state.metrics,
    hasError: !!state.error,

    // Actions
    refreshData,
    clearData,
    retryFetch,

    // Auto-refresh control
    setupAutoRefresh,
    clearAutoRefresh,
  };
}
