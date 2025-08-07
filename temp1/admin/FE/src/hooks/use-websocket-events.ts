/**
 * useWebSocketEvents Hook
 * Hook cho handling WebSocket events với type-safe processing
 */

import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { useWebSocket } from "../components/websocket/websocket-provider";
import {
  SecurityEvent,
  UserActivityEvent,
  SystemMetricsEvent,
  AdminNotificationEvent,
  BulkOperationProgressEvent,
  DashboardUpdateEvent,
} from "../lib/websocket/websocket-types";
import { EVENT_SEVERITY_LEVELS, TOAST_CONFIG } from "../lib/websocket/websocket-constants";

/**
 * Event handlers interface
 * Interface cho event handlers
 */
export interface WebSocketEventHandlers {
  onSecurityEvent?: (event: SecurityEvent) => void;
  onSecurityEventBatch?: (events: SecurityEvent[]) => void;
  onUserActivity?: (event: UserActivityEvent) => void;
  onUserActivityAggregated?: (data: any) => void;
  onUserMetricsUpdate?: (metrics: any) => void;
  onSystemMetrics?: (event: SystemMetricsEvent) => void;
  onAdminNotification?: (event: AdminNotificationEvent) => void;
  onBulkOperationProgress?: (event: BulkOperationProgressEvent) => void;
  onDashboardUpdate?: (event: DashboardUpdateEvent) => void;
}

/**
 * Event statistics interface
 * Interface cho event statistics
 */
export interface EventStatistics {
  totalEvents: number;
  securityEvents: number;
  userActivityEvents: number;
  systemMetricsEvents: number;
  adminNotifications: number;
  bulkOperationEvents: number;
  dashboardUpdates: number;
  lastEventTime?: Date;
  eventsPerMinute: number;
}

/**
 * Hook options interface
 * Interface cho hook options
 */
export interface UseWebSocketEventsOptions {
  enableNotifications?: boolean;
  enableSounds?: boolean;
  enableEventLogging?: boolean;
  maxEventHistory?: number;
  eventHandlers?: WebSocketEventHandlers;
}

/**
 * Hook return interface
 * Interface cho hook return
 */
export interface UseWebSocketEventsReturn {
  // Event statistics
  statistics: EventStatistics;

  // Event history
  recentEvents: Array<{
    id: string;
    type: string;
    event: any;
    timestamp: Date;
  }>;

  // Event handlers
  clearEventHistory: () => void;
  getEventsByType: (type: string) => any[];
  getEventsInTimeRange: (startTime: Date, endTime: Date) => any[];

  // Notification controls
  enableNotifications: () => void;
  disableNotifications: () => void;
  isNotificationsEnabled: boolean;
}

/**
 * Main useWebSocketEvents hook
 * Hook chính cho WebSocket events handling
 */
export function useWebSocketEvents(
  options: UseWebSocketEventsOptions = {}
): UseWebSocketEventsReturn {
  const {
    enableNotifications = true,
    enableSounds = false,
    enableEventLogging = true,
    maxEventHistory = 1000,
    eventHandlers = {},
  } = options;

  const webSocket = useWebSocket();

  // Event statistics state
  const [statistics, setStatistics] = useState<EventStatistics>({
    totalEvents: 0,
    securityEvents: 0,
    userActivityEvents: 0,
    systemMetricsEvents: 0,
    adminNotifications: 0,
    bulkOperationEvents: 0,
    dashboardUpdates: 0,
    eventsPerMinute: 0,
  });

  // Event history state
  const [recentEvents, setRecentEvents] = useState<
    Array<{
      id: string;
      type: string;
      event: any;
      timestamp: Date;
    }>
  >([]);

  // Notification state
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(enableNotifications);

  // Event rate tracking
  const eventTimestamps = useRef<Date[]>([]);

  /**
   * Update event statistics
   * Cập nhật thống kê events
   */
  const updateStatistics = useCallback((eventType: string) => {
    const now = new Date();

    // Add timestamp for rate calculation
    eventTimestamps.current.push(now);

    // Keep only last minute of timestamps
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    eventTimestamps.current = eventTimestamps.current.filter(
      (timestamp) => timestamp > oneMinuteAgo
    );

    setStatistics((prev) => {
      const updated = {
        ...prev,
        totalEvents: prev.totalEvents + 1,
        lastEventTime: now,
        eventsPerMinute: eventTimestamps.current.length,
      };

      // Update specific event type counter
      switch (eventType) {
        case "security_event":
        case "security_event_batch":
          updated.securityEvents = prev.securityEvents + 1;
          break;
        case "user_activity":
        case "user_activity_aggregated":
        case "user_metrics_update":
          updated.userActivityEvents = prev.userActivityEvents + 1;
          break;
        case "system_metrics":
          updated.systemMetricsEvents = prev.systemMetricsEvents + 1;
          break;
        case "admin_notification":
          updated.adminNotifications = prev.adminNotifications + 1;
          break;
        case "bulk_operation_progress":
          updated.bulkOperationEvents = prev.bulkOperationEvents + 1;
          break;
        case "dashboard_update":
          updated.dashboardUpdates = prev.dashboardUpdates + 1;
          break;
      }

      return updated;
    });
  }, []);

  /**
   * Add event to history
   * Thêm event vào history
   */
  const addEventToHistory = useCallback(
    (type: string, event: any) => {
      if (!enableEventLogging) return;

      const eventRecord = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        event,
        timestamp: new Date(),
      };

      setRecentEvents((prev) => {
        const updated = [eventRecord, ...prev];
        return updated.slice(0, maxEventHistory);
      });
    },
    [enableEventLogging, maxEventHistory]
  );

  /**
   * Handle security events
   * Xử lý security events
   */
  const handleSecurityEvent = useCallback(
    (event: SecurityEvent) => {
      updateStatistics("security_event");
      addEventToHistory("security_event", event);

      if (eventHandlers.onSecurityEvent) {
        eventHandlers.onSecurityEvent(event);
      }

      // Show notification if enabled
      if (isNotificationsEnabled) {
        const isCritical = event.severity === EVENT_SEVERITY_LEVELS.CRITICAL;
        const isHigh = event.severity === EVENT_SEVERITY_LEVELS.HIGH;

        if (isCritical || isHigh) {
          const notificationFn = isCritical ? toast.error : toast.warning;

          notificationFn(`Cảnh báo bảo mật: ${event.eventType}`, {
            description: `${event.userEmail || event.userId}: ${event.message}`,
            duration: isCritical ? TOAST_CONFIG.DURATION.CRITICAL : TOAST_CONFIG.DURATION.WARNING,
          });

          // Play sound for critical events
          if (enableSounds && isCritical) {
            playNotificationSound("security-alert");
          }
        }
      }
    },
    [updateStatistics, addEventToHistory, eventHandlers, isNotificationsEnabled, enableSounds]
  );

  /**
   * Handle security event batch
   * Xử lý security event batch
   */
  const handleSecurityEventBatch = useCallback(
    (events: SecurityEvent[]) => {
      updateStatistics("security_event_batch");
      addEventToHistory("security_event_batch", events);

      if (eventHandlers.onSecurityEventBatch) {
        eventHandlers.onSecurityEventBatch(events);
      }

      // Show batch notification if enabled
      if (isNotificationsEnabled && events.length > 0) {
        const criticalCount = events.filter(
          (e) => e.severity === EVENT_SEVERITY_LEVELS.CRITICAL
        ).length;
        const highCount = events.filter((e) => e.severity === EVENT_SEVERITY_LEVELS.HIGH).length;

        if (criticalCount > 0) {
          toast.error(`${criticalCount} cảnh báo bảo mật nghiêm trọng`, {
            description: `${events.length} sự kiện bảo mật mới`,
            duration: TOAST_CONFIG.DURATION.CRITICAL,
          });
        } else if (highCount > 0) {
          toast.warning(`${highCount} cảnh báo bảo mật quan trọng`, {
            description: `${events.length} sự kiện bảo mật mới`,
            duration: TOAST_CONFIG.DURATION.WARNING,
          });
        }
      }
    },
    [updateStatistics, addEventToHistory, eventHandlers, isNotificationsEnabled]
  );

  /**
   * Handle user activity events
   * Xử lý user activity events
   */
  const handleUserActivity = useCallback(
    (event: UserActivityEvent) => {
      updateStatistics("user_activity");
      addEventToHistory("user_activity", event);

      if (eventHandlers.onUserActivity) {
        eventHandlers.onUserActivity(event);
      }

      // Show notification for important activities
      if (isNotificationsEnabled) {
        const importantActivities = ["LOGIN", "LOGOUT", "EXAM_SUBMIT"];

        if (importantActivities.includes(event.activityType)) {
          toast.info(`Hoạt động: ${event.activityType}`, {
            description: `${event.userEmail || event.userId}: ${event.description}`,
            duration: TOAST_CONFIG.DURATION.INFO,
          });
        }
      }
    },
    [updateStatistics, addEventToHistory, eventHandlers, isNotificationsEnabled]
  );

  /**
   * Handle system metrics events
   * Xử lý system metrics events
   */
  const handleSystemMetrics = useCallback(
    (event: SystemMetricsEvent) => {
      updateStatistics("system_metrics");
      addEventToHistory("system_metrics", event);

      if (eventHandlers.onSystemMetrics) {
        eventHandlers.onSystemMetrics(event);
      }

      // Show notification for critical metrics
      if (isNotificationsEnabled && event.status === "CRITICAL") {
        toast.error(`Hệ thống cảnh báo: ${event.metricType}`, {
          description: `Giá trị: ${event.value}${event.unit}`,
          duration: TOAST_CONFIG.DURATION.ERROR,
        });
      }
    },
    [updateStatistics, addEventToHistory, eventHandlers, isNotificationsEnabled]
  );

  /**
   * Handle admin notifications
   * Xử lý admin notifications
   */
  const handleAdminNotification = useCallback(
    (event: AdminNotificationEvent) => {
      updateStatistics("admin_notification");
      addEventToHistory("admin_notification", event);

      if (eventHandlers.onAdminNotification) {
        eventHandlers.onAdminNotification(event);
      }

      // Show notification
      if (isNotificationsEnabled) {
        const duration =
          event.autoHideAfter || TOAST_CONFIG.DURATION[event.type] || TOAST_CONFIG.DURATION.INFO;

        switch (event.type) {
          case "ERROR":
            toast.error(event.title, {
              description: event.message,
              duration,
            });
            break;
          case "WARNING":
            toast.warning(event.title, {
              description: event.message,
              duration,
            });
            break;
          case "SUCCESS":
            toast.success(event.title, {
              description: event.message,
              duration,
            });
            break;
          default:
            toast.info(event.title, {
              description: event.message,
              duration,
            });
        }
      }
    },
    [updateStatistics, addEventToHistory, eventHandlers, isNotificationsEnabled]
  );

  /**
   * Handle bulk operation progress
   * Xử lý bulk operation progress
   */
  const handleBulkOperationProgress = useCallback(
    (event: BulkOperationProgressEvent) => {
      updateStatistics("bulk_operation_progress");
      addEventToHistory("bulk_operation_progress", event);

      if (eventHandlers.onBulkOperationProgress) {
        eventHandlers.onBulkOperationProgress(event);
      }

      // Show notification for completed operations
      if (isNotificationsEnabled) {
        if (event.status === "COMPLETED") {
          toast.success("Thao tác hàng loạt hoàn thành", {
            description: `${event.processedItems}/${event.totalItems} mục đã được xử lý`,
            duration: TOAST_CONFIG.DURATION.SUCCESS,
          });
        } else if (event.status === "FAILED") {
          toast.error("Thao tác hàng loạt thất bại", {
            description: `${event.failedItems} mục thất bại`,
            duration: TOAST_CONFIG.DURATION.ERROR,
          });
        }
      }
    },
    [updateStatistics, addEventToHistory, eventHandlers, isNotificationsEnabled]
  );

  /**
   * Handle dashboard updates
   * Xử lý dashboard updates
   */
  const handleDashboardUpdate = useCallback(
    (event: DashboardUpdateEvent) => {
      updateStatistics("dashboard_update");
      addEventToHistory("dashboard_update", event);

      if (eventHandlers.onDashboardUpdate) {
        eventHandlers.onDashboardUpdate(event);
      }
    },
    [updateStatistics, addEventToHistory, eventHandlers]
  );

  /**
   * Clear event history
   * Xóa event history
   */
  const clearEventHistory = useCallback(() => {
    setRecentEvents([]);
    setStatistics((prev) => ({
      ...prev,
      totalEvents: 0,
      securityEvents: 0,
      userActivityEvents: 0,
      systemMetricsEvents: 0,
      adminNotifications: 0,
      bulkOperationEvents: 0,
      dashboardUpdates: 0,
    }));
    eventTimestamps.current = [];
  }, []);

  /**
   * Get events by type
   * Lấy events theo type
   */
  const getEventsByType = useCallback(
    (type: string) => {
      return recentEvents.filter((event) => event.type === type).map((event) => event.event);
    },
    [recentEvents]
  );

  /**
   * Get events in time range
   * Lấy events trong khoảng thời gian
   */
  const getEventsInTimeRange = useCallback(
    (startTime: Date, endTime: Date) => {
      return recentEvents
        .filter((event) => event.timestamp >= startTime && event.timestamp <= endTime)
        .map((event) => event.event);
    },
    [recentEvents]
  );

  /**
   * Enable notifications
   * Bật notifications
   */
  const enableNotificationsHandler = useCallback(() => {
    setIsNotificationsEnabled(true);
  }, []);

  /**
   * Disable notifications
   * Tắt notifications
   */
  const disableNotificationsHandler = useCallback(() => {
    setIsNotificationsEnabled(false);
  }, []);

  /**
   * Play notification sound
   * Phát âm thanh thông báo
   */
  const playNotificationSound = useCallback(
    (type: string) => {
      if (!enableSounds || typeof window === "undefined") return;

      try {
        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.volume = 0.5;
        audio.play().catch((error) => {
          console.warn("Failed to play notification sound:", error);
        });
      } catch (error) {
        console.warn("Failed to create audio element:", error);
      }
    },
    [enableSounds]
  );

  /**
   * Setup event listeners when WebSocket is connected
   * Thiết lập event listeners khi WebSocket đã kết nối
   */
  useEffect(() => {
    if (!webSocket.socket || !webSocket.isConnected) return;

    const socket = webSocket.socket;

    // Setup event listeners
    socket.on("security_event", handleSecurityEvent);
    socket.on("security_event_batch", handleSecurityEventBatch);
    socket.on("user_activity", handleUserActivity);
    socket.on("user_activity_aggregated", (data) => {
      updateStatistics("user_activity_aggregated");
      addEventToHistory("user_activity_aggregated", data);
      if (eventHandlers.onUserActivityAggregated) {
        eventHandlers.onUserActivityAggregated(data);
      }
    });
    socket.on("user_metrics_update", (metrics) => {
      updateStatistics("user_metrics_update");
      addEventToHistory("user_metrics_update", metrics);
      if (eventHandlers.onUserMetricsUpdate) {
        eventHandlers.onUserMetricsUpdate(metrics);
      }
    });
    socket.on("system_metrics", handleSystemMetrics);
    socket.on("admin_notification", handleAdminNotification);
    socket.on("bulk_operation_progress", handleBulkOperationProgress);
    socket.on("dashboard_update", handleDashboardUpdate);

    // Cleanup listeners on unmount or reconnection
    return () => {
      socket.off("security_event", handleSecurityEvent);
      socket.off("security_event_batch", handleSecurityEventBatch);
      socket.off("user_activity", handleUserActivity);
      socket.off("user_activity_aggregated");
      socket.off("user_metrics_update");
      socket.off("system_metrics", handleSystemMetrics);
      socket.off("admin_notification", handleAdminNotification);
      socket.off("bulk_operation_progress", handleBulkOperationProgress);
      socket.off("dashboard_update", handleDashboardUpdate);
    };
  }, [
    webSocket.socket,
    webSocket.isConnected,
    handleSecurityEvent,
    handleSecurityEventBatch,
    handleUserActivity,
    handleSystemMetrics,
    handleAdminNotification,
    handleBulkOperationProgress,
    handleDashboardUpdate,
    updateStatistics,
    addEventToHistory,
    eventHandlers,
  ]);

  return {
    // Event statistics
    statistics,

    // Event history
    recentEvents,

    // Event handlers
    clearEventHistory,
    getEventsByType,
    getEventsInTimeRange,

    // Notification controls
    enableNotifications: enableNotificationsHandler,
    disableNotifications: disableNotificationsHandler,
    isNotificationsEnabled,
  };
}
