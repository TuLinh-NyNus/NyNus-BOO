/**
 * API Types and Interfaces for Admin App
 * Types và interfaces cho API trong admin app
 */

/**
 * Standard API response structure
 * Cấu trúc response API chuẩn
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode: number;
  timestamp?: string;
}

/**
 * API error structure
 * Cấu trúc lỗi API
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
  method: string;
  error?: string;
}

/**
 * Enhanced error with additional context
 * Lỗi được enhance với context bổ sung
 */
export interface EnhancedError extends Error {
  type: ErrorType;
  statusCode?: number;
  originalError?: any;
  requestId?: string;
  timestamp: string;
  context?: Record<string, any>;
}

/**
 * Error types for admin operations
 * Các loại lỗi cho operations admin
 */
export type ErrorType =
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "ADMIN_PERMISSION_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "RATE_LIMIT_ERROR"
  | "UNKNOWN_ERROR";

/**
 * Retry configuration
 * Cấu hình retry
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  retryCondition: (error: any) => boolean;
}

/**
 * API client configuration
 * Cấu hình API client
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryConfig: RetryConfig;
  tokenRefreshThreshold: number;
  enableLogging: boolean;
  enablePerformanceTracking: boolean;
}

/**
 * Request tracking information
 * Thông tin tracking request
 */
export interface RequestInfo {
  id: string;
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  error?: boolean;
}

/**
 * Admin authentication tokens
 * Tokens xác thực admin
 */
export interface AdminTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Admin user information
 * Thông tin user admin
 */
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  lastLoginAt?: string;
  isActive: boolean;
}

/**
 * Admin login credentials
 * Thông tin đăng nhập admin
 */
export interface AdminLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Admin login response
 * Response đăng nhập admin
 */
export interface AdminLoginResponse {
  user: AdminUser;
  tokens: AdminTokens;
  sessionId: string;
}

/**
 * Log levels for API logging
 * Các mức log cho API logging
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * API log entry
 * Entry log API
 */
export interface ApiLogEntry {
  requestId: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: boolean;
  context?: Record<string, any>;
}

/**
 * Performance metrics
 * Metrics hiệu suất
 */
export interface PerformanceMetrics {
  requestId: string;
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: string;
  error: boolean;
}

/**
 * Admin API endpoints configuration
 * Cấu hình endpoints API admin
 */
export interface AdminApiEndpoints {
  // Authentication
  login: string;
  logout: string;
  refresh: string;
  profile: string;

  // User Management
  users: string;
  userById: (id: string) => string;
  userSessions: (id: string) => string;

  // Security & Audit
  auditLogs: string;
  securityEvents: string;
  sessions: string;
  notifications: string;

  // Resources & Permissions
  resources: string;
  permissions: string;
  roles: string;

  // System Configuration
  settings: string;
  systemHealth: string;
  analytics: string;
}

/**
 * Request options for admin API calls
 * Options cho admin API calls
 */
export interface AdminRequestOptions {
  skipAuth?: boolean;
  skipRetry?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  signal?: AbortSignal;
}

/**
 * Pagination parameters
 * Tham số phân trang
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

/**
 * Paginated response
 * Response có phân trang
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Admin statistics response
 * Response thống kê admin
 */
export interface AdminStatsResponse {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  activeSessions: number;
  securityAlerts: number;
  systemHealth: "healthy" | "warning" | "critical";
  lastUpdated: string;
}
