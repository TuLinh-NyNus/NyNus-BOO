/**
 * Admin Header Mock Data
 * Mockdata cho admin header components (search, user menu, notifications)
 */

import { MockDataUtils } from './utils';

/**
 * Admin User Interface
 * Interface cho admin user trong header
 */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Admin Notification Interface
 * Interface cho notifications trong header
 */
export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon?: string;
}

/**
 * Search Suggestion Interface
 * Interface cho search suggestions
 */
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'user' | 'course' | 'question' | 'page';
  url: string;
  icon?: string;
  description?: string;
}

/**
 * Mock Admin User Data
 * Mock data cho current admin user
 */
export const mockAdminUser: AdminUser = {
  id: 'admin-001',
  name: 'Admin User',
  email: 'admin@nynus.edu.vn',
  avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzNCODJGNiIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2LCAxNikiPgogICAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KICAgIDxwYXRoIGQ9Ik04IDI4YzAtNC40IDMuNi04IDgtOHM4IDMuNiA4IDh2NEg4di00eiIgZmlsbD0id2hpdGUiLz4KICAgIDxwYXRoIGQ9Ik0xMCA4bDItMiA0IDMgNC0zIDIgMi0xIDRIMTFsLTEtNHoiIGZpbGw9IiNGQ0QzNEQiLz4KICA8L2c+Cjwvc3ZnPg==',
  role: 'ADMIN',
  firstName: 'Admin',
  lastName: 'User'
};

/**
 * Mock Notifications Data
 * Mock data cho admin notifications
 */
export const mockNotifications: AdminNotification[] = [
  {
    id: 'notif-001',
    title: 'Người dùng mới đăng ký',
    message: '5 người dùng mới đã đăng ký trong 1 giờ qua',
    type: 'info',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: false,
    actionUrl: '/3141592654/admin/users',
    icon: 'Users'
  },
  {
    id: 'notif-002',
    title: 'Cảnh báo hiệu suất',
    message: 'Database response time cao hơn bình thường',
    type: 'warning',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    actionUrl: '/3141592654/admin/analytics',
    icon: 'AlertTriangle'
  },
  {
    id: 'notif-003',
    title: 'Khóa học mới được tạo',
    message: '"Advanced React Patterns" đã được thêm vào hệ thống',
    type: 'success',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: true,
    actionUrl: '/3141592654/admin/questions',
    icon: 'BookOpen'
  },
  {
    id: 'notif-004',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống đã được cập nhật lên version 2.1.0',
    type: 'info',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: true,
    actionUrl: '/3141592654/admin/settings',
    icon: 'Settings'
  },
  {
    id: 'notif-005',
    title: 'Lỗi đăng nhập',
    message: 'Phát hiện nhiều lần đăng nhập thất bại từ IP 192.168.1.100',
    type: 'error',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: true,
    actionUrl: '/3141592654/admin/security',
    icon: 'Shield'
  }
];

/**
 * Mock Search Suggestions Data
 * Mock data cho search suggestions
 */
export const mockSearchSuggestions: SearchSuggestion[] = [
  // User suggestions
  {
    id: 'search-user-001',
    text: 'Nguyễn Văn An',
    type: 'user',
    url: '/3141592654/admin/users/user-001',
    icon: 'User',
    description: 'Học viên - Level 5'
  },
  {
    id: 'search-user-002',
    text: 'Trần Thị Bình',
    type: 'user',
    url: '/3141592654/admin/users/user-002',
    icon: 'User',
    description: 'Giáo viên - Toán học'
  },
  
  // Course suggestions
  {
    id: 'search-course-001',
    text: 'React Advanced Patterns',
    type: 'course',
    url: '/3141592654/admin/questions?course=react-advanced',
    icon: 'BookOpen',
    description: 'Khóa học lập trình'
  },
  {
    id: 'search-course-002',
    text: 'Toán học cơ bản',
    type: 'course',
    url: '/3141592654/admin/questions?course=math-basic',
    icon: 'BookOpen',
    description: 'Khóa học toán'
  },
  
  // Question suggestions
  {
    id: 'search-question-001',
    text: 'Câu hỏi về React Hooks',
    type: 'question',
    url: '/3141592654/admin/questions/question-001',
    icon: 'FileQuestion',
    description: 'Câu hỏi lập trình'
  },
  {
    id: 'search-question-002',
    text: 'Phương trình bậc hai',
    type: 'question',
    url: '/3141592654/admin/questions/question-002',
    icon: 'FileQuestion',
    description: 'Câu hỏi toán học'
  },
  
  // Page suggestions
  {
    id: 'search-page-001',
    text: 'Quản lý người dùng',
    type: 'page',
    url: '/3141592654/admin/users',
    icon: 'Users',
    description: 'Trang quản lý'
  },
  {
    id: 'search-page-002',
    text: 'Thống kê hệ thống',
    type: 'page',
    url: '/3141592654/admin/analytics',
    icon: 'BarChart3',
    description: 'Trang báo cáo'
  },
  {
    id: 'search-page-003',
    text: 'Cài đặt bảo mật',
    type: 'page',
    url: '/3141592654/admin/security',
    icon: 'Shield',
    description: 'Trang cài đặt'
  }
];

/**
 * Admin Header Mock Service
 * Service để mock các API calls cho header
 */
export const adminHeaderMockService = {
  /**
   * Get current admin user
   * Lấy thông tin admin user hiện tại
   */
  getCurrentUser: (): Promise<AdminUser> => {
    return MockDataUtils.simulateApiCall(mockAdminUser, 200);
  },

  /**
   * Get admin notifications
   * Lấy danh sách notifications
   */
  getNotifications: (limit: number = 10): Promise<AdminNotification[]> => {
    const notifications = mockNotifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    return MockDataUtils.simulateApiCall(notifications, 300);
  },

  /**
   * Get unread notifications count
   * Lấy số lượng notifications chưa đọc
   */
  getUnreadNotificationsCount: (): Promise<number> => {
    const unreadCount = mockNotifications.filter(n => !n.read).length;
    return MockDataUtils.simulateApiCall(unreadCount, 150);
  },

  /**
   * Mark notification as read
   * Đánh dấu notification đã đọc
   */
  markNotificationAsRead: (notificationId: string): Promise<{ success: boolean }> => {
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return MockDataUtils.simulateApiCall({ success: true }, 150);
  },

  /**
   * Mark all notifications as read
   * Đánh dấu tất cả notifications đã đọc
   */
  markAllNotificationsAsRead: (): Promise<{ success: boolean }> => {
    mockNotifications.forEach(n => n.read = true);
    return MockDataUtils.simulateApiCall({ success: true }, 200);
  },

  /**
   * Search suggestions
   * Lấy search suggestions
   */
  getSearchSuggestions: (query: string, limit: number = 8): Promise<SearchSuggestion[]> => {
    if (!query || query.length < 2) {
      return MockDataUtils.simulateApiCall([], 100);
    }

    const suggestions = mockSearchSuggestions.filter(s =>
      s.text.toLowerCase().includes(query.toLowerCase()) ||
      s.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);

    return MockDataUtils.simulateApiCall(suggestions, 200);
  },

  /**
   * Perform search
   * Thực hiện search
   */
  performSearch: (): Promise<{
    users: unknown[];
    courses: unknown[];
    questions: unknown[];
    total: number;
  }> => {
    // Mock search results
    const results = {
      users: [],
      courses: [],
      questions: [],
      total: 0
    };

    // Simulate search delay
    return MockDataUtils.simulateApiCall(results, 500);
  },

  /**
   * Update user profile
   * Cập nhật profile user
   */
  updateUserProfile: (updates: Partial<AdminUser>): Promise<AdminUser> => {
    const updatedUser = { ...mockAdminUser, ...updates };
    return MockDataUtils.simulateApiCall(updatedUser, 300);
  }
};

/**
 * Get notification type color
 * Lấy màu sắc cho notification type
 */
export function getNotificationTypeColor(type: AdminNotification['type']): string {
  const colors = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  };
  return colors[type];
}

/**
 * Get notification type icon
 * Lấy icon cho notification type
 */
export function getNotificationTypeIcon(type: AdminNotification['type']): string {
  const icons = {
    info: 'Info',
    success: 'CheckCircle',
    warning: 'AlertTriangle',
    error: 'AlertCircle'
  };
  return icons[type];
}

/**
 * Format notification timestamp
 * Format timestamp cho notification
 */
export function formatNotificationTimestamp(timestamp: Date): string {
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)} giờ trước`;
  } else {
    return timestamp.toLocaleDateString('vi-VN');
  }
}
