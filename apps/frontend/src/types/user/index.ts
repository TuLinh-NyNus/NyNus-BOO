/**
 * User Types Index
 * Central export file for all user-related types
 */

// Import all types first
import type {
  User,
  UserSession,
  UserActivity
} from './base';
import type { AdminUser } from './admin';
import type { UserRole, UserStatus } from './roles';

// ===== ROLES & STATUS =====
export {
  UserRole,
  UserStatus,
  ROLE_HIERARCHY,
  ROLE_LABELS,
  STATUS_LABELS,
  roleHelpers,
  isUserRole,
  isUserStatus
} from './roles';

// ===== BASE USER TYPES =====
export type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserProfile,
  UserSession,
  UserActivity,
  UserStats,
  UserPreferences,

  UserWithComputedFields
} from './base';

// ===== ADMIN USER TYPES =====
export type {
  AdminUser,
  AdminUserFilterParams,
  AdvancedUserFilters as UserFilters,
  UserManagementAction,
  BulkUserOperation,
  UserAuditLog,
  UserSecurityAssessment,
  RolePromotionRequest,
  UserExportConfig,
  UserImportResult,
  UserManagementMetrics
} from './admin';

// ===== FORM TYPES =====
export type {
  LoginForm,
  RegisterForm,
  PasswordResetForm,
  PasswordResetConfirmForm,
  ChangePasswordForm,
  UserProfileForm,
  AdminCreateUserForm,
  AdminEditUserForm,
  BulkUserActionForm,
  UserSearchForm,
  UserFilterForm,
  UserImportForm,
  UserExportForm,
  RolePromotionForm,
  UserSecurityForm,
  UserNotificationForm,
  FormValidationErrors,
  FormSubmissionState
} from './forms';

// ===== TYPE GUARDS =====
export const userTypeGuards = {
  isUser: (obj: unknown): obj is User => {
    return obj !== null && typeof obj === 'object' && typeof (obj as User).id === 'string' && typeof (obj as User).email === 'string';
  },

  isAdminUser: (obj: unknown): obj is AdminUser => {
    return userTypeGuards.isUser(obj) && (obj as AdminUser).role !== undefined;
  },

  isUserSession: (obj: unknown): obj is UserSession => {
    return obj !== null && typeof obj === 'object' && typeof (obj as UserSession).id === 'string' && typeof (obj as UserSession).userId === 'string';
  },

  isUserActivity: (obj: unknown): obj is UserActivity => {
    return obj !== null && typeof obj === 'object' && typeof (obj as UserActivity).id === 'string' && typeof (obj as UserActivity).userId === 'string' && typeof (obj as UserActivity).action === 'string';
  }
};

// ===== UTILITY TYPES =====
export type UserRoleArray = UserRole[];
export type UserStatusArray = UserStatus[];
export type UserIdArray = string[];

// Partial types for updates
export type PartialUser = Partial<User>;
export type PartialAdminUser = Partial<AdminUser>;

// Pick types for specific use cases
export type UserBasicInfo = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
export type UserPublicInfo = Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'role' | 'level'>;
export type UserSecurityInfo = Pick<User, 'id' | 'email' | 'lastLoginAt' | 'loginAttempts' | 'lockedUntil'>;

// Omit types for creation
export type UserCreateData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type AdminUserCreateData = Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>;

// ===== CONSTANTS =====
export const USER_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION_MINUTES: 30,
  SESSION_TIMEOUT_MINUTES: 60,
  PASSWORD_MIN_LENGTH: 8,
  MAX_CONCURRENT_SESSIONS: 5,
  RISK_SCORE_THRESHOLD: 70,
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Export limits
  MAX_EXPORT_RECORDS: 10000,
  
  // File upload limits
  MAX_AVATAR_SIZE_MB: 5,
  ALLOWED_AVATAR_TYPES: ['image/jpeg', 'image/png', 'image/webp']
} as const;

// ===== DEFAULT VALUES =====
export const USER_DEFAULTS = {
  role: 'STUDENT' as const,
  status: 'PENDING_VERIFICATION' as const,
  emailVerified: false,
  level: 1,
  maxConcurrentSessions: 3,
  riskScore: 0,
  loginAttempts: 0,
  activeSessionsCount: 0,
  totalResourceAccess: 0
} as const;
