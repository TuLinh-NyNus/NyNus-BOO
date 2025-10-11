/**
 * User Roles and Status Types
 * Consolidated role system for the entire application
 */

// Import from base types (which uses protobuf)
import { UserRole, UserStatus, type UserRole as UserRoleType, type UserStatus as UserStatusType } from './base';

// Re-export for convenience
export { UserRole, UserStatus };
export type { UserRoleType, UserStatusType };

/**
 * Role hierarchy levels for permission checking
 * FIXED: Match backend hierarchy (apps/backend/internal/constant/roles.go)
 * Hierarchy: GUEST(1) < STUDENT(2) < TUTOR(3) < TEACHER(4) < ADMIN(5)
 */
export const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  [UserRole.USER_ROLE_UNSPECIFIED]: -1,
  [UserRole.USER_ROLE_GUEST]: 1,      // FIXED: 0 → 1
  [UserRole.USER_ROLE_STUDENT]: 2,    // FIXED: 1 → 2
  [UserRole.USER_ROLE_TUTOR]: 3,      // FIXED: 2 → 3
  [UserRole.USER_ROLE_TEACHER]: 4,    // FIXED: 3 → 4
  [UserRole.USER_ROLE_ADMIN]: 5       // FIXED: 4 → 5
};

/**
 * Role display names for UI
 */
export const ROLE_LABELS: Record<UserRoleType, string> = {
  [UserRole.USER_ROLE_UNSPECIFIED]: "Không xác định",
  [UserRole.USER_ROLE_GUEST]: "Khách",
  [UserRole.USER_ROLE_STUDENT]: "Học viên",
  [UserRole.USER_ROLE_TUTOR]: "Trợ giảng",
  [UserRole.USER_ROLE_TEACHER]: "Giảng viên",
  [UserRole.USER_ROLE_ADMIN]: "Quản trị viên"
};

/**
 * Status display names for UI
 */
export const STATUS_LABELS: Record<UserStatusType, string> = {
  [UserStatus.USER_STATUS_UNSPECIFIED]: "Không xác định",
  [UserStatus.USER_STATUS_ACTIVE]: "Hoạt động",
  [UserStatus.USER_STATUS_SUSPENDED]: "Tạm khóa",
  [UserStatus.USER_STATUS_INACTIVE]: "Không hoạt động"
};

/**
 * Helper functions for role checking
 */
export const roleHelpers = {
  /**
   * Check if role has permission level >= required level
   */
  hasPermissionLevel: (userRole: UserRoleType, requiredRole: UserRoleType): boolean => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  },

  /**
   * Check if user is admin
   */
  isAdmin: (role: UserRoleType): boolean => {
    return role === UserRole.USER_ROLE_ADMIN;
  },

  /**
   * Check if user is instructor (teacher or tutor)
   */
  isInstructor: (role: UserRoleType): boolean => {
    return role === UserRole.USER_ROLE_TEACHER || role === UserRole.USER_ROLE_TUTOR;
  },

  /**
   * Check if user can manage other users
   */
  canManageUsers: (role: UserRoleType): boolean => {
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[UserRole.USER_ROLE_TEACHER];
  },

  /**
   * Get role color for UI
   */
  getRoleColor: (role: UserRoleType): string => {
    const colors = {
      [UserRole.USER_ROLE_UNSPECIFIED]: "gray",
      [UserRole.USER_ROLE_GUEST]: "gray",
      [UserRole.USER_ROLE_STUDENT]: "blue",
      [UserRole.USER_ROLE_TUTOR]: "green",
      [UserRole.USER_ROLE_TEACHER]: "purple",
      [UserRole.USER_ROLE_ADMIN]: "red"
    };
    return colors[role];
  },

  /**
   * Get status color for UI
   */
  getStatusColor: (status: UserStatusType): string => {
    const colors = {
      [UserStatus.USER_STATUS_UNSPECIFIED]: "gray",
      [UserStatus.USER_STATUS_ACTIVE]: "green",
      [UserStatus.USER_STATUS_SUSPENDED]: "red",
      [UserStatus.USER_STATUS_INACTIVE]: "gray"
    };
    return colors[status];
  }
};

/**
 * Type guards for role checking
 */
export const isUserRole = (value: number): value is UserRoleType => {
  return Object.values(UserRole).includes(value as UserRoleType);
};

export const isUserStatus = (value: number): value is UserStatusType => {
  return Object.values(UserStatus).includes(value as UserStatusType);
};
