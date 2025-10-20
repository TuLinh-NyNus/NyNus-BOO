/**
 * Notifications Hook
 * Hook để quản lý notifications trong NyNus system
 *
 * @author NyNus Team
 * @version 2.0.0 - Real gRPC Implementation
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context-grpc';
import { NotificationService, BackendNotification } from '@/services/grpc/notification.service';
import { logger } from '@/lib/utils/logger';

// ===== TYPES =====

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'security';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

export interface NotificationActions {
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// ===== HELPER FUNCTIONS =====

/**
 * Map BackendNotification to frontend Notification type
 * Chuyển đổi notification từ backend sang frontend format
 */
function mapBackendNotification(backendNotif: BackendNotification): Notification {
  // Map backend type to frontend type
  let frontendType: Notification['type'] = 'info';
  if (backendNotif.type.includes('SECURITY') || backendNotif.type.includes('LOGIN')) {
    frontendType = 'security';
  } else if (backendNotif.type.includes('ERROR') || backendNotif.type.includes('ALERT')) {
    frontendType = 'error';
  } else if (backendNotif.type.includes('WARNING')) {
    frontendType = 'warning';
  } else if (backendNotif.type.includes('SUCCESS')) {
    frontendType = 'success';
  }

  return {
    id: backendNotif.id,
    type: frontendType,
    title: backendNotif.title,
    message: backendNotif.message,
    isRead: backendNotif.isRead,
    createdAt: new Date(backendNotif.createdAt),
    expiresAt: backendNotif.expiresAt ? new Date(backendNotif.expiresAt) : undefined,
    actionUrl: backendNotif.data?.actionUrl,
    actionLabel: backendNotif.data?.actionLabel,
  };
}

// ===== MOCK DATA (Deprecated - Using real gRPC service) =====

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'security',
    title: 'Đăng nhập từ thiết bị mới',
    message: 'Tài khoản của bạn đã được đăng nhập từ Chrome trên Windows lúc 14:30',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    actionUrl: '/security/sessions',
    actionLabel: 'Xem phiên đăng nhập'
  },
  {
    id: '2',
    type: 'info',
    title: 'Khóa học mới được thêm',
    message: 'Khóa học "Toán cao cấp A1" đã được thêm vào thư viện',
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    actionUrl: '/courses/toan-cao-cap-a1',
    actionLabel: 'Xem khóa học'
  },
  {
    id: '3',
    type: 'success',
    title: 'Hoàn thành bài kiểm tra',
    message: 'Bạn đã hoàn thành bài kiểm tra "Giải tích 1" với điểm số 8.5/10',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    actionUrl: '/results/giai-tich-1',
    actionLabel: 'Xem kết quả'
  }
];

// ===== MAIN HOOK =====

/**
 * useNotifications Hook
 * Main hook để quản lý notifications
 */
export function useNotifications(): NotificationState & NotificationActions {
  // ===== STATE =====

  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    lastFetch: null
  });

  const { isAuthenticated, user } = useAuth();

  // ===== COMPUTED VALUES =====

  const unreadCount = useMemo(() => {
    return state.notifications.filter(n => !n.isRead).length;
  }, [state.notifications]);

  // ===== ACTIONS =====

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0,
        error: null
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use real gRPC service to fetch notifications
      const response = await NotificationService.getUserNotifications({
        page: 1,
        limit: 50,
        unreadOnly: false
      });

      // Map backend notifications to frontend format
      const frontendNotifications = response.notifications.map(mapBackendNotification);

      setState(prev => ({
        ...prev,
        notifications: frontendNotifications,
        unreadCount: response.unreadCount,
        isLoading: false,
        lastFetch: new Date()
      }));

      logger.debug('[useNotifications] Notifications fetched successfully', {
        operation: 'fetchNotifications',
        count: frontendNotifications.length,
        unreadCount: response.unreadCount,
      });

    } catch (error) {
      logger.error('[useNotifications] Failed to fetch notifications', {
        operation: 'fetchNotifications',
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Failed to fetch notifications',
        stack: error instanceof Error ? error.stack : undefined,
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Không thể tải thông báo. Vui lòng thử lại.'
      }));
    }
  }, [isAuthenticated, user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Use real gRPC service to mark notification as read
      const success = await NotificationService.markAsRead(notificationId);

      if (success) {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1)
        }));

        logger.debug('[useNotifications] Notification marked as read', {
          operation: 'markAsRead',
          notificationId,
        });
      }

    } catch (error) {
      logger.error('[useNotifications] Failed to mark notification as read', {
        operation: 'markAsRead',
        notificationId,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Failed to mark as read',
      });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // Use real gRPC service to mark all notifications as read
      const success = await NotificationService.markAllAsRead();

      if (success) {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0
        }));

        logger.debug('[useNotifications] All notifications marked as read', {
          operation: 'markAllAsRead',
        });
      }

    } catch (error) {
      logger.error('[useNotifications] Failed to mark all notifications as read', {
        operation: 'markAllAsRead',
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Failed to mark all as read',
      });
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // Use real gRPC service to delete notification
      const success = await NotificationService.deleteNotification(notificationId);

      if (success) {
        setState(prev => {
          const deletedNotif = prev.notifications.find(n => n.id === notificationId);
          const wasUnread = deletedNotif && !deletedNotif.isRead;

          return {
            ...prev,
            notifications: prev.notifications.filter(n => n.id !== notificationId),
            unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
          };
        });

        logger.debug('[useNotifications] Notification deleted', {
          operation: 'deleteNotification',
          notificationId,
        });
      }

    } catch (error) {
      logger.error('[useNotifications] Failed to delete notification', {
        operation: 'deleteNotification',
        notificationId,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Failed to delete notification',
      });
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      // Use real gRPC service to delete all notifications
      const deletedCount = await NotificationService.deleteAllNotifications();

      if (deletedCount > 0) {
        setState(prev => ({
          ...prev,
          notifications: [],
          unreadCount: 0
        }));

        logger.debug('[useNotifications] All notifications cleared', {
          operation: 'clearAll',
          deletedCount,
        });
      }

    } catch (error) {
      logger.error('[useNotifications] Failed to clear all notifications', {
        operation: 'clearAll',
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Failed to clear all notifications',
      });
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // ===== EFFECTS =====

  // Auto-fetch notifications when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user, fetchNotifications]);

  // Auto-refresh notifications every 5 minutes
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, user, fetchNotifications]);

  // ===== RETURN =====

  return {
    // State
    notifications: state.notifications,
    unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    lastFetch: state.lastFetch,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refreshNotifications
  };
}

// ===== EXPORT TYPES =====
// Types are already exported above in the interface declarations
