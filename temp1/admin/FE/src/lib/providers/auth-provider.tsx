/**
 * Admin Authentication Provider
 * Provider xác thực admin cho toàn bộ app
 */

"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

import { useAdminAuth } from "../../hooks/use-admin-auth";
import { toSecretPath, isUsingSecretPath } from "../admin-paths";

/**
 * Authentication context interface
 * Interface context authentication
 */
interface AuthContextValue {
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  error: string | null;
}

/**
 * Create authentication context
 * Tạo context authentication
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Provider props interface
 * Interface props provider
 */
interface AdminAuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  allowedPermissions?: string[];
}

/**
 * Public routes that don't require authentication
 * Các routes public không cần authentication
 */
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password", "/404", "/500"];

/**
 * Check if route is public
 * Kiểm tra xem route có phải public không
 */
function isPublicRoute(pathname: string): boolean {
  // Convert to admin path for comparison
  const adminPath = pathname.replace(/^\/\d+/, "/admin");
  return PUBLIC_ROUTES.some((route) => adminPath.endsWith(route));
}

/**
 * Admin Authentication Provider Component
 * Component Provider Authentication Admin
 */
export function AdminAuthProvider({
  children,
  requireAuth = true,
  allowedRoles = [],
  allowedPermissions = [],
}: AdminAuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    status,
    hasRole,
    hasPermission,
    redirectToLogin,
    redirectToDashboard,
  } = useAdminAuth();

  /**
   * Handle authentication initialization
   * Xử lý khởi tạo authentication
   */
  useEffect(() => {
    if (status !== "loading") {
      setIsInitialized(true);
    }
  }, [status]);

  /**
   * Handle route protection
   * Xử lý bảo vệ route
   */
  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = pathname;
    const isPublic = isPublicRoute(currentPath);

    // If route requires auth but user is not authenticated
    if (requireAuth && !isAuthenticated && !isPublic) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      redirectToLogin();
      return;
    }

    // If user is authenticated but on login page, redirect to dashboard
    if (isAuthenticated && currentPath.endsWith("/login")) {
      redirectToDashboard();
      return;
    }

    // Check role requirements
    if (isAuthenticated && allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.some((role) => hasRole(role));
      if (!hasRequiredRole) {
        toast.error(`Bạn cần có một trong các quyền sau: ${allowedRoles.join(", ")}`);
        redirectToDashboard();
        return;
      }
    }

    // Check permission requirements
    if (isAuthenticated && allowedPermissions.length > 0) {
      const hasRequiredPermission = allowedPermissions.some((permission) =>
        hasPermission(permission)
      );
      if (!hasRequiredPermission) {
        toast.error("Bạn không có quyền truy cập trang này");
        redirectToDashboard();
        return;
      }
    }
  }, [
    isInitialized,
    isAuthenticated,
    pathname,
    requireAuth,
    allowedRoles,
    allowedPermissions,
    hasRole,
    hasPermission,
    redirectToLogin,
    redirectToDashboard,
  ]);

  /**
   * Handle authentication errors
   * Xử lý lỗi authentication
   */
  useEffect(() => {
    if (error) {
      console.error("Authentication error:", error);

      // Show error toast for critical errors
      if (error.includes("token") || error.includes("session")) {
        toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      }
    }
  }, [error]);

  /**
   * Handle URL security - ensure using secret path
   * Xử lý bảo mật URL - đảm bảo sử dụng secret path
   */
  useEffect(() => {
    if (!isInitialized) return;

    // Check if current path is using secret path
    if (!isUsingSecretPath(pathname)) {
      // If not using secret path and not a public route, redirect to secret path
      if (!isPublicRoute(pathname)) {
        const secretPath = toSecretPath(pathname);
        router.replace(secretPath);
      }
    }
  }, [pathname, isInitialized, router]);

  /**
   * Context value
   * Giá trị context
   */
  const contextValue: AuthContextValue = {
    isInitialized,
    isAuthenticated,
    isLoading,
    user,
    error,
  };

  /**
   * Loading state
   * Trạng thái loading
   */
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Đang khởi tạo...</p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   * Trạng thái lỗi
   */
  if (error && status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <div className="text-destructive">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Lỗi xác thực</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 * Hook để sử dụng context authentication
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within AdminAuthProvider");
  }

  return context;
}

/**
 * Higher-order component for route protection
 * Component bậc cao để bảo vệ route
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    allowedRoles?: string[];
    allowedPermissions?: string[];
    fallback?: React.ComponentType;
  } = {}
) {
  const {
    requireAuth = true,
    allowedRoles = [],
    allowedPermissions = [],
    fallback: Fallback,
  } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, hasRole, hasPermission } = useAdminAuth();

    // Show loading state
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      if (Fallback) {
        return <Fallback />;
      }
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Yêu cầu đăng nhập</h2>
            <p className="text-muted-foreground">Vui lòng đăng nhập để truy cập trang này</p>
          </div>
        </div>
      );
    }

    // Check role requirements
    if (isAuthenticated && allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.some((role) => hasRole(role));
      if (!hasRequiredRole) {
        if (Fallback) {
          return <Fallback />;
        }
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Không có quyền truy cập</h2>
              <p className="text-muted-foreground">
                Bạn cần có một trong các quyền sau: {allowedRoles.join(", ")}
              </p>
            </div>
          </div>
        );
      }
    }

    // Check permission requirements
    if (isAuthenticated && allowedPermissions.length > 0) {
      const hasRequiredPermission = allowedPermissions.some((permission) =>
        hasPermission(permission)
      );
      if (!hasRequiredPermission) {
        if (Fallback) {
          return <Fallback />;
        }
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Không có quyền truy cập</h2>
              <p className="text-muted-foreground">Bạn không có quyền truy cập trang này</p>
            </div>
          </div>
        );
      }
    }

    return <Component {...props} />;
  };
}

/**
 * Component for protecting routes declaratively
 * Component để bảo vệ routes một cách declarative
 */
interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  allowedPermissions?: string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles = [],
  allowedPermissions = [],
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Yêu cầu đăng nhập</h2>
            <p className="text-muted-foreground">Vui lòng đăng nhập để truy cập trang này</p>
          </div>
        </div>
      )
    );
  }

  if (isAuthenticated && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some((role) => hasRole(role));
    if (!hasRequiredRole) {
      return (
        fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Không có quyền truy cập</h2>
              <p className="text-muted-foreground">
                Bạn cần có một trong các quyền sau: {allowedRoles.join(", ")}
              </p>
            </div>
          </div>
        )
      );
    }
  }

  if (isAuthenticated && allowedPermissions.length > 0) {
    const hasRequiredPermission = allowedPermissions.some((permission) =>
      hasPermission(permission)
    );
    if (!hasRequiredPermission) {
      return (
        fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Không có quyền truy cập</h2>
              <p className="text-muted-foreground">Bạn không có quyền truy cập trang này</p>
            </div>
          </div>
        )
      );
    }
  }

  return <>{children}</>;
}
