/**
 * useRealtimeDashboard Hook
 * Hook cho real-time dashboard updates với WebSocket integration
 */

import { useEffect, useCallback, useState, useRef } from "react";
import { toast } from "sonner";

import { useWebSocket } from "../components/websocket/websocket-provider";
import { useWebSocketEvents } from "./use-websocket-events";
import {
  SystemMetricsEvent,
  UserActivityEvent,
  DashboardUpdateEvent,
} from "../lib/websocket/websocket-types";
import { AdminAnalyticsService } from "../lib/api/services/admin.api";

/**
 * Dashboard metrics interface
 * Interface cho dashboard metrics
 */
export interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
    totalFormatted: string;
    activeFormatted: string;
    growthFormatted: string;
  };
  sessions: {
    total: number;
    active: number;
    averageDuration: number;
    bounceRate: number;
    totalFormatted: string;
    activeFormatted: string;
    durationFormatted: string;
    bounceRateFormatted: string;
  };
  security: {
    events: number;
    alerts: number;
    blockedIPs: number;
    riskScore: number;
    eventsFormatted: string;
    alertsFormatted: string;
    blockedIPsFormatted: string;
    riskScoreFormatted: string;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    performance: number;
    uptimeFormatted: string;
    responseTimeFormatted: string;
    errorRateFormatted: string;
    performanceFormatted: string;
  };
  lastUpdated: Date;
}

/**
 * Real-time update interface
 * Interface cho real-time updates
 */
interface RealtimeUpdate {
  type: "user_activity" | "system_metrics" | "dashboard_update";
  data: any;
  timestamp: Date;
  processed: boolean;
}

/**
 * Hook options interface
 * Interface cho hook options
 */
interface UseRealtimeDashboardOptions {
  enableRealTimeUpdates?: boolean;
  updateInterval?: number;
  enableSmoothing?: boolean;
  smoothingDuration?: number;
  enableConflictResolution?: boolean;
  maxPendingUpdates?: number;
}

/**
 * Hook return interface
 * Interface cho hook return
 */
interface UseRealtimeDashboardReturn {
  // Dashboard data
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Real-time status
  isRealTimeEnabled: boolean;
  pendingUpdates: number;
  updateRate: number;

  // Actions
  refreshMetrics: () => Promise<void>;
  enableRealTime: () => void;
  disableRealTime: () => void;
  clearError: () => void;

  // Utility
  getMetricTrend: (metricPath: string) => "up" | "down" | "stable";
  getUpdateHistory: () => RealtimeUpdate[];
}

/**
 * Default dashboard metrics
 * Metrics mặc định cho dashboard
 */
const DEFAULT_METRICS: DashboardMetrics = {
  users: {
    total: 0,
    active: 0,
    newToday: 0,
    growth: 0,
    totalFormatted: "0",
    activeFormatted: "0",
    growthFormatted: "0%",
  },
  sessions: {
    total: 0,
    active: 0,
    averageDuration: 0,
    bounceRate: 0,
    totalFormatted: "0",
    activeFormatted: "0",
    durationFormatted: "0m",
    bounceRateFormatted: "0%",
  },
  security: {
    events: 0,
    alerts: 0,
    blockedIPs: 0,
    riskScore: 0,
    eventsFormatted: "0",
    alertsFormatted: "0",
    blockedIPsFormatted: "0",
    riskScoreFormatted: "Low",
  },
  system: {
    uptime: 100,
    responseTime: 0,
    errorRate: 0,
    performance: 100,
    uptimeFormatted: "100%",
    responseTimeFormatted: "0ms",
    errorRateFormatted: "0%",
    performanceFormatted: "Excellent",
  },
  lastUpdated: new Date(),
};

/**
 * Main useRealtimeDashboard hook
 * Hook chính cho real-time dashboard
 */
export function useRealtimeDashboard(
  options: UseRealtimeDashboardOptions = {}
): UseRealtimeDashboardReturn {
  const {
    enableRealTimeUpdates = true,
    updateInterval = 30000, // 30 seconds
    enableSmoothing = true,
    smoothingDuration = 1000, // 1 second
    enableConflictResolution = true,
    maxPendingUpdates = 10,
  } = options;

  // WebSocket connection
  const webSocket = useWebSocket();

  // State management
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(enableRealTimeUpdates);
  const [pendingUpdates, setPendingUpdates] = useState(0);
  const [updateRate, setUpdateRate] = useState(0);

  // Update tracking
  const updateHistory = useRef<RealtimeUpdate[]>([]);
  const updateQueue = useRef<RealtimeUpdate[]>([]);
  const processingRef = useRef(false);
  const updateTimestamps = useRef<Date[]>([]);

  /**
   * WebSocket events handling
   * Xử lý WebSocket events
   */
  const { statistics } = useWebSocketEvents({
    enableNotifications: false, // Dashboard updates don't need notifications
    enableEventLogging: true,
    eventHandlers: {
      onUserActivity: handleUserActivity,
      onSystemMetrics: handleSystemMetrics,
      onDashboardUpdate: handleDashboardUpdate,
    },
  });

  /**
   * Handle user activity events
   * Xử lý user activity events
   */
  function handleUserActivity(event: UserActivityEvent) {
    if (!isRealTimeEnabled) return;

    const update: RealtimeUpdate = {
      type: "user_activity",
      data: event,
      timestamp: new Date(),
      processed: false,
    };

    queueUpdate(update);
  }

  /**
   * Handle system metrics events
   * Xử lý system metrics events
   */
  function handleSystemMetrics(event: SystemMetricsEvent) {
    if (!isRealTimeEnabled) return;

    const update: RealtimeUpdate = {
      type: "system_metrics",
      data: event,
      timestamp: new Date(),
      processed: false,
    };

    queueUpdate(update);
  }

  /**
   * Handle dashboard update events
   * Xử lý dashboard update events
   */
  function handleDashboardUpdate(event: DashboardUpdateEvent) {
    if (!isRealTimeEnabled) return;

    const update: RealtimeUpdate = {
      type: "dashboard_update",
      data: event.data,
      timestamp: new Date(),
      processed: false,
    };

    queueUpdate(update);
  }

  /**
   * Queue update for processing
   * Queue update để xử lý
   */
  const queueUpdate = useCallback(
    (update: RealtimeUpdate) => {
      updateQueue.current.push(update);
      setPendingUpdates(updateQueue.current.length);

      // Limit queue size
      if (updateQueue.current.length > maxPendingUpdates) {
        updateQueue.current = updateQueue.current.slice(-maxPendingUpdates);
      }

      // Process queue if not already processing
      if (!processingRef.current) {
        processUpdateQueue();
      }
    },
    [maxPendingUpdates]
  );

  /**
   * Process update queue
   * Xử lý update queue
   */
  const processUpdateQueue = useCallback(async () => {
    if (processingRef.current || updateQueue.current.length === 0) return;

    processingRef.current = true;

    try {
      const updates = [...updateQueue.current];
      updateQueue.current = [];
      setPendingUpdates(0);

      // Process updates in batch
      await processBatchUpdates(updates);

      // Update rate tracking
      const now = new Date();
      updateTimestamps.current.push(now);

      // Keep only last minute of timestamps
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      updateTimestamps.current = updateTimestamps.current.filter(
        (timestamp) => timestamp > oneMinuteAgo
      );

      setUpdateRate(updateTimestamps.current.length);
    } catch (error) {
      console.error("Failed to process updates:", error);
      setError(error instanceof Error ? error.message : "Failed to process updates");
    } finally {
      processingRef.current = false;
    }
  }, []);

  /**
   * Process batch updates
   * Xử lý batch updates
   */
  const processBatchUpdates = useCallback(
    async (updates: RealtimeUpdate[]) => {
      if (!metrics) return;

      let updatedMetrics = { ...metrics };
      let hasChanges = false;

      for (const update of updates) {
        try {
          const result = applyUpdate(updatedMetrics, update);
          if (result) {
            updatedMetrics = result;
            hasChanges = true;
          }

          // Add to history
          updateHistory.current.push({ ...update, processed: true });

          // Limit history size
          if (updateHistory.current.length > 100) {
            updateHistory.current = updateHistory.current.slice(-100);
          }
        } catch (error) {
          console.error("Failed to apply update:", error);
        }
      }

      if (hasChanges) {
        // Apply smoothing if enabled
        if (enableSmoothing) {
          await smoothMetricsTransition(metrics, updatedMetrics);
        } else {
          setMetrics(updatedMetrics);
          setLastUpdated(new Date());
        }
      }
    },
    [metrics, enableSmoothing]
  );

  /**
   * Apply single update to metrics
   * Áp dụng single update vào metrics
   */
  const applyUpdate = useCallback(
    (currentMetrics: DashboardMetrics, update: RealtimeUpdate): DashboardMetrics | null => {
      switch (update.type) {
        case "user_activity":
          return applyUserActivityUpdate(currentMetrics, update.data);
        case "system_metrics":
          return applySystemMetricsUpdate(currentMetrics, update.data);
        case "dashboard_update":
          return applyDashboardUpdate(currentMetrics, update.data);
        default:
          return null;
      }
    },
    []
  );

  /**
   * Apply user activity update
   * Áp dụng user activity update
   */
  const applyUserActivityUpdate = useCallback(
    (currentMetrics: DashboardMetrics, data: UserActivityEvent): DashboardMetrics => {
      const updated = { ...currentMetrics };

      // Update user metrics based on activity type
      switch (data.activityType) {
        case "LOGIN":
          updated.users.active += 1;
          updated.sessions.active += 1;
          break;
        case "LOGOUT":
          updated.sessions.active = Math.max(0, updated.sessions.active - 1);
          break;
      }

      // Reformat values
      updated.users.activeFormatted = formatNumber(updated.users.active);
      updated.sessions.activeFormatted = formatNumber(updated.sessions.active);
      updated.lastUpdated = new Date();

      return updated;
    },
    []
  );

  /**
   * Apply system metrics update
   * Áp dụng system metrics update
   */
  const applySystemMetricsUpdate = useCallback(
    (currentMetrics: DashboardMetrics, data: SystemMetricsEvent): DashboardMetrics => {
      const updated = { ...currentMetrics };

      // Update system metrics based on metric type
      switch (data.metricType) {
        case "API_RESPONSE_TIME":
          updated.system.responseTime = data.value;
          updated.system.responseTimeFormatted = `${data.value}ms`;
          break;
        case "CPU_USAGE":
        case "MEMORY_USAGE":
          // Update system performance indicators
          updated.system.performance = Math.max(0, 100 - data.value);
          updated.system.performanceFormatted =
            updated.system.performance > 80
              ? "Excellent"
              : updated.system.performance > 60
                ? "Good"
                : updated.system.performance > 40
                  ? "Fair"
                  : "Poor";
          break;
      }

      updated.lastUpdated = new Date();
      return updated;
    },
    []
  );

  /**
   * Apply dashboard update
   * Áp dụng dashboard update
   */
  const applyDashboardUpdate = useCallback(
    (currentMetrics: DashboardMetrics, data: any): DashboardMetrics => {
      const updated = { ...currentMetrics };

      // Merge dashboard data
      if (data.users) {
        Object.assign(updated.users, data.users);
      }
      if (data.sessions) {
        Object.assign(updated.sessions, data.sessions);
      }
      if (data.security) {
        Object.assign(updated.security, data.security);
      }
      if (data.system) {
        Object.assign(updated.system, data.system);
      }

      updated.lastUpdated = new Date();
      return updated;
    },
    []
  );

  /**
   * Smooth metrics transition
   * Smooth transition cho metrics
   */
  const smoothMetricsTransition = useCallback(
    async (from: DashboardMetrics, to: DashboardMetrics) => {
      // Simple implementation - could be enhanced with animation
      setMetrics(to);
      setLastUpdated(new Date());
    },
    []
  );

  /**
   * Format number for display
   * Format số để hiển thị
   */
  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }, []);

  /**
   * Refresh metrics manually
   * Refresh metrics thủ công
   */
  const refreshMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use AdminAnalyticsService để fetch real data
      const analyticsService = new AdminAnalyticsService();
      const dashboardMetrics = await analyticsService.getDashboardMetrics();

      // Format metrics cho UI display
      const formattedMetrics: DashboardMetrics = {
        users: {
          total: dashboardMetrics.users.total,
          active: dashboardMetrics.users.active,
          newToday: dashboardMetrics.users.newToday,
          growth: dashboardMetrics.users.growth,
          totalFormatted: dashboardMetrics.users.total.toLocaleString(),
          activeFormatted: dashboardMetrics.users.active.toLocaleString(),
          growthFormatted: `${dashboardMetrics.users.growth > 0 ? "+" : ""}${dashboardMetrics.users.growth}%`,
        },
        sessions: {
          total: dashboardMetrics.sessions.total,
          active: dashboardMetrics.sessions.active,
          averageDuration: dashboardMetrics.sessions.averageDuration,
          bounceRate: dashboardMetrics.sessions.bounceRate,
          totalFormatted: dashboardMetrics.sessions.total.toLocaleString(),
          activeFormatted: dashboardMetrics.sessions.active.toLocaleString(),
          durationFormatted: `${dashboardMetrics.sessions.averageDuration}m`,
          bounceRateFormatted: `${dashboardMetrics.sessions.bounceRate}%`,
        },
        security: {
          events: dashboardMetrics.security.events,
          alerts: dashboardMetrics.security.alerts,
          blockedIPs: dashboardMetrics.security.blockedIPs,
          riskScore: dashboardMetrics.security.riskScore,
          eventsFormatted: dashboardMetrics.security.events.toLocaleString(),
          alertsFormatted: dashboardMetrics.security.alerts.toLocaleString(),
          blockedIPsFormatted: dashboardMetrics.security.blockedIPs.toLocaleString(),
          riskScoreFormatted:
            dashboardMetrics.security.riskScore < 30
              ? "Low"
              : dashboardMetrics.security.riskScore < 70
                ? "Medium"
                : "High",
        },
        system: {
          uptime: dashboardMetrics.system.uptime,
          responseTime: dashboardMetrics.system.responseTime,
          errorRate: dashboardMetrics.system.errorRate,
          performance: dashboardMetrics.system.performance,
          uptimeFormatted: `${dashboardMetrics.system.uptime.toFixed(1)}%`,
          responseTimeFormatted: `${dashboardMetrics.system.responseTime}ms`,
          errorRateFormatted: `${dashboardMetrics.system.errorRate.toFixed(1)}%`,
          performanceFormatted:
            dashboardMetrics.system.performance >= 90
              ? "Excellent"
              : dashboardMetrics.system.performance >= 70
                ? "Good"
                : "Poor",
        },
        lastUpdated: new Date(),
      };

      setMetrics(formattedMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing dashboard metrics:", error);
      setError(error instanceof Error ? error.message : "Failed to refresh metrics");

      // Fallback to default metrics on error
      setMetrics(DEFAULT_METRICS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Enable real-time updates
   * Bật real-time updates
   */
  const enableRealTime = useCallback(() => {
    setIsRealTimeEnabled(true);
  }, []);

  /**
   * Disable real-time updates
   * Tắt real-time updates
   */
  const disableRealTime = useCallback(() => {
    setIsRealTimeEnabled(false);
    updateQueue.current = [];
    setPendingUpdates(0);
  }, []);

  /**
   * Clear error state
   * Xóa error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get metric trend
   * Lấy trend của metric
   */
  const getMetricTrend = useCallback((metricPath: string): "up" | "down" | "stable" => {
    // Simple implementation - could be enhanced with historical data
    return "stable";
  }, []);

  /**
   * Get update history
   * Lấy update history
   */
  const getUpdateHistory = useCallback((): RealtimeUpdate[] => {
    return [...updateHistory.current];
  }, []);

  /**
   * Initialize dashboard
   * Khởi tạo dashboard
   */
  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  /**
   * Setup periodic refresh
   * Thiết lập refresh định kỳ
   */
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      if (updateQueue.current.length === 0) {
        // Refresh if no real-time updates
        refreshMetrics();
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, updateInterval, refreshMetrics]);

  return {
    // Dashboard data
    metrics,
    isLoading,
    error,
    lastUpdated,

    // Real-time status
    isRealTimeEnabled,
    pendingUpdates,
    updateRate,

    // Actions
    refreshMetrics,
    enableRealTime,
    disableRealTime,
    clearError,

    // Utility
    getMetricTrend,
    getUpdateHistory,
  };
}
