/**
 * Use Admin Notifications Hook
 * Hook cho admin notifications với real-time simulation
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AdminNotification, NotificationType } from '@/types/admin/header';
import { adminHeaderMockService } from '@/lib/mockdata/admin-header';
import { useMockWebSocket } from '@/components/admin/providers/mock-websocket-provider';

/**
 * Notifications State Interface
 * Interface cho notifications state
 */
interface NotificationsState {
  notifications: AdminNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Notifications Actions Interface
 * Interface cho notifications actions
 */
interface NotificationsActions {
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt'>) => void;
  refreshNotifications: () => Promise<void>;
}

/**
 * Use Admin Notifications Return Type
 * Return type cho useAdminNotifications hook
 */
interface UseAdminNotificationsReturn {
  state: NotificationsState;
  actions: NotificationsActions;
  // Convenience getters
  notifications: AdminNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  // Convenience actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  addNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt'>) => void;
}

/**
 * Use Admin Notifications Hook
 * Main hook cho notifications management
 */
export function useAdminNotifications(): UseAdminNotificationsReturn {
  const [notificationsState, setNotificationsState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const { lastMessage, isConnected } = useMockWebSocket();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load notifications
   * Load notifications từ mock service
   */
  const loadNotifications = useCallback(async () => {
    try {
      setNotificationsState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      const mockNotifications = await adminHeaderMockService.getNotifications();

      // Convert mock notifications to proper format
      const notifications: AdminNotification[] = mockNotifications.map(n => ({
        ...n,
        isRead: n.read,
        createdAt: n.timestamp,
        href: n.actionUrl
      }));

      const unreadCount = notifications.filter(n => !n.read).length;

      setNotificationsState(prev => ({
        ...prev,
        notifications,
        unreadCount,
        isLoading: false,
        lastUpdated: new Date()
      }));

    } catch (error) {
      setNotificationsState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load notifications',
        isLoading: false
      }));
    }
  }, []);

  /**
   * Mark notification as read
   * Đánh dấu notification đã đọc
   */
  const markAsRead = useCallback((notificationId: string) => {
    setNotificationsState(prev => {
      const updatedNotifications = prev.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );

      const unreadCount = updatedNotifications.filter(n => !n.read).length;

      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount
      };
    });
  }, []);

  /**
   * Mark all notifications as read
   * Đánh dấu tất cả notifications đã đọc
   */
  const markAllAsRead = useCallback(() => {
    setNotificationsState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => ({
        ...notification,
        isRead: true
      })),
      unreadCount: 0
    }));
  }, []);

  /**
   * Clear notification
   * Xóa notification
   */
  const clearNotification = useCallback((notificationId: string) => {
    setNotificationsState(prev => {
      const updatedNotifications = prev.notifications.filter(
        notification => notification.id !== notificationId
      );

      const unreadCount = updatedNotifications.filter(n => !n.read).length;

      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount
      };
    });
  }, []);

  /**
   * Clear all notifications
   * Xóa tất cả notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotificationsState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0
    }));
  }, []);

  /**
   * Add new notification
   * Thêm notification mới
   */
  const addNotification = useCallback((
    notification: Omit<AdminNotification, 'id' | 'createdAt'>
  ) => {
    const newNotification: AdminNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      createdAt: new Date(),
      read: false,
      isRead: false
    };

    setNotificationsState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1
    }));
  }, []);

  /**
   * Refresh notifications
   * Refresh notifications từ server
   */
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  /**
   * Generate random notification
   * Generate random notification cho simulation
   */
  const generateRandomNotification = useCallback(() => {
    const notificationTypes: NotificationType[] = ['info', 'success', 'warning', 'error'];
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

    const notifications = {
      info: [
        {
          title: 'Người dùng mới đăng ký',
          message: 'Có 3 người dùng mới đăng ký trong 10 phút qua',
          type: 'info' as NotificationType,
          timestamp: new Date(),
          read: false,
          isRead: false,
          href: '/3141592654/admin/users?filter=new'
        },
        {
          title: 'Câu hỏi mới được tạo',
          message: 'Giảng viên Nguyễn Văn A đã tạo 5 câu hỏi mới',
          type: 'info' as NotificationType,
          timestamp: new Date(),
          read: false,
          isRead: false,
          href: '/3141592654/admin/questions?filter=recent'
        }
      ],
      success: [
        {
          title: 'Backup hoàn thành',
          message: 'Sao lưu dữ liệu hệ thống đã hoàn thành thành công',
          type: 'success' as NotificationType,
          timestamp: new Date(),
          read: false,
          isRead: false,
          href: '/3141592654/admin/settings/backup'
        },
        {
          title: 'Cập nhật thành công',
          message: 'Hệ thống đã được cập nhật lên phiên bản mới',
          type: 'success' as NotificationType,
          timestamp: new Date(),
          read: false,
          isRead: false
        }
      ],
      warning: [
        {
          title: 'Dung lượng lưu trữ',
          message: 'Dung lượng lưu trữ đã sử dụng 85%. Cần dọn dẹp dữ liệu',
          type: 'warning' as NotificationType,
          timestamp: new Date(),
          read: false,
          isRead: false,
          href: '/3141592654/admin/settings/storage'
        },
        {
          title: 'Phiên đăng nhập sắp hết hạn',
          message: 'Phiên đăng nhập của bạn sẽ hết hạn trong 10 phút',
          type: 'warning' as NotificationType,
          timestamp: new Date(),
          read: false,
          isRead: false
        }
      ],
      error: [
        {
          title: 'Lỗi kết nối database',
          message: 'Không thể kết nối đến database. Vui lòng kiểm tra lại',
          type: 'error' as NotificationType,
          timestamp: new Date(),
          read: false,
          isRead: false,
          href: '/3141592654/admin/settings/database'
        },
        {
          title: 'Lỗi gửi email',
          message: 'Không thể gửi email thông báo. Kiểm tra cấu hình SMTP',
          type: 'error' as NotificationType,
          timestamp: new Date(),
          read: false,
          isRead: false,
          href: '/3141592654/admin/settings/email'
        }
      ]
    };

    const typeNotifications = notifications[randomType];
    const randomNotification = typeNotifications[Math.floor(Math.random() * typeNotifications.length)];

    addNotification(randomNotification);
  }, [addNotification]);

  /**
   * Handle WebSocket messages
   * Xử lý WebSocket messages cho real-time notifications
   */
  useEffect(() => {
    if (lastMessage && typeof lastMessage === 'object' && 'type' in lastMessage) {
      const message = lastMessage as { type: string; data?: unknown };
      
      if (message.type === 'notification' && message.data) {
        const notificationData = message.data as Omit<AdminNotification, 'id' | 'createdAt'>;
        addNotification(notificationData);
      }
    }
  }, [lastMessage, addNotification]);

  /**
   * Setup real-time simulation
   * Setup simulation cho real-time notifications
   */
  useEffect(() => {
    // Generate random notifications every 30-60 seconds when connected
    if (isConnected) {
      const generateNotification = () => {
        // 30% chance to generate a notification
        if (Math.random() < 0.3) {
          generateRandomNotification();
        }
      };

      // Set random interval between 30-60 seconds
      const randomInterval = 30000 + Math.random() * 30000;
      intervalRef.current = setInterval(generateNotification, randomInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isConnected, generateRandomNotification]);

  /**
   * Load initial notifications
   * Load notifications khi component mount
   */
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Create actions object
  const actions: NotificationsActions = {
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    addNotification,
    refreshNotifications
  };

  return {
    state: notificationsState,
    actions,
    // Convenience getters
    notifications: notificationsState.notifications,
    unreadCount: notificationsState.unreadCount,
    isLoading: notificationsState.isLoading,
    error: notificationsState.error,
    // Convenience actions
    markAsRead,
    markAllAsRead,
    clearNotification,
    addNotification
  };
}

/**
 * Use Notification Toast Hook
 * Hook cho notification toast functionality
 */
export function useNotificationToast() {
  const { addNotification } = useAdminNotifications();

  const showToast = useCallback((
    title: string,
    message: string,
    type: NotificationType = 'info'
  ) => {
    addNotification({
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      isRead: false
    });
  }, [addNotification]);

  return {
    showToast,
    showInfo: (title: string, message: string) =>
      showToast(title, message, 'info'),
    showSuccess: (title: string, message: string) =>
      showToast(title, message, 'success'),
    showWarning: (title: string, message: string) =>
      showToast(title, message, 'warning'),
    showError: (title: string, message: string) =>
      showToast(title, message, 'error')
  };
}
