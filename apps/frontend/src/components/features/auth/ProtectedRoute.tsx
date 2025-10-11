"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading || isRedirecting) return;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      setIsRedirecting(true);
      const loginUrl = redirectTo || `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }

    // If authenticated, check role-based access
    if (isAuthenticated && user) {
      const hasAccess = checkAccess(user, requiredRoles, minRole, minLevel);
      
      if (!hasAccess && redirectTo) {
        setIsRedirecting(true);
        router.push(redirectTo);
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requiredRoles, minRole, minLevel, redirectTo, pathname, router, isRedirecting]);

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
