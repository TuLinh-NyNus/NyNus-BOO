"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Shield, AlertTriangle } from "lucide-react";

import { useAuth } from "@/contexts/auth-context-grpc";
import { UserRole } from "@/generated/common/common_pb";

// Type alias for UserRole enum
type UserRoleType = typeof UserRole[keyof typeof UserRole];
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Role hierarchy for access control
const ROLE_HIERARCHY: Record<number, number> = {
  [UserRole.USER_ROLE_GUEST]: 1,
  [UserRole.USER_ROLE_STUDENT]: 2,
  [UserRole.USER_ROLE_TUTOR]: 3,
  [UserRole.USER_ROLE_TEACHER]: 4,
  [UserRole.USER_ROLE_ADMIN]: 5,
};

/**
 * Check if NextAuth session cookie exists
 * This is a more reliable way to check authentication than relying on useSession() status
 * because useSession() may not have fetched the session yet on initial page load
 */
function hasSessionCookie(): boolean {
  if (typeof window === 'undefined') return false;

  const cookies = document.cookie;
  // Check for both dev and production cookie names
  return cookies.includes('next-auth.session-token') || cookies.includes('__Secure-next-auth.session-token');
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRoleType[];
  minRole?: UserRoleType;
  minLevel?: number;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
  showUnauthorized?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  minRole,
  minLevel,
  requireAuth = true,
  fallback,
  redirectTo,
  showUnauthorized = true,
}: ProtectedRouteProps) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { status: sessionStatus, data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasCookie, setHasCookie] = useState(false);
  const [waitStartTime, setWaitStartTime] = useState<number | null>(null);

  // ✅ NEW FIX: Check for session cookie on mount and when session changes
  // This prevents redirect loop when session cookie exists but useSession() hasn't loaded yet
  useEffect(() => {
    const cookieExists = hasSessionCookie();
    console.log('[ProtectedRoute] Cookie check:', {
      cookieExists,
      sessionStatus,
      isAuthenticated,
      hasUser: !!user,
      pathname
    });
    setHasCookie(cookieExists);

    // Start wait timer when cookie exists but not authenticated
    if (cookieExists && !isAuthenticated && waitStartTime === null) {
      setWaitStartTime(Date.now());
    }
    // Clear wait timer when authenticated
    if (isAuthenticated && waitStartTime !== null) {
      setWaitStartTime(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, sessionStatus, isAuthenticated, user, pathname]); // Removed waitStartTime to prevent infinite loop

  // ✅ IMPROVED FIX: Combine loading states AND check for session cookie
  // Wait for AuthContext OR if session cookie exists, wait for NextAuth to load it
  const isLoading = authLoading || (hasCookie && sessionStatus === "loading");

  useEffect(() => {
    console.log('[ProtectedRoute] Auth check:', {
      isLoading,
      isRedirecting,
      hasCookie,
      sessionStatus,
      isAuthenticated,
      hasUser: !!user,
      pathname,
      waitTime: waitStartTime ? `${Date.now() - waitStartTime}ms` : 'N/A'
    });

    if (isLoading || isRedirecting) {
      console.log('[ProtectedRoute] Waiting... (isLoading or isRedirecting)');
      return;
    }

    // ✅ CRITICAL FIX: If session cookie exists, wait for AuthContext to load user
    // This prevents redirect loop when:
    // 1. Login succeeds → session cookie is set
    // 2. Dashboard loads → ProtectedRoute mounts
    // 3. AuthContext hasn't fetched user yet (isAuthenticated = false)
    // 4. But session cookie EXISTS → user IS authenticated, just not loaded yet
    // 5. Wait for AuthContext to fetch user instead of redirecting
    //
    // ⚠️ TIMEOUT: If waiting > 5 seconds, assume session is invalid and redirect
    if (hasCookie && !isAuthenticated) {
      const waitTime = waitStartTime ? Date.now() - waitStartTime : 0;
      const TIMEOUT_MS = 5000; // 5 seconds timeout

      if (waitTime < TIMEOUT_MS) {
        console.log('[ProtectedRoute] Session cookie exists - waiting for AuthContext to load user...', {
          waitTime: `${waitTime}ms`,
          timeout: `${TIMEOUT_MS}ms`
        });
        // Don't redirect yet, give AuthContext time to fetch user
        return;
      } else {
        console.warn('[ProtectedRoute] TIMEOUT - Session cookie exists but user not loaded after 5s, redirecting to login', {
          waitTime: `${waitTime}ms`,
          hasCookie,
          isAuthenticated,
          sessionStatus
        });
        // Timeout reached, redirect to login
        // This handles edge cases like invalid session cookie or network errors
      }
    }

    // Only redirect if NO session cookie AND not authenticated
    // OR if timeout reached (handled above)
    if (requireAuth && !isAuthenticated) {
      console.log('[ProtectedRoute] NOT AUTHENTICATED - Redirecting to login', {
        requireAuth,
        isAuthenticated,
        hasCookie,
        sessionStatus
      });
      setIsRedirecting(true);
      const loginUrl = redirectTo || `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }

    // If authenticated, check role-based access
    if (isAuthenticated && user) {
      console.log('[ProtectedRoute] AUTHENTICATED - Checking role access', {
        userRole: user.role,
        requiredRoles,
        minRole,
        minLevel
      });
      const hasAccess = checkAccess(user, requiredRoles, minRole, minLevel);

      if (!hasAccess && redirectTo) {
        console.log('[ProtectedRoute] ACCESS DENIED - Redirecting', { redirectTo });
        setIsRedirecting(true);
        router.push(redirectTo);
        return;
      }
    }

    console.log('[ProtectedRoute] All checks passed - Rendering children');
  }, [isLoading, isAuthenticated, user, requireAuth, requiredRoles, minRole, minLevel, redirectTo, pathname, router, isRedirecting, sessionStatus, hasCookie, waitStartTime]);

  // Show loading state
  if (isLoading || isRedirecting) {
    return fallback || <LoadingFallback />;
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return fallback || <AuthRequiredFallback />;
  }

  // Check role-based access
  if (isAuthenticated && user) {
    const hasAccess = checkAccess(user, requiredRoles, minRole, minLevel);
    
    if (!hasAccess) {
      if (!showUnauthorized) {
        return null;
      }
      return fallback || (
        <UnauthorizedFallback 
          userRole={user.role}
          requiredRoles={requiredRoles}
          minRole={minRole}
          minLevel={minLevel}
        />
      );
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
}

// Helper function to check access permissions
function checkAccess(
  user: { role?: UserRoleType; level?: number } | null,
  requiredRoles?: UserRoleType[],
  minRole?: UserRoleType,
  minLevel?: number
): boolean {
  // User must exist
  if (!user || !user.role) {
    return false;
  }

  // Check specific roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) return false;
  }

  // Check minimum role hierarchy
  if (minRole !== undefined) {
    const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
    const minRoleLevel = ROLE_HIERARCHY[minRole] || 0;
    if (userRoleLevel < minRoleLevel) return false;
  }

  // Check minimum level (for roles that have levels)
  if (minLevel !== undefined && user.level !== undefined) {
    const rolesWithLevels: UserRoleType[] = [
      UserRole.USER_ROLE_STUDENT,
      UserRole.USER_ROLE_TUTOR,
      UserRole.USER_ROLE_TEACHER,
    ];

    if (rolesWithLevels.includes(user.role) && user.level < minLevel) {
      return false;
    }
  }

  return true;
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
      </div>
    </div>
  );
}

// Authentication required fallback
function AuthRequiredFallback() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle>Yêu cầu đăng nhập</CardTitle>
          <CardDescription>
            Bạn cần đăng nhập để truy cập trang này
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)}
          >
            Đăng nhập
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push("/")}
          >
            Về trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Unauthorized access fallback
function UnauthorizedFallback({
  userRole,
  requiredRoles,
  minRole,
  minLevel,
}: {
  userRole: UserRoleType;
  requiredRoles?: UserRoleType[];
  minRole?: UserRoleType;
  minLevel?: number;
}) {
  const router = useRouter();

  const getRoleName = (role: UserRoleType): string => {
    switch (role) {
      case UserRole.USER_ROLE_ADMIN: return "Quản trị viên";
      case UserRole.USER_ROLE_TEACHER: return "Giáo viên";
      case UserRole.USER_ROLE_TUTOR: return "Gia sư";
      case UserRole.USER_ROLE_STUDENT: return "Học sinh";
      case UserRole.USER_ROLE_GUEST: return "Khách";
      default: return "Không xác định";
    }
  };

  const getRequiredRolesText = (): string => {
    if (requiredRoles && requiredRoles.length > 0) {
      return requiredRoles.map(getRoleName).join(", ");
    }
    if (minRole !== undefined) {
      return `${getRoleName(minRole)} trở lên`;
    }
    return "Quyền đặc biệt";
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <CardTitle>Không có quyền truy cập</CardTitle>
          <CardDescription>
            Bạn không có quyền truy cập trang này
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Vai trò hiện tại:</strong> {getRoleName(userRole)}</p>
                <p><strong>Yêu cầu:</strong> {getRequiredRolesText()}</p>
                {minLevel && (
                  <p><strong>Cấp độ tối thiểu:</strong> {minLevel}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => router.push("/dashboard")}
            >
              Về Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/")}
            >
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Higher-Order Component wrapper
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  protectionConfig: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...protectionConfig}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking access in components
export function useAccessControl() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (roles: UserRoleType | UserRoleType[]): boolean => {
    if (!isAuthenticated || !user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasMinRole = (minRole: UserRoleType): boolean => {
    if (!isAuthenticated || !user) return false;
    const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
    const minRoleLevel = ROLE_HIERARCHY[minRole] || 0;
    return userRoleLevel >= minRoleLevel;
  };

  const hasMinLevel = (minLevel: number): boolean => {
    if (!isAuthenticated || !user || user.level === undefined) return false;
    return user.level >= minLevel;
  };

  return {
    hasRole,
    hasMinRole,
    hasMinLevel,
    isAuthenticated,
    user,
  };
}
