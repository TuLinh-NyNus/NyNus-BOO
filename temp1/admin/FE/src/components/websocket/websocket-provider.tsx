/**
 * WebSocket Provider Component
 * Provider component cho WebSocket context và global state management
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import { useAdminWebSocket } from "../../hooks/use-admin-websocket";
import { soundService } from "../../lib/services/sound-service";
import {
  WebSocketContextType,
  SecurityEvent,
  UserActivityEvent,
  SystemMetricsEvent,
  AdminNotificationEvent,
  BulkOperationProgressEvent,
  DashboardUpdateEvent,
} from "../../lib/websocket/websocket-types";
import {
  SUBSCRIPTION_TYPES,
  EVENT_SEVERITY_LEVELS,
  TOAST_CONFIG,
} from "../../lib/websocket/websocket-constants";

/**
 * WebSocket Context
 * Context cho WebSocket state management
 */
const WebSocketContext = createContext<WebSocketContextType | null>(null);

/**
 * WebSocket Provider Props
 * Props cho WebSocket Provider
 */
interface WebSocketProviderProps {
  children: React.ReactNode;
  enableNotifications?: boolean;
  enableSounds?: boolean;
  autoConnect?: boolean;
}

/**
 * WebSocket Provider Component
 * Component cung cấp WebSocket context cho toàn bộ app
 */
export function WebSocketProvider({
  children,
  enableNotifications = true,
  enableSounds = false,
  autoConnect = true,
}: WebSocketProviderProps) {
  const [isProviderReady, setIsProviderReady] = useState(false);

  // Initialize WebSocket connection với event handlers
  const webSocket = useAdminWebSocket({
    autoConnect,
    enableReconnection: true,
    maxReconnectAttempts: 10,
    reconnectDelay: 1000,
    subscriptions: [
      {
        eventType: SUBSCRIPTION_TYPES.SECURITY_EVENTS,
        severityLevels: [EVENT_SEVERITY_LEVELS.HIGH, EVENT_SEVERITY_LEVELS.CRITICAL],
      },
      {
        eventType: SUBSCRIPTION_TYPES.ADMIN_NOTIFICATIONS,
      },
      {
        eventType: SUBSCRIPTION_TYPES.BULK_OPERATIONS,
      },
      {
        eventType: SUBSCRIPTION_TYPES.DASHBOARD_UPDATES,
      },
      {
        eventType: SUBSCRIPTION_TYPES.USER_ACTIVITY,
      },
    ],
    eventHandlers: {
      onSecurityEvent: handleSecurityEvent,
      onSecurityEventBatch: handleSecurityEventBatch,
      onUserActivity: handleUserActivity,
      onUserActivityAggregated: handleUserActivityAggregated,
      onUserMetricsUpdate: handleUserMetricsUpdate,
      onSystemMetrics: handleSystemMetrics,
      onAdminNotification: handleAdminNotification,
      onBulkOperationProgress: handleBulkOperationProgress,
      onDashboardUpdate: handleDashboardUpdate,
    },
    onConnectionChange: (status) => {
      console.log("WebSocket connection status changed:", status);
    },
    onError: (error) => {
      console.error("WebSocket provider error:", error);
    },
  });

  /**
   * Handle security events
   * Xử lý security events
   */
  function handleSecurityEvent(event: SecurityEvent) {
    console.log("Security event received:", event);

    if (!enableNotifications) return;

    // Play sound alert for security events
    if (enableSounds) {
      soundService.playSecurityAlert().catch((error) => {
        console.warn("Failed to play security alert sound:", error);
      });
    }

    // Show notification based on severity với enhanced styling
    const notificationConfig = {
      title: `🚨 ${getSecurityEventTitle(event.eventType)}`,
      description: `${event.userEmail || event.userId}: ${event.message}`,
      duration:
        event.severity === "CRITICAL"
          ? TOAST_CONFIG.DURATION.CRITICAL
          : TOAST_CONFIG.DURATION.WARNING,
    };

    switch (event.severity) {
      case "CRITICAL":
        toast.error(notificationConfig.title, {
          description: notificationConfig.description,
          duration: notificationConfig.duration,
          className: "border-red-500 bg-red-50 text-red-900",
          style: {
            borderLeft: "4px solid #ef4444",
          },
        });
        break;
      case "HIGH":
        toast.warning(notificationConfig.title, {
          description: notificationConfig.description,
          duration: notificationConfig.duration,
          className: "border-orange-500 bg-orange-50 text-orange-900",
          style: {
            borderLeft: "4px solid #f97316",
          },
        });
        break;
      default:
        toast.info(notificationConfig.title, {
          description: notificationConfig.description,
          duration: notificationConfig.duration,
          className: "border-blue-500 bg-blue-50 text-blue-900",
          style: {
            borderLeft: "4px solid #3b82f6",
          },
        });
    }
  }

  /**
   * Handle security event batch
   * Xử lý batch security events
   */
  function handleSecurityEventBatch(events: SecurityEvent[]) {
    console.log("Security event batch received:", events.length, "events");

    if (!enableNotifications || events.length === 0) return;

    // Show summary notification for batch
    const criticalCount = events.filter((e) => e.severity === "CRITICAL").length;
    const highCount = events.filter((e) => e.severity === "HIGH").length;

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

  /**
   * Handle user activity events
   * Xử lý user activity events
   */
  function handleUserActivity(event: UserActivityEvent) {
    console.log("User activity received:", event);

    // Only show notifications for important activities
    const importantActivities = ["LOGIN", "LOGOUT", "EXAM_SUBMIT"];

    if (enableNotifications && importantActivities.includes(event.activityType)) {
      toast.info(getUserActivityTitle(event.activityType), {
        description: `${event.userEmail || event.userId}: ${event.description}`,
        duration: TOAST_CONFIG.DURATION.INFO,
      });
    }
  }

  /**
   * Handle aggregated user activity
   * Xử lý aggregated user activity
   */
  function handleUserActivityAggregated(data: any) {
    console.log("User activity aggregated received:", data);

    if (enableNotifications && data.totalActivities > 10) {
      toast.info("Hoạt động người dùng cao", {
        description: `${data.totalActivities} hoạt động từ ${data.userEmail || data.userId}`,
        duration: TOAST_CONFIG.DURATION.INFO,
      });
    }
  }

  /**
   * Handle user metrics update
   * Xử lý user metrics update
   */
  function handleUserMetricsUpdate(metrics: any) {
    console.log("User metrics update received:", metrics);

    // Update global metrics state if needed
    // This could trigger dashboard updates
  }

  /**
   * Handle system metrics
   * Xử lý system metrics
   */
  function handleSystemMetrics(event: SystemMetricsEvent) {
    console.log("System metrics received:", event);

    if (!enableNotifications) return;

    // Play sound for critical system events
    if (enableSounds && event.status === "CRITICAL") {
      soundService.playError().catch((error) => {
        console.warn("Failed to play error sound:", error);
      });
    }

    // Show notification for critical system metrics với enhanced styling
    if (event.status === "CRITICAL") {
      toast.error(`🔥 Hệ thống cảnh báo: ${event.metricType}`, {
        description: `Giá trị: ${event.value}${event.unit}`,
        duration: TOAST_CONFIG.DURATION.ERROR,
        className: "border-red-500 bg-red-50 text-red-900",
        style: {
          borderLeft: "4px solid #ef4444",
        },
      });
    } else if (event.status === "WARNING") {
      toast.warning(`⚠️ Hệ thống cảnh báo: ${event.metricType}`, {
        description: `Giá trị: ${event.value}${event.unit}`,
        duration: TOAST_CONFIG.DURATION.WARNING,
        className: "border-orange-500 bg-orange-50 text-orange-900",
        style: {
          borderLeft: "4px solid #f97316",
        },
      });
    }
  }

  /**
   * Handle admin notifications
   * Xử lý admin notifications
   */
  function handleAdminNotification(event: AdminNotificationEvent) {
    console.log("Admin notification received:", event);

    if (!enableNotifications) return;

    const duration =
      event.autoHideAfter || TOAST_CONFIG.DURATION[event.type] || TOAST_CONFIG.DURATION.INFO;

    // Play appropriate sound based on notification type
    if (enableSounds) {
      switch (event.type) {
        case "ERROR":
          soundService
            .playError()
            .catch((error) => console.warn("Failed to play error sound:", error));
          break;
        case "SUCCESS":
          soundService
            .playSuccess()
            .catch((error) => console.warn("Failed to play success sound:", error));
          break;
        case "WARNING":
        case "INFO":
        default:
          soundService
            .playNotification()
            .catch((error) => console.warn("Failed to play notification sound:", error));
          break;
      }
    }

    // Show toast với enhanced styling
    switch (event.type) {
      case "ERROR":
        toast.error(event.title, {
          description: event.message,
          duration,
          className: "border-red-500 bg-red-50 text-red-900",
          style: {
            borderLeft: "4px solid #ef4444",
          },
        });
        break;
      case "WARNING":
        toast.warning(event.title, {
          description: event.message,
          duration,
          className: "border-orange-500 bg-orange-50 text-orange-900",
          style: {
            borderLeft: "4px solid #f97316",
          },
        });
        break;
      case "SUCCESS":
        toast.success(event.title, {
          description: event.message,
          duration,
          className: "border-green-500 bg-green-50 text-green-900",
          style: {
            borderLeft: "4px solid #22c55e",
          },
        });
        break;
      default:
        toast.info(event.title, {
          description: event.message,
          duration,
          className: "border-blue-500 bg-blue-50 text-blue-900",
          style: {
            borderLeft: "4px solid #3b82f6",
          },
        });
    }

    // Sound already played above in the switch statement
  }

  /**
   * Handle bulk operation progress
   * Xử lý bulk operation progress
   */
  function handleBulkOperationProgress(event: BulkOperationProgressEvent) {
    console.log("Bulk operation progress received:", event);

    if (!enableNotifications) return;

    // Show notification for completed operations
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

  /**
   * Handle dashboard updates
   * Xử lý dashboard updates
   */
  function handleDashboardUpdate(event: DashboardUpdateEvent) {
    console.log("Dashboard update received:", event);

    // Trigger dashboard refresh or update specific widgets
    // This could be handled by dashboard components listening to this context
  }

  /**
   * Get security event title
   * Lấy title cho security event
   */
  function getSecurityEventTitle(eventType: string): string {
    const titles: Record<string, string> = {
      LOGIN_ATTEMPT: "Thử đăng nhập",
      FAILED_LOGIN: "Đăng nhập thất bại",
      SUSPICIOUS_ACTIVITY: "Hoạt động đáng ngờ",
      ACCOUNT_LOCKED: "Tài khoản bị khóa",
      PASSWORD_CHANGED: "Mật khẩu đã thay đổi",
      ROLE_CHANGED: "Quyền đã thay đổi",
    };
    return titles[eventType] || "Sự kiện bảo mật";
  }

  /**
   * Get user activity title
   * Lấy title cho user activity
   */
  function getUserActivityTitle(activityType: string): string {
    const titles: Record<string, string> = {
      LOGIN: "Người dùng đăng nhập",
      LOGOUT: "Người dùng đăng xuất",
      PROFILE_UPDATE: "Cập nhật hồ sơ",
      COURSE_ACCESS: "Truy cập khóa học",
      EXAM_START: "Bắt đầu bài thi",
      EXAM_SUBMIT: "Nộp bài thi",
    };
    return titles[activityType] || "Hoạt động người dùng";
  }

  /**
   * Play notification sound
   * Phát âm thanh thông báo
   */
  function playNotificationSound(type: string) {
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
  }

  /**
   * Mark provider as ready when WebSocket is initialized
   * Đánh dấu provider sẵn sàng khi WebSocket đã khởi tạo
   */
  useEffect(() => {
    setIsProviderReady(true);
  }, []);

  const contextValue: WebSocketContextType = {
    webSocket,
    isProviderReady,
  };

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
}

/**
 * Hook to use WebSocket context
 * Hook để sử dụng WebSocket context
 */
export function useWebSocketContext(): WebSocketContextType {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }

  return context;
}

/**
 * Hook to use WebSocket connection
 * Hook để sử dụng WebSocket connection
 */
export function useWebSocket() {
  const { webSocket } = useWebSocketContext();
  return webSocket;
}
