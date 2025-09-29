/**
 * User Form Types
 * Form interfaces for user-related operations
 */

import { UserRole, UserStatus } from './roles';

/**
 * Login form data
 */
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration form data
 */
export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  agreeToTerms: boolean;
}

/**
 * Password reset request form
 */
export interface PasswordResetForm {
  email: string;
}

/**
 * Password reset confirmation form
 */
export interface PasswordResetConfirmForm {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Change password form
 */
export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User profile edit form
 */
export interface UserProfileForm {
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: File | string;
}

/**
 * Admin user creation form
 */
export interface AdminCreateUserForm {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  password: string;
  confirmPassword: string;
  emailVerified: boolean;
  level?: number;
  maxConcurrentSessions?: number;
  permissions?: string[];
  notes?: string;
  tags?: string[];
}

/**
 * Admin user edit form
 */
export interface AdminEditUserForm {
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  level?: number;
  maxConcurrentSessions?: number;
  permissions?: string[];
  notes?: string;
  tags?: string[];
}

/**
 * Bulk user action form
 */
export interface BulkUserActionForm {
  action: 'activate' | 'suspend' | 'delete' | 'change_role' | 'add_tag' | 'remove_tag';
  userIds: string[];
  reason?: string;
  
  // Action-specific parameters
  newRole?: UserRole;
  newStatus?: UserStatus;
  tag?: string;
}

/**
 * User search form
 */
export interface UserSearchForm {
  query: string;
  roles: UserRole[];
  statuses: UserStatus[];
  emailVerified?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
    field: 'createdAt' | 'lastLoginAt' | 'updatedAt';
  };
}

/**
 * User filter form for advanced filtering
 */
export interface UserFilterForm {
  // Basic filters
  search: string;
  roles: UserRole[];
  statuses: UserStatus[];
  
  // Advanced filters
  emailVerified?: boolean;
  levelMin?: number;
  levelMax?: number;
  riskScoreMin?: number;
  riskScoreMax?: number;
  isLocked?: boolean;
  highRisk?: boolean;
  
  // Date filters
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
  
  // Admin filters
  assignedTo?: string;
  hasTags?: string[];
  hasNotes?: boolean;
}

/**
 * User import form
 */
export interface UserImportForm {
  file: File;
  format: 'csv' | 'xlsx';
  hasHeaders: boolean;
  fieldMapping: Record<string, string>;
  defaultRole: UserRole;
  defaultStatus: UserStatus;
  sendWelcomeEmail: boolean;
  requireEmailVerification: boolean;
}

/**
 * User export form
 */
export interface UserExportForm {
  format: 'csv' | 'xlsx' | 'json';
  fields: string[];
  includeAuditLog: boolean;
  includeActivity: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters: UserFilterForm;
}

/**
 * Role promotion request form
 */
export interface RolePromotionForm {
  userId: string;
  requestedRole: UserRole;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  justification: string;
}

/**
 * User security settings form
 */
export interface UserSecurityForm {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  maxConcurrentSessions: number;
  allowedIpRanges?: string[];
  requirePasswordChange: boolean;
  passwordExpiryDays?: number;
}

/**
 * User notification preferences form
 */
export interface UserNotificationForm {
  email: {
    loginAlerts: boolean;
    securityAlerts: boolean;
    accountUpdates: boolean;
    marketing: boolean;
  };
  push: {
    enabled: boolean;
    loginAlerts: boolean;
    securityAlerts: boolean;
  };
  sms: {
    enabled: boolean;
    securityAlerts: boolean;
  };
}

/**
 * Form validation errors
 */
export interface FormValidationErrors {
  [field: string]: string | string[];
}

/**
 * Form submission state
 */
export interface FormSubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  errors: FormValidationErrors;
  message?: string;
}
