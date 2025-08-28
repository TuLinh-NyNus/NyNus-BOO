'use client';

import React from 'react';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Interface cho Notification
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // milliseconds, undefined = không tự động đóng
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Interface cho Notification Context
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  // Convenience methods
  showSuccess: (title: string, message: string, duration?: number) => string;
  showError: (title: string, message: string, duration?: number) => string;
  showWarning: (title: string, message: string, duration?: number) => string;
  showInfo: (title: string, message: string, duration?: number) => string;
}

// Tạo Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCounter, setNotificationCounter] = useState<number>(0);

  // Tạo unique ID cho notification - sử dụng counter thay vì Date.now() + Math.random()
  // để đảm bảo deterministic ID generation và tránh hydration mismatch
  const generateId = useCallback(() => {
    const id = `notification-${notificationCounter}`;
    setNotificationCounter(prev => prev + 1);
    return id;
  }, [notificationCounter]);

  // Thêm notification mới
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000 // Default 5 seconds
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification sau duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }, newNotification.duration);
    }

    return id;
  }, [generateId]);

  // Xóa notification theo ID
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Xóa tất cả notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods cho các loại notification phổ biến
  const showSuccess = useCallback((title: string, message: string, duration = 5000) => {
    return addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, duration = 8000) => {
    return addNotification({ type: 'error', title, message, duration });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, duration = 6000) => {
    return addNotification({ type: 'warning', title, message, duration });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, duration = 5000) => {
    return addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook để sử dụng Notification Context
export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
}

// Export types
export type { Notification, NotificationContextType };

