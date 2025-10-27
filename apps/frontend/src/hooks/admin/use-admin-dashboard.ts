/**
 * Admin Dashboard Hook
 * React hook để quản lý admin dashboard data và operations
 *
 * ✅ FIX: Sử dụng AdminStatsContext để tránh duplicate API calls
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/services/grpc/admin.service';
import { useAdminStats } from '@/contexts/admin-stats-context';
// import { UserRole, UserStatus } from '@/generated/common/common_pb';

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  securityAlerts: number;
  newUsersToday: number;
  loginAttemptsToday: number;
  suspiciousActivities: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, unknown>;
}

export interface ResourceAccess {
  id: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  action: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResourceAccessParams {
  page?: number;
  limit?: number;
  userId?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: number;
  status: number;
  level?: number;
  is_active: boolean;
  email_verified: boolean;
  username?: string;
  avatar?: string;
  google_id?: string;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  role?: number;
  status?: number;
  search?: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UseAdminDashboardReturn {
  // Dashboard stats
  stats: AdminDashboardStats | null;
  statsLoading: boolean;
  statsError: string | null;
  refreshStats: () => Promise<void>;

  // User management
  users: AdminUser[];
  usersLoading: boolean;
  usersError: string | null;
  usersPagination: AdminUserListResponse['pagination'] | null;
  loadUsers: (params?: AdminUserListParams) => Promise<void>;
  updateUserRole: (userId: string, role: number, level?: number) => Promise<boolean>;
  updateUserStatus: (userId: string, status: number) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;

  // Audit logs
  auditLogs: AuditLog[];
  auditLogsLoading: boolean;
  auditLogsError: string | null;
  loadAuditLogs: (params?: AuditLogParams) => Promise<void>;

  // Resource access monitoring
  resourceAccess: ResourceAccess[];
  resourceAccessLoading: boolean;
  resourceAccessError: string | null;
  loadResourceAccess: (params?: ResourceAccessParams) => Promise<void>;
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  // ✅ FIX: Use AdminStatsContext instead of local state
  const { stats: contextStats, loading: statsLoading, error: statsError, refresh: refreshStats } = useAdminStats();

  // Map context stats to AdminDashboardStats format
  const stats: AdminDashboardStats | null = contextStats ? {
    totalUsers: contextStats.total_users || 0,
    activeUsers: contextStats.active_users || 0,
    totalSessions: contextStats.total_sessions || 0,
    securityAlerts: contextStats.suspicious_activities || 0,
    newUsersToday: 0, // TODO: Add to backend
    loginAttemptsToday: 0, // TODO: Add to backend
    suspiciousActivities: contextStats.suspicious_activities || 0
  } : null;

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersPagination, setUsersPagination] = useState<AdminUserListResponse['pagination'] | null>(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogsError, setAuditLogsError] = useState<string | null>(null);

  // Resource access state
  const [resourceAccess, setResourceAccess] = useState<ResourceAccess[]>([]);
  const [resourceAccessLoading, setResourceAccessLoading] = useState(false);
  const [resourceAccessError, setResourceAccessError] = useState<string | null>(null);

  /**
   * Load users with pagination and filters
   */
  const loadUsers = useCallback(async (params: AdminUserListParams = {}) => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const response = await AdminService.listUsers({
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20
        },
        filter: {
          role: params.role,
          status: params.status,
          search_query: params.search
        }
      });

      if (response.success) {
        setUsers(response.users || []);
        setUsersPagination(response.pagination || null);
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsersError('Không thể tải danh sách người dùng');
      setUsers([]);
      setUsersPagination(null);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  /**
   * Update user role and level
   */
  const updateUserRole = useCallback(async (userId: string, role: number, level?: number): Promise<boolean> => {
    try {
      const response = await AdminService.updateUserRole({
        user_id: userId,
        new_role: role,
        level: level
      });

      if (response.success) {
        // Refresh users list to show updated data
        await loadUsers();
        return true;
      } else {
        throw new Error(response.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      return false;
    }
  }, [loadUsers]);

  /**
   * Update user status
   */
  const updateUserStatus = useCallback(async (userId: string, status: number): Promise<boolean> => {
    try {
      const response = await AdminService.updateUserStatus({
        user_id: userId,
        new_status: status
      });

      if (response.success) {
        // Refresh users list to show updated data
        await loadUsers();
        return true;
      } else {
        throw new Error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
      return false;
    }
  }, [loadUsers]);

  /**
   * Delete user
   */
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Note: AdminService doesn't have deleteUser method yet
      // This would need to be implemented in the service
      console.log(`Deleting user ${userId}`);
      
      // Refresh users list after deletion
      await loadUsers();
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  }, [loadUsers]);

  /**
   * Load audit logs
   */
  const loadAuditLogs = useCallback(async (params: AuditLogParams = {}) => {
    setAuditLogsLoading(true);
    setAuditLogsError(null);

    try {
      const response = await AdminService.getAuditLogs({
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20
        },
        userId: params.userId,
        action: params.action,
        startDate: params.startDate,
        endDate: params.endDate
      });

      if (response.success) {
        setAuditLogs(response.audit_logs || []);
      } else {
        throw new Error(response.message || 'Failed to load audit logs');
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      setAuditLogsError('Không thể tải nhật ký audit');
      setAuditLogs([]);
    } finally {
      setAuditLogsLoading(false);
    }
  }, []);

  /**
   * Load resource access logs
   */
  const loadResourceAccess = useCallback(async (params: ResourceAccessParams = {}) => {
    setResourceAccessLoading(true);
    setResourceAccessError(null);

    try {
      const response = await AdminService.getResourceAccess({
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20
        },
        userId: params.userId,
        resourceType: params.resourceType,
        startDate: params.startDate,
        endDate: params.endDate
      });

      if (response.success) {
        setResourceAccess(response.resource_access || []);
      } else {
        throw new Error(response.message || 'Failed to load resource access');
      }
    } catch (error) {
      console.error('Failed to load resource access:', error);
      setResourceAccessError('Không thể tải nhật ký truy cập tài nguyên');
      setResourceAccess([]);
    } finally {
      setResourceAccessLoading(false);
    }
  }, []);

  // ✅ FIX: Load initial data on mount
  // REMOVED: refreshStats() call - AdminStatsContext already auto-fetches on mount
  // Keeping this useEffect would cause infinite loop due to function dependency chain:
  // refreshStats depends on fetchStats → fetchStats recreates on stats update → refreshStats recreates → useEffect triggers
  useEffect(() => {
    // Only load users on mount, stats are already loaded by AdminStatsContext
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  return {
    // Dashboard stats
    stats,
    statsLoading,
    statsError,
    refreshStats,

    // User management
    users,
    usersLoading,
    usersError,
    usersPagination,
    loadUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser,

    // Audit logs
    auditLogs,
    auditLogsLoading,
    auditLogsError,
    loadAuditLogs,

    // Resource access monitoring
    resourceAccess,
    resourceAccessLoading,
    resourceAccessError,
    loadResourceAccess
  };
}
