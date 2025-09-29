/**
 * Admin User Types
 * Extended user interfaces for admin management
 */

import { User } from './base';
import { UserRole, UserStatus } from './roles';

/**
 * AdminUser interface for user management
 * Extends base User with admin-specific fields
 */
export interface AdminUser extends User {
  // ===== ADMIN-SPECIFIC FIELDS =====
  permissions?: string[];               // Specific permissions
  riskScore?: number;                   // Security risk score (0-100)

  // ===== ENHANCED TRACKING =====
  totalLoginAttempts?: number;          // Total login attempts
  successfulLogins?: number;            // Successful login count
  failedLogins?: number;                // Failed login count
  loginAttempts?: number;               // Failed login attempts (for compatibility)

  // ===== ADMIN METADATA =====
  notes?: string;                       // Admin notes about user
  tags?: string[];                      // Admin tags for categorization
  assignedTo?: string;                  // Admin user ID responsible for this user

  // ===== COMPUTED FIELDS FOR ADMIN UI =====
  isHighRisk?: boolean;                 // Computed from riskScore
  needsAttention?: boolean;             // Computed from various factors
  lastActivitySummary?: string;         // Human-readable last activity
  name?: string;                        // Computed field for search (compatibility)

  // ===== COMPATIBILITY FIELDS =====
  lastLoginIp?: string;                 // Last login IP address
  lockedUntil?: Date;                   // Account locked until date

  // ===== MISSING FIELDS FROM COMPONENTS =====
  username?: string;                    // Username for display
  phone?: string;                       // Phone number
  school?: string;                      // School name
  address?: string;                     // Address
  dateOfBirth?: Date;                   // Date of birth
  gender?: string;                      // Gender
  adminNotes?: string;                  // Admin notes (alias for notes)
  googleId?: string;                    // Google OAuth ID
  password_hash?: string;               // Password hash
  maxConcurrentIPs?: number;            // Maximum concurrent IPs allowed

  // ===== NESTED OBJECTS =====
  stats?: {                             // User statistics
    totalExamResults?: number;
    totalCourses?: number;
    totalLessons?: number;
    averageScore?: number;
    [key: string]: unknown;
  };
  profile?: {                           // User profile data
    completionRate?: number;
    bio?: string;
    phoneNumber?: string;
    preferences?: {
      language?: string;
      timezone?: string;
      profileVisibility?: string;
      notifications?: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
      };
    };
    [key: string]: unknown;
  };
}

/**
 * Admin user filter parameters
 * For filtering users in admin interface
 */
export interface AdminUserFilterParams {
  // Basic filters
  search?: string;
  roles?: UserRole[];
  statuses?: UserStatus[];
  
  // Enhanced filters
  emailVerified?: boolean;
  levelRange?: { min: number; max: number };
  riskScoreRange?: { min: number; max: number };
  isLocked?: boolean;
  highRisk?: boolean;
  needsAttention?: boolean;
  
  // Date filters
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
  
  // Admin filters
  assignedTo?: string;
  hasTags?: string[];
  hasNotes?: boolean;
  
  // Pagination
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Advanced user filters for complex queries
 */
export interface AdvancedUserFilters {
  // Basic filters
  search: string;
  roles: UserRole[];
  statuses: UserStatus[];

  // Enhanced filters
  emailVerified?: boolean | null;
  levelRange?: { min: number; max: number } | null;
  riskScoreRange?: { min: number; max: number } | null;

  // Date range filters
  dateRange?: {
    field: 'createdAt' | 'lastLoginAt' | 'updatedAt';
    start: Date;
    end: Date;
  } | null;

  // Activity filters
  sessionCountRange?: { min: number; max: number } | null;
  resourceAccessRange?: { min: number; max: number } | null;
}

/**
 * User management actions
 */
export interface UserManagementAction {
  type: 'activate' | 'suspend' | 'verify' | 'reset_password' | 'unlock' | 'delete';
  userId: string;
  reason?: string;
  performedBy: string;
  performedAt: Date;
}

/**
 * Bulk user operations
 */
export interface BulkUserOperation {
  action: 'activate' | 'suspend' | 'delete' | 'change_role' | 'add_tag';
  userIds: string[];
  parameters?: Record<string, unknown>;
  performedBy: string;
  performedAt: Date;
}

/**
 * User audit log entry
 */
export interface UserAuditLog {
  id: string;
  userId: string;
  action: string;
  oldValue?: unknown;
  newValue?: unknown;
  performedBy: string;
  performedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

/**
 * User security assessment
 */
export interface UserSecurityAssessment {
  userId: string;
  riskScore: number;
  riskFactors: string[];
  recommendations: string[];
  lastAssessedAt: Date;
  assessedBy: string;
}

/**
 * User role promotion workflow
 */
export interface RolePromotionRequest {
  id: string;
  userId: string;
  currentRole: UserRole;
  requestedRole: UserRole;
  requestedBy: string;
  requestedAt: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

/**
 * User export configuration
 */
export interface UserExportConfig {
  format: 'csv' | 'xlsx' | 'json';
  fields: string[];
  filters: AdminUserFilterParams;
  includeAuditLog: boolean;
  includeActivity: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * User import result
 */
export interface UserImportResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
  warnings: Array<{
    row: number;
    email: string;
    warning: string;
  }>;
}

/**
 * User management dashboard metrics
 */
export interface UserManagementMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  suspendedUsers: number;
  highRiskUsers: number;
  pendingVerifications: number;
  
  // Activity metrics
  averageSessionsPerUser: number;
  totalActiveSessions: number;
  
  // Growth metrics
  userGrowthRate: number;
  retentionRate: number;
  
  // Security metrics
  averageRiskScore: number;
  securityIncidents: number;
}

// ===== UTILITY FUNCTIONS =====

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
  return user.status === 1 && user.emailVerified; // USER_STATUS_ACTIVE = 1
}

/**
 * Check if user is suspended
 * Kiểm tra user có bị tạm ngưng không
 */
export function isUserSuspended(user: AdminUser): boolean {
  return user.status === 2; // USER_STATUS_SUSPENDED = 2
}

/**
 * Transform API user to AdminUser interface
 * Chuyển đổi API user sang AdminUser interface
 */
export function transformApiUserToAdminUser(apiUser: Record<string, unknown>): AdminUser {
  return {
    id: String(apiUser.id || ''),
    email: String(apiUser.email || ''),
    firstName: apiUser.firstName ? String(apiUser.firstName) : undefined,
    lastName: apiUser.lastName ? String(apiUser.lastName) : undefined,
    name:
      apiUser.firstName && apiUser.lastName
        ? `${String(apiUser.firstName)} ${String(apiUser.lastName)}`.trim()
        : String(apiUser.firstName || apiUser.lastName || apiUser.email || ''),
    role: (apiUser.role as UserRole) || 1, // USER_ROLE_STUDENT = 1
    status: (apiUser.status as UserStatus) || 1, // USER_STATUS_ACTIVE = 1
    level: Number(apiUser.level) || 1,
    emailVerified: apiUser.emailVerified !== false,
    lastLoginAt: apiUser.lastLoginAt ? new Date(String(apiUser.lastLoginAt)) : undefined,
    createdAt: new Date(String(apiUser.createdAt || new Date().toISOString())),
    updatedAt: apiUser.updatedAt ? new Date(String(apiUser.updatedAt)) : new Date(),
    activeSessionsCount: Number(apiUser.activeSessionsCount) || 0,
    totalResourceAccess: Number(apiUser.totalResourceAccess) || 0,
    riskScore: Number(apiUser.riskScore) || 0.1,
    permissions: Array.isArray(apiUser.permissions) ? apiUser.permissions as string[] : [],
    isActive: apiUser.isActive !== false,
    maxConcurrentSessions: Number(apiUser.maxConcurrentSessions) || 5,
    lastLoginIp: apiUser.lastLoginIp ? String(apiUser.lastLoginIp) : undefined,
    loginAttempts: Number(apiUser.loginAttempts) || 0,
    lockedUntil: apiUser.lockedUntil ? new Date(String(apiUser.lockedUntil)) : undefined,
  };
}
