/**
 * Notification gRPC Service
 * Service để kết nối với backend notification system
 */

// import { GRPC_WEB_HOST, getAuthMetadata } from './client';
import { AuthHelpers } from '@/lib/utils/auth-helpers';

// Notification interfaces matching backend structure
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

export interface CreateNotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, string>;
  expiresAt?: string;
}

export interface MarkAsReadRequest {
  notificationId: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  securityAlerts: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
}

/**
 * Notification Service Class
 */
export class NotificationService {
  // TODO: Initialize gRPC client when protobuf files are generated
  // private static client = new GrpcWebClient();

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}): Promise<NotificationListResponse> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      const { page = 1, limit = 20, unreadOnly = false } = params;

      // Mock implementation - replace with actual gRPC call
      // const response = await this.client.notificationService.getUserNotifications({
      //   page,
      //   limit,
      //   unreadOnly
      // }, { authorization: `Bearer ${accessToken}` });

      // Mock data for now
      const mockNotifications: BackendNotification[] = [
        {
          id: '1',
          userId: 'current-user',
          type: 'SECURITY_ALERT',
          title: 'Đăng nhập từ thiết bị mới',
          message: 'Tài khoản của bạn vừa được đăng nhập từ thiết bị mới tại TP.HCM',
          data: {
            deviceType: 'desktop',
            location: 'Ho Chi Minh City',
            ipAddress: '192.168.1.100'
          },
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'current-user',
          type: 'SYSTEM_MESSAGE',
          title: 'Cập nhật hệ thống',
          message: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai',
          data: {
            maintenanceStart: '2024-01-16T02:00:00Z',
            maintenanceEnd: '2024-01-16T04:00:00Z'
          },
          isRead: true,
          readAt: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '3',
          userId: 'current-user',
          type: 'COURSE_UPDATE',
          title: 'Khóa học mới được thêm',
          message: 'Khóa học "Advanced React Patterns" đã được thêm vào thư viện',
          data: {
            courseId: 'course-123',
            courseName: 'Advanced React Patterns'
          },
          isRead: false,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        }
      ];

      // Apply filters
      let filteredNotifications = mockNotifications;
      if (unreadOnly) {
        filteredNotifications = filteredNotifications.filter(n => !n.isRead);
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + limit);

      const unreadCount = mockNotifications.filter(n => !n.isRead).length;

      return {
        notifications: paginatedNotifications,
        total: filteredNotifications.length,
        unreadCount
      };
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      throw new Error('Không thể tải thông báo');
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      // const response = await this.client.notificationService.markAsRead({
      //   notificationId
      // }, { authorization: `Bearer ${accessToken}` });

      console.log(`Marked notification ${notificationId} as read`);
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      // const response = await this.client.notificationService.markAllAsRead({}, {
      //   authorization: `Bearer ${accessToken}`
      // });

      console.log('Marked all notifications as read');
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      // const response = await this.client.notificationService.deleteNotification({
      //   notificationId
      // }, { authorization: `Bearer ${accessToken}` });

      console.log(`Deleted notification ${notificationId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        return 0;
      }

      // Mock implementation
      // const response = await this.client.notificationService.getUnreadCount({}, {
      //   authorization: `Bearer ${accessToken}`
      // });

      // Mock unread count
      return 2;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Create notification (admin only)
   */
  static async createNotification(request: CreateNotificationRequest): Promise<BackendNotification | null> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      // const response = await this.client.notificationService.createNotification(request, {
      //   authorization: `Bearer ${accessToken}`
      // });

      // Mock created notification
      const mockNotification: BackendNotification = {
        id: `notif-${Date.now()}`,
        userId: request.userId,
        type: request.type,
        title: request.title,
        message: request.message,
        data: request.data || {},
        isRead: false,
        createdAt: new Date().toISOString(),
        expiresAt: request.expiresAt
      };

      return mockNotification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }

  /**
   * Get notification preferences
   */
  static async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      // const response = await this.client.notificationService.getPreferences({}, {
      //   authorization: `Bearer ${accessToken}`
      // });

      // Mock preferences
      return {
        userId: 'current-user',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        securityAlerts: true,
        productUpdates: true,
        marketingEmails: false
      };
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return null;
    }
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      // const response = await this.client.notificationService.updatePreferences(preferences, {
      //   authorization: `Bearer ${accessToken}`
      // });

      console.log('Updated notification preferences:', preferences);
      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time notifications (WebSocket/SSE)
   */
  static subscribeToNotifications(
    onNotification: (notification: BackendNotification) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock WebSocket connection
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
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      if (onError) {
        onError(error as Error);
      }
      return () => {}; // No-op cleanup
    }
  }
}
