/**
 * Notifications Hook
 * Hook để quản lý notifications trong NyNus system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context-grpc';

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

// ===== MOCK DATA (TODO: Replace with real gRPC service) =====

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
      // TODO: Replace with real gRPC service call
      // const response = await NotificationService.getNotifications(user.id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock response based on user role
      const mockNotifications = user.role?.toString() === 'ADMIN'
        ? [...MOCK_NOTIFICATIONS, {
            id: '4',
            type: 'warning' as const,
            title: 'Cảnh báo hệ thống',
            message: 'Phát hiện 3 lần đăng nhập thất bại từ IP 192.168.1.100',
            isRead: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            actionUrl: '/admin/security/alerts',
            actionLabel: 'Xem chi tiết'
          }]
        : MOCK_NOTIFICATIONS;

      setState(prev => ({
        ...prev,
        notifications: mockNotifications,
        unreadCount: mockNotifications.filter(n => !n.isRead).length,
        isLoading: false,
        lastFetch: new Date()
      }));

    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Không thể tải thông báo. Vui lòng thử lại.'
      }));
    }
  }, [isAuthenticated, user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // TODO: Replace with real gRPC service call
      // await NotificationService.markAsRead(notificationId);

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      }));

    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // TODO: Replace with real gRPC service call
      // await NotificationService.markAllAsRead(user.id);

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, isRead: true }))
      }));

    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // TODO: Replace with real gRPC service call
      // await NotificationService.deleteNotification(notificationId);

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId)
      }));

    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      // TODO: Replace with real gRPC service call
      // await NotificationService.clearAll(user.id);

      setState(prev => ({
        ...prev,
        notifications: []
      }));

    } catch (error) {
      console.error('Failed to clear all notifications:', error);
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
