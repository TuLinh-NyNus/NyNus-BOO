/**
 * User Roles and Status Types
 * Consolidated role system for the entire application
 */

// Import UserRole and UserStatus from core-types to maintain consistency
import { UserRole, UserStatus } from '../../mockdata/shared/core-types';

// Re-export for convenience
export { UserRole, UserStatus };

/**
 * Role hierarchy levels for permission checking
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.GUEST]: 0,
  [UserRole.STUDENT]: 1,
  [UserRole.TUTOR]: 2,
  [UserRole.TEACHER]: 3,
  [UserRole.ADMIN]: 4
};

/**
 * Role display names for UI
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.GUEST]: "Khách",
  [UserRole.STUDENT]: "Học viên",
  [UserRole.TUTOR]: "Trợ giảng", 
  [UserRole.TEACHER]: "Giảng viên",
  [UserRole.ADMIN]: "Quản trị viên"
};

/**
 * Status display names for UI
 */
export const STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "Hoạt động",
  [UserStatus.SUSPENDED]: "Tạm khóa",
  [UserStatus.PENDING_VERIFICATION]: "Chờ xác thực",
  [UserStatus.INACTIVE]: "Không hoạt động",
  [UserStatus.PENDING]: "Chờ xử lý",
  [UserStatus.DELETED]: "Đã xóa"
};

/**
 * Helper functions for role checking
 */
export const roleHelpers = {
  /**
   * Check if role has permission level >= required level
   */
  hasPermissionLevel: (userRole: UserRole, requiredRole: UserRole): boolean => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  },

  /**
   * Check if user is admin
   */
  isAdmin: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user is instructor (teacher or tutor)
   */
  isInstructor: (role: UserRole): boolean => {
    return role === UserRole.TEACHER || role === UserRole.TUTOR;
  },

  /**
   * Check if user can manage other users
   */
  canManageUsers: (role: UserRole): boolean => {
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[UserRole.TEACHER];
  },

  /**
   * Get role color for UI
   */
  getRoleColor: (role: UserRole): string => {
    const colors = {
      [UserRole.GUEST]: "gray",
      [UserRole.STUDENT]: "blue", 
      [UserRole.TUTOR]: "green",
      [UserRole.TEACHER]: "purple",
      [UserRole.ADMIN]: "red"
    };
    return colors[role];
  },

  /**
   * Get status color for UI
   */
  getStatusColor: (status: UserStatus): string => {
    const colors = {
      [UserStatus.ACTIVE]: "green",
      [UserStatus.SUSPENDED]: "red",
      [UserStatus.PENDING_VERIFICATION]: "yellow",
      [UserStatus.INACTIVE]: "gray",
      [UserStatus.PENDING]: "orange",
      [UserStatus.DELETED]: "red"
    };
    return colors[status];
  }
};

/**
 * Type guards for role checking
 */
export const isUserRole = (value: string): value is UserRole => {
  return Object.values(UserRole).includes(value as UserRole);
};

export const isUserStatus = (value: string): value is UserStatus => {
  return Object.values(UserStatus).includes(value as UserStatus);
};
