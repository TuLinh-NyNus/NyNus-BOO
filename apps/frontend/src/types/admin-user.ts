/**
 * Admin User Types
 * Types cho admin user management system
 */

/**
 * User roles enum
 * Enum cho user roles
 */
export type UserRole = "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";

/**
 * User status enum
 * Enum cho user status
 */
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

/**
 * Admin User interface for user management
 * Interface AdminUser cho user management
 */
export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Computed field for search
  role: UserRole;
  status: UserStatus;
  level?: number;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  activeSessionsCount: number;
  totalResourceAccess: number;
  riskScore?: number;

  // Additional fields for enhanced functionality
  permissions?: string[];
  isActive?: boolean;
  maxConcurrentSessions?: number;
  lastLoginIp?: string;
  loginAttempts?: number;
  lockedUntil?: Date;
}

/**
 * User stats interface
 * Interface thống kê user
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  growthPercentage: number;
  usersByRole?: Record<string, number>;
  usersByLevel?: Record<string, number>;
  usersByStatus?: Record<string, number>;
  averageSessionDuration?: number;
  mostActiveUsers?: Array<{
    id: string;
    name: string;
    email: string;
    sessionCount: number;
    lastActivity: string;
  }>;
}

/**
 * User activity interface
 * Interface hoạt động user
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

/**
 * User filter params
 * Tham số lọc user
 */
export interface UserFilterParams {
  search?: string;
  role?: string;
  status?: string;
  level?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "email" | "role" | "status" | "createdAt" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastActivityFrom?: string;
  lastActivityTo?: string;
}

/**
 * Transform API user to AdminUser interface
 * Chuyển đổi API user sang AdminUser interface
 */
export function transformApiUserToAdminUser(apiUser: any): AdminUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    name:
      apiUser.firstName && apiUser.lastName
        ? `${apiUser.firstName} ${apiUser.lastName}`.trim()
        : apiUser.firstName || apiUser.lastName || apiUser.email,
    role: (apiUser.role as UserRole) || "STUDENT",
    status: (apiUser.status as UserStatus) || "ACTIVE",
    level: apiUser.level || 1,
    emailVerified: apiUser.emailVerified !== false,
    lastLoginAt: apiUser.lastLoginAt,
    createdAt: apiUser.createdAt || new Date().toISOString(),
    updatedAt: apiUser.updatedAt,
    activeSessionsCount: apiUser.activeSessionsCount || 0,
    totalResourceAccess: apiUser.totalResourceAccess || 0,
    riskScore: apiUser.riskScore || 0.1,
    permissions: apiUser.permissions || [],
    isActive: apiUser.isActive !== false,
    maxConcurrentSessions: apiUser.maxConcurrentSessions || 5,
    lastLoginIp: apiUser.lastLoginIp,
    loginAttempts: apiUser.loginAttempts || 0,
    lockedUntil: apiUser.lockedUntil ? new Date(apiUser.lockedUntil) : undefined,
  };
}

/**
 * User role labels
 * Labels cho user roles
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  GUEST: "Khách",
  STUDENT: "Học viên",
  TUTOR: "Gia sư",
  TEACHER: "Giáo viên",
  ADMIN: "Quản trị viên",
};

/**
 * User status labels
 * Labels cho user statuses
 */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Hoạt động",
  SUSPENDED: "Tạm ngưng",
  PENDING_VERIFICATION: "Chờ xác thực",
};

/**
 * User role colors for badges
 * Màu sắc cho role badges
 */
export const USER_ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "destructive",
  TEACHER: "default",
  TUTOR: "secondary",
  STUDENT: "outline",
  GUEST: "secondary",
};

/**
 * User status colors for badges
 * Màu sắc cho status badges
 */
export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  ACTIVE: "secondary",
  SUSPENDED: "destructive",
  PENDING_VERIFICATION: "default",
};

/**
 * Check if user has specific role
 * Kiểm tra user có role cụ thể không
 */
export function hasRole(user: AdminUser, role: UserRole): boolean {
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 * Kiểm tra user có bất kỳ role nào trong danh sách không
 */
export function hasAnyRole(user: AdminUser, roles: UserRole[]): boolean {
  return roles.includes(user.role);
}

/**
 * Check if user is active
 * Kiểm tra user có đang hoạt động không
 */
export function isUserActive(user: AdminUser): boolean {
  return user.status === "ACTIVE" && user.emailVerified;
}

/**
 * Check if user is suspended
 * Kiểm tra user có bị tạm ngưng không
 */
export function isUserSuspended(user: AdminUser): boolean {
  return user.status === "SUSPENDED";
}

/**
 * Check if user needs verification
 * Kiểm tra user có cần xác thực không
 */
export function needsVerification(user: AdminUser): boolean {
  return user.status === "PENDING_VERIFICATION" || !user.emailVerified;
}

/**
 * Get user display name
 * Lấy tên hiển thị của user
 */
export function getUserDisplayName(user: AdminUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`.trim();
  }
  return user.firstName || user.lastName || user.email;
}

/**
 * Get user initials for avatar
 * Lấy chữ cái đầu của user cho avatar
 */
export function getUserInitials(user: AdminUser): string {
  const displayName = getUserDisplayName(user);
  const words = displayName.split(" ");

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  } else if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return user.email.slice(0, 2).toUpperCase();
}

/**
 * Format user last login time
 * Format thời gian đăng nhập cuối của user
 */
export function formatLastLogin(user: AdminUser): string {
  if (!user.lastLoginAt) return "Chưa đăng nhập";

  const date = new Date(user.lastLoginAt);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)} giờ trước`;
  } else {
    return date.toLocaleDateString("vi-VN");
  }
}

/**
 * Calculate user risk level
 * Tính mức độ rủi ro của user
 */
export function getUserRiskLevel(user: AdminUser): "low" | "medium" | "high" {
  const riskScore = user.riskScore || 0;

  if (riskScore >= 7) return "high";
  if (riskScore >= 4) return "medium";
  return "low";
}

/**
 * Get risk level color
 * Lấy màu cho mức độ rủi ro
 */
export function getRiskLevelColor(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "secondary";
  }
}
