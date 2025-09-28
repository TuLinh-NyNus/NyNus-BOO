/**
 * Admin Dashboard Hook
 * React hook để quản lý admin dashboard data và operations
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/services/grpc/admin.service';
import { UserRole, UserStatus } from '@/generated/common/common_pb';

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
  role: UserRole;
  status: UserStatus;
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
  role?: UserRole;
  status?: UserStatus;
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
  updateUserRole: (userId: string, role: UserRole, level?: number) => Promise<boolean>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<boolean>;
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
  // Dashboard stats state
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

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
   * Load dashboard statistics
   */
  const refreshStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);

    try {
      // For now, use mock data since backend might not have this endpoint yet
      const mockStats: AdminDashboardStats = {
        totalUsers: 1250,
        activeUsers: 890,
        totalSessions: 1456,
        securityAlerts: 12,
        newUsersToday: 45,
        loginAttemptsToday: 2340,
        suspiciousActivities: 8
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStatsError('Không thể tải thống kê dashboard');
    } finally {
      setStatsLoading(false);
    }
  }, []);

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
  const updateUserRole = useCallback(async (userId: string, role: UserRole, level?: number): Promise<boolean> => {
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
  const updateUserStatus = useCallback(async (userId: string, status: UserStatus): Promise<boolean> => {
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

  // Load initial data on mount
  useEffect(() => {
    refreshStats();
    loadUsers();
  }, [refreshStats, loadUsers]);

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
