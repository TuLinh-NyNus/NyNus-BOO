/**
 * Admin API Service
 * Service layer cho tất cả admin APIs - user management, audit logs, resource access, etc.
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { apiGet, apiPut } from '@/lib/api/client';

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
function buildQueryString(params: Record<string, unknown> | object): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
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
  const queryParams = {
    ...pagination,
    ...filter,
  };
  
  const queryString = buildQueryString(queryParams);
  const response = await apiGet<ListUsersResponse>(`/api/v1/admin/users${queryString}`);
  
  return response;
}

/**
 * Update user role
 */
export async function updateUserRole(request: UpdateUserRoleRequest): Promise<UserUpdateResponse> {
  const { user_id, ...body } = request;
  
  const response = await apiPut<UserUpdateResponse>(
    `/api/v1/admin/users/${user_id}/role`,
    body
  );
  
  return response;
}

/**
 * Update user level
 */
export async function updateUserLevel(request: UpdateUserLevelRequest): Promise<UserUpdateResponse> {
  const { user_id, ...body } = request;
  
  const response = await apiPut<UserUpdateResponse>(
    `/api/v1/admin/users/${user_id}/level`,
    body
  );
  
  return response;
}

/**
 * Update user status
 */
export async function updateUserStatus(request: UpdateUserStatusRequest): Promise<UserUpdateResponse> {
  const { user_id, ...body } = request;
  
  const response = await apiPut<UserUpdateResponse>(
    `/api/v1/admin/users/${user_id}/status`,
    body
  );
  
  return response;
}

/**
 * Get audit logs
 */
export async function getAuditLogs(request?: GetAuditLogsRequest): Promise<GetAuditLogsResponse> {
  const queryString = request ? buildQueryString(request) : '';
  
  const response = await apiGet<GetAuditLogsResponse>(`/api/v1/admin/audit-logs${queryString}`);
  
  return response;
}

/**
 * Get resource access logs
 */
export async function getResourceAccess(request?: GetResourceAccessRequest): Promise<GetResourceAccessResponse> {
  const queryString = request ? buildQueryString(request) : '';
  
  const response = await apiGet<GetResourceAccessResponse>(`/api/v1/admin/resource-access${queryString}`);
  
  return response;
}

/**
 * Get security alerts
 */
export async function getSecurityAlerts(request?: GetSecurityAlertsRequest): Promise<GetSecurityAlertsResponse> {
  const queryString = request ? buildQueryString(request) : '';
  
  const response = await apiGet<GetSecurityAlertsResponse>(`/api/v1/admin/security-alerts${queryString}`);
  
  return response;
}

/**
 * Get system statistics
 */
export async function getSystemStats(): Promise<GetSystemStatsResponse> {
  const response = await apiGet<GetSystemStatsResponse>('/api/v1/admin/stats');
  
  return response;
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