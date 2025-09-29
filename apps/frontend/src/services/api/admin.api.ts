/**
 * Admin API Service (Simplified Stub Version)
 * Temporary stub implementation while protobuf files are being generated
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

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

// ===== STUB FUNCTIONS =====

/**
 * List users with filters and pagination
 */
export async function listUsers(
  _filter?: ListUsersFilter,
  pagination?: PaginationRequest
): Promise<ListUsersResponse> {
  console.warn('listUsers is stubbed - need protobuf generation');
  
  return {
    users: [],
    pagination: {
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 20,
      total_count: 0,
      total_pages: 0,
    },
    success: true,
  } as ListUsersResponse;
}

/**
 * Update user role
 */
export async function updateUserRole(request: UpdateUserRoleRequest): Promise<UserUpdateResponse> {
  console.warn('updateUserRole is stubbed - need protobuf generation');
  
  return {
    updated_user: {
      id: request.user_id,
      email: '',
      role: request.new_role,
      level: request.level,
      status: 'ACTIVE',
      created_at: '',
      updated_at: '',
    } as User,
    success: true,
  } as UserUpdateResponse;
}

/**
 * Update user level
 */
export async function updateUserLevel(request: UpdateUserLevelRequest): Promise<UserUpdateResponse> {
  console.warn('updateUserLevel is stubbed - need protobuf generation');
  
  return {
    updated_user: {
      id: request.user_id,
      email: '',
      role: 'STUDENT',
      level: request.new_level,
      status: 'ACTIVE',
      created_at: '',
      updated_at: '',
    } as User,
    success: true,
  } as UserUpdateResponse;
}

/**
 * Update user status
 */
export async function updateUserStatus(request: UpdateUserStatusRequest): Promise<UserUpdateResponse> {
  console.warn('updateUserStatus is stubbed - need protobuf generation');
  
  return {
    updated_user: {
      id: request.user_id,
      email: '',
      role: 'STUDENT',
      status: request.new_status,
      created_at: '',
      updated_at: '',
    } as User,
    success: true,
  } as UserUpdateResponse;
}

/**
 * Get audit logs
 */
export async function getAuditLogs(_request?: GetAuditLogsRequest): Promise<GetAuditLogsResponse> {
  console.warn('getAuditLogs is stubbed - need protobuf generation');
  
  return {
    logs: [],
    pagination: {
      page: 1,
      limit: 20,
      total_count: 0,
      total_pages: 0,
    },
    success: true,
  } as GetAuditLogsResponse;
}

/**
 * Get resource access logs
 */
export async function getResourceAccess(_request?: GetResourceAccessRequest): Promise<GetResourceAccessResponse> {
  console.warn('getResourceAccess is stubbed - need protobuf generation');
  
  return {
    accesses: [],
    pagination: {
      page: 1,
      limit: 20,
      total_count: 0,
      total_pages: 0,
    },
    success: true,
  } as GetResourceAccessResponse;
}

/**
 * Get security alerts
 */
export async function getSecurityAlerts(_request?: GetSecurityAlertsRequest): Promise<GetSecurityAlertsResponse> {
  console.warn('getSecurityAlerts is stubbed - need protobuf generation');
  
  return {
    alerts: [],
    pagination: {
      page: 1,
      limit: 20,
      total_count: 0,
      total_pages: 0,
    },
    success: true,
  } as GetSecurityAlertsResponse;
}

/**
 * Get system statistics
 */
export async function getSystemStats(): Promise<GetSystemStatsResponse> {
  console.warn('getSystemStats is stubbed - need protobuf generation');
  
  return {
    stats: {
      total_users: 0,
      active_users: 0,
      total_sessions: 0,
      active_sessions: 0,
      users_by_role: {},
      users_by_status: {},
      suspicious_activities: 0,
    },
    success: true,
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