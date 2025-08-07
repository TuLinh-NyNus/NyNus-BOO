/**
 * useUserManagement Hook
 * Hook cho user management với comprehensive user operations
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

import { AdminUserService } from "../lib/api/services/admin.api";
import { useErrorHandler } from "../lib/hooks/use-error-handler";
import { adminCacheService } from "../lib/api/services/cache.service";

/**
 * User interface for user management
 * Interface user cho user management
 */
interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  level?: number;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  activeSessionsCount: number;
  totalResourceAccess: number;
  riskScore?: number;
}

/**
 * User stats interface
 * Interface thống kê user
 */
interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  growthPercentage: number;
}

/**
 * User filter params
 * Tham số lọc user
 */
interface UserFilterParams {
  search?: string;
  role?: string;
  status?: string;
  level?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "email" | "role" | "status" | "createdAt" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}

/**
 * User management state
 * State quản lý user
 */
interface UserManagementState {
  users: AdminUser[];
  stats: UserStats | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: UserFilterParams;
  selectedUser: AdminUser | null;
}

/**
 * User management options
 * Tùy chọn user management
 */
interface UseUserManagementOptions {
  initialLimit?: number;
  enableCaching?: boolean;
  debounceDelay?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

/**
 * Transform API user to AdminUser interface
 * Chuyển đổi API user sang AdminUser interface
 */
function transformApiUserToAdminUser(apiUser: any): AdminUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    role: (apiUser.role as "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN") || "STUDENT",
    status: apiUser.status || "ACTIVE",
    level: apiUser.level || 1,
    emailVerified: apiUser.emailVerified !== false,
    lastLoginAt: apiUser.lastLoginAt,
    createdAt: apiUser.createdAt || new Date().toISOString(),
    activeSessionsCount: apiUser.activeSessionsCount || 0,
    totalResourceAccess: apiUser.totalResourceAccess || 0,
    riskScore: apiUser.riskScore || 0.1,
  };
}

/**
 * useUserManagement Hook
 * Hook chính cho user management
 */
export function useUserManagement(options: UseUserManagementOptions = {}) {
  const {
    initialLimit = 25,
    enableCaching = true,
    debounceDelay = 300,
    onError,
    onSuccess,
  } = options;

  const [state, setState] = useState<UserManagementState>({
    users: [],
    stats: null,
    isLoading: true,
    isSearching: false,
    error: null,
    pagination: {
      page: 1,
      limit: initialLimit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    filters: {
      page: 1,
      limit: initialLimit,
    },
    selectedUser: null,
  });

  const { handleError } = useErrorHandler({
    showToast: true,
    context: {
      component: "UserManagement",
      action: "DATA_FETCH",
    },
  });

  const userService = useRef(new AdminUserService());
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  /**
   * Fetch users with filters
   * Lấy users với filters
   */
  const fetchUsers = useCallback(
    async (filters: UserFilterParams = {}, isSearch = false): Promise<void> => {
      if (isUnmountedRef.current) return;

      try {
        setState((prev) => ({
          ...prev,
          isLoading: !isSearch,
          isSearching: isSearch,
          error: null,
        }));

        const mergedFilters = { ...state.filters, ...filters };

        // Use search API if search term exists
        let response;
        if (mergedFilters.search && mergedFilters.search.trim()) {
          response = await userService.current.searchUsers(mergedFilters.search, mergedFilters);
        } else {
          response = await userService.current.getUsers(mergedFilters);
        }

        if (isUnmountedRef.current) return;

        setState((prev) => ({
          ...prev,
          users: response.data.map(transformApiUserToAdminUser),
          isLoading: false,
          isSearching: false,
          error: null,
          pagination: {
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
            hasNext: response.pagination.hasNext,
            hasPrev: response.pagination.hasPrev,
          },
          filters: mergedFilters,
        }));

        // Call success callback
        if (onSuccess) {
          onSuccess(response);
        }

        // Show success toast for search
        if (isSearch && mergedFilters.search) {
          toast.success(`Tìm thấy ${response.pagination.total} người dùng`);
        }
      } catch (error) {
        if (isUnmountedRef.current) return;

        console.error("Failed to fetch users:", error);

        const errorMessage =
          error instanceof Error ? error.message : "Không thể tải danh sách người dùng";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isSearching: false,
          error: errorMessage,
        }));

        // Handle error through global error handler
        await handleError(error, {
          action: "FETCH_USERS",
          resource: "USER_MANAGEMENT",
          filters: filters,
        });

        // Call error callback
        if (onError) {
          onError(error);
        }
      }
    },
    [state.filters, onSuccess, onError, handleError]
  );

  /**
   * Fetch user statistics
   * Lấy thống kê user
   */
  const fetchUserStats = useCallback(async (): Promise<void> => {
    try {
      // Use cache if enabled
      if (enableCaching) {
        const cachedStats = adminCacheService.cacheManager.get<UserStats>("user_stats");
        if (cachedStats) {
          setState((prev) => ({ ...prev, stats: cachedStats }));
          return;
        }
      }

      const statsResponse = await userService.current.getUserStats();

      if (isUnmountedRef.current) return;

      // Transform UserStatsResponse to UserStats
      const stats: UserStats = {
        totalUsers: statsResponse.totalUsers,
        activeUsers: statsResponse.activeUsers,
        suspendedUsers: statsResponse.suspendedUsers,
        newUsersToday: statsResponse.newUsersToday,
        newUsersThisWeek: statsResponse.newUsersThisWeek,
        newUsersThisMonth: statsResponse.newUsersThisMonth,
        growthPercentage:
          statsResponse.newUsersThisMonth > 0
            ? (statsResponse.newUsersThisMonth / statsResponse.totalUsers) * 100
            : 0,
      };

      setState((prev) => ({ ...prev, stats }));

      // Cache for 5 minutes
      if (enableCaching) {
        adminCacheService.cacheManager.set("user_stats", stats, 300);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      await handleError(error, {
        action: "FETCH_USER_STATS",
        resource: "USER_MANAGEMENT",
      });
    }
  }, [enableCaching, handleError]);

  /**
   * Debounced search
   * Tìm kiếm với debounce
   */
  const debouncedSearch = useCallback(
    (searchTerm: string, filters: UserFilterParams = {}) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        fetchUsers({ ...filters, search: searchTerm }, true);
      }, debounceDelay);
    },
    [fetchUsers, debounceDelay]
  );

  /**
   * Search users
   * Tìm kiếm users
   */
  const searchUsers = useCallback(
    (searchTerm: string) => {
      if (searchTerm.trim()) {
        debouncedSearch(searchTerm, { page: 1, limit: state.pagination.limit });
      } else {
        // Clear search and fetch all users
        fetchUsers({ page: 1, limit: state.pagination.limit });
      }
    },
    [debouncedSearch, fetchUsers, state.pagination.limit]
  );

  /**
   * Apply filters
   * Áp dụng filters
   */
  const applyFilters = useCallback(
    (filters: UserFilterParams) => {
      fetchUsers({ ...filters, page: 1 });
    },
    [fetchUsers]
  );

  /**
   * Change page
   * Thay đổi trang
   */
  const changePage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= state.pagination.totalPages) {
        fetchUsers({ ...state.filters, page });
      }
    },
    [fetchUsers, state.filters, state.pagination.totalPages]
  );

  /**
   * Refresh users
   * Làm mới users
   */
  const refreshUsers = useCallback(async () => {
    await Promise.all([fetchUsers(state.filters), fetchUserStats()]);
    toast.success("Danh sách người dùng đã được cập nhật!");
  }, [fetchUsers, fetchUserStats, state.filters]);

  /**
   * Get user by ID
   * Lấy user theo ID
   */
  const getUserById = useCallback(
    async (userId: string): Promise<AdminUser | null> => {
      try {
        const apiUser = await userService.current.getUserById(userId);
        const user = transformApiUserToAdminUser(apiUser);
        setState((prev) => ({ ...prev, selectedUser: user }));
        return user;
      } catch (error) {
        console.error("Failed to fetch user:", error);
        await handleError(error, {
          action: "FETCH_USER_BY_ID",
          resource: "USER_MANAGEMENT",
          userId,
        });
        return null;
      }
    },
    [handleError]
  );

  /**
   * Clear selected user
   * Xóa user đã chọn
   */
  const clearSelectedUser = useCallback(() => {
    setState((prev) => ({ ...prev, selectedUser: null }));
  }, []);

  /**
   * Clear search and filters
   * Xóa search và filters
   */
  const clearFilters = useCallback(() => {
    const defaultFilters = { page: 1, limit: initialLimit };
    fetchUsers(defaultFilters);
  }, [fetchUsers, initialLimit]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data state
    users: state.users,
    stats: state.stats,
    selectedUser: state.selectedUser,

    // Loading state
    isLoading: state.isLoading,
    isSearching: state.isSearching,
    error: state.error,

    // Pagination
    pagination: state.pagination,

    // Filters
    filters: state.filters,

    // Actions
    searchUsers,
    applyFilters,
    changePage,
    refreshUsers,
    getUserById,
    clearSelectedUser,
    clearFilters,

    // Utility
    hasUsers: state.users.length > 0,
    hasError: !!state.error,
  };
}
