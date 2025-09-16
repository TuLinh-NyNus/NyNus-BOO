/**
 * Admin API Service
 * Service layer cho tất cả admin APIs - user management, audit logs, resource access, etc.
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

// Refactored to use gRPC-Web AdminService
import { AdminService } from '@/services/grpc/admin.service';

// ===== TYPES =====

/**
 * User role enum values
 */
export type UserRole = 'GUEST' | 'STUDENT' | 'TUTOR' | 'TEACHER' | 'ADMIN';

/**
 * User status enum values
 */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role: UserRole;
  level?: number;
  status: UserStatus;
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  login_count?: number;
}

/**
 * List users filter
 */
export interface ListUsersFilter {
  role?: UserRole;
  status?: UserStatus;
  level?: number;
  email_verified?: boolean;
  search_query?: string;
}

/**
 * Pagination request
 */
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Pagination response
 */
export interface PaginationResponse {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
}

/**
 * API Response wrapper
 */
export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  errors?: string[];
  data?: T;
}

/**
 * List users response
 */
export interface ListUsersResponse extends APIResponse {
  users: User[];
  pagination: PaginationResponse;
}

/**
 * Update user role request
 */
export interface UpdateUserRoleRequest {
  user_id: string;
  new_role: UserRole;
  level?: number;
}

/**
 * Update user level request
 */
export interface UpdateUserLevelRequest {
  user_id: string;
  new_level: number;
}

/**
 * Update user status request
 */
export interface UpdateUserStatusRequest {
  user_id: string;
  new_status: UserStatus;
  reason?: string;
}

/**
 * User update response
 */
export interface UserUpdateResponse extends APIResponse {
  updated_user: User;
}

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource: string;
  resource_id?: string;
  old_values?: string; // JSON string
  new_values?: string; // JSON string
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

/**
 * Get audit logs request
 */
export interface GetAuditLogsRequest extends PaginationRequest {
  user_id?: string;
  action?: string;
  resource?: string;
  start_date?: string; // ISO format
  end_date?: string;   // ISO format
}

/**
 * Get audit logs response
 */
export interface GetAuditLogsResponse extends APIResponse {
  logs: AuditLog[];
  pagination: PaginationResponse;
}

/**
 * Resource access entry
 */
export interface ResourceAccess {
  id: string;
  user_id: string;
  user_email?: string;
  resource_type: string;
  resource_id: string;
  action: string;
  ip_address: string;
  is_valid_access: boolean;
  risk_score: number;
  created_at: string;
}

/**
 * Get resource access request
 */
export interface GetResourceAccessRequest extends PaginationRequest {
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  min_risk_score?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * Get resource access response
 */
export interface GetResourceAccessResponse extends APIResponse {
  accesses: ResourceAccess[];
  pagination: PaginationResponse;
}

/**
 * Security alert
 */
export interface SecurityAlert {
  user_id: string;
  alert_type: string;
  message: string;
  details?: string; // JSON string
  created_at: string;
}

/**
 * Get security alerts request
 */
export interface GetSecurityAlertsRequest extends PaginationRequest {
  user_id?: string;
  alert_type?: string;
  unresolved_only?: boolean;
}

/**
 * Get security alerts response
 */
export interface GetSecurityAlertsResponse extends APIResponse {
  alerts: SecurityAlert[];
  pagination: PaginationResponse;
}

/**
 * System statistics
 */
export interface SystemStats {
  total_users: number;
  active_users: number;
  total_sessions: number;
  active_sessions: number;
  users_by_role: Record<string, number>;
  users_by_status: Record<string, number>;
  suspicious_activities: number;
}

/**
 * Get system stats response
 */
export interface GetSystemStatsResponse extends APIResponse {
  stats: SystemStats;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Build query string from object
 */
function _buildQueryString(_params: Record<string, unknown> | object): string {
  // retained for compatibility; not used after gRPC refactor
  const searchParams = new URLSearchParams();
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ===== API FUNCTIONS =====

/**
 * List users with filters and pagination
 */
export async function listUsers(
  filter?: ListUsersFilter,
  pagination?: PaginationRequest
): Promise<ListUsersResponse> {
  // Build gRPC request
  const req = new (await import('@/generated/v1/admin_pb')).AdminListUsersRequest();
  if (pagination) {
    const pg = req.getPagination?.();
    pg?.setPage?.(pagination.page ?? 1);
    pg?.setLimit?.(pagination.limit ?? 20);
    if (pagination.sort_by) pg?.setSortBy?.(pagination.sort_by);
    if (pagination.sort_order) pg?.setSortOrder?.(pagination.sort_order);
  }
  if (filter) {
    const f = req.getFilter?.();
    if (filter.role) {
      // Map string role to common.UserRole enum value (fallback to STUDENT)
      const roleEnum = (await import('@/generated/common/common_pb')).UserRole;
      const roleMap: Record<string, number> = {
        GUEST: roleEnum.USER_ROLE_GUEST,
        STUDENT: roleEnum.USER_ROLE_STUDENT,
        TUTOR: roleEnum.USER_ROLE_TUTOR,
        TEACHER: roleEnum.USER_ROLE_TEACHER,
        ADMIN: roleEnum.USER_ROLE_ADMIN,
      };
      f?.setRole?.(roleMap[filter.role] ?? roleEnum.USER_ROLE_STUDENT);
    }
    if (filter.status) {
      const statusEnum = (await import('@/generated/common/common_pb')).UserStatus;
      const statusMap: Record<string, number> = {
        ACTIVE: statusEnum.USER_STATUS_ACTIVE,
        INACTIVE: statusEnum.USER_STATUS_INACTIVE,
        SUSPENDED: statusEnum.USER_STATUS_SUSPENDED,
      };
      f?.setStatus?.(statusMap[filter.status] ?? statusEnum.USER_STATUS_ACTIVE);
    }
    if (typeof filter.level === 'number') f?.setLevel?.(filter.level);
    if (typeof filter.email_verified === 'boolean') f?.setEmailVerified?.(filter.email_verified);
    if (filter.search_query) f?.setSearchQuery?.(filter.search_query);
  }

  const res = await AdminService.listUsers(req);
  // Map response to current shape
  const users = (res.getUsersList?.() || []).map((u: unknown) => {
    const user = u as {
      getId?: () => string;
      getEmail?: () => string;
      getUsername?: () => string;
      getFirstName?: () => string;
      getLastName?: () => string;
      getRole?: () => number;
      getLevel?: () => number;
      getStatus?: () => number;
      getEmailVerified?: () => boolean;
      getCreatedAt?: () => string;
      getUpdatedAt?: () => string;
      getLastLoginAt?: () => string;
      getLoginCount?: () => number;
    };
    return {
      id: user.getId?.() ?? '',
      email: user.getEmail?.() ?? '',
      username: user.getUsername?.() ?? undefined,
      name: `${user.getFirstName?.() ?? ''} ${user.getLastName?.() ?? ''}`.trim() || undefined,
      role: (user.getRole?.() ?? 2) === 5 ? 'ADMIN' : (user.getRole?.() ?? 2) === 4 ? 'TEACHER' : (user.getRole?.() ?? 2) === 3 ? 'TUTOR' : 'STUDENT',
      level: user.getLevel?.(),
      status: (user.getStatus?.() ?? 1) === 1 ? 'ACTIVE' : (user.getStatus?.() ?? 1) === 2 ? 'INACTIVE' : 'SUSPENDED',
      email_verified: user.getEmailVerified?.(),
      created_at: user.getCreatedAt?.() ?? '',
      updated_at: user.getUpdatedAt?.() ?? '',
      last_login_at: user.getLastLoginAt?.() ?? undefined,
      login_count: user.getLoginCount?.() ?? undefined,
    } as User;
  }) as User[];

  const pg = res.getPagination?.();
  return {
    users,
    pagination: {
      page: pg?.getPage?.() ?? (pagination?.page ?? 1),
      limit: pg?.getLimit?.() ?? (pagination?.limit ?? 20),
      total_count: pg?.getTotalCount?.() ?? users.length,
      total_pages: pg?.getTotalPages?.() ?? 1,
    },
    success: true,
  } as ListUsersResponse;
}

/**
 * Update user role
 */
export async function updateUserRole(request: UpdateUserRoleRequest): Promise<UserUpdateResponse> {
  const { user_id, new_role, level } = request;
  const { UpdateUserRoleRequest } = await import('@/generated/v1/admin_pb');
  const req = new UpdateUserRoleRequest();
  req.setUserId(user_id);
  const roleEnum = (await import('@/generated/common/common_pb')).UserRole;
  const roleMap: Record<UserRole, number> = {
    GUEST: roleEnum.USER_ROLE_GUEST,
    STUDENT: roleEnum.USER_ROLE_STUDENT,
    TUTOR: roleEnum.USER_ROLE_TUTOR,
    TEACHER: roleEnum.USER_ROLE_TEACHER,
    ADMIN: roleEnum.USER_ROLE_ADMIN,
  };
  req.setNewRole(roleMap[new_role]);
  if (typeof level === 'number') req.setLevel(level);

  const res = await AdminService.updateUserRole(req);
  const u = res.getUpdatedUser?.();
  return {
    updated_user: u ? {
      id: u.getId?.() ?? '',
      email: u.getEmail?.() ?? '',
      role: ((value: number) => value === 5 ? 'ADMIN' : value === 4 ? 'TEACHER' : value === 3 ? 'TUTOR' : 'STUDENT')(u.getRole?.() ?? 2),
      level: u.getLevel?.(),
      status: 'ACTIVE',
      created_at: '',
      updated_at: '',
    } as User : (undefined as unknown as User),
    success: true,
  } as UserUpdateResponse;
}

/**
 * Update user level
 */
export async function updateUserLevel(request: UpdateUserLevelRequest): Promise<UserUpdateResponse> {
  const { UpdateUserLevelRequest } = await import('@/generated/v1/admin_pb');
  const req = new UpdateUserLevelRequest();
  req.setUserId(request.user_id);
  req.setNewLevel(request.new_level);
  const res = await AdminService.updateUserLevel(req);
  const u = res.getUpdatedUser?.();
  return {
    updated_user: u ? {
      id: u.getId?.() ?? '',
      email: u.getEmail?.() ?? '',
      role: ((value: number) => value === 5 ? 'ADMIN' : value === 4 ? 'TEACHER' : value === 3 ? 'TUTOR' : 'STUDENT')(u.getRole?.() ?? 2),
      level: u.getLevel?.(),
      status: 'ACTIVE',
      created_at: '',
      updated_at: '',
    } as User : (undefined as unknown as User),
    success: true,
  } as UserUpdateResponse;
}

/**
 * Update user status
 */
export async function updateUserStatus(request: UpdateUserStatusRequest): Promise<UserUpdateResponse> {
  const { UpdateUserStatusRequest } = await import('@/generated/v1/admin_pb');
  const req = new UpdateUserStatusRequest();
  req.setUserId(request.user_id);
  const statusEnum = (await import('@/generated/common/common_pb')).UserStatus;
  const statusMap: Record<UserStatus, number> = {
    ACTIVE: statusEnum.USER_STATUS_ACTIVE,
    INACTIVE: statusEnum.USER_STATUS_INACTIVE,
    SUSPENDED: statusEnum.USER_STATUS_SUSPENDED,
  };
  req.setNewStatus(statusMap[request.new_status]);
  if (request.reason) req.setReason(request.reason);
  const res = await AdminService.updateUserStatus(req);
  const u = res.getUpdatedUser?.();
  return {
    updated_user: u ? {
      id: u.getId?.() ?? '',
      email: u.getEmail?.() ?? '',
      role: ((value: number) => value === 5 ? 'ADMIN' : value === 4 ? 'TEACHER' : value === 3 ? 'TUTOR' : 'STUDENT')(u.getRole?.() ?? 2),
      level: u.getLevel?.(),
      status: request.new_status,
      created_at: '',
      updated_at: '',
    } as User : (undefined as unknown as User),
    success: true,
  } as UserUpdateResponse;
}

/**
 * Get audit logs
 */
export async function getAuditLogs(request?: GetAuditLogsRequest): Promise<GetAuditLogsResponse> {
  const { GetAuditLogsRequest } = await import('@/generated/v1/admin_pb');
  const req = new GetAuditLogsRequest();
  if (request) {
    const pg = req.getPagination?.();
    if (pg) {
      if (request.page) pg.setPage(request.page);
      if (request.limit) pg.setLimit(request.limit);
      if (request.sort_by) pg.setSortBy(request.sort_by);
      if (request.sort_order) pg.setSortOrder(request.sort_order);
    }
    if (request.user_id) req.setUserId(request.user_id);
    if (request.action) req.setAction(request.action);
    if (request.resource) req.setResource(request.resource);
    if (request.start_date) req.setStartDate(request.start_date);
    if (request.end_date) req.setEndDate(request.end_date);
  }
  const res = await AdminService.getAuditLogs(req);
  const logs = (res.getLogsList?.() || []).map((l: unknown) => {
    const log = l as {
      getId?: () => string;
      getUserId?: () => string;
      getUserEmail?: () => string;
      getAction?: () => string;
      getResource?: () => string;
      getResourceId?: () => string;
      getOldValues?: () => string;
      getNewValues?: () => string;
      getIpAddress?: () => string;
      getUserAgent?: () => string;
      getSuccess?: () => boolean;
      getErrorMessage?: () => string;
      getCreatedAt?: () => string;
    };
    return {
      id: log.getId?.() ?? '',
      user_id: log.getUserId?.() ?? undefined,
      user_email: log.getUserEmail?.() ?? undefined,
      action: log.getAction?.() ?? '',
      resource: log.getResource?.() ?? '',
      resource_id: log.getResourceId?.() ?? undefined,
      old_values: log.getOldValues?.() ?? undefined,
      new_values: log.getNewValues?.() ?? undefined,
      ip_address: log.getIpAddress?.() ?? undefined,
      user_agent: log.getUserAgent?.() ?? undefined,
      success: !!log.getSuccess?.(),
      error_message: log.getErrorMessage?.() ?? undefined,
      created_at: log.getCreatedAt?.() ?? '',
    };
  });
  const pg = res.getPagination?.();
  return {
    logs,
    pagination: {
      page: pg?.getPage?.() ?? (request?.page ?? 1),
      limit: pg?.getLimit?.() ?? (request?.limit ?? 20),
      total_count: pg?.getTotalCount?.() ?? logs.length,
      total_pages: pg?.getTotalPages?.() ?? 1,
    },
    success: true,
  } as GetAuditLogsResponse;
}

/**
 * Get resource access logs
 */
export async function getResourceAccess(request?: GetResourceAccessRequest): Promise<GetResourceAccessResponse> {
  const { GetResourceAccessRequest } = await import('@/generated/v1/admin_pb');
  const req = new GetResourceAccessRequest();
  if (request) {
    const pg = req.getPagination?.();
    if (pg) {
      if (request.page) pg.setPage(request.page);
      if (request.limit) pg.setLimit(request.limit);
      if (request.sort_by) pg.setSortBy(request.sort_by);
      if (request.sort_order) pg.setSortOrder(request.sort_order);
    }
    if (request.user_id) req.setUserId(request.user_id);
    if (request.resource_type) req.setResourceType(request.resource_type);
    if (request.resource_id) req.setResourceId(request.resource_id);
    if (typeof request.min_risk_score === 'number') req.setMinRiskScore(request.min_risk_score);
    if (request.start_date) req.setStartDate(request.start_date);
    if (request.end_date) req.setEndDate(request.end_date);
  }
  const res = await AdminService.getResourceAccess(req);
  const accesses = (res.getAccessesList?.() || []).map((a: unknown) => {
    const acc = a as {
      getId?: () => string;
      getUserId?: () => string;
      getUserEmail?: () => string;
      getResourceType?: () => string;
      getResourceId?: () => string;
      getAction?: () => string;
      getIpAddress?: () => string;
      getIsValidAccess?: () => boolean;
      getRiskScore?: () => number;
      getCreatedAt?: () => string;
    };
    return {
      id: acc.getId?.() ?? '',
      user_id: acc.getUserId?.() ?? '',
      user_email: acc.getUserEmail?.() ?? undefined,
      resource_type: acc.getResourceType?.() ?? '',
      resource_id: acc.getResourceId?.() ?? '',
      action: acc.getAction?.() ?? '',
      ip_address: acc.getIpAddress?.() ?? '',
      is_valid_access: !!acc.getIsValidAccess?.(),
      risk_score: acc.getRiskScore?.() ?? 0,
      created_at: acc.getCreatedAt?.() ?? '',
    };
  });
  const pg = res.getPagination?.();
  return {
    accesses,
    pagination: {
      page: pg?.getPage?.() ?? (request?.page ?? 1),
      limit: pg?.getLimit?.() ?? (request?.limit ?? 20),
      total_count: pg?.getTotalCount?.() ?? accesses.length,
      total_pages: pg?.getTotalPages?.() ?? 1,
    },
    success: true,
  } as GetResourceAccessResponse;
}

/**
 * Get security alerts
 */
export async function getSecurityAlerts(request?: GetSecurityAlertsRequest): Promise<GetSecurityAlertsResponse> {
  const { GetSecurityAlertsRequest } = await import('@/generated/v1/admin_pb');
  const req = new GetSecurityAlertsRequest();
  if (request) {
    const pg = req.getPagination?.();
    if (pg) {
      if (request.page) pg.setPage(request.page);
      if (request.limit) pg.setLimit(request.limit);
      if (request.sort_by) pg.setSortBy(request.sort_by);
      if (request.sort_order) pg.setSortOrder(request.sort_order);
    }
    if (request.user_id) req.setUserId(request.user_id);
    if (request.alert_type) req.setAlertType(request.alert_type);
    if (typeof request.unresolved_only === 'boolean') req.setUnresolvedOnly(request.unresolved_only);
  }
  const res = await AdminService.getSecurityAlerts(req);
  const alerts = (res.getAlertsList?.() || []).map((a: unknown) => {
    const al = a as {
      getUserId?: () => string;
      getAlertType?: () => string;
      getMessage?: () => string;
      getDetails?: () => string;
    };
    return {
      user_id: al.getUserId?.() ?? '',
      alert_type: al.getAlertType?.() ?? '',
      message: al.getMessage?.() ?? '',
      details: al.getDetails?.() ?? undefined,
      created_at: '',
    };
  });
  const pg = res.getPagination?.();
  return {
    alerts,
    pagination: {
      page: pg?.getPage?.() ?? (request?.page ?? 1),
      limit: pg?.getLimit?.() ?? (request?.limit ?? 20),
      total_count: pg?.getTotalCount?.() ?? alerts.length,
      total_pages: pg?.getTotalPages?.() ?? 1,
    },
    success: true,
  } as GetSecurityAlertsResponse;
}

/**
 * Get system statistics
 */
export async function getSystemStats(): Promise<GetSystemStatsResponse> {
  const { GetSystemStatsRequest } = await import('@/generated/v1/admin_pb');
  const res = await AdminService.getSystemStats(new GetSystemStatsRequest());
  const s = res.getStats?.();
  return {
    stats: s ? {
      total_users: s.getTotalUsers?.() ?? 0,
      active_users: s.getActiveUsers?.() ?? 0,
      total_sessions: s.getTotalSessions?.() ?? 0,
      active_sessions: s.getActiveSessions?.() ?? 0,
      users_by_role: s.getUsersByRoleMap?.()?.toObject() as Record<string, number> ?? {},
      users_by_status: s.getUsersByStatusMap?.()?.toObject() as Record<string, number> ?? {},
      suspicious_activities: s.getSuspiciousActivities?.() ?? 0,
    } : {
      total_users: 0,
      active_users: 0,
      total_sessions: 0,
      active_sessions: 0,
      users_by_role: {},
      users_by_status: {},
      suspicious_activities: 0,
    }
  } as GetSystemStatsResponse;
}

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Suspend user (convenience function)
 */
export async function suspendUser(userId: string, reason?: string): Promise<UserUpdateResponse> {
  return updateUserStatus({
    user_id: userId,
    new_status: 'SUSPENDED',
    reason: reason || 'Suspended by admin',
  });
}

/**
 * Activate user (convenience function)
 */
export async function activateUser(userId: string): Promise<UserUpdateResponse> {
  return updateUserStatus({
    user_id: userId,
    new_status: 'ACTIVE',
  });
}

/**
 * Get users by role (convenience function)
 */
export async function getUsersByRole(role: UserRole, pagination?: PaginationRequest): Promise<ListUsersResponse> {
  return listUsers({ role }, pagination);
}

/**
 * Get users by status (convenience function)
 */
export async function getUsersByStatus(status: UserStatus, pagination?: PaginationRequest): Promise<ListUsersResponse> {
  return listUsers({ status }, pagination);
}

/**
 * Search users (convenience function)
 */
export async function searchUsers(query: string, pagination?: PaginationRequest): Promise<ListUsersResponse> {
  return listUsers({ search_query: query }, pagination);
}

/**
 * Get high-risk resource accesses (convenience function)
 */
export async function getHighRiskAccesses(
  minRiskScore = 70,
  pagination?: PaginationRequest
): Promise<GetResourceAccessResponse> {
  return getResourceAccess({ min_risk_score: minRiskScore, ...pagination });
}

/**
 * Get recent audit logs (convenience function)
 */
export async function getRecentAuditLogs(
  hours = 24,
  pagination?: PaginationRequest
): Promise<GetAuditLogsResponse> {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
  
  return getAuditLogs({
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    ...pagination,
  });
}

/**
 * Get user audit logs (convenience function)
 */
export async function getUserAuditLogs(
  userId: string,
  pagination?: PaginationRequest
): Promise<GetAuditLogsResponse> {
  return getAuditLogs({ user_id: userId, ...pagination });
}

/**
 * Get user resource accesses (convenience function)
 */
export async function getUserResourceAccesses(
  userId: string,
  pagination?: PaginationRequest
): Promise<GetResourceAccessResponse> {
  return getResourceAccess({ user_id: userId, ...pagination });
}

// ===== ERROR HANDLING HELPERS =====

/**
 * Check if error is admin permission error
 */
export function isAdminPermissionError(error: unknown): boolean {
  return (
    error !== null &&
    error !== undefined &&
    typeof error === 'object' &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number' &&
    ((error as { status: number }).status === 403 || (error as { status: number }).status === 401)
  );
}

/**
 * Get user-friendly error message for admin operations
 */
export function getAdminErrorMessage(error: unknown): string {
  if (isAdminPermissionError(error)) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Đã xảy ra lỗi không xác định.';
}

// ===== DEFAULT EXPORT =====

/**
 * Admin API service object
 */
export const adminApiService = {
  // User management
  listUsers,
  updateUserRole,
  updateUserLevel,
  updateUserStatus,
  suspendUser,
  activateUser,
  getUsersByRole,
  getUsersByStatus,
  searchUsers,
  
  // Audit & monitoring
  getAuditLogs,
  getResourceAccess,
  getSecurityAlerts,
  getSystemStats,
  getRecentAuditLogs,
  getUserAuditLogs,
  getUserResourceAccesses,
  getHighRiskAccesses,
  
  // Error helpers
  isAdminPermissionError,
  getAdminErrorMessage,
};

export default adminApiService;