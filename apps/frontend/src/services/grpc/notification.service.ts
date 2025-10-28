/**
 * Notification Service Client (gRPC-Web)
 * ======================
 * Real gRPC client implementation for NotificationService
 * Replaces mock implementation with actual backend calls
 *
 * @author NyNus Development Team
 * @version 2.0.0 - Real gRPC Implementation
 * @created 2025-01-19
 */

// gRPC-Web imports
import { NotificationServiceClient } from '@/generated/v1/NotificationServiceClientPb';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import {
  Notification as PbNotification,
  GetNotificationsRequest,
  MarkAsReadRequest,
  MarkAllAsReadRequest,
  DeleteNotificationRequest,
  DeleteAllNotificationsRequest,
  CreateNotificationRequest,
} from '@/generated/v1/notification_pb';
import { RpcError } from 'grpc-web';

// gRPC client utilities
import { getAuthMetadata } from './client';
import { createGrpcClient } from './client-factory';

// ===== FRONTEND TYPES =====

export interface BackendNotification {
  id: string;
  userId: string;
  type: string; // SECURITY_ALERT, COURSE_UPDATE, SYSTEM_MESSAGE, etc.
  title: string;
  message: string;
  data: Record<string, string>;
  isRead: boolean;
  readAt?: string; // RFC3339 timestamp
  createdAt: string; // RFC3339 timestamp
  expiresAt?: string; // RFC3339 timestamp
}

export interface NotificationListResponse {
  notifications: BackendNotification[];
  total: number;
  unreadCount: number;
}

export interface CreateNotificationRequestData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, string>;
  expiresAt?: string;
}

// ===== gRPC CLIENT INITIALIZATION =====

// ✅ FIX: Use client factory for lazy initialization
const getNotificationServiceClient = createGrpcClient(NotificationServiceClient, 'NotificationService');

// ===== OBJECT MAPPERS =====

/**
 * Map protobuf Notification to frontend BackendNotification
 */
function mapNotificationFromPb(pbNotification: PbNotification): BackendNotification {
  const notificationObj = pbNotification.toObject();
  
  // Convert dataMap array to Record<string, string>
  const dataMap: Record<string, string> = {};
  notificationObj.dataMap.forEach(([key, value]) => {
    dataMap[key] = value;
  });
  
  return {
    id: notificationObj.id,
    userId: notificationObj.userId,
    type: notificationObj.type,
    title: notificationObj.title,
    message: notificationObj.message,
    data: dataMap,
    isRead: notificationObj.isRead,
    readAt: notificationObj.readAt ? String(notificationObj.readAt) : undefined,
    createdAt: String(notificationObj.createdAt || ''),
    expiresAt: notificationObj.expiresAt ? String(notificationObj.expiresAt) : undefined,
  };
}

// ===== CACHING MECHANISM =====

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_DURATION = 30000; // 30 seconds cache

/**
 * Get cached data if still valid
 */
function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Set cached data
 */
function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Clear cache by pattern
 */
function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => cache.delete(key));
}

// ===== ERROR HANDLING =====

/**
 * Check if error is rate limit error
 */
function isRateLimitError(error: RpcError): boolean {
  return error.code === 8 || // RESOURCE_EXHAUSTED
         error.message?.toLowerCase().includes('rate limit');
}

/**
 * Handle gRPC errors and convert to user-friendly messages
 */
function handleGrpcError(error: RpcError, options?: { silent?: boolean }): string {
  const isRateLimit = isRateLimitError(error);
  
  // Log based on error type
  if (isRateLimit) {
    if (!options?.silent) {
      console.warn('[NotificationService] Rate limit exceeded, using cached data if available');
    }
  } else {
    console.error('[NotificationService] gRPC Error:', error);
  }
  
  switch (error.code) {
    case 3: return error.message || 'Dữ liệu không hợp lệ';
    case 5: return 'Không tìm thấy thông báo';
    case 7: return 'Bạn không có quyền thực hiện thao tác này';
    case 8: return error.message || 'Vui lòng thử lại sau';
    case 14: return 'Dịch vụ tạm thời không khả dụng';
    case 16: return 'Vui lòng đăng nhập để tiếp tục';
    default: return error.message || 'Đã xảy ra lỗi không xác định';
  }
}

// ===== NOTIFICATION SERVICE IMPLEMENTATION =====

export class NotificationService {
  /**
   * Get user notifications with pagination
   * Lấy danh sách thông báo của user
   * 
   * ✅ FIX: Added caching and graceful error handling for rate limit
   */
  static async getUserNotifications(params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}): Promise<NotificationListResponse> {
    const { page = 1, limit = 20, unreadOnly = false } = params;
    const cacheKey = `notification:list:${page}:${limit}:${unreadOnly}`;
    
    // Check cache first (only for first page to keep data fresh)
    if (page === 1) {
      const cached = getCachedData<NotificationListResponse>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }
    
    try {
      const offset = (page - 1) * limit;

      const request = new GetNotificationsRequest();
      request.setLimit(limit);
      request.setOffset(offset);
      request.setUnreadOnly(unreadOnly);

      const response = await getNotificationServiceClient().getNotifications(request, getAuthMetadata());
      const notifications = response.getNotificationsList().map(mapNotificationFromPb);
      
      const result = {
        notifications,
        total: response.getTotal(),
        unreadCount: response.getUnreadCount(),
      };
      
      // Cache the result (only for first page)
      if (page === 1) {
        setCachedData(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      const rpcError = error as RpcError;
      const isRateLimit = isRateLimitError(rpcError);
      
      // Handle rate limit gracefully
      if (isRateLimit) {
        console.warn('[NotificationService] Rate limit exceeded for getUserNotifications, returning empty list');
        // Return empty list instead of throwing error
        return {
          notifications: [],
          total: 0,
          unreadCount: 0,
        };
      }
      
      // For other errors, still throw
      const errorMessage = handleGrpcError(rpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get unread count
   * Lấy số lượng thông báo chưa đọc
   * 
   * ✅ FIX: Added caching and graceful error handling for rate limit
   */
  static async getUnreadCount(): Promise<number> {
    const cacheKey = 'notification:unread-count';
    
    // Check cache first
    const cached = getCachedData<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const request = new GetNotificationsRequest();
      request.setLimit(1);
      request.setOffset(0);
      request.setUnreadOnly(true);

      const response = await getNotificationServiceClient().getNotifications(request, getAuthMetadata());
      const count = response.getUnreadCount();
      
      // Cache the result
      setCachedData(cacheKey, count);
      
      return count;
    } catch (error) {
      const rpcError = error as RpcError;
      const isRateLimit = isRateLimitError(rpcError);
      
      // Handle rate limit gracefully
      if (isRateLimit) {
        console.warn('[NotificationService] Rate limit exceeded for getUnreadCount, returning 0');
        // Return 0 instead of throwing error
        return 0;
      }
      
      // For other errors, still throw
      const errorMessage = handleGrpcError(rpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Mark notification as read
   * Đánh dấu thông báo đã đọc
   * 
   * ✅ FIX: Clear cache after mutation
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const request = new MarkAsReadRequest();
      request.setId(notificationId);

      const response = await getNotificationServiceClient().markAsRead(request, getAuthMetadata());
      const success = response.getSuccess();
      
      // Clear notification cache to force refresh
      if (success) {
        clearCache('notification:');
      }
      
      return success;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Mark all notifications as read
   * Đánh dấu tất cả thông báo đã đọc
   * 
   * ✅ FIX: Clear cache after mutation
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      const request = new MarkAllAsReadRequest();

      const response = await getNotificationServiceClient().markAllAsRead(request, getAuthMetadata());
      const success = response.getMarkedCount() > 0;
      
      // Clear notification cache to force refresh
      if (success) {
        clearCache('notification:');
      }
      
      return success;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete notification
   * Xóa thông báo
   * 
   * ✅ FIX: Clear cache after mutation
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const request = new DeleteNotificationRequest();
      request.setId(notificationId);

      const response = await getNotificationServiceClient().deleteNotification(request, getAuthMetadata());
      const success = response.getSuccess();
      
      // Clear notification cache to force refresh
      if (success) {
        clearCache('notification:');
      }
      
      return success;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete all notifications
   * Xóa tất cả thông báo
   * 
   * ✅ FIX: Clear cache after mutation
   */
  static async deleteAllNotifications(): Promise<number> {
    try {
      const request = new DeleteAllNotificationsRequest();

      const response = await getNotificationServiceClient().deleteAllNotifications(request, getAuthMetadata());
      const deletedCount = response.getDeletedCount();
      
      // Clear notification cache to force refresh
      if (deletedCount > 0) {
        clearCache('notification:');
      }
      
      return deletedCount;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create notification (admin only)
   * Tạo thông báo (chỉ admin)
   * 
   * ✅ FIX: Clear cache after mutation
   */
  static async createNotification(requestData: CreateNotificationRequestData): Promise<BackendNotification | null> {
    try {
      const request = new CreateNotificationRequest();
      request.setUserId(requestData.userId);
      request.setType(requestData.type);
      request.setTitle(requestData.title);
      request.setMessage(requestData.message);
      
      if (requestData.data) {
        const dataMap = request.getDataMap();
        Object.entries(requestData.data).forEach(([key, value]) => {
          dataMap.set(key, value);
        });
      }
      
      if (requestData.expiresAt) {
        const timestamp = new Timestamp();
        const date = new Date(requestData.expiresAt);
        timestamp.setSeconds(Math.floor(date.getTime() / 1000));
        timestamp.setNanos((date.getTime() % 1000) * 1000000);
        request.setExpiresAt(timestamp);
      }

      const response = await getNotificationServiceClient().createNotification(request, getAuthMetadata());
      const notification = response.getNotification();
      
      // Clear notification cache to force refresh
      if (notification) {
        clearCache('notification:');
      }
      
      return notification ? mapNotificationFromPb(notification) : null;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  // NOTE: Notification preferences have been migrated to ProfileService
  // Use ProfileService.getPreferences() and ProfileService.updatePreferences() instead
  // See: apps/frontend/src/hooks/notifications/use-backend-notifications.ts

  /**
   * Subscribe to real-time notifications (mock - WebSocket not implemented)
   * Đăng ký nhận thông báo real-time
   */
  static subscribeToNotifications(
    onNotification: (notification: BackendNotification) => void,
    _onError: (error: Error) => void
  ): () => void {
    // Mock WebSocket connection
    console.warn('subscribeToNotifications: Mock implementation - WebSocket not implemented');
    console.log('Subscribing to real-time notifications...');

    // Simulate receiving notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        const mockNotification: BackendNotification = {
          id: `notif-${Date.now()}`,
          userId: 'current-user',
          type: 'SECURITY_ALERT',
          title: 'Hoạt động đáng nghi ngờ',
          message: 'Phát hiện nhiều lần đăng nhập thất bại từ IP lạ',
          data: {
            ipAddress: '10.0.0.50',
            attempts: '5'
          },
          isRead: false,
          createdAt: new Date().toISOString()
        };
        onNotification(mockNotification);
      }
    }, 10000);

    // Return cleanup function
    return () => {
      clearInterval(interval);
      console.log('Unsubscribed from real-time notifications');
    };
  }
}

export default NotificationService;
