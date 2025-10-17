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
import { getGrpcUrl } from '@/lib/config/endpoints';
import { getAuthMetadata } from './client';

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

const GRPC_ENDPOINT = getGrpcUrl();
const notificationServiceClient = new NotificationServiceClient(GRPC_ENDPOINT);

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
    readAt: notificationObj.readAt || undefined,
    createdAt: notificationObj.createdAt,
    expiresAt: notificationObj.expiresAt || undefined,
  };
}

// ===== ERROR HANDLING =====

/**
 * Handle gRPC errors and convert to user-friendly messages
 */
function handleGrpcError(error: RpcError): string {
  console.error('gRPC Error:', error);
  switch (error.code) {
    case 3: return error.message || 'Dữ liệu không hợp lệ';
    case 5: return 'Không tìm thấy thông báo';
    case 7: return 'Bạn không có quyền thực hiện thao tác này';
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
   */
  static async getUserNotifications(params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}): Promise<NotificationListResponse> {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = params;
      const offset = (page - 1) * limit;

      const request = new GetNotificationsRequest();
      request.setLimit(limit);
      request.setOffset(offset);
      request.setUnreadOnly(unreadOnly);

      const response = await notificationServiceClient.getNotifications(request, getAuthMetadata());
      const notifications = response.getNotificationsList().map(mapNotificationFromPb);
      
      return {
        notifications,
        total: response.getTotal(),
        unreadCount: response.getUnreadCount(),
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get unread count
   * Lấy số lượng thông báo chưa đọc
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const request = new GetNotificationsRequest();
      request.setLimit(1);
      request.setOffset(0);
      request.setUnreadOnly(true);

      const response = await notificationServiceClient.getNotifications(request, getAuthMetadata());
      return response.getUnreadCount();
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Mark notification as read
   * Đánh dấu thông báo đã đọc
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const request = new MarkAsReadRequest();
      request.setId(notificationId);

      const response = await notificationServiceClient.markAsRead(request, getAuthMetadata());
      return response.getSuccess();
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Mark all notifications as read
   * Đánh dấu tất cả thông báo đã đọc
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      const request = new MarkAllAsReadRequest();

      const response = await notificationServiceClient.markAllAsRead(request, getAuthMetadata());
      return response.getMarkedCount() > 0;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete notification
   * Xóa thông báo
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const request = new DeleteNotificationRequest();
      request.setId(notificationId);

      const response = await notificationServiceClient.deleteNotification(request, getAuthMetadata());
      return response.getSuccess();
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete all notifications
   * Xóa tất cả thông báo
   */
  static async deleteAllNotifications(): Promise<number> {
    try {
      const request = new DeleteAllNotificationsRequest();

      const response = await notificationServiceClient.deleteAllNotifications(request, getAuthMetadata());
      return response.getDeletedCount();
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create notification (admin only)
   * Tạo thông báo (chỉ admin)
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
        request.setExpiresAt(requestData.expiresAt);
      }

      const response = await notificationServiceClient.createNotification(request, getAuthMetadata());
      const notification = response.getNotification();
      
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
