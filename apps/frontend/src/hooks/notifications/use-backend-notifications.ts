/**
 * Backend Notifications Hook
 * React hook để quản lý notifications từ backend gRPC service
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationService, BackendNotification } from '@/services/grpc/notification.service';
import { ProfileService } from '@/services/grpc/profile.service';
import { useAuth } from '@/contexts/auth-context-grpc';

// NotificationPreferences type - mapped from ProfileService UserPreferences
export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  securityAlerts: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
}

export interface UseBackendNotificationsReturn {
  // Notifications data
  notifications: BackendNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // Actions
  loadNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  refreshUnreadCount: () => Promise<void>;

  // Preferences
  preferences: NotificationPreferences | null;
  preferencesLoading: boolean;
  loadPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<boolean>;

  // Real-time
  isConnected: boolean;
  subscribeToRealtime: () => void;
  unsubscribeFromRealtime: () => void;
}

export function useBackendNotifications(): UseBackendNotificationsReturn {
  // Notifications state
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  // Real-time state
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Auth context
  const { user, isAuthenticated } = useAuth();

  /**
   * Load notifications from backend
   */
  const loadNotifications = useCallback(async (params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await NotificationService.getUserNotifications(params);
      
      if (params.page && params.page > 1) {
        // Append to existing notifications for pagination
        setNotifications(prev => [...prev, ...response.notifications]);
      } else {
        // Replace notifications for initial load or refresh
        setNotifications(response.notifications);
      }
      
      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const success = await NotificationService.markAsRead(notificationId);
      
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return success;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const success = await NotificationService.markAllAsRead();
      
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            isRead: true,
            readAt: notification.readAt || new Date().toISOString()
          }))
        );
        
        setUnreadCount(0);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const success = await NotificationService.deleteNotification(notificationId);
      
      if (success) {
        // Update local state
        const notificationToDelete = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        // Update unread count if deleted notification was unread
        if (notificationToDelete && !notificationToDelete.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
      
      return success;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }, [notifications]);

  /**
   * Refresh unread count
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
    }
  }, [isAuthenticated]);

  /**
   * Load notification preferences
   * Migrated from NotificationService mock to ProfileService real gRPC
   */
  const loadPreferences = useCallback(async () => {
    if (!isAuthenticated) return;

    setPreferencesLoading(true);

    try {
      const response = await ProfileService.getPreferences();

      if (response.success && response.preferences) {
        // Map ProfileService preferences to NotificationPreferences format
        const mappedPrefs: NotificationPreferences = {
          userId: 'current-user', // Will be replaced with actual user ID from auth context
          emailNotifications: response.preferences.email_notifications ?? true,
          pushNotifications: response.preferences.push_notifications ?? true,
          smsNotifications: response.preferences.sms_notifications ?? false,
          securityAlerts: response.preferences.security_alerts ?? true,
          productUpdates: response.preferences.product_updates ?? true,
          marketingEmails: response.preferences.marketing_emails ?? false,
        };
        setPreferences(mappedPrefs);
      } else {
        console.error('Failed to load preferences:', response.message);
        setPreferences(null);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      setPreferences(null);
    } finally {
      setPreferencesLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Update notification preferences
   * Migrated from NotificationService mock to ProfileService real gRPC
   */
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>): Promise<boolean> => {
    try {
      // Map NotificationPreferences format to ProfileService format
      const profilePrefs: Record<string, boolean | string> = {};

      if (newPreferences.emailNotifications !== undefined) {
        profilePrefs.email_notifications = newPreferences.emailNotifications;
      }
      if (newPreferences.pushNotifications !== undefined) {
        profilePrefs.push_notifications = newPreferences.pushNotifications;
      }
      if (newPreferences.smsNotifications !== undefined) {
        profilePrefs.sms_notifications = newPreferences.smsNotifications;
      }
      if (newPreferences.securityAlerts !== undefined) {
        profilePrefs.security_alerts = newPreferences.securityAlerts;
      }
      if (newPreferences.productUpdates !== undefined) {
        profilePrefs.product_updates = newPreferences.productUpdates;
      }
      if (newPreferences.marketingEmails !== undefined) {
        profilePrefs.marketing_emails = newPreferences.marketingEmails;
      }

      const response = await ProfileService.updatePreferences(profilePrefs);

      if (response.success && preferences) {
        // Update local state
        setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
        return true;
      }

      console.error('Failed to update preferences:', response.message);
      return false;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }, [preferences]);

  /**
   * Subscribe to real-time notifications
   */
  const subscribeToRealtime = useCallback(() => {
    if (!isAuthenticated || isConnected) return;

    console.log('Subscribing to real-time notifications...');

    const unsubscribe = NotificationService.subscribeToNotifications(
      (notification: BackendNotification) => {
        console.log('Received real-time notification:', notification);
        
        // Add new notification to the beginning of the list
        setNotifications(prev => [notification, ...prev]);
        
        // Update unread count if notification is unread
        if (!notification.isRead) {
          setUnreadCount(prev => prev + 1);
        }
      },
      (error: Error) => {
        console.error('Real-time notification error:', error);
        setIsConnected(false);
      }
    );

    unsubscribeRef.current = unsubscribe;
    setIsConnected(true);
  }, [isAuthenticated, isConnected]);

  /**
   * Unsubscribe from real-time notifications
   */
  const unsubscribeFromRealtime = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
      loadPreferences();
      refreshUnreadCount();
    }
  }, [isAuthenticated, user, loadNotifications, loadPreferences, refreshUnreadCount]);

  // Auto-subscribe to real-time notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isConnected) {
      subscribeToRealtime();
    }

    // Cleanup on unmount or when user logs out
    return () => {
      if (!isAuthenticated) {
        unsubscribeFromRealtime();
      }
    };
  }, [isAuthenticated, user, isConnected, subscribeToRealtime, unsubscribeFromRealtime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromRealtime();
    };
  }, [unsubscribeFromRealtime]);

  return {
    // Notifications data
    notifications,
    unreadCount,
    loading,
    error,

    // Actions
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,

    // Preferences
    preferences,
    preferencesLoading,
    loadPreferences,
    updatePreferences,

    // Real-time
    isConnected,
    subscribeToRealtime,
    unsubscribeFromRealtime
  };
}
