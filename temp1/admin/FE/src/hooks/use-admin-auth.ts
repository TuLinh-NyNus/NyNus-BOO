/**
 * useAdminAuth Hook
 * Hook cho admin authentication với additional utilities
 */

import { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAdminAuth as useAdminAuthStore } from "../stores/auth.store";
import { toSecretPath } from "../lib/admin-paths";
import { isTokenExpired, isTokenExpiringSoon } from "../lib/utils/token.utils";

/**
 * Authentication status type
 * Loại trạng thái authentication
 */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

/**
 * Hook options interface
 * Interface tùy chọn hook
 */
interface UseAdminAuthOptions {
  redirectTo?: string;
  redirectIfAuthenticated?: string;
  requireAuth?: boolean;
  requirePermissions?: string[];
  requireRole?: string;
  onAuthChange?: (isAuthenticated: boolean) => void;
  onError?: (error: string) => void;
}

/**
 * Hook return type
 * Loại return của hook
 */
interface UseAdminAuthReturn {
  // Authentication state
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  status: AuthStatus;

  // Token information
  tokenExpiresAt: Date | null;
  timeUntilExpiration: string;
  isTokenExpiring: boolean;

  // Authentication actions
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // User actions
  updateProfile: (data: any) => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;

  // Utility methods
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;

  // State management
  clearError: () => void;

  // Navigation helpers
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
}

/**
 * Main useAdminAuth hook
 * Hook useAdminAuth chính
 */
export function useAdminAuth(options: UseAdminAuthOptions = {}): UseAdminAuthReturn {
  const router = useRouter();
  const store = useAdminAuthStore();

  const {
    redirectTo,
    redirectIfAuthenticated,
    requireAuth = false,
    requirePermissions = [],
    requireRole,
    onAuthChange,
    onError,
  } = options;

  /**
   * Computed authentication status
   * Trạng thái authentication được tính toán
   */
  const status: AuthStatus = useMemo(() => {
    if (!store.isInitialized || store.isLoading) return "loading";
    if (store.error) return "error";
    if (store.isAuthenticated) return "authenticated";
    return "unauthenticated";
  }, [store.isInitialized, store.isLoading, store.error, store.isAuthenticated]);

  /**
   * Check if token is expiring soon
   * Kiểm tra xem token có sắp hết hạn không
   */
  const isTokenExpiring = useMemo(() => {
    if (!store.accessToken) return false;
    return isTokenExpiringSoon(store.accessToken);
  }, [store.accessToken]);

  /**
   * Enhanced permission checking
   * Kiểm tra permission nâng cao
   */
  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some((permission) => store.hasPermission(permission));
    },
    [store]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every((permission) => store.hasPermission(permission));
    },
    [store]
  );

  /**
   * Navigation helpers
   * Helpers điều hướng
   */
  const redirectToLogin = useCallback(() => {
    const loginPath = toSecretPath("/admin/login");
    router.push(loginPath);
  }, [router]);

  const redirectToDashboard = useCallback(() => {
    const dashboardPath = toSecretPath("/admin");
    router.push(dashboardPath);
  }, [router]);

  /**
   * Enhanced login with error handling
   * Login nâng cao với xử lý lỗi
   */
  const login = useCallback(
    async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
      try {
        await store.login(credentials);

        // Redirect after successful login
        if (redirectIfAuthenticated) {
          router.push(toSecretPath(redirectIfAuthenticated));
        } else {
          redirectToDashboard();
        }
      } catch (error) {
        console.error("Login error:", error);
        if (onError) {
          onError(error instanceof Error ? error.message : "Đăng nhập thất bại");
        }
        throw error;
      }
    },
    [store, router, redirectIfAuthenticated, onError, redirectToDashboard]
  );

  /**
   * Enhanced logout with cleanup
   * Logout nâng cao với cleanup
   */
  const logout = useCallback(async () => {
    try {
      await store.logout();
      redirectToLogin();
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout API fails
      redirectToLogin();
    }
  }, [store, redirectToLogin]);

  /**
   * Initialize authentication on mount
   * Khởi tạo authentication khi mount
   */
  useEffect(() => {
    if (!store.isInitialized) {
      store.initialize();
    }
  }, [store]);

  /**
   * Handle authentication state changes
   * Xử lý thay đổi trạng thái authentication
   */
  useEffect(() => {
    if (!store.isInitialized) return;

    if (onAuthChange) {
      onAuthChange(store.isAuthenticated);
    }

    // Handle authentication requirements
    if (requireAuth && !store.isAuthenticated && status !== "loading") {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      redirectToLogin();
      return;
    }

    // Handle redirect if authenticated
    if (redirectIfAuthenticated && store.isAuthenticated) {
      router.push(toSecretPath(redirectIfAuthenticated));
      return;
    }

    // Handle redirect if unauthenticated
    if (redirectTo && !store.isAuthenticated && status !== "loading") {
      router.push(toSecretPath(redirectTo));
      return;
    }
  }, [
    store.isInitialized,
    store.isAuthenticated,
    status,
    requireAuth,
    redirectTo,
    redirectIfAuthenticated,
    onAuthChange,
    router,
    redirectToLogin,
  ]);

  /**
   * Handle permission requirements
   * Xử lý yêu cầu permission
   */
  useEffect(() => {
    if (!store.isInitialized || !store.isAuthenticated) return;

    // Check role requirement
    if (requireRole && !store.hasRole(requireRole)) {
      toast.error(`Bạn cần có quyền ${requireRole} để truy cập trang này`);
      redirectToDashboard();
      return;
    }

    // Check permission requirements
    if (requirePermissions.length > 0 && !hasAllPermissions(requirePermissions)) {
      toast.error("Bạn không có quyền truy cập trang này");
      redirectToDashboard();
      return;
    }
  }, [
    store.isInitialized,
    store.isAuthenticated,
    requireRole,
    requirePermissions,
    store.hasRole,
    hasAllPermissions,
    redirectToDashboard,
  ]);

  /**
   * Handle token expiration warnings
   * Xử lý cảnh báo token hết hạn
   */
  useEffect(() => {
    if (!store.isAuthenticated || !store.accessToken) return;

    if (isTokenExpiring) {
      toast.warning("Phiên đăng nhập sắp hết hạn", {
        description: "Hệ thống sẽ tự động gia hạn phiên đăng nhập",
        duration: 5000,
      });
    }
  }, [store.isAuthenticated, store.accessToken, isTokenExpiring]);

  /**
   * Handle errors
   * Xử lý lỗi
   */
  useEffect(() => {
    if (store.error && onError) {
      onError(store.error);
    }
  }, [store.error, onError]);

  /**
   * Auto-refresh token when expiring
   * Tự động refresh token khi sắp hết hạn
   */
  useEffect(() => {
    if (!store.isAuthenticated || !store.accessToken) return;

    const checkTokenExpiration = () => {
      if (isTokenExpired(store.accessToken!)) {
        toast.error("Phiên đăng nhập đã hết hạn");
        logout();
      } else if (isTokenExpiringSoon(store.accessToken!)) {
        store.refreshTokens().catch((error) => {
          console.error("Auto token refresh failed:", error);
        });
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [store.isAuthenticated, store.accessToken, store.refreshToken, logout]);

  return {
    // Authentication state
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    error: store.error,
    status,

    // Token information
    tokenExpiresAt: store.tokenExpiresAt,
    timeUntilExpiration: store.getTimeUntilExpiration(),
    isTokenExpiring,

    // Authentication actions
    login,
    logout,
    refreshToken: store.refreshTokens,

    // User actions
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,

    // Utility methods
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,
    hasAnyPermission,
    hasAllPermissions,

    // State management
    clearError: store.clearError,

    // Navigation helpers
    redirectToLogin,
    redirectToDashboard,
  };
}

/**
 * Hook for checking authentication status only
 * Hook chỉ để kiểm tra trạng thái authentication
 */
export function useAuthStatus() {
  const { isAuthenticated, isLoading, isInitialized, status } = useAdminAuth();

  return {
    isAuthenticated,
    isLoading,
    isInitialized,
    status,
  };
}

/**
 * Hook for user information only
 * Hook chỉ để lấy thông tin user
 */
export function useAdminUser() {
  const { user, isAuthenticated, hasPermission, hasRole } = useAdminAuth();

  return {
    user,
    isAuthenticated,
    hasPermission,
    hasRole,
  };
}

/**
 * Hook for authentication actions only
 * Hook chỉ để thực hiện actions authentication
 */
export function useAuthActions() {
  const { login, logout, refreshToken, updateProfile, changePassword } = useAdminAuth();

  return {
    login,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
  };
}
