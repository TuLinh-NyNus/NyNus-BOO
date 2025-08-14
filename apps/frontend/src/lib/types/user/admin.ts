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
  
  // ===== ADMIN METADATA =====
  notes?: string;                       // Admin notes about user
  tags?: string[];                      // Admin tags for categorization
  assignedTo?: string;                  // Admin user ID responsible for this user
  
  // ===== COMPUTED FIELDS FOR ADMIN UI =====
  isHighRisk?: boolean;                 // Computed from riskScore
  needsAttention?: boolean;             // Computed from various factors
  lastActivitySummary?: string;         // Human-readable last activity
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
