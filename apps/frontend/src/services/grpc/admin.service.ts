/**
 * Admin Service Client (gRPC-Web)
 * Implements AdminService RPCs for user management, audit logs, resource access, and system stats
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AdminServiceClient } from '@/generated/v1/AdminServiceClientPb';
import {
  AdminListUsersRequest,
  UpdateUserRoleRequest,
  UpdateUserLevelRequest,
  UpdateUserStatusRequest,
  GetAuditLogsRequest,
  GetResourceAccessRequest,
  GetSecurityAlertsRequest,
  GetSystemStatsRequest,
  ListUsersFilter,
  AuditLog,
  ResourceAccess,
  SecurityAlert,
  GetMetricsHistoryRequest,
  GetMetricsHistoryResponse,
  MetricsDataPoint,
} from '@/generated/v1/admin_pb';
import { PaginationRequest } from '@/generated/common/common_pb';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { User } from '@/generated/v1/user_pb';
import { RpcError } from 'grpc-web';
import { getAuthMetadata } from './client';
import { createGrpcClient } from './client-factory';

// MetricsDataPoint interface for type safety
// Matches the protobuf MetricsDataPoint structure
export interface MetricsDataPointType {
  timestamp: Date;
  total_users: number;
  active_users: number;
  total_sessions: number;
  active_sessions: number;
  suspicious_activities: number;
}

// ✅ FIX: Use client factory for lazy initialization
const getAdminServiceClient = createGrpcClient(AdminServiceClient, 'AdminService');

// Handle gRPC errors
function handleGrpcError(error: RpcError): string {
  console.error('gRPC Error:', error);
  switch (error.code) {
    case 3: return error.message || 'Invalid input provided';
    case 7: return 'Permission denied. Admin access required.';
    case 14: return 'Service temporarily unavailable';
    case 16: return 'Authentication required';
    default: return error.message || 'An unexpected error occurred';
  }
}

// Map User from protobuf
function mapUserFromPb(user: User): any {
  return {
    id: user.getId(),
    email: user.getEmail(),
    first_name: user.getFirstName(),
    last_name: user.getLastName(),
    role: user.getRole(),
    is_active: user.getIsActive(),
    level: user.getLevel(),
    username: user.getUsername(),
    avatar: user.getAvatar(),
    status: user.getStatus(),
    email_verified: user.getEmailVerified(),
    google_id: user.getGoogleId(),
  };
}

// Map AuditLog from protobuf
function mapAuditLogFromPb(log: AuditLog): any {
  return {
    id: log.getId(),
    user_id: log.getUserId(),
    user_email: log.getUserEmail(),
    action: log.getAction(),
    resource: log.getResource(),
    resource_id: log.getResourceId(),
    old_values: log.getOldValues(),
    new_values: log.getNewValues(),
    ip_address: log.getIpAddress(),
    user_agent: log.getUserAgent(),
    success: log.getSuccess(),
    error_message: log.getErrorMessage(),
    created_at: log.getCreatedAt(),
  };
}

export class AdminService {
  static async listUsers(req: any = {}): Promise<any> {
    try {
      const request = new AdminListUsersRequest();
      
      // Set pagination
      if (req.pagination) {
        const pagination = new PaginationRequest();
        pagination.setPage(req.pagination.page || 1);
        pagination.setLimit(req.pagination.limit || 20);
        request.setPagination(pagination);
      }
      
      // Set filter if provided
      if (req.filter) {
        const filter = new ListUsersFilter();
        if (req.filter.role !== undefined) filter.setRole(req.filter.role);
        if (req.filter.status !== undefined) filter.setStatus(req.filter.status);
        if (req.filter.level !== undefined) filter.setLevel(req.filter.level);
        if (req.filter.email_verified !== undefined) filter.setEmailVerified(req.filter.email_verified);
        if (req.filter.search_query) filter.setSearchQuery(req.filter.search_query);
        request.setFilter(filter);
      }

      const response = await getAdminServiceClient().listUsers(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        users: response.getUsersList().map(mapUserFromPb),
        pagination: responseObj.pagination
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        users: [],
        pagination: undefined
      };
    }
  }

  static async updateUserRole(req: any): Promise<any> {
    try {
      const request = new UpdateUserRoleRequest();
      request.setUserId(req.user_id);
      request.setNewRole(req.new_role);
      if (req.level !== undefined) request.setLevel(req.level);

      const response = await getAdminServiceClient().updateUserRole(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        updated_user: responseObj.updatedUser ? mapUserFromPb(response.getUpdatedUser()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        updated_user: undefined
      };
    }
  }

  static async updateUserLevel(req: any): Promise<any> {
    try {
      const request = new UpdateUserLevelRequest();
      request.setUserId(req.user_id);
      request.setNewLevel(req.new_level);

      const response = await getAdminServiceClient().updateUserLevel(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        updated_user: responseObj.updatedUser ? mapUserFromPb(response.getUpdatedUser()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        updated_user: undefined
      };
    }
  }

  static async updateUserStatus(req: any): Promise<any> {
    try {
      const request = new UpdateUserStatusRequest();
      request.setUserId(req.user_id);
      request.setNewStatus(req.new_status);
      if (req.reason) request.setReason(req.reason);

      const response = await getAdminServiceClient().updateUserStatus(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        updated_user: responseObj.updatedUser ? mapUserFromPb(response.getUpdatedUser()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        updated_user: undefined
      };
    }
  }

  static async getAuditLogs(req: any = {}): Promise<any> {
    try {
      const request = new GetAuditLogsRequest();
      
      // Set pagination
      if (req.pagination) {
        const pagination = new PaginationRequest();
        pagination.setPage(req.pagination.page || 1);
        pagination.setLimit(req.pagination.limit || 50);
        request.setPagination(pagination);
      }
      
      // Set filters
      if (req.user_id) request.setUserId(req.user_id);
      if (req.action) request.setAction(req.action);
      if (req.resource) request.setResource(req.resource);
      if (req.start_date) request.setStartDate(req.start_date);
      if (req.end_date) request.setEndDate(req.end_date);

      const response = await getAdminServiceClient().getAuditLogs(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        logs: response.getLogsList().map(mapAuditLogFromPb),
        pagination: responseObj.pagination
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        logs: [],
        pagination: undefined
      };
    }
  }

  static async getResourceAccess(req: any = {}): Promise<any> {
    try {
      const request = new GetResourceAccessRequest();
      
      // Set pagination
      if (req.pagination) {
        const pagination = new PaginationRequest();
        pagination.setPage(req.pagination.page || 1);
        pagination.setLimit(req.pagination.limit || 50);
        request.setPagination(pagination);
      }
      
      // Set filters
      if (req.user_id) request.setUserId(req.user_id);
      if (req.resource_type) request.setResourceType(req.resource_type);
      if (req.resource_id) request.setResourceId(req.resource_id);
      if (req.min_risk_score !== undefined) request.setMinRiskScore(req.min_risk_score);
      if (req.start_date) request.setStartDate(req.start_date);
      if (req.end_date) request.setEndDate(req.end_date);

      const response = await getAdminServiceClient().getResourceAccess(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        accesses: response.getAccessesList().map((access: ResourceAccess) => ({
          id: access.getId(),
          user_id: access.getUserId(),
          user_email: access.getUserEmail(),
          resource_type: access.getResourceType(),
          resource_id: access.getResourceId(),
          action: access.getAction(),
          ip_address: access.getIpAddress(),
          is_valid_access: access.getIsValidAccess(),
          risk_score: access.getRiskScore(),
          created_at: access.getCreatedAt(),
        })),
        pagination: responseObj.pagination
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        accesses: [],
        pagination: undefined
      };
    }
  }

  static async getSecurityAlerts(req: any = {}): Promise<any> {
    try {
      const request = new GetSecurityAlertsRequest();
      
      // Set pagination
      if (req.pagination) {
        const pagination = new PaginationRequest();
        pagination.setPage(req.pagination.page || 1);
        pagination.setLimit(req.pagination.limit || 50);
        request.setPagination(pagination);
      }
      
      // Set filters
      if (req.user_id) request.setUserId(req.user_id);
      if (req.alert_type) request.setAlertType(req.alert_type);
      if (req.unresolved_only !== undefined) request.setUnresolvedOnly(req.unresolved_only);

      const response = await getAdminServiceClient().getSecurityAlerts(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        alerts: response.getAlertsList().map((alert: SecurityAlert) => ({
          user_id: alert.getUserId(),
          alert_type: alert.getAlertType(),
          message: alert.getMessage(),
          details: alert.getDetails(),
        })),
        pagination: responseObj.pagination
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        alerts: [],
        pagination: undefined
      };
    }
  }

  static async getSystemStats(): Promise<any> {
    try {
      const request = new GetSystemStatsRequest();

      const response = await getAdminServiceClient().getSystemStats(request, getAuthMetadata());
      const responseObj = response.toObject();
      const stats = response.getStats();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        stats: stats ? {
          total_users: stats.getTotalUsers(),
          active_users: stats.getActiveUsers(),
          total_sessions: stats.getTotalSessions(),
          active_sessions: stats.getActiveSessions(),
          users_by_role: stats.getUsersByRoleMap().toObject(),
          users_by_status: stats.getUsersByStatusMap().toObject(),
          suspicious_activities: stats.getSuspiciousActivities(),
        } : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        stats: undefined
      };
    }
  }

  /**
   * Get metrics history for sparklines/charts
   * Lấy lịch sử metrics để vẽ sparklines và charts
   * 
   * ✅ FIX: Converted from HTTP GET to gRPC client to utilize rate limiting and consistency
   */
  static async getMetricsHistory(options: {
    startTime?: Date;
    endTime?: Date;
    intervalSeconds?: number;
    limit?: number;
  } = {}): Promise<any> {
    try {
      const request = new GetMetricsHistoryRequest();
      
      // Set limit (default: 7 for sparklines)
      if (options.limit) {
        request.setLimit(options.limit);
      }
      
      // Set interval in seconds
      if (options.intervalSeconds) {
        request.setIntervalSeconds(options.intervalSeconds);
      }
      
      // Set start time
      if (options.startTime) {
        const startTimestamp = new Timestamp();
        startTimestamp.fromDate(options.startTime);
        request.setStartTime(startTimestamp);
      }
      
      // Set end time
      if (options.endTime) {
        const endTimestamp = new Timestamp();
        endTimestamp.fromDate(options.endTime);
        request.setEndTime(endTimestamp);
      }

      const response = await getAdminServiceClient().getMetricsHistory(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        dataPoints: response.getDataPointsList().map(point => ({
          timestamp: point.getTimestamp()?.toDate() || new Date(),
          total_users: point.getTotalUsers() || 0,
          active_users: point.getActiveUsers() || 0,
          total_sessions: point.getTotalSessions() || 0,
          active_sessions: point.getActiveSessions() || 0,
          suspicious_activities: point.getSuspiciousActivities() || 0,
        })),
        totalPoints: responseObj.totalPoints || 0,
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        dataPoints: [],
        totalPoints: 0,
      };
    }
  }

  /**
   * Get all user sessions across the system (admin only)
   * Lấy tất cả sessions của users trong hệ thống
   */
  static async getAllUserSessions(params: {
    page?: number;
    limit?: number;
    userId?: string;
    activeOnly?: boolean;
    searchQuery?: string;
  } = {}): Promise<{
    success: boolean;
    message: string;
    errors?: string[];
    sessions?: Array<{
      id: string;
      user_id: string;
      session_token: string;
      ip_address: string;
      user_agent: string;
      device_fingerprint: string;
      location: string;
      is_active: boolean;
      last_activity: string;
      expires_at: string;
      created_at: string;
    }>;
    pagination?: {
      page: number;
      limit: number;
      total_pages: number;
      total_count: number;
    };
    total_active_sessions?: number;
    unique_active_users?: number;
  }> {
    try {
      const { page = 1, limit = 20, userId, activeOnly = true, searchQuery } = params;

      const { GetAllUserSessionsRequest } = await import('@/generated/v1/admin_pb');
      const request = new GetAllUserSessionsRequest();

      const paginationReq = new PaginationRequest();
      paginationReq.setPage(page);
      paginationReq.setLimit(limit);
      request.setPagination(paginationReq);

      if (userId) {
        request.setUserId(userId);
      }
      request.setActiveOnly(activeOnly);
      if (searchQuery) {
        request.setSearchQuery(searchQuery);
      }

      const response = await getAdminServiceClient().getAllUserSessions(request, getAuthMetadata());
      const responseObj = response.toObject();

      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        sessions: responseObj.sessionsList?.map((s) => {
          // Convert protobuf Timestamp to ISO string
          const lastActivity = s.lastActivity?.seconds 
            ? new Date(Number(s.lastActivity.seconds) * 1000).toISOString()
            : new Date().toISOString();
          const expiresAt = s.expiresAt?.seconds
            ? new Date(Number(s.expiresAt.seconds) * 1000).toISOString()
            : new Date().toISOString();
          const createdAt = s.createdAt?.seconds
            ? new Date(Number(s.createdAt.seconds) * 1000).toISOString()
            : new Date().toISOString();

          return {
            id: s.id || '',
            user_id: s.userId || '',
            session_token: s.sessionToken || '',
            ip_address: s.ipAddress || '',
            user_agent: s.userAgent || '',
            device_fingerprint: s.deviceFingerprint || '',
            location: s.location || '',
            is_active: s.isActive || false,
            last_activity: lastActivity,
            expires_at: expiresAt,
            created_at: createdAt,
          };
        }),
        pagination: responseObj.pagination ? {
          page: responseObj.pagination.page || 1,
          limit: responseObj.pagination.limit || 20,
          total_pages: responseObj.pagination.totalPages || 1,
          total_count: responseObj.pagination.totalCount || 0,
        } : undefined,
        total_active_sessions: responseObj.totalActiveSessions || 0,
        unique_active_users: responseObj.uniqueActiveUsers || 0,
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        sessions: [],
        total_active_sessions: 0,
        unique_active_users: 0,
      };
    }
  }

  /**
   * Get all notifications across all users (Admin only)
   * TODO: Uncomment when proto generation is fixed
   */
  static async getAllNotifications(_params: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: string;
    unreadOnly?: boolean;
    searchQuery?: string;
  } = {}): Promise<{
    success: boolean;
    message: string;
    errors?: string[];
    notifications: Array<{
      notification: {
        id: string;
        userId: string;
        type: string;
        title: string;
        message: string;
        data?: Record<string, string>;
        isRead: boolean;
        readAt?: string;
        createdAt: string;
        expiresAt?: string;
      };
      userEmail: string;
      userName: string;
    }>;
    pagination?: {
      page: number;
      limit: number;
      totalPages: number;
      totalCount: number;
    };
    totalUnread: number;
  }> {
    console.warn('AdminService.getAllNotifications() - Proto generation pending. Using fallback.');
    return {
      success: false,
      message: 'Proto generation pending - method not yet available',
      errors: ['Proto files need to be regenerated after fixing grpc-tools'],
      notifications: [],
      totalUnread: 0,
    };

    /* TODO: Uncomment when proto types are available
    try {
      const request = new GetAllNotificationsRequest();

      // Set pagination
      const pagination = new PaginationRequest();
      pagination.setPage(params.page || 1);
      pagination.setLimit(params.limit || 20);
      request.setPagination(pagination);

      // Set filters
      if (params.type || params.userId || params.unreadOnly) {
        const filter = new NotificationFilter();
        if (params.type) filter.setType(params.type);
        if (params.userId) filter.setUserId(params.userId);
        if (params.unreadOnly) filter.setUnreadOnly(params.unreadOnly);
        request.setFilter(filter);
      }

      if (params.searchQuery) {
        request.setSearchQuery(params.searchQuery);
      }

      const response = await new Promise((resolve, reject) => {
        getAdminServiceClient().getAllNotifications(request, getAuthMetadata(), (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      const responseObj = response.toObject();

      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        notifications: responseObj.notificationsList?.map((n: any) => ({
          notification: {
            id: n.notification?.id || '',
            userId: n.notification?.userId || '',
            type: n.notification?.type || '',
            title: n.notification?.title || '',
            message: n.notification?.message || '',
            data: n.notification?.dataMap || {},
            isRead: n.notification?.isRead || false,
            readAt: n.notification?.readAt,
            createdAt: n.notification?.createdAt || '',
            expiresAt: n.notification?.expiresAt,
          },
          userEmail: n.userEmail || '',
          userName: n.userName || '',
        })) || [],
        pagination: responseObj.pagination ? {
          page: responseObj.pagination.page,
          limit: responseObj.pagination.limit,
          totalPages: responseObj.pagination.totalPages,
          totalCount: responseObj.pagination.totalCount,
        } : undefined,
        totalUnread: responseObj.totalUnread || 0,
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        notifications: [],
        totalUnread: 0,
      };
    }
    */
  }

  /**
   * Get notification statistics (Admin only)
   * TODO: Uncomment when proto generation is fixed
   */
  static async getNotificationStats(): Promise<{
    success: boolean;
    message: string;
    errors?: string[];
    stats?: {
      totalSentToday: number;
      totalUnread: number;
      notificationsByType: Record<string, number>;
      readRate: number;
      mostActiveType: string;
      averageReadTime: number;
      sentThisWeek: number;
      growthPercentage: number;
    };
  }> {
    console.warn('AdminService.getNotificationStats() - Proto generation pending. Using fallback.');
    return {
      success: false,
      message: 'Proto generation pending - method not yet available',
      errors: ['Proto files need to be regenerated after fixing grpc-tools'],
    };

    /* TODO: Uncomment when proto types are available
    try {
      const request = new GetNotificationStatsRequest();

      const response = await new Promise((resolve, reject) => {
        getAdminServiceClient().getNotificationStats(request, getAuthMetadata(), (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      const responseObj = response.toObject();
      const stats = responseObj.stats;

      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        stats: stats ? {
          totalSentToday: stats.totalSentToday,
          totalUnread: stats.totalUnread,
          notificationsByType: stats.notificationsByTypeMap || {},
          readRate: stats.readRate,
          mostActiveType: stats.mostActiveType,
          averageReadTime: stats.averageReadTime,
          sentThisWeek: stats.sentThisWeek,
          growthPercentage: stats.growthPercentage,
        } : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
      };
    }
    */
  }
}
