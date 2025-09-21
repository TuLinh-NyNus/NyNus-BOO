/**
 * Base User Types
 * Core user interfaces for the application
 */

// Import UserRole và UserStatus từ protobuf generated types (primary)
import { UserRole, UserStatus } from '../../../generated/common/common_pb';
// Fallback manual types
// import { UserRole, UserStatus } from './roles';

/**
 * Core User interface
 * Base interface that all user types extend from
 */
export interface User {
  // ===== CORE REQUIRED FIELDS =====
  id: string;                           // Primary key
  email: string;                        // Login identifier
  role: UserRole;                       // User role
  status: UserStatus;                   // Account status
  emailVerified: boolean;               // Email verification status
  createdAt: Date;                      // Creation timestamp
  updatedAt: Date;                      // Last update timestamp

  // ===== PROFILE FIELDS =====
  firstName?: string;                   // First name
  lastName?: string;                    // Last name
  name?: string;                        // Computed full name for search
  avatar?: string;                      // Profile picture URL
  bio?: string;                         // User biography
  
  // ===== AUTHENTICATION FIELDS =====
  lastLoginAt?: Date;                   // Last login timestamp
  lastLoginIp?: string;                 // Last login IP address
  loginAttempts?: number;               // Failed login attempts
  lockedUntil?: Date;                   // Account lock expiration
  
  // ===== ACTIVITY FIELDS =====
  level?: number;                       // User level (1-100)
  totalResourceAccess?: number;         // Total resources accessed
  activeSessionsCount?: number;         // Current active sessions
  maxConcurrentSessions?: number;       // Maximum allowed sessions
  isActive?: boolean;                   // Account active status (for compatibility)
}

/**
 * User creation input
 * Fields required when creating a new user
 */
export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
}

/**
 * User update input
 * Fields that can be updated for existing user
 */
export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar?: string;
  bio?: string;
  level?: number;
  maxConcurrentSessions?: number;
}

/**
 * User profile for public display
 * Sanitized user data for public consumption
 */
export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  level?: number;
  createdAt: Date;
}

/**
 * User session information
 * Data about user's current session
 */
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

/**
 * User activity log entry
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * User statistics
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  pendingVerificationUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  growthPercentage: number;
  
  // Role distribution
  roleDistribution: Record<UserRole, number>;
  
  // Activity metrics
  averageSessionDuration: number;
  totalSessions: number;
  activeSessions: number;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
}

/**
 * Helper type for user with computed fields
 */
export type UserWithComputedFields = User & {
  fullName: string;
  initials: string;
  isOnline: boolean;
  lastSeenText: string;
};
