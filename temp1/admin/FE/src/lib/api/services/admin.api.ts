/**
 * Admin API Services
 * Các service API cho admin operations
 */

import { adminApiClient } from "../client";
import { ADMIN_API_ENDPOINTS, REQUEST_TIMEOUTS } from "../config";
import {
  AdminUser,
  AdminLoginCredentials,
  AdminLoginResponse,
  AdminStatsResponse,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from "../types";

/**
 * Authentication API Service
 * Service API xác thực
 */
export class AdminAuthService {
  /**
   * Admin login
   * Đăng nhập admin
   */
  async login(credentials: AdminLoginCredentials): Promise<AdminLoginResponse> {
    const response = await adminApiClient.post<AdminLoginResponse>(
      ADMIN_API_ENDPOINTS.login,
      credentials,
      { timeout: REQUEST_TIMEOUTS.LOGIN }
    );
    return response.data;
  }

  /**
   * Admin logout
   * Đăng xuất admin
   */
  async logout(): Promise<void> {
    await adminApiClient.post(ADMIN_API_ENDPOINTS.logout, {}, { timeout: REQUEST_TIMEOUTS.LOGOUT });
    adminApiClient.clearAuthentication();
  }

  /**
   * Get admin profile
   * Lấy thông tin profile admin
   */
  async getProfile(): Promise<AdminUser> {
    const response = await adminApiClient.get<AdminUser>(ADMIN_API_ENDPOINTS.profile);
    return response.data;
  }

  /**
   * Update admin profile
   * Cập nhật profile admin
   */
  async updateProfile(data: Partial<AdminUser>): Promise<AdminUser> {
    const response = await adminApiClient.put<AdminUser>(ADMIN_API_ENDPOINTS.profile, data);
    return response.data;
  }

  /**
   * Change admin password
   * Đổi mật khẩu admin
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    await adminApiClient.post(`${ADMIN_API_ENDPOINTS.profile}/change-password`, data);
  }
}

/**
 * Advanced user filtering parameters
 * Tham số lọc user nâng cao
 */
interface UserFilterParams extends PaginationParams {
  search?: string;
  role?: string;
  status?: string;
  level?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastActivityFrom?: string;
  lastActivityTo?: string;
  sortBy?: "name" | "email" | "role" | "status" | "createdAt" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}

/**
 * Bulk user operation parameters
 * Tham số thao tác user hàng loạt
 */
interface BulkUserOperationParams {
  userIds: string[];
  operation: "activate" | "suspend" | "delete" | "updateRole" | "updateLevel";
  data?: {
    role?: string;
    level?: string;
    reason?: string;
  };
}

/**
 * User statistics response
 * Response thống kê user
 */
interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  usersByLevel: Record<string, number>;
  usersByStatus: Record<string, number>;
  averageSessionDuration: number;
  mostActiveUsers: Array<{
    id: string;
    name: string;
    email: string;
    sessionCount: number;
    lastActivity: string;
  }>;
}

/**
 * User Management API Service
 * Service API quản lý user nâng cao
 */
export class AdminUserService {
  /**
   * Get all users with advanced filtering and pagination
   * Lấy tất cả users với lọc nâng cao và phân trang
   */
  async getUsers(params: UserFilterParams = {}): Promise<PaginatedResponse<AdminUser>> {
    const response = await adminApiClient.get<PaginatedResponse<AdminUser>>(
      ADMIN_API_ENDPOINTS.users,
      {
        params,
        timeout: REQUEST_TIMEOUTS.USER_OPERATIONS,
      }
    );
    return response.data;
  }

  /**
   * Search users with debounced query
   * Tìm kiếm users với query debounced
   */
  async searchUsers(
    query: string,
    filters: Partial<UserFilterParams> = {}
  ): Promise<PaginatedResponse<AdminUser>> {
    const searchParams = {
      search: query,
      ...filters,
      limit: filters.limit || 20,
    };

    const response = await adminApiClient.get<PaginatedResponse<AdminUser>>(
      ADMIN_API_ENDPOINTS.users,
      {
        params: searchParams,
        timeout: REQUEST_TIMEOUTS.USER_OPERATIONS,
      }
    );
    return response.data;
  }

  /**
   * Get user by ID with detailed information
   * Lấy user theo ID với thông tin chi tiết
   */
  async getUserById(id: string, includeDetails: boolean = false): Promise<AdminUser> {
    const response = await adminApiClient.get<AdminUser>(ADMIN_API_ENDPOINTS.userById(id), {
      params: { includeDetails },
      timeout: REQUEST_TIMEOUTS.USER_OPERATIONS,
    });
    return response.data;
  }

  /**
   * Create new user
   * Tạo user mới
   */
  async createUser(userData: Omit<AdminUser, "id">): Promise<AdminUser> {
    const response = await adminApiClient.post<AdminUser>(ADMIN_API_ENDPOINTS.users, userData, {
      timeout: REQUEST_TIMEOUTS.USER_OPERATIONS,
    });
    return response.data;
  }

  /**
   * Update user
   * Cập nhật user
   */
  async updateUser(id: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    const response = await adminApiClient.put<AdminUser>(
      ADMIN_API_ENDPOINTS.userById(id),
      userData,
      { timeout: REQUEST_TIMEOUTS.USER_OPERATIONS }
    );
    return response.data;
  }

  /**
   * Delete user
   * Xóa user
   */
  async deleteUser(id: string): Promise<void> {
    await adminApiClient.delete(ADMIN_API_ENDPOINTS.userById(id), {
      timeout: REQUEST_TIMEOUTS.USER_OPERATIONS,
    });
  }

  /**
   * Bulk delete users
   * Xóa nhiều users
   */
  async bulkDeleteUsers(userIds: string[]): Promise<void> {
    await adminApiClient.post(
      `${ADMIN_API_ENDPOINTS.users}/bulk-delete`,
      { userIds },
      { timeout: REQUEST_TIMEOUTS.BULK_OPERATIONS }
    );
  }

  /**
   * Get user sessions
   * Lấy sessions của user
   */
  async getUserSessions(userId: string): Promise<any[]> {
    const response = await adminApiClient.get<any[]>(ADMIN_API_ENDPOINTS.userSessions(userId));
    return response.data;
  }

  /**
   * Terminate user session
   * Kết thúc session của user
   */
  async terminateUserSession(userId: string, sessionId: string): Promise<void> {
    await adminApiClient.delete(`${ADMIN_API_ENDPOINTS.userSessions(userId)}/${sessionId}`, {
      timeout: REQUEST_TIMEOUTS.USER_OPERATIONS,
    });
  }

  /**
   * Suspend user
   * Tạm ngưng user
   */
  async suspendUser(id: string, reason?: string): Promise<AdminUser> {
    const response = await adminApiClient.post<AdminUser>(
      `${ADMIN_API_ENDPOINTS.userById(id)}/suspend`,
      { reason },
      { timeout: REQUEST_TIMEOUTS.USER_OPERATIONS }
    );
    return response.data;
  }

  /**
   * Activate user
   * Kích hoạt user
   */
  async activateUser(id: string): Promise<AdminUser> {
    const response = await adminApiClient.post<AdminUser>(
      `${ADMIN_API_ENDPOINTS.userById(id)}/activate`,
      {},
      { timeout: REQUEST_TIMEOUTS.USER_OPERATIONS }
    );
    return response.data;
  }

  /**
   * Bulk user operations
   * Thao tác user hàng loạt
   */
  async bulkUserOperation(params: BulkUserOperationParams): Promise<{
    success: number;
    failed: number;
    errors: Array<{ userId: string; error: string }>;
  }> {
    const response = await adminApiClient.post(`${ADMIN_API_ENDPOINTS.users}/bulk`, params, {
      timeout: REQUEST_TIMEOUTS.BULK_OPERATIONS,
    });
    return response.data;
  }

  /**
   * Get user statistics
   * Lấy thống kê user
   */
  async getUserStats(): Promise<UserStatsResponse> {
    const response = await adminApiClient.get<UserStatsResponse>(
      `${ADMIN_API_ENDPOINTS.users}/stats`,
      { timeout: REQUEST_TIMEOUTS.ANALYTICS }
    );
    return response.data;
  }

  /**
   * Export users data
   * Xuất dữ liệu users
   */
  async exportUsers(filters: UserFilterParams = {}, format: "csv" | "xlsx" = "csv"): Promise<Blob> {
    return adminApiClient.downloadFile(`${ADMIN_API_ENDPOINTS.users}/export`, {
      params: { ...filters, format },
      timeout: REQUEST_TIMEOUTS.EXPORT_OPERATIONS,
    });
  }

  /**
   * Get user activity timeline
   * Lấy timeline hoạt động user
   */
  async getUserActivity(
    userId: string,
    params: {
      startDate?: string;
      endDate?: string;
      limit?: number;
    } = {}
  ): Promise<
    Array<{
      id: string;
      action: string;
      resource: string;
      timestamp: string;
      details: any;
    }>
  > {
    const response = await adminApiClient.get(`${ADMIN_API_ENDPOINTS.userById(userId)}/activity`, {
      params,
      timeout: REQUEST_TIMEOUTS.USER_OPERATIONS,
    });
    return response.data;
  }
}

/**
 * Security event filtering parameters
 * Tham số lọc security events
 */
interface SecurityEventFilterParams extends PaginationParams {
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  eventType?: string;
  userId?: string;
  ipAddress?: string;
  dateFrom?: string;
  dateTo?: string;
  isProcessed?: boolean;
  sortBy?: "timestamp" | "severity" | "eventType";
  sortOrder?: "asc" | "desc";
}

/**
 * Security statistics response
 * Response thống kê bảo mật
 */
interface SecurityStatsResponse {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topThreats: Array<{
    type: string;
    count: number;
    lastOccurrence: string;
  }>;
  riskScore: number;
  blockedIPs: number;
  suspiciousActivities: number;
}

/**
 * Security & Audit API Service
 * Service API bảo mật và audit nâng cao
 */
export class AdminSecurityService {
  /**
   * Get audit logs with advanced filtering
   * Lấy audit logs với lọc nâng cao
   */
  async getAuditLogs(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
    const response = await adminApiClient.get<PaginatedResponse<any>>(
      ADMIN_API_ENDPOINTS.auditLogs,
      {
        params,
        timeout: REQUEST_TIMEOUTS.ANALYTICS,
      }
    );
    return response.data;
  }

  /**
   * Get security events with advanced filtering
   * Lấy security events với lọc nâng cao
   */
  async getSecurityEvents(params: SecurityEventFilterParams = {}): Promise<PaginatedResponse<any>> {
    const response = await adminApiClient.get<PaginatedResponse<any>>(
      ADMIN_API_ENDPOINTS.securityEvents,
      {
        params,
        timeout: REQUEST_TIMEOUTS.ANALYTICS,
      }
    );
    return response.data;
  }

  /**
   * Get active sessions
   * Lấy sessions đang hoạt động
   */
  async getActiveSessions(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
    const response = await adminApiClient.get<PaginatedResponse<any>>(
      ADMIN_API_ENDPOINTS.sessions,
      { params }
    );
    return response.data;
  }

  /**
   * Terminate session
   * Kết thúc session
   */
  async terminateSession(sessionId: string): Promise<void> {
    await adminApiClient.delete(`${ADMIN_API_ENDPOINTS.sessions}/${sessionId}`);
  }

  /**
   * Get notifications
   * Lấy thông báo
   */
  async getNotifications(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
    const response = await adminApiClient.get<PaginatedResponse<any>>(
      ADMIN_API_ENDPOINTS.notifications,
      { params }
    );
    return response.data;
  }

  /**
   * Mark notification as read
   * Đánh dấu thông báo đã đọc
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await adminApiClient.patch(
      `${ADMIN_API_ENDPOINTS.notifications}/${notificationId}`,
      { isRead: true },
      { timeout: REQUEST_TIMEOUTS.USER_OPERATIONS }
    );
  }

  /**
   * Get security statistics
   * Lấy thống kê bảo mật
   */
  async getSecurityStats(): Promise<SecurityStatsResponse> {
    const response = await adminApiClient.get<SecurityStatsResponse>(
      `${ADMIN_API_ENDPOINTS.securityEvents}/stats`,
      { timeout: REQUEST_TIMEOUTS.ANALYTICS }
    );
    return response.data;
  }

  /**
   * Acknowledge security alert
   * Xác nhận cảnh báo bảo mật
   */
  async acknowledgeAlert(alertId: string, note?: string): Promise<void> {
    await adminApiClient.post(
      `${ADMIN_API_ENDPOINTS.securityEvents}/${alertId}/acknowledge`,
      { note },
      { timeout: REQUEST_TIMEOUTS.USER_OPERATIONS }
    );
  }

  /**
   * Get real-time security alerts
   * Lấy cảnh báo bảo mật real-time
   */
  async getActiveAlerts(severity?: "HIGH" | "CRITICAL"): Promise<
    Array<{
      id: string;
      type: string;
      severity: string;
      message: string;
      timestamp: string;
      isProcessed: boolean;
      metadata: any;
    }>
  > {
    const response = await adminApiClient.get(`${ADMIN_API_ENDPOINTS.securityEvents}/alerts`, {
      params: { severity },
      timeout: REQUEST_TIMEOUTS.ANALYTICS,
    });
    return response.data;
  }

  /**
   * Generate security report
   * Tạo báo cáo bảo mật
   */
  async generateSecurityReport(params: {
    startDate: string;
    endDate: string;
    includeDetails?: boolean;
    format?: "pdf" | "csv" | "xlsx";
  }): Promise<Blob> {
    return adminApiClient.downloadFile(`${ADMIN_API_ENDPOINTS.securityEvents}/report`, {
      params,
      timeout: REQUEST_TIMEOUTS.EXPORT_OPERATIONS,
    });
  }

  /**
   * Update security settings
   * Cập nhật cài đặt bảo mật
   */
  async updateSecuritySettings(settings: {
    maxLoginAttempts?: number;
    lockoutDuration?: number;
    sessionTimeout?: number;
    requireTwoFactor?: boolean;
    alertThresholds?: {
      criticalEventCount?: number;
      suspiciousActivityCount?: number;
    };
  }): Promise<void> {
    await adminApiClient.put(`${ADMIN_API_ENDPOINTS.securityEvents}/settings`, settings, {
      timeout: REQUEST_TIMEOUTS.USER_OPERATIONS,
    });
  }
}

/**
 * System Management API Service
 * Service API quản lý hệ thống
 */
export class AdminSystemService {
  /**
   * Get system health
   * Lấy tình trạng sức khỏe hệ thống
   */
  async getSystemHealth(): Promise<any> {
    const response = await adminApiClient.get(ADMIN_API_ENDPOINTS.systemHealth, {
      timeout: REQUEST_TIMEOUTS.HEALTH_CHECK,
    });
    return response.data;
  }

  /**
   * Get system settings
   * Lấy cài đặt hệ thống
   */
  async getSettings(): Promise<any> {
    const response = await adminApiClient.get(ADMIN_API_ENDPOINTS.settings);
    return response.data;
  }

  /**
   * Update system settings
   * Cập nhật cài đặt hệ thống
   */
  async updateSettings(settings: Record<string, any>): Promise<any> {
    const response = await adminApiClient.put(ADMIN_API_ENDPOINTS.settings, settings);
    return response.data;
  }

  /**
   * Get analytics data
   * Lấy dữ liệu analytics
   */
  async getAnalytics(
    params: {
      startDate?: string;
      endDate?: string;
      metrics?: string[];
    } = {}
  ): Promise<any> {
    const response = await adminApiClient.get(ADMIN_API_ENDPOINTS.analytics, {
      params,
      timeout: REQUEST_TIMEOUTS.ANALYTICS,
    });
    return response.data;
  }

  /**
   * Export data
   * Xuất dữ liệu
   */
  async exportData(type: string, params: any = {}): Promise<Blob> {
    return adminApiClient.downloadFile(`/export/${type}`, {
      params,
      timeout: REQUEST_TIMEOUTS.EXPORT_OPERATIONS,
    });
  }

  /**
   * Get admin statistics
   * Lấy thống kê admin
   */
  async getAdminStats(): Promise<AdminStatsResponse> {
    const response = await adminApiClient.get<AdminStatsResponse>("/stats", {
      timeout: REQUEST_TIMEOUTS.ANALYTICS,
    });
    return response.data;
  }

  /**
   * Get system performance metrics
   * Lấy metrics hiệu suất hệ thống
   */
  async getPerformanceMetrics(): Promise<{
    cpu: { usage: number; cores: number };
    memory: { used: number; total: number; percentage: number };
    disk: { used: number; total: number; percentage: number };
    network: { inbound: number; outbound: number };
    database: { connections: number; queryTime: number };
    apiResponseTime: number;
    uptime: number;
  }> {
    const response = await adminApiClient.get(`${ADMIN_API_ENDPOINTS.systemHealth}/performance`, {
      timeout: REQUEST_TIMEOUTS.HEALTH_CHECK,
    });
    return response.data;
  }

  /**
   * Get system configuration
   * Lấy cấu hình hệ thống
   */
  async getSystemConfiguration(): Promise<{
    environment: string;
    version: string;
    features: Record<string, boolean>;
    limits: Record<string, number>;
    maintenance: {
      isEnabled: boolean;
      scheduledAt?: string;
      message?: string;
    };
  }> {
    const response = await adminApiClient.get(`${ADMIN_API_ENDPOINTS.settings}/configuration`, {
      timeout: REQUEST_TIMEOUTS.USER_OPERATIONS,
    });
    return response.data;
  }

  /**
   * Update system configuration
   * Cập nhật cấu hình hệ thống
   */
  async updateSystemConfiguration(config: {
    features?: Record<string, boolean>;
    limits?: Record<string, number>;
    maintenance?: {
      isEnabled: boolean;
      scheduledAt?: string;
      message?: string;
    };
  }): Promise<void> {
    await adminApiClient.put(`${ADMIN_API_ENDPOINTS.settings}/configuration`, config, {
      timeout: REQUEST_TIMEOUTS.USER_OPERATIONS,
    });
  }

  /**
   * Create system backup
   * Tạo backup hệ thống
   */
  async createSystemBackup(
    options: {
      includeDatabase?: boolean;
      includeFiles?: boolean;
      includeConfiguration?: boolean;
      description?: string;
    } = {}
  ): Promise<{
    backupId: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    createdAt: string;
    estimatedSize: number;
  }> {
    const response = await adminApiClient.post(
      `${ADMIN_API_ENDPOINTS.systemHealth}/backup`,
      options,
      { timeout: REQUEST_TIMEOUTS.EXPORT_OPERATIONS }
    );
    return response.data;
  }

  /**
   * Get backup status
   * Lấy trạng thái backup
   */
  async getBackupStatus(backupId: string): Promise<{
    id: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    progress: number;
    createdAt: string;
    completedAt?: string;
    size?: number;
    error?: string;
  }> {
    const response = await adminApiClient.get(
      `${ADMIN_API_ENDPOINTS.systemHealth}/backup/${backupId}`,
      { timeout: REQUEST_TIMEOUTS.USER_OPERATIONS }
    );
    return response.data;
  }

  /**
   * Get system logs
   * Lấy logs hệ thống
   */
  async getSystemLogs(
    params: {
      level?: "ERROR" | "WARN" | "INFO" | "DEBUG";
      startDate?: string;
      endDate?: string;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<
    Array<{
      id: string;
      level: string;
      message: string;
      timestamp: string;
      source: string;
      metadata?: any;
    }>
  > {
    const response = await adminApiClient.get(`${ADMIN_API_ENDPOINTS.systemHealth}/logs`, {
      params,
      timeout: REQUEST_TIMEOUTS.ANALYTICS,
    });
    return response.data;
  }
}

/**
 * Analytics dashboard metrics
 * Metrics dashboard analytics
 */
interface DashboardMetrics {
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
 * Analytics API Service
 * Service API analytics nâng cao
 */
export class AdminAnalyticsService {
  /**
   * Get dashboard metrics
   * Lấy metrics dashboard
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await adminApiClient.get<DashboardMetrics>(
      `${ADMIN_API_ENDPOINTS.analytics}/dashboard`,
      { timeout: REQUEST_TIMEOUTS.ANALYTICS }
    );
    return response.data;
  }

  /**
   * Get real-time analytics data
   * Lấy dữ liệu analytics real-time
   */
  async getRealTimeAnalytics(): Promise<{
    activeUsers: number;
    activeSessions: number;
    requestsPerMinute: number;
    errorRate: number;
    responseTime: number;
    timestamp: string;
  }> {
    const response = await adminApiClient.get(`${ADMIN_API_ENDPOINTS.analytics}/realtime`, {
      timeout: REQUEST_TIMEOUTS.ANALYTICS,
    });
    return response.data;
  }

  /**
   * Get user analytics
   * Lấy analytics user
   */
  async getUserAnalytics(
    params: {
      startDate?: string;
      endDate?: string;
      groupBy?: "day" | "week" | "month";
    } = {}
  ): Promise<{
    registrations: Array<{ date: string; count: number }>;
    activations: Array<{ date: string; count: number }>;
    demographics: {
      byRole: Record<string, number>;
      byLevel: Record<string, number>;
      byStatus: Record<string, number>;
    };
    engagement: {
      averageSessionDuration: number;
      averageSessionsPerUser: number;
      retentionRate: number;
    };
  }> {
    const response = await adminApiClient.get(`${ADMIN_API_ENDPOINTS.analytics}/users`, {
      params,
      timeout: REQUEST_TIMEOUTS.ANALYTICS,
    });
    return response.data;
  }

  /**
   * Get security analytics
   * Lấy analytics bảo mật
   */
  async getSecurityAnalytics(
    params: {
      startDate?: string;
      endDate?: string;
      groupBy?: "hour" | "day" | "week";
    } = {}
  ): Promise<{
    events: Array<{ date: string; count: number; severity: string }>;
    threats: Array<{ type: string; count: number; trend: number }>;
    blockedIPs: Array<{ date: string; count: number }>;
    riskTrends: Array<{ date: string; score: number }>;
  }> {
    const response = await adminApiClient.get(`${ADMIN_API_ENDPOINTS.analytics}/security`, {
      params,
      timeout: REQUEST_TIMEOUTS.ANALYTICS,
    });
    return response.data;
  }

  /**
   * Get system performance analytics
   * Lấy analytics hiệu suất hệ thống
   */
  async getPerformanceAnalytics(
    params: {
      startDate?: string;
      endDate?: string;
      metrics?: string[];
    } = {}
  ): Promise<{
    responseTime: Array<{ timestamp: string; value: number }>;
    throughput: Array<{ timestamp: string; requests: number }>;
    errorRate: Array<{ timestamp: string; rate: number }>;
    resourceUsage: {
      cpu: Array<{ timestamp: string; usage: number }>;
      memory: Array<{ timestamp: string; usage: number }>;
      disk: Array<{ timestamp: string; usage: number }>;
    };
  }> {
    const response = await adminApiClient.get(`${ADMIN_API_ENDPOINTS.analytics}/performance`, {
      params,
      timeout: REQUEST_TIMEOUTS.ANALYTICS,
    });
    return response.data;
  }

  /**
   * Generate custom analytics report
   * Tạo báo cáo analytics tùy chỉnh
   */
  async generateCustomReport(params: {
    reportType: "users" | "security" | "performance" | "comprehensive";
    startDate: string;
    endDate: string;
    metrics: string[];
    groupBy?: "hour" | "day" | "week" | "month";
    filters?: Record<string, any>;
    format?: "json" | "csv" | "pdf";
  }): Promise<Blob | any> {
    if (params.format && params.format !== "json") {
      return adminApiClient.downloadFile(`${ADMIN_API_ENDPOINTS.analytics}/report`, {
        params,
        timeout: REQUEST_TIMEOUTS.EXPORT_OPERATIONS,
      });
    } else {
      const response = await adminApiClient.get(`${ADMIN_API_ENDPOINTS.analytics}/report`, {
        params,
        timeout: REQUEST_TIMEOUTS.ANALYTICS,
      });
      return response.data;
    }
  }
}

/**
 * Export service instances
 * Export các instance service
 */
export const adminAuthService = new AdminAuthService();
export const adminUserService = new AdminUserService();
export const adminSecurityService = new AdminSecurityService();
export const adminSystemService = new AdminSystemService();
export const adminAnalyticsService = new AdminAnalyticsService();
