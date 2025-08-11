/**
 * Admin Dashboard Mock Data
 * Mockdata cho admin dashboard metrics và real-time data
 */

import { MockDataUtils } from '../utils';

/**
 * Dashboard Metrics Interface
 * Interface cho dashboard metrics
 */
export interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  sessions: {
    total: number;
    active: number;
    averageDuration: number;
    bounceRate: number;
  };
  security: {
    events: number;
    alerts: number;
    blockedIPs: number;
    riskScore: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    performance: number;
  };
}

/**
 * System Status Interface
 * Interface cho system status
 */
export interface SystemStatus {
  apiServer: 'online' | 'offline' | 'degraded';
  database: 'online' | 'offline' | 'slow';
  redisCache: 'online' | 'offline' | 'slow';
  fileStorage: 'online' | 'offline' | 'degraded';
}

/**
 * Recent Activity Interface
 * Interface cho recent activities
 */
export interface RecentActivity {
  id: string;
  type: 'course_created' | 'user_registered' | 'system_update' | 'performance_alert';
  title: string;
  description: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success';
}

/**
 * Mock Dashboard Metrics
 * Mock data cho dashboard metrics
 */
export const mockDashboardMetrics: DashboardMetrics = {
  users: {
    total: 15847,
    active: 12456,
    newToday: 127,
    growth: 12.5
  },
  sessions: {
    total: 8934,
    active: 1247,
    averageDuration: 1847, // seconds
    bounceRate: 23.4
  },
  security: {
    events: 156,
    alerts: 3,
    blockedIPs: 12,
    riskScore: 2.3
  },
  system: {
    uptime: 99.8,
    responseTime: 145, // ms
    errorRate: 0.02,
    performance: 94.5
  }
};

/**
 * Mock System Status
 * Mock data cho system status
 */
export const mockSystemStatus: SystemStatus = {
  apiServer: 'online',
  database: 'online',
  redisCache: 'slow',
  fileStorage: 'online'
};

/**
 * Mock Recent Activities
 * Mock data cho recent activities
 */
export const mockRecentActivities: RecentActivity[] = [
  {
    id: 'activity-001',
    type: 'course_created',
    title: 'Khóa học mới được tạo',
    description: '"Advanced React Patterns" - 5 phút trước',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    severity: 'success'
  },
  {
    id: 'activity-002',
    type: 'user_registered',
    title: 'Người dùng mới đăng ký',
    description: '25 người dùng mới - 1 giờ trước',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    severity: 'info'
  },
  {
    id: 'activity-003',
    type: 'system_update',
    title: 'Cập nhật hệ thống',
    description: 'Version 2.1.0 - 2 giờ trước',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'info'
  },
  {
    id: 'activity-004',
    type: 'performance_alert',
    title: 'Cảnh báo hiệu suất',
    description: 'Database response time cao - 3 giờ trước',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    severity: 'warning'
  }
];

/**
 * Mock Service để simulate API calls
 * Mock service cho dashboard data
 */
export const adminDashboardMockService = {
  /**
   * Get dashboard metrics
   * Lấy dashboard metrics
   */
  getDashboardMetrics: (): Promise<DashboardMetrics> => {
    return MockDataUtils.simulateApiCall(mockDashboardMetrics, 500);
  },

  /**
   * Get system status
   * Lấy system status
   */
  getSystemStatus: (): Promise<SystemStatus> => {
    return MockDataUtils.simulateApiCall(mockSystemStatus, 200);
  },

  /**
   * Get recent activities
   * Lấy recent activities
   */
  getRecentActivities: (limit: number = 10): Promise<RecentActivity[]> => {
    const activities = mockRecentActivities.slice(0, limit);
    return MockDataUtils.simulateApiCall(activities, 300);
  },

  /**
   * Refresh dashboard data
   * Refresh dashboard data
   */
  refreshDashboardData: (): Promise<{
    metrics: DashboardMetrics;
    systemStatus: SystemStatus;
    recentActivities: RecentActivity[];
  }> => {
    // Simulate slight variations in metrics
    const refreshedMetrics = {
      ...mockDashboardMetrics,
      users: {
        ...mockDashboardMetrics.users,
        active: mockDashboardMetrics.users.active + Math.floor(Math.random() * 20) - 10
      },
      sessions: {
        ...mockDashboardMetrics.sessions,
        active: mockDashboardMetrics.sessions.active + Math.floor(Math.random() * 50) - 25
      }
    };

    return MockDataUtils.simulateApiCall({
      metrics: refreshedMetrics,
      systemStatus: mockSystemStatus,
      recentActivities: mockRecentActivities
    }, 800);
  }
};

/**
 * Get formatted dashboard metrics
 * Lấy dashboard metrics đã format
 */
export function getFormattedDashboardMetrics(): DashboardMetrics {
  return {
    ...mockDashboardMetrics,
    users: {
      ...mockDashboardMetrics.users,
      total: Number(mockDashboardMetrics.users.total.toLocaleString()),
      active: Number(mockDashboardMetrics.users.active.toLocaleString())
    }
  };
}

/**
 * Get system status with labels
 * Lấy system status với labels
 */
export function getSystemStatusWithLabels() {
  const statusLabels = {
    online: 'Hoạt động',
    offline: 'Ngưng hoạt động',
    degraded: 'Hoạt động chậm',
    slow: 'Chậm'
  };

  return {
    apiServer: {
      status: mockSystemStatus.apiServer,
      label: statusLabels[mockSystemStatus.apiServer]
    },
    database: {
      status: mockSystemStatus.database,
      label: statusLabels[mockSystemStatus.database]
    },
    redisCache: {
      status: mockSystemStatus.redisCache,
      label: statusLabels[mockSystemStatus.redisCache]
    },
    fileStorage: {
      status: mockSystemStatus.fileStorage,
      label: statusLabels[mockSystemStatus.fileStorage]
    }
  };
}

/**
 * Get activity severity colors
 * Lấy màu sắc cho activity severity
 */
export function getActivitySeverityColor(severity: RecentActivity['severity']): string {
  const colors = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  };
  return colors[severity];
}
