/**
 * Admin Notifications Hook & Provider
 * Centralised state to avoid duplicate gRPC calls that triggered rate limiting.
 */

'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  NotificationService,
  type BackendNotification,
} from '@/services/grpc/notification.service';
import {
  AdminNotification,
  type NotificationType,
} from '@/types/admin/header';
import { logger } from '@/lib/utils/logger';
import { useAuth } from '@/contexts/auth-context-grpc';
// Phase 4 - Task 4.3.1: Import WebSocket hook
import { useWebSocket } from '@/providers';

interface NotificationsState {
  notifications: AdminNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface NotificationsActions {
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt'>) => void;
  refreshNotifications: () => Promise<void>;
}

export interface UseAdminNotificationsReturn {
  state: NotificationsState;
  actions: NotificationsActions;
  notifications: AdminNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  addNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt'>) => void;
}

const MAX_CACHED_NOTIFICATIONS = 50;
const MIN_FETCH_INTERVAL_MS = 750;

const AdminNotificationsContext = createContext<UseAdminNotificationsReturn | undefined>(undefined);

function mapBackendTypeToNotificationType(type: string | undefined): NotificationType {
  const normalized = type?.toLowerCase() ?? '';

  if (
    normalized.includes('error') ||
    normalized.includes('fail') ||
    normalized.includes('alert') ||
    normalized.includes('critical')
  ) {
    return 'error';
  }

  if (
    normalized.includes('warn') ||
    normalized.includes('risk') ||
    normalized.includes('security')
  ) {
    return 'warning';
  }

  if (
    normalized.includes('success') ||
    normalized.includes('complete') ||
    normalized.includes('done')
  ) {
    return 'success';
  }

  return 'info';
}

function deriveHref(data: Record<string, string> | undefined): string | undefined {
  if (!data) return undefined;

  return (
    data.actionUrl ||
    data.href ||
    data.url ||
    data.link ||
    data.redirectUrl ||
    undefined
  );
}

function mapBackendNotificationToAdmin(notification: BackendNotification): AdminNotification {
  const createdAt = notification.createdAt
    ? new Date(notification.createdAt)
    : new Date();

  const href = deriveHref(notification.data);

  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: mapBackendTypeToNotificationType(notification.type),
    timestamp: createdAt,
    createdAt,
    read: notification.isRead,
    isRead: notification.isRead,
    href,
    icon: undefined,
    data: notification.data,
  };
}

function normalizeIncomingNotification(
  notification: Partial<AdminNotification>
): AdminNotification {
  const timestamp = notification.timestamp
    ? new Date(notification.timestamp)
    : new Date();

  const read = notification.read ?? false;
  const isRead = notification.isRead ?? read;

  return {
    ...notification,
    id:
      notification.id ??
      `notification-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    timestamp,
    createdAt: timestamp,
    read,
    isRead,
    type: notification.type ?? 'info',
  } as AdminNotification;
}

export function AdminNotificationsProvider({ children }: { children: ReactNode }) {
  const [notificationsState, setNotificationsState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const { isAuthenticated } = useAuth();
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const lastFetchTimestampRef = useRef<number>(0);
  const loadNotificationsRef = useRef<((force?: boolean) => Promise<void>) | null>(null); // ✅ FIX: Ref for stable reference
  const initialFetchDoneRef = useRef<boolean>(false); // ✅ FIX: Prevent React Strict Mode double-fetch
  
  // Phase 4 - Task 4.3.1: Subscribe to WebSocket notifications
  const { lastMessage: wsLastMessage } = useWebSocket();

  const loadNotifications = useCallback(
    async (force = false): Promise<void> => {
      if (!isAuthenticated) {
        setNotificationsState(prev => ({
          ...prev,
          notifications: [],
          unreadCount: 0,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        }));
        return;
      }

      const now = Date.now();

      if (!force) {
        if (fetchPromiseRef.current) {
          return fetchPromiseRef.current;
        }

        const elapsed = now - lastFetchTimestampRef.current;
        if (elapsed < MIN_FETCH_INTERVAL_MS) {
          return;
        }
      }

      setNotificationsState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const fetchPromise = (async () => {
        try {
          const response = await NotificationService.getUserNotifications({
            limit: MAX_CACHED_NOTIFICATIONS,
          });

          const notifications = response.notifications
            .map(mapBackendNotificationToAdmin)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

          setNotificationsState(prev => ({
            ...prev,
            notifications,
            unreadCount:
              response.unreadCount ??
              notifications.filter(notification => !notification.read).length,
            isLoading: false,
            error: null,
            lastUpdated: new Date(),
          }));
        } catch (error) {
          logger.error('[AdminNotificationsProvider] Failed to load notifications', { error });
          setNotificationsState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load notifications',
          }));
          throw error;
        } finally {
          fetchPromiseRef.current = null;
          lastFetchTimestampRef.current = Date.now();
        }
      })();

      fetchPromiseRef.current = fetchPromise;
      return fetchPromise;
    },
    [isAuthenticated],
  );

  // ✅ FIX: Update ref whenever loadNotifications changes
  useEffect(() => {
    loadNotificationsRef.current = loadNotifications;
  }, [loadNotifications]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      setNotificationsState(prev => {
        const updatedNotifications = prev.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true, isRead: true }
            : notification,
        );

        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(notification => !notification.read).length,
          lastUpdated: new Date(),
        };
      });

      NotificationService.markAsRead(notificationId).catch(error => {
        logger.error('[AdminNotificationsProvider] Failed to mark notification as read', {
          notificationId,
          error,
        });
        loadNotifications(true).catch(() => {
          /** swallow follow-up error */
        });
      });
    },
    [loadNotifications],
  );

  const markAllAsRead = useCallback(() => {
    setNotificationsState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => ({
        ...notification,
        read: true,
        isRead: true,
      })),
      unreadCount: 0,
      lastUpdated: new Date(),
    }));

    NotificationService.markAllAsRead().catch(error => {
      logger.error('[AdminNotificationsProvider] Failed to mark all notifications as read', { error });
      loadNotifications(true).catch(() => {
        /** swallow follow-up error */
      });
    });
  }, [loadNotifications]);

  const clearNotification = useCallback(
    (notificationId: string) => {
      setNotificationsState(prev => {
        const notificationToRemove = prev.notifications.find(notification => notification.id === notificationId);
        const notifications = prev.notifications.filter(notification => notification.id !== notificationId);
        const wasUnread = notificationToRemove ? !notificationToRemove.read : false;

        return {
          ...prev,
          notifications,
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
          lastUpdated: new Date(),
        };
      });

      NotificationService.deleteNotification(notificationId).catch(error => {
        logger.error('[AdminNotificationsProvider] Failed to delete notification', {
          notificationId,
          error,
        });
        loadNotifications(true).catch(() => {
          /** swallow follow-up error */
        });
      });
    },
    [loadNotifications],
  );

  const clearAllNotifications = useCallback(() => {
    setNotificationsState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0,
      lastUpdated: new Date(),
    }));

    NotificationService.deleteAllNotifications().catch(error => {
      logger.error('[AdminNotificationsProvider] Failed to delete all notifications', { error });
      loadNotifications(true).catch(() => {
        /** swallow follow-up error */
      });
    });
  }, [loadNotifications]);

  const addNotification = useCallback(
    (notification: Omit<AdminNotification, 'id' | 'createdAt'>) => {
      const normalizedNotification = normalizeIncomingNotification(notification);

      setNotificationsState(prev => {
        const notifications = [normalizedNotification, ...prev.notifications].slice(
          0,
          MAX_CACHED_NOTIFICATIONS,
        );

        return {
          ...prev,
          notifications,
          unreadCount: normalizedNotification.read ? prev.unreadCount : prev.unreadCount + 1,
          lastUpdated: new Date(),
        };
      });
    },
    [],
  );

  const refreshNotifications = useCallback(async () => {
    await loadNotifications(true);
  }, [loadNotifications]);
  
  /**
   * Handle WebSocket notifications
   * Phase 4 - Task 4.3.1: Subscribe to WebSocket notifications
   */
  useEffect(() => {
    if (!wsLastMessage) return;
    
    try {
      // Convert WebSocket notification to AdminNotification
      const adminNotification: AdminNotification = {
        id: wsLastMessage.id,
        title: wsLastMessage.title,
        message: wsLastMessage.message,
        type: mapBackendTypeToNotificationType(wsLastMessage.type),
        timestamp: new Date(wsLastMessage.timestamp),
        createdAt: new Date(wsLastMessage.timestamp),
        read: wsLastMessage.is_read || false,
        isRead: wsLastMessage.is_read || false,
        href: (typeof wsLastMessage.data?.action_url === 'string' ? wsLastMessage.data.action_url : undefined) || 
              (typeof wsLastMessage.data?.href === 'string' ? wsLastMessage.data.href : undefined),
        data: wsLastMessage.data,
      };
      
      // Add to state (task 4.3.2: Hybrid mode - WebSocket for real-time push)
      setNotificationsState(prev => {
        // Check for duplicates (task 4.3.2: Local state merge - deduplicate)
        const exists = prev.notifications.some(n => n.id === adminNotification.id);
        if (exists) {
          logger.debug('[AdminNotifications] Duplicate WebSocket notification ignored', { id: adminNotification.id });
          return prev;
        }
        
        const notifications = [adminNotification, ...prev.notifications].slice(0, MAX_CACHED_NOTIFICATIONS);
        const unreadCount = notifications.filter(n => !n.read).length;
        
        return {
          ...prev,
          notifications,
          unreadCount,
          lastUpdated: new Date(),
        };
      });
      
      logger.info('[AdminNotifications] WebSocket notification added', { 
        id: adminNotification.id, 
        title: adminNotification.title 
      });
    } catch (error) {
      logger.error('[AdminNotifications] Failed to process WebSocket notification', { error });
    }
  }, [wsLastMessage]);

  // ❌ DISABLED: Mock notification generator - using real data only
  // Keep the function for potential manual testing, but don't auto-call it
  // const generateRandomNotification = useCallback(() => {
  //   const notificationTypes: NotificationType[] = ['info', 'success', 'warning', 'error'];
  //   const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

  //   const notificationMap: Record<NotificationType, Omit<AdminNotification, 'id' | 'createdAt'>> = {
  //     info: {
  //       title: 'Người dùng mới đăng ký',
  //       message: 'Có 3 người dùng mới đăng ký trong 10 phút qua',
  //       type: 'info',
  //       timestamp: new Date(),
  //       read: false,
  //       isRead: false,
  //       href: '/3141592654/admin/users?filter=new',
  //     },
  //     success: {
  //       title: 'Hoàn tất sao lưu hệ thống',
  //       message: 'Backup dữ liệu hoàn thành lúc 02:15',
  //       type: 'success',
  //       timestamp: new Date(),
  //       read: false,
  //       isRead: false,
  //       href: '/3141592654/admin/settings/backups',
  //     },
  //     warning: {
  //       title: 'Cảnh báo hiệu suất',
  //       message: 'Database response time cao hơn bình thường',
  //       type: 'warning',
  //       timestamp: new Date(),
  //       read: false,
  //       isRead: false,
  //       href: '/3141592654/admin/analytics?tab=performance',
  //     },
  //     error: {
  //       title: 'Lỗi xử lý đề thi',
  //       message: 'Không thể đồng bộ đề thi',
  //       type: 'error',
  //       timestamp: new Date(),
  //       read: false,
  //       isRead: false,
  //       href: '/3141592654/admin/exams/sync',
  //     },
  //   };

  //   const candidates = notificationMap[randomType];
  //   addNotification(candidates);
  // }, [addNotification]);

  // ❌ DISABLED: Mock WebSocket notifications - using real data only
  // useEffect(() => {
  //   if (!lastMessage || typeof lastMessage !== 'object') return;
  //   if (!('type' in lastMessage) || lastMessage.type !== 'notification') return;

  //   const payload = lastMessage.data as Record<string, unknown> | undefined;

  //   addNotification({
  //     title: (payload?.title as string) || 'Thông báo hệ thống',
  //     message: (payload?.message as string) || '',
  //     type: mapBackendTypeToNotificationType(payload?.type as string | undefined),
  //     timestamp: payload?.timestamp ? new Date(String(payload.timestamp)) : new Date(),
  //     read: Boolean(payload?.read),
  //     isRead: Boolean(payload?.read),
  //     actionUrl: (payload?.actionUrl as string) || (payload?.href as string),
  //     href: (payload?.actionUrl as string) || (payload?.href as string),
  //     data: payload as Record<string, string> | undefined,
  //   });
  // }, [lastMessage, addNotification]);

  // ❌ DISABLED: Auto-generate mock notifications - using real data only
  // useEffect(() => {
  //   if (!isConnected) {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //       intervalRef.current = null;
  //     }
  //     return;
  //   }

  //   intervalRef.current = setInterval(() => {
  //     if (Math.random() < 0.3) {
  //       generateRandomNotification();
  //     }
  //   }, 30_000);

  //   return () => {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //       intervalRef.current = null;
  //     }
  //   };
  // }, [isConnected, generateRandomNotification]);

  /**
   * Initial load effect
   * ✅ FIX: Remove loadNotifications from dependencies to prevent infinite loop
   * Use ref to access latest function and initialFetchDoneRef to prevent double-fetch in React Strict Mode
   */
  useEffect(() => {
    if (isAuthenticated) {
      // Only fetch once per authentication state change
      if (!initialFetchDoneRef.current) {
        initialFetchDoneRef.current = true;
        
        if (loadNotificationsRef.current) {
          logger.info('[AdminNotificationsProvider] Initial fetch triggered');
          loadNotificationsRef.current(true).catch(() => {
            /** swallow initial error - already logged */
          });
        }
      }
    } else {
      // Reset when logged out
      initialFetchDoneRef.current = false;
      setNotificationsState(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
      }));
    }

    // Cleanup removed - no intervals used when using real data only
  }, [isAuthenticated]); // ✅ FIX: Remove loadNotifications from dependencies

  const contextValue = useMemo<UseAdminNotificationsReturn>(() => ({
    state: notificationsState,
    actions: {
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications,
      addNotification,
      refreshNotifications,
    },
    notifications: notificationsState.notifications,
    unreadCount: notificationsState.unreadCount,
    isLoading: notificationsState.isLoading,
    error: notificationsState.error,
    markAsRead,
    markAllAsRead,
    clearNotification,
    addNotification,
  }), [
    notificationsState,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    addNotification,
    refreshNotifications,
  ]);

  return createElement(
    AdminNotificationsContext.Provider,
    { value: contextValue },
    children,
  );
}

export function useAdminNotifications(): UseAdminNotificationsReturn {
  const context = useContext(AdminNotificationsContext);

  if (!context) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationsProvider');
  }

  return context;
}

export function useNotificationToast() {
  const { addNotification } = useAdminNotifications();

  const showToast = useCallback((
    title: string,
    message: string,
    type: NotificationType = 'info',
  ) => {
    addNotification({
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      isRead: false,
    });
  }, [addNotification]);

  return {
    showToast,
    showInfo: (title: string, message: string) => showToast(title, message, 'info'),
    showSuccess: (title: string, message: string) => showToast(title, message, 'success'),
    showWarning: (title: string, message: string) => showToast(title, message, 'warning'),
    showError: (title: string, message: string) => showToast(title, message, 'error'),
  };
}

export default NotificationService;
