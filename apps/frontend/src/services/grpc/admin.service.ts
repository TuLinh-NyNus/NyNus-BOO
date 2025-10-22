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
} from '@/generated/v1/admin_pb';
import { PaginationRequest } from '@/generated/common/common_pb';
import { User } from '@/generated/v1/user_pb';
import { RpcError } from 'grpc-web';
import { getGrpcUrl } from '@/lib/config/endpoints';
import { getAuthMetadata } from './client';

// gRPC client configuration
const GRPC_ENDPOINT = getGrpcUrl();
const adminServiceClient = new AdminServiceClient(GRPC_ENDPOINT);

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

      const response = await adminServiceClient.listUsers(request, getAuthMetadata());
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

      const response = await adminServiceClient.updateUserRole(request, getAuthMetadata());
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

      const response = await adminServiceClient.updateUserLevel(request, getAuthMetadata());
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

      const response = await adminServiceClient.updateUserStatus(request, getAuthMetadata());
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

      const response = await adminServiceClient.getAuditLogs(request, getAuthMetadata());
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

      const response = await adminServiceClient.getResourceAccess(request, getAuthMetadata());
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

      const response = await adminServiceClient.getSecurityAlerts(request, getAuthMetadata());
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

      const response = await adminServiceClient.getSystemStats(request, getAuthMetadata());
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
}
