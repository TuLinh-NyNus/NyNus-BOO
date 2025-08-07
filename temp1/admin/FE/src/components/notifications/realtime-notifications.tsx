/**
 * Real-time Notifications Component
 * Component hiển thị notifications real-time từ WebSocket
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Activity,
  Users,
  Shield,
  Settings,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";

import { useWebSocketEvents } from "../../hooks/use-websocket-events";
import {
  SecurityEvent,
  UserActivityEvent,
  SystemMetricsEvent,
  AdminNotificationEvent,
} from "../../lib/websocket/websocket-types";

/**
 * Notification item interface
 * Interface cho notification item
 */
interface NotificationItem {
  id: string;
  type: "security" | "activity" | "system" | "admin";
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  read: boolean;
  data: any;
}

/**
 * Real-time Notifications Props
 * Props cho Real-time Notifications component
 */
interface RealtimeNotificationsProps {
  maxNotifications?: number;
  autoHideAfter?: number;
  showUnreadOnly?: boolean;
  enableSounds?: boolean;
  enablePriorities?: boolean;
  className?: string;
}

/**
 * Real-time Notifications Component
 * Component hiển thị notifications real-time với filtering và management
 */
export function RealtimeNotifications({
  maxNotifications = 50,
  autoHideAfter = 30000, // 30 seconds
  showUnreadOnly = false,
  enableSounds = true,
  enablePriorities = true,
  className = "",
}: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Use WebSocket events hook
  const {
    statistics,
    recentEvents,
    clearEventHistory,
    isNotificationsEnabled,
    enableNotifications,
    disableNotifications,
  } = useWebSocketEvents({
    enableNotifications: true,
    enableSounds: enableSounds,
    enableEventLogging: true,
    maxEventHistory: maxNotifications,
    eventHandlers: {
      onSecurityEvent: handleSecurityEvent,
      onUserActivity: handleUserActivity,
      onSystemMetrics: handleSystemMetrics,
      onAdminNotification: handleAdminNotification,
    },
  });

  /**
   * Handle security events
   * Xử lý security events
   */
  function handleSecurityEvent(event: SecurityEvent) {
    const notification: NotificationItem = {
      id: event.id,
      type: "security",
      title: getSecurityEventTitle(event.eventType),
      message: `${event.userEmail || event.userId}: ${event.message}`,
      severity: event.severity.toLowerCase() as any,
      timestamp: new Date(event.timestamp),
      read: false,
      data: event,
    };

    addNotification(notification);
  }

  /**
   * Handle user activity events
   * Xử lý user activity events
   */
  function handleUserActivity(event: UserActivityEvent) {
    // Only show important activities
    const importantActivities = ["LOGIN", "LOGOUT", "EXAM_SUBMIT"];
    if (!importantActivities.includes(event.activityType)) return;

    const notification: NotificationItem = {
      id: event.id,
      type: "activity",
      title: getUserActivityTitle(event.activityType),
      message: `${event.userEmail || event.userId}: ${event.description}`,
      severity: "low",
      timestamp: new Date(event.timestamp),
      read: false,
      data: event,
    };

    addNotification(notification);
  }

  /**
   * Handle system metrics events
   * Xử lý system metrics events
   */
  function handleSystemMetrics(event: SystemMetricsEvent) {
    // Only show warning and critical metrics
    if (event.status === "NORMAL") return;

    const notification: NotificationItem = {
      id: event.id,
      type: "system",
      title: `Hệ thống: ${event.metricType}`,
      message: `Giá trị: ${event.value}${event.unit} (${event.status})`,
      severity: event.status === "CRITICAL" ? "critical" : "medium",
      timestamp: new Date(event.timestamp),
      read: false,
      data: event,
    };

    addNotification(notification);
  }

  /**
   * Handle admin notifications
   * Xử lý admin notifications
   */
  function handleAdminNotification(event: AdminNotificationEvent) {
    const notification: NotificationItem = {
      id: event.id,
      type: "admin",
      title: event.title,
      message: event.message,
      severity: event.type.toLowerCase() as any,
      timestamp: new Date(event.timestamp),
      read: false,
      data: event,
    };

    addNotification(notification);
  }

  /**
   * Add notification to list
   * Thêm notification vào danh sách
   */
  const addNotification = (notification: NotificationItem) => {
    setNotifications((prev) => {
      const updated = [notification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    // Play sound for critical notifications
    if (
      enableSounds &&
      (notification.severity === "critical" || notification.severity === "high")
    ) {
      playNotificationSound(notification.severity);
    }

    // Auto-hide notification after specified time
    if (autoHideAfter > 0) {
      setTimeout(() => {
        markAsRead(notification.id);
      }, autoHideAfter);
    }
  };

  /**
   * Mark notification as read
   * Đánh dấu notification đã đọc
   */
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  /**
   * Mark all notifications as read
   * Đánh dấu tất cả notifications đã đọc
   */
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  /**
   * Clear all notifications
   * Xóa tất cả notifications
   */
  const clearAllNotifications = () => {
    setNotifications([]);
    clearEventHistory();
  };

  /**
   * Get notification icon
   * Lấy icon cho notification
   */
  const getNotificationIcon = (type: string, severity: string) => {
    const iconClass = "h-4 w-4";

    switch (type) {
      case "security":
        return <Shield className={`${iconClass} text-red-500`} />;
      case "activity":
        return <Users className={`${iconClass} text-blue-500`} />;
      case "system":
        return <Activity className={`${iconClass} text-orange-500`} />;
      case "admin":
        switch (severity) {
          case "error":
            return <XCircle className={`${iconClass} text-red-500`} />;
          case "warning":
            return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
          case "success":
            return <CheckCircle className={`${iconClass} text-green-500`} />;
          default:
            return <Info className={`${iconClass} text-blue-500`} />;
        }
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  /**
   * Get severity badge variant
   * Lấy variant cho severity badge
   */
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

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
  function playNotificationSound(severity: string) {
    if (!enableSounds || typeof window === "undefined") return;

    try {
      let soundFile = "/sounds/notification.mp3";

      // Choose sound based on severity
      switch (severity) {
        case "critical":
          soundFile = "/sounds/critical-alert.mp3";
          break;
        case "high":
          soundFile = "/sounds/warning.mp3";
          break;
        case "medium":
          soundFile = "/sounds/info.mp3";
          break;
        default:
          soundFile = "/sounds/notification.mp3";
      }

      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.warn("Failed to play notification sound:", error);
      });
    } catch (error) {
      console.warn("Failed to create audio element:", error);
    }
  }

  // Filter notifications based on showUnreadOnly
  const filteredNotifications = showUnreadOnly
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Thông báo real-time</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isNotificationsEnabled ? disableNotifications : enableNotifications}
                  className="text-xs"
                >
                  {isNotificationsEnabled ? "Tắt" : "Bật"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {unreadCount} thông báo chưa đọc • {statistics.eventsPerMinute} events/phút
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {/* Action Buttons */}
            <div className="flex gap-2 px-4 pb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-xs"
              >
                Đánh dấu đã đọc
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
                className="text-xs"
              >
                Xóa tất cả
              </Button>
            </div>

            <div className="border-t border-gray-200" />

            {/* Notifications List */}
            <div className="h-64 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">Không có thông báo nào</div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                        notification.read ? "border-gray-200 opacity-60" : "border-blue-500"
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type, notification.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{notification.title}</p>
                            <Badge
                              variant={getSeverityVariant(notification.severity)}
                              className="text-xs"
                            >
                              {notification.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp.toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
