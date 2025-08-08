/**
 * Mock data for notifications - Admin management
 * Dữ liệu mock cho quản lý thông báo admin
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { MockPagination, MockApiResponse } from './types';

/**
 * System Notification Interface
 * Interface cho system notifications trong admin dashboard
 */
export interface SystemNotification {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'SECURITY_ALERT' | 'COURSE_UPDATE' | 'SYSTEM_MESSAGE' | 'ACHIEVEMENT' | 'SOCIAL' | 'PAYMENT';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Notification Statistics Interface
 * Interface cho thống kê thông báo
 */
export interface NotificationStats {
  totalSentToday: number;
  totalUnread: number;
  notificationsByType: Record<string, number>;
  readRate: number;
  mostActiveType: string;
  averageReadTime: number;
  sentThisWeek: number;
  growthPercentage: number;
}

/**
 * Mock System Notifications Data
 * Dữ liệu mock cho system notifications
 */
export const mockSystemNotifications: SystemNotification[] = [
  {
    id: 'sys-notif-001',
    userId: 'student-001',
    userEmail: 'hv001@student.nynus.edu.vn',
    userName: 'Nguyễn Văn An',
    type: 'SECURITY_ALERT',
    title: 'Đăng nhập từ thiết bị mới',
    message: 'Tài khoản của bạn đã được đăng nhập từ iPhone tại TP.HCM lúc 16:45 ngày 15/01/2025. Nếu không phải bạn, vui lòng thay đổi mật khẩu ngay.',
    data: { deviceType: 'iPhone', location: 'TP.HCM', ipAddress: '10.0.0.50' },
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sys-notif-002',
    userId: 'student-002',
    userEmail: 'hv002@student.nynus.edu.vn',
    userName: 'Trần Thị Bình',
    type: 'COURSE_UPDATE',
    title: 'Bài học mới đã có sẵn',
    message: 'Bài học "Cực trị hàm số nâng cao" đã được thêm vào khóa học "Toán học lớp 12". Hãy xem ngay!',
    data: { courseId: 'course-001', lessonId: 'lesson-new-001' },
    isRead: true,
    readAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'sys-notif-003',
    userId: 'student-003',
    userEmail: 'hv003@student.nynus.edu.vn',
    userName: 'Lê Minh Cường',
    type: 'SYSTEM_MESSAGE',
    title: 'Bảo trì hệ thống',
    message: 'Hệ thống sẽ được bảo trì từ 2:00-4:00 sáng ngày 16/01/2025. Trong thời gian này, bạn có thể không truy cập được một số tính năng.',
    data: { maintenanceStart: '2025-01-16T02:00:00Z', maintenanceEnd: '2025-01-16T04:00:00Z' },
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sys-notif-004',
    userId: 'teacher-001',
    userEmail: 'gv001@teacher.nynus.edu.vn',
    userName: 'Phạm Thị Lan',
    type: 'ACHIEVEMENT',
    title: 'Chứng chỉ mới đã được cấp',
    message: 'Chúc mừng! Bạn đã hoàn thành khóa học "React Advanced" và nhận được chứng chỉ.',
    data: { courseId: 'course-react-advanced', certificateId: 'cert-001' },
    isRead: true,
    readAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'sys-notif-005',
    userId: 'student-004',
    userEmail: 'hv004@student.nynus.edu.vn',
    userName: 'Võ Văn Nam',
    type: 'SOCIAL',
    title: 'Bình luận mới trên bài viết',
    message: 'Có 3 bình luận mới trên bài viết "Cách học hiệu quả" của bạn.',
    data: { postId: 'post-001', commentCount: 3 },
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sys-notif-006',
    userId: 'student-005',
    userEmail: 'hv005@student.nynus.edu.vn',
    userName: 'Nguyễn Thị Mai',
    type: 'PAYMENT',
    title: 'Thanh toán thành công',
    message: 'Thanh toán cho khóa học "JavaScript Fundamentals" đã được xử lý thành công. Bạn có thể bắt đầu học ngay.',
    data: { courseId: 'course-js-fundamentals', amount: 299000, paymentId: 'pay-001' },
    isRead: true,
    readAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  }
];

/**
 * Mock Notification Statistics
 * Thống kê mock cho notifications
 */
export const mockNotificationStats: NotificationStats = {
  totalSentToday: 156,
  totalUnread: 89,
  notificationsByType: {
    SYSTEM_MESSAGE: 45,
    SECURITY_ALERT: 23,
    COURSE_UPDATE: 34,
    ACHIEVEMENT: 12,
    SOCIAL: 8,
    PAYMENT: 5,
  },
  readRate: 78,
  mostActiveType: 'SYSTEM_MESSAGE',
  averageReadTime: 2.5,
  sentThisWeek: 567,
  growthPercentage: 12,
};

/**
 * Helper Functions for Notification Management
 * Các hàm helper cho quản lý notifications
 */

/**
 * Get notification by ID
 * Lấy notification theo ID
 */
export function getNotificationById(id: string): SystemNotification | undefined {
  return mockSystemNotifications.find(notification => notification.id === id);
}

/**
 * Get notifications by user ID
 * Lấy notifications theo user ID
 */
export function getNotificationsByUser(userId: string): SystemNotification[] {
  return mockSystemNotifications.filter(notification => notification.userId === userId);
}

/**
 * Get unread notifications
 * Lấy notifications chưa đọc
 */
export function getUnreadNotifications(): SystemNotification[] {
  return mockSystemNotifications.filter(notification => !notification.isRead);
}

/**
 * Get notifications by type
 * Lấy notifications theo loại
 */
export function getNotificationsByType(type: SystemNotification['type']): SystemNotification[] {
  return mockSystemNotifications.filter(notification => notification.type === type);
}

/**
 * Search notifications
 * Tìm kiếm notifications
 */
export function searchNotifications(query: string): SystemNotification[] {
  const searchTerm = query.toLowerCase();
  return mockSystemNotifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm) ||
    notification.message.toLowerCase().includes(searchTerm) ||
    notification.userEmail.toLowerCase().includes(searchTerm) ||
    notification.userName.toLowerCase().includes(searchTerm)
  );
}

/**
 * Filter notifications by read status
 * Lọc notifications theo trạng thái đọc
 */
export function filterNotificationsByReadStatus(isRead: boolean): SystemNotification[] {
  return mockSystemNotifications.filter(notification => notification.isRead === isRead);
}

/**
 * Get notifications by date range
 * Lấy notifications theo khoảng thời gian
 */
export function getNotificationsByDateRange(startDate: Date, endDate: Date): SystemNotification[] {
  return mockSystemNotifications.filter(notification => {
    const createdAt = new Date(notification.createdAt);
    return createdAt >= startDate && createdAt <= endDate;
  });
}

/**
 * Mock API response for notifications
 * Response API mock cho notifications
 */
export function getMockNotificationsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    type?: SystemNotification['type'];
    isRead?: boolean;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }
): MockApiResponse<{ notifications: SystemNotification[]; pagination: MockPagination }> {
  let filteredNotifications = [...mockSystemNotifications];

  // Apply filters
  if (filters?.type) {
    filteredNotifications = getNotificationsByType(filters.type);
  }
  if (filters?.isRead !== undefined) {
    filteredNotifications = filteredNotifications.filter(n => n.isRead === filters.isRead);
  }
  if (filters?.search) {
    filteredNotifications = searchNotifications(filters.search);
  }
  if (filters?.startDate && filters?.endDate) {
    filteredNotifications = getNotificationsByDateRange(filters.startDate, filters.endDate);
  }

  // Apply pagination
  const total = filteredNotifications.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  };
}

/**
 * Mock API response for notification statistics
 * Response API mock cho thống kê notifications
 */
export function getMockNotificationStatsResponse(): MockApiResponse<NotificationStats> {
  return {
    success: true,
    data: mockNotificationStats,
    message: 'Notification statistics retrieved successfully'
  };
}
