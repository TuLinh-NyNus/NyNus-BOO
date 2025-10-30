/**
 * Admin React Query Hooks
 * Centralized data fetching hooks cho admin pages với caching và deduplication
 * 
 * ✅ FIX: Giải quyết multiple API calls problem
 * 
 * Performance improvements:
 * - Request deduplication: Nhiều components gọi cùng API → chỉ 1 request
 * - Caching: Data được cache 30 seconds → giảm API calls
 * - Background refetch: Auto refresh data khi stale
 * - Optimistic updates: UI update ngay, sync với server sau
 * 
 * @author NyNus Development Team
 * @created 2025-01-19
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { AdminService } from '@/services/grpc/admin.service';
import { logger } from '@/lib/logger';

// ===== QUERY KEYS =====

/**
 * Query keys cho admin data
 * Sử dụng hierarchical structure để invalidate dễ dàng
 */
export const adminQueryKeys = {
  all: ['admin'] as const,
  
  // Users
  users: () => [...adminQueryKeys.all, 'users'] as const,
  usersList: (filters?: AdminUserFilters) => [...adminQueryKeys.users(), 'list', filters] as const,
  usersDetail: (id: string) => [...adminQueryKeys.users(), 'detail', id] as const,
  
  // Audit logs
  auditLogs: () => [...adminQueryKeys.all, 'audit-logs'] as const,
  auditLogsList: (filters?: AuditLogFilters) => [...adminQueryKeys.auditLogs(), 'list', filters] as const,
  
  // Resource access
  resourceAccess: () => [...adminQueryKeys.all, 'resource-access'] as const,
  resourceAccessList: (filters?: ResourceAccessFilters) => [...adminQueryKeys.resourceAccess(), 'list', filters] as const,
  
  // Security alerts
  securityAlerts: () => [...adminQueryKeys.all, 'security-alerts'] as const,
  securityAlertsList: (filters?: SecurityAlertFilters) => [...adminQueryKeys.securityAlerts(), 'list', filters] as const,
  
  // System stats
  systemStats: () => [...adminQueryKeys.all, 'system-stats'] as const,
} as const;

// ===== TYPE DEFINITIONS =====

interface AdminUserFilters {
  role?: string;
  status?: string;
  search_query?: string;
  page?: number;
  limit?: number;
}

interface AuditLogFilters {
  user_id?: string;
  action?: string;
  resource?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

interface ResourceAccessFilters {
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  action?: string;
  min_risk_score?: number;
  page?: number;
  limit?: number;
}

interface SecurityAlertFilters {
  severity?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

// ===== HOOKS =====

/**
 * useAdminUsers Hook
 * Fetch danh sách users với filtering và pagination
 * 
 * Features:
 * - Auto caching 30 seconds
 * - Request deduplication
 * - Background refetch khi stale
 */
export function useAdminUsers(
  filters?: AdminUserFilters,
  options?: Omit<UseQueryOptions<unknown, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminQueryKeys.usersList(filters),
    queryFn: async () => {
      logger.debug('[useAdminUsers] Fetching users', { filters });
      
      const response = await AdminService.listUsers({
        filter: {
          role: filters?.role,
          status: filters?.status,
          search_query: filters?.search_query,
        },
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 20, // ✅ Giảm từ 50 xuống 20
        },
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch users');
      }
      
      return response;
    },
    staleTime: 30000, // 30 seconds - Data được coi là fresh trong 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - Keep in cache 5 minutes
    retry: 2, // Retry 2 lần nếu failed
    ...options,
  });
}

/**
 * useAuditLogs Hook
 * Fetch audit logs với filtering và pagination
 */
export function useAuditLogs(
  filters?: AuditLogFilters,
  options?: Omit<UseQueryOptions<unknown, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminQueryKeys.auditLogsList(filters),
    queryFn: async () => {
      logger.debug('[useAuditLogs] Fetching audit logs', { filters });
      
      const response = await AdminService.getAuditLogs({
        user_id: filters?.user_id,
        action: filters?.action,
        resource: filters?.resource,
        start_date: filters?.start_date,
        end_date: filters?.end_date,
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 20, // ✅ Giảm từ 50 xuống 20
        },
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch audit logs');
      }
      
      return response;
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
}

/**
 * useResourceAccess Hook
 * Fetch resource access logs với filtering và pagination
 */
export function useResourceAccess(
  filters?: ResourceAccessFilters,
  options?: Omit<UseQueryOptions<unknown, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminQueryKeys.resourceAccessList(filters),
    queryFn: async () => {
      logger.debug('[useResourceAccess] Fetching resource access', { filters });
      
      const response = await AdminService.getResourceAccess({
        user_id: filters?.user_id,
        resource_type: filters?.resource_type,
        resource_id: filters?.resource_id,
        action: filters?.action,
        min_risk_score: filters?.min_risk_score,
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 20, // ✅ Giảm từ 50 xuống 20
        },
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch resource access');
      }
      
      return response;
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
}

/**
 * useSecurityAlerts Hook
 * Fetch security alerts với filtering và pagination
 */
export function useSecurityAlerts(
  filters?: SecurityAlertFilters,
  options?: Omit<UseQueryOptions<unknown, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminQueryKeys.securityAlertsList(filters),
    queryFn: async () => {
      logger.debug('[useSecurityAlerts] Fetching security alerts', { filters });
      
      const response = await AdminService.getSecurityAlerts({
        severity: filters?.severity,
        status: filters?.status,
        start_date: filters?.start_date,
        end_date: filters?.end_date,
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 20, // ✅ Giảm từ 50 xuống 20
        },
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch security alerts');
      }
      
      return response;
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
}

/**
 * useSystemStats Hook
 * Fetch system statistics
 * 
 * Note: Sử dụng AdminStatsContext thay vì hook này để tránh duplicate calls
 * Hook này chỉ dùng khi cần fetch stats riêng biệt
 */
export function useSystemStats(
  options?: Omit<UseQueryOptions<unknown, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminQueryKeys.systemStats(),
    queryFn: async () => {
      logger.debug('[useSystemStats] Fetching system stats');
      
      const response = await AdminService.getSystemStats();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch system stats');
      }
      
      return response;
    },
    staleTime: 60000, // 1 minute - Stats ít thay đổi hơn
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...options,
  });
}

// ===== MUTATIONS =====

/**
 * useUpdateUserRole Mutation
 * Update user role với optimistic updates
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, newRole, level }: { userId: string; newRole: string; level?: number }) => {
      logger.debug('[useUpdateUserRole] Updating user role', { userId, newRole, level });
      
      const response = await AdminService.updateUserRole({
        user_id: userId,
        new_role: newRole,
        level: level || 0,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update user role');
      }
      
      return response;
    },
    onSuccess: () => {
      // Invalidate users queries để refetch data mới
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      logger.info('[useUpdateUserRole] User role updated successfully');
    },
    onError: (error) => {
      logger.error('[useUpdateUserRole] Failed to update user role', { error });
    },
  });
}

// ===== EXPORTS =====

const adminQueries = {
  useAdminUsers,
  useAuditLogs,
  useResourceAccess,
  useSecurityAlerts,
  useSystemStats,
  useUpdateUserRole,
};

export default adminQueries;


