/**
 * Admin User Management Hook
 * Hook để quản lý user actions trong admin dashboard với backend APIs
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useCallback } from 'react';
import { 
  User,
  UserRole,
  UserStatus,
  ListUsersFilter,
  PaginationRequest,
  listUsers,
  updateUserRole,
  updateUserLevel,
  updateUserStatus,
  searchUsers,
  getAdminErrorMessage,
  isAdminPermissionError,
} from '@/lib/services/api/admin.api';

// ===== TYPES =====

/**
 * User management hook options
 */
export interface UseAdminUserManagementOptions {
  initialPageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * User management hook return value
 */
export interface UseAdminUserManagementReturn {
  // Data states
  users: User[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isUpdating: boolean;
  
  // Error states
  error: string | null;
  
  // Filter states
  filters: ListUsersFilter;
  searchQuery: string;
  
  // Actions
  loadUsers: (filters?: ListUsersFilter, pagination?: PaginationRequest) => Promise<void>;
  refreshUsers: () => Promise<void>;
  updateUserRoleAction: (userId: string, newRole: UserRole, level?: number) => Promise<void>;
  updateUserLevelAction: (userId: string, newLevel: number) => Promise<void>;
  updateUserStatusAction: (userId: string, newStatus: UserStatus, reason?: string) => Promise<void>;
  suspendUserAction: (userId: string, reason?: string) => Promise<void>;
  activateUserAction: (userId: string) => Promise<void>;
  searchUsersAction: (query: string) => Promise<void>;
  setFilters: (filters: ListUsersFilter) => void;
  setSearchQuery: (query: string) => void;
  goToPage: (page: number) => Promise<void>;
  clearError: () => void;
}

// ===== HOOK =====

/**
 * Admin User Management Hook
 */
export function useAdminUserManagement(
  options: UseAdminUserManagementOptions = {}
): UseAdminUserManagementReturn {
  const {
    initialPageSize = 20,
    autoRefresh: _autoRefresh = false,
    refreshInterval: _refreshInterval = 30000,
  } = options;

  // States
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFiltersState] = useState<ListUsersFilter>({});
  const [searchQuery, setSearchQueryState] = useState('');

  // ===== UTILITY FUNCTIONS =====

  /**
   * Handle API errors
   */
  const handleError = useCallback((err: unknown, context: string) => {
    console.error(`[useAdminUserManagement] ${context}:`, err);
    
    if (isAdminPermissionError(err)) {
      setError('Bạn không có quyền thực hiện thao tác này.');
    } else {
      const errorMessage = getAdminErrorMessage(err);
      setError(errorMessage);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ===== DATA LOADING =====

  /**
   * Load users with filters and pagination
   */
  const loadUsers = useCallback(async (
    filtersParam?: ListUsersFilter,
    paginationParam?: PaginationRequest
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const finalFilters = filtersParam || filters;
      const finalPagination = paginationParam || {
        page: currentPage,
        limit: initialPageSize,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      const response = await listUsers(finalFilters, finalPagination);

      if (response.success && response.users) {
        setUsers(response.users);
        setTotalCount(response.pagination.total_count);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.total_pages);
      } else {
        throw new Error(response.message || 'Không thể tải danh sách người dùng');
      }
    } catch (err) {
      handleError(err, 'Load users');
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, initialPageSize, handleError]);

  /**
   * Refresh users (without changing loading state)
   */
  const refreshUsers = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const response = await listUsers(filters, {
        page: currentPage,
        limit: initialPageSize,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      if (response.success && response.users) {
        setUsers(response.users);
        setTotalCount(response.pagination.total_count);
        setTotalPages(response.pagination.total_pages);
      }
    } catch (err) {
      handleError(err, 'Refresh users');
    } finally {
      setIsRefreshing(false);
    }
  }, [filters, currentPage, initialPageSize, handleError]);

  // ===== USER ACTIONS =====

  /**
   * Update user role
   */
  const updateUserRoleAction = useCallback(async (
    userId: string, 
    newRole: UserRole, 
    level?: number
  ) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await updateUserRole({
        user_id: userId,
        new_role: newRole,
        level,
      });

      if (response.success && response.updated_user) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, role: newRole, level: level || user.level }
              : user
          )
        );
      } else {
        throw new Error(response.message || 'Không thể cập nhật vai trò người dùng');
      }
    } catch (err) {
      handleError(err, 'Update user role');
      throw err; // Re-throw để component có thể handle
    } finally {
      setIsUpdating(false);
    }
  }, [handleError]);

  /**
   * Update user level
   */
  const updateUserLevelAction = useCallback(async (userId: string, newLevel: number) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await updateUserLevel({
        user_id: userId,
        new_level: newLevel,
      });

      if (response.success && response.updated_user) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, level: newLevel }
              : user
          )
        );
      } else {
        throw new Error(response.message || 'Không thể cập nhật cấp độ người dùng');
      }
    } catch (err) {
      handleError(err, 'Update user level');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [handleError]);

  /**
   * Update user status
   */
  const updateUserStatusAction = useCallback(async (
    userId: string, 
    newStatus: UserStatus, 
    reason?: string
  ) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await updateUserStatus({
        user_id: userId,
        new_status: newStatus,
        reason,
      });

      if (response.success && response.updated_user) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, status: newStatus }
              : user
          )
        );
      } else {
        throw new Error(response.message || 'Không thể cập nhật trạng thái người dùng');
      }
    } catch (err) {
      handleError(err, 'Update user status');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [handleError]);

  /**
   * Suspend user
   */
  const suspendUserAction = useCallback(async (userId: string, reason?: string) => {
    return updateUserStatusAction(userId, 'SUSPENDED', reason);
  }, [updateUserStatusAction]);

  /**
   * Activate user
   */
  const activateUserAction = useCallback(async (userId: string) => {
    return updateUserStatusAction(userId, 'ACTIVE');
  }, [updateUserStatusAction]);

  // ===== SEARCH & FILTERING =====

  /**
   * Search users
   */
  const searchUsersAction = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSearchQueryState(query);

      const response = await searchUsers(query, {
        page: 1,
        limit: initialPageSize,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      if (response.success && response.users) {
        setUsers(response.users);
        setTotalCount(response.pagination.total_count);
        setCurrentPage(1);
        setTotalPages(response.pagination.total_pages);
        
        // Clear filters when searching
        setFiltersState({});
      } else {
        throw new Error(response.message || 'Không thể tìm kiếm người dùng');
      }
    } catch (err) {
      handleError(err, 'Search users');
    } finally {
      setIsLoading(false);
    }
  }, [initialPageSize, handleError]);

  /**
   * Set filters and reload data
   */
  const setFilters = useCallback((newFilters: ListUsersFilter) => {
    setFiltersState(newFilters);
    setSearchQueryState(''); // Clear search when filtering
    setCurrentPage(1); // Reset to first page
    
    // Load users with new filters
    loadUsers(newFilters, {
      page: 1,
      limit: initialPageSize,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  }, [loadUsers, initialPageSize]);

  /**
   * Set search query
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    
    if (query.trim()) {
      searchUsersAction(query);
    } else {
      // Clear search and reload with current filters
      setFiltersState({});
      loadUsers();
    }
  }, [searchUsersAction, loadUsers]);

  /**
   * Go to page
   */
  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    await loadUsers(filters, {
      page,
      limit: initialPageSize,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  }, [totalPages, currentPage, filters, loadUsers, initialPageSize]);

  // ===== RETURN =====

  return {
    // Data states
    users,
    totalCount,
    currentPage,
    totalPages,
    
    // Loading states
    isLoading,
    isRefreshing,
    isUpdating,
    
    // Error states
    error,
    
    // Filter states
    filters,
    searchQuery,
    
    // Actions
    loadUsers,
    refreshUsers,
    updateUserRoleAction,
    updateUserLevelAction,
    updateUserStatusAction,
    suspendUserAction,
    activateUserAction,
    searchUsersAction,
    setFilters,
    setSearchQuery,
    goToPage,
    clearError,
  };
}

// ===== DEFAULT EXPORT =====

export default useAdminUserManagement;