'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AdminUser, UserStats, AdvancedUserFilters } from '@/lib/mockdata/types';
import { MockPagination } from '@/lib/mockdata/core-types';
import { UserRole, UserStatus } from '@/generated/common/common_pb';
import { AdminService } from '@/services/grpc/admin.service';
import { useAdminStats } from '@/contexts/admin-stats-context';

// ===== INTERFACES =====

/**
 * Configuration interface cho useUserManagement hook
 */
interface UseUserManagementConfig {
  initialLimit: number;        // Số lượng users mỗi trang (default: 25)
  enableCaching: boolean;      // Có cache kết quả không (default: true)
  debounceDelay: number;       // Delay cho search debounce (default: 300ms)
}

/**
 * Return interface của useUserManagement hook
 */
interface UseUserManagementReturn {
  // ===== DATA =====
  users: AdminUser[];                    // Danh sách users hiện tại
  stats: UserStats;                      // Thống kê users
  selectedUser: AdminUser | null;        // User được chọn để xem chi tiết
  
  // ===== STATES =====
  isLoading: boolean;                    // Đang load users
  isSearching: boolean;                  // Đang search users
  error: string | null;                  // Lỗi nếu có
  
  // ===== PAGINATION =====
  pagination: MockPagination;            // Thông tin phân trang
  
  // ===== FILTERS =====
  filters: AdvancedUserFilters;          // Bộ lọc hiện tại
  
  // ===== ACTIONS =====
  searchUsers: (query: string) => Promise<void>;                    // Tìm kiếm users
  applyFilters: (filters: AdvancedUserFilters) => Promise<void>;     // Áp dụng bộ lọc
  changePage: (page: number) => Promise<void>;                      // Chuyển trang
  refreshUsers: () => Promise<void>;                                // Refresh danh sách
  
  // ===== USER MANAGEMENT =====
  getUserById: (id: string) => Promise<void>;                       // Lấy user theo ID
  clearSelectedUser: () => void;                                    // Clear user đã chọn
  clearFilters: () => void;                                         // Clear tất cả filters
  
  // ===== SECURITY ACTIONS =====
  suspendUser: (userId: string, reason: string) => Promise<void>;   // Tạm ngưng user
  reactivateUser: (userId: string) => Promise<void>;               // Kích hoạt lại user
  promoteUser: (userId: string, newRole: UserRole) => Promise<void>; // Thăng cấp user
  resetUserSecurity: (userId: string) => Promise<void>;            // Reset security info
  
  // ===== UTILITY =====
  hasUsers: boolean;                     // Có users không
  hasError: boolean;                     // Có lỗi không
}

// ===== DEFAULT VALUES =====

/**
 * Default configuration cho hook
 */
const defaultConfig: UseUserManagementConfig = {
  initialLimit: 1000, // Load all users for client-side pagination
  enableCaching: true,
  debounceDelay: 300,
};

/**
 * Default filters cho AdvancedUserFilters
 */
const defaultFilters: AdvancedUserFilters = {
  search: '',
  roles: [],
  statuses: [],
  emailVerified: null,
  levelRange: null,
  riskScoreRange: null,
  createdDateRange: null,
  lastLoginDateRange: null,
  isLocked: null,
  highRiskUsers: null,
  multipleSessionUsers: null,
};

// ===== MAIN HOOK =====

/**
 * Enhanced User Management Hook với Enhanced User Model support
 * 
 * @param config - Configuration cho hook
 * @returns UseUserManagementReturn object với tất cả functions và data
 */
export function useUserManagement(
  config: Partial<UseUserManagementConfig> = {}
): UseUserManagementReturn {
  // Merge config với defaults
  const finalConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);

  // ✅ FIX: Use AdminStatsContext instead of direct API call
  const { stats: contextStats } = useAdminStats();

  // ===== STATES =====
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    suspendedUsers: 0,
    pendingVerificationUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    growthPercentage: 0,
    guestUsers: 0,
    studentUsers: 0,
    tutorUsers: 0,
    teacherUsers: 0,
    adminUsers: 0,
    highRiskUsers: 0,
    lockedUsers: 0,
    multipleSessionUsers: 0,
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<MockPagination>({
    page: 1,
    limit: finalConfig.initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState<AdvancedUserFilters>(defaultFilters);
  
  // ===== CACHE STATE =====
  const cacheRef = useRef<Map<string, { users: AdminUser[]; pagination: MockPagination }>>(new Map());
  
  // ===== UTILITY COMPUTED VALUES =====
  const hasUsers = useMemo(() => users.length > 0, [users]);
  const hasError = useMemo(() => error !== null, [error]);
  
  // ===== HELPER FUNCTIONS =====
  
  /**
   * Generate cache key từ filters và pagination
   */
  const generateCacheKey = useCallback((filters: AdvancedUserFilters, page: number) => {
    return JSON.stringify({ filters, page, limit: pagination.limit });
  }, [pagination.limit]);
  
  /**
   * Load users từ real database via gRPC với filters và pagination
   */
  const loadUsers = useCallback(async (
    newFilters: AdvancedUserFilters = filters,
    page: number = pagination.page
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache nếu enabled
      const cacheKey = generateCacheKey(newFilters, page);
      if (finalConfig.enableCaching && cacheRef.current.has(cacheKey)) {
        const cachedData = cacheRef.current.get(cacheKey);
        if (cachedData) {
          setUsers(cachedData.users);
          setPagination(cachedData.pagination);
          setIsLoading(false);
          return;
        }
      }

      // Convert AdvancedUserFilters to gRPC API filters
      const grpcFilters: {
        role?: string;
        status?: string;
        search_query?: string;
      } = {};

      if (newFilters.roles.length === 1) {
        // Convert enum to string for gRPC
        grpcFilters.role = newFilters.roles[0].toString();
      }
      if (newFilters.statuses.length === 1) {
        // Convert enum to string for gRPC
        grpcFilters.status = newFilters.statuses[0].toString();
      }
      if (newFilters.search) {
        grpcFilters.search_query = newFilters.search;
      }

      // Call real gRPC API
      const response = await AdminService.listUsers({
        filter: grpcFilters,
        pagination: {
          page,
          limit: pagination.limit
        }
      });

      if (response.success && response.users) {
        // Map gRPC users to AdminUser format
        const mappedUsers: AdminUser[] = response.users.map((user: Record<string, unknown>) => ({
          id: user.id,
          email: user.email,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          username: user.username || '',
          role: user.role as UserRole,
          status: user.status as UserStatus,
          level: user.level || 1,
          isActive: user.is_active,
          emailVerified: user.email_verified || false,
          avatar: user.avatar || '',
          googleId: user.google_id || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
          // Enhanced fields - default values for now
          riskScore: 0,
          isLocked: false,
          failedLoginAttempts: 0,
          activeSessions: 0,
          totalLogins: 0,
          lastPasswordChange: new Date(),
          twoFactorEnabled: false,
          suspensionReason: null,
          suspendedAt: null,
          suspendedBy: null,
          notes: null
        }));

        setUsers(mappedUsers);

        // Map pagination
        const paginationData: MockPagination = {
          page: response.pagination?.page || page,
          limit: response.pagination?.limit || pagination.limit,
          total: response.pagination?.total || mappedUsers.length,
          totalPages: response.pagination?.total_pages || 1,
          hasNext: response.pagination?.has_next || false,
          hasPrev: response.pagination?.has_prev || false
        };
        setPagination(paginationData);

        // Cache result nếu enabled
        if (finalConfig.enableCaching) {
          cacheRef.current.set(cacheKey, {
            users: mappedUsers,
            pagination: paginationData
          });
        }
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, finalConfig.enableCaching, generateCacheKey]);
  
  /**
   * Load user statistics from AdminStatsContext
   * ✅ FIX: Use context instead of direct API call to avoid rate limit
   */
  const loadStats = useCallback(() => {
    if (contextStats) {
      // Map context stats to UserStats format
      const userStats: UserStats = {
        totalUsers: contextStats.total_users || 0,
        activeUsers: contextStats.active_users || 0,
        inactiveUsers: 0, // TODO: Add to backend
        suspendedUsers: 0, // TODO: Add to backend
        pendingVerificationUsers: 0, // TODO: Add to backend
        newUsersToday: 0, // TODO: Add to backend
        newUsersThisWeek: 0, // TODO: Add to backend
        newUsersThisMonth: 0, // TODO: Add to backend
        growthPercentage: 0, // TODO: Calculate from historical data
        guestUsers: contextStats.users_by_role?.['GUEST'] || 0,
        studentUsers: contextStats.users_by_role?.['STUDENT'] || 0,
        tutorUsers: contextStats.users_by_role?.['TUTOR'] || 0,
        teacherUsers: contextStats.users_by_role?.['TEACHER'] || 0,
        adminUsers: contextStats.users_by_role?.['ADMIN'] || 0,
        highRiskUsers: contextStats.suspicious_activities || 0,
        lockedUsers: 0, // TODO: Add to backend
        multipleSessionUsers: 0 // TODO: Add to backend
      };
      setStats(userStats);
    }
  }, [contextStats]);
  
  // ===== MAIN ACTIONS =====
  
  /**
   * Search users với debounce
   */
  const searchUsers = useCallback(async (query: string) => {
    setIsSearching(true);
    
    // Debounce logic
    await new Promise(resolve => setTimeout(resolve, finalConfig.debounceDelay));
    
    try {
      const newFilters = { ...filters, search: query };
      setFilters(newFilters);
      await loadUsers(newFilters, 1); // Reset to page 1 when searching
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [filters, loadUsers, finalConfig.debounceDelay]);
  
  /**
   * Apply advanced filters
   */
  const applyFilters = useCallback(async (newFilters: AdvancedUserFilters) => {
    setFilters(newFilters);
    await loadUsers(newFilters, 1); // Reset to page 1 when filtering
  }, [loadUsers]);
  
  /**
   * Change page
   */
  const changePage = useCallback(async (page: number) => {
    await loadUsers(filters, page);
  }, [filters, loadUsers]);
  
  /**
   * Refresh users list
   */
  const refreshUsers = useCallback(async () => {
    // Clear cache
    cacheRef.current = new Map();
    await loadUsers();
    await loadStats();
  }, [loadUsers, loadStats]);
  
  // ===== USER MANAGEMENT ACTIONS =====
  
  /**
   * Get user by ID và set làm selectedUser
   * Tìm user từ danh sách đã load hoặc fetch từ API nếu cần
   */
  const getUserById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);

      // First try to find user in current loaded users
      const user = users.find(u => u.id === id);

      if (user) {
        setSelectedUser(user);
      } else {
        // If not found in current list, could fetch from API
        // For now, just throw error
        throw new Error(`User with ID ${id} not found in current list`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user');
    } finally {
      setIsLoading(false);
    }
  }, [users]);
  
  /**
   * Clear selected user
   */
  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
  }, []);
  
  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    loadUsers(defaultFilters, 1);
  }, [loadUsers]);
  
  // ===== SECURITY ACTIONS =====
  
  /**
   * Suspend user với reason - Call real gRPC API
   */
  const suspendUser = useCallback(async (userId: string, reason: string) => {
    try {
      setIsLoading(true);

      // Call real gRPC API to update user status
      const response = await AdminService.updateUserStatus({
        user_id: userId,
        status: 'SUSPENDED'
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to suspend user');
      }

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, status: UserStatus.USER_STATUS_SUSPENDED, suspensionReason: reason }
          : user
      ));

      await loadStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend user');
    } finally {
      setIsLoading(false);
    }
  }, [loadStats]);
  
  /**
   * Reactivate suspended user - Call real gRPC API
   */
  const reactivateUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);

      // Call real gRPC API to update user status
      const response = await AdminService.updateUserStatus({
        user_id: userId,
        status: 'ACTIVE'
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to reactivate user');
      }

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, status: UserStatus.USER_STATUS_ACTIVE, isLocked: false, failedLoginAttempts: 0 }
          : user
      ));

      await loadStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate user');
    } finally {
      setIsLoading(false);
    }
  }, [loadStats]);
  
  /**
   * Promote user to new role - Call real gRPC API
   */
  const promoteUser = useCallback(async (userId: string, newRole: UserRole) => {
    try {
      setIsLoading(true);

      // Call real gRPC API to update user role
      const response = await AdminService.updateUserRole({
        user_id: userId,
        role: newRole.toString()
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to promote user');
      }

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, role: Number(newRole) as UserRole }
          : user
      ));

      await loadStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote user');
    } finally {
      setIsLoading(false);
    }
  }, [loadStats]);
  
  /**
   * Reset user security information
   */
  const resetUserSecurity = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      // Mock API call
      console.log(`Resetting security for user ${userId}`);
      
      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? {
              ...user,
              loginAttempts: 0,
              lockedUntil: undefined,
              riskScore: 0,
              activeSessionsCount: 0
            } as AdminUser
          : user
      ));
      
      await loadStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset user security');
    } finally {
      setIsLoading(false);
    }
  }, [loadStats]);
  
  // ===== EFFECTS =====

  /**
   * Update stats when context stats change
   * ✅ FIX: Auto-update stats from context
   */
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /**
   * Load initial data khi component mount
   */
  useEffect(() => {
    loadUsers();
  }, [loadUsers]); // Include dependencies
  
  // ===== RETURN =====
  
  return {
    // Data
    users,
    stats,
    selectedUser,
    
    // States
    isLoading,
    isSearching,
    error,
    
    // Pagination
    pagination,
    
    // Filters
    filters,
    
    // Actions
    searchUsers,
    applyFilters,
    changePage,
    refreshUsers,
    
    // User management
    getUserById,
    clearSelectedUser,
    clearFilters,
    
    // Security actions
    suspendUser,
    reactivateUser,
    promoteUser,
    resetUserSecurity,
    
    // Utility
    hasUsers,
    hasError,
  };
}
