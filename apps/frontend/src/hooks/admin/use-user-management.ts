'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getMockUsersResponse,
  getMockUserStats,
  getUserById as getUserByIdFromMock
} from '@/lib/mockdata/users';
import { AdminUser, UserStats, AdvancedUserFilters } from '@/lib/mockdata/types';
import { UserRole, UserStatus, MockPagination } from '@/lib/mockdata/core-types';

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
  initialLimit: 25,
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
  const [cache, setCache] = useState<Map<string, { users: AdminUser[]; pagination: MockPagination }>>(new Map());
  
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
   * Load users từ mockdata với filters và pagination
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
      if (finalConfig.enableCaching && cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          setUsers(cachedData.users);
          setPagination(cachedData.pagination);
          setIsLoading(false);
          return;
        }
      }
      
      // Convert AdvancedUserFilters to API filters
      const apiFilters = {
        role: newFilters.roles.length === 1 ? newFilters.roles[0] : undefined,
        status: newFilters.statuses.length === 1 ? newFilters.statuses[0] : undefined,
        emailVerified: newFilters.emailVerified === null ? undefined : newFilters.emailVerified,
        levelMin: newFilters.levelRange?.min,
        levelMax: newFilters.levelRange?.max,
        riskScoreMin: newFilters.riskScoreRange?.min,
        riskScoreMax: newFilters.riskScoreRange?.max,
        isLocked: newFilters.isLocked === null ? undefined : newFilters.isLocked,
        highRisk: newFilters.highRiskUsers === null ? undefined : newFilters.highRiskUsers,
        search: newFilters.search || undefined,
      };
      
      // Call mock API
      const response = getMockUsersResponse(page, pagination.limit, apiFilters);
      
      if (response.success && response.data) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
        
        // Cache result nếu enabled
        if (finalConfig.enableCaching) {
          setCache(prev => new Map(prev).set(cacheKey, response.data));
        }
      } else {
        throw new Error('Failed to load users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, finalConfig.enableCaching, cache, generateCacheKey]);
  
  /**
   * Load user statistics
   */
  const loadStats = useCallback(async () => {
    try {
      const userStats = getMockUserStats();
      setStats(userStats);
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  }, []);
  
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
    setCache(new Map());
    await loadUsers();
    await loadStats();
  }, [loadUsers, loadStats]);
  
  // ===== USER MANAGEMENT ACTIONS =====
  
  /**
   * Get user by ID và set làm selectedUser
   */
  const getUserById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const user = getUserByIdFromMock(id);
      if (user) {
        setSelectedUser(user);
      } else {
        throw new Error(`User with ID ${id} not found`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
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
   * Suspend user với reason
   */
  const suspendUser = useCallback(async (userId: string, reason: string) => {
    try {
      setIsLoading(true);
      // Mock API call - trong thực tế sẽ call API
      console.log(`Suspending user ${userId} with reason: ${reason}`);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: UserStatus.SUSPENDED, adminNotes: `SUSPENDED: ${reason}` }
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
   * Reactivate suspended user
   */
  const reactivateUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      // Mock API call
      console.log(`Reactivating user ${userId}`);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: UserStatus.ACTIVE, lockedUntil: null, loginAttempts: 0 }
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
   * Promote user to new role
   */
  const promoteUser = useCallback(async (userId: string, newRole: UserRole) => {
    try {
      setIsLoading(true);
      // Mock API call
      console.log(`Promoting user ${userId} to role ${newRole}`);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, level: newRole === UserRole.ADMIN ? null : 1 }
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
              lockedUntil: null, 
              riskScore: 0,
              activeSessionsCount: 0 
            }
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
   * Load initial data khi component mount
   */
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [loadUsers, loadStats]); // Include dependencies
  
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
