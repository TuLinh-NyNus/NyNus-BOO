/**
 * API Configuration for Admin App
 * Cấu hình API cho admin app
 */

import { ApiClientConfig, AdminApiEndpoints } from "./types";

/**
 * Environment detection
 * Phát hiện môi trường
 */
const ENV = process.env.NODE_ENV || "development";
const IS_DEV = ENV === "development";
const IS_PROD = ENV === "production";

/**
 * Base API URL configuration
 * Cấu hình base URL API
 */
const getBaseApiUrl = (): string => {
  // Base URL for admin backend API
  // Admin backend runs on different port from main backend
  const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:4000";
  return baseUrl;
};

/**
 * Environment-specific API client configuration
 * Cấu hình API client theo môi trường
 */
export const getApiClientConfig = (): ApiClientConfig => {
  const baseConfig = {
    baseURL: getBaseApiUrl(),
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    enableLogging: IS_DEV,
    enablePerformanceTracking: true,
  };

  switch (ENV) {
    case "development":
      return {
        ...baseConfig,
        timeout: 15000, // Longer timeout for development
        retryConfig: {
          maxRetries: 2, // Fewer retries in dev for faster feedback
          retryDelay: 500,
          exponentialBackoff: true,
          retryCondition: (error: any) => {
            // Retry on server errors, network errors, and timeouts
            return (
              error.response?.status >= 500 ||
              error.code === "NETWORK_ERROR" ||
              error.code === "TIMEOUT" ||
              error.code === "ECONNABORTED"
            );
          },
        },
      };

    case "production":
      return {
        ...baseConfig,
        timeout: 10000, // Standard timeout for production
        retryConfig: {
          maxRetries: 3, // More retries in production for reliability
          retryDelay: 1000,
          exponentialBackoff: true,
          retryCondition: (error: any) => {
            // More conservative retry in production
            return (
              error.response?.status >= 500 ||
              error.code === "NETWORK_ERROR" ||
              error.response?.status === 429 // Rate limiting
            );
          },
        },
      };

    case "test":
      return {
        ...baseConfig,
        timeout: 5000, // Shorter timeout for tests
        enableLogging: false, // Disable logging in tests
        enablePerformanceTracking: false,
        retryConfig: {
          maxRetries: 1, // Minimal retries in tests
          retryDelay: 100,
          exponentialBackoff: false,
          retryCondition: () => false, // No retries in tests by default
        },
      };

    default:
      return {
        ...baseConfig,
        timeout: 10000,
        retryConfig: {
          maxRetries: 2,
          retryDelay: 1000,
          exponentialBackoff: true,
          retryCondition: (error: any) => error.response?.status >= 500,
        },
      };
  }
};

/**
 * Admin API endpoints configuration
 * Cấu hình endpoints API admin - Updated for /api/v1 standardization
 */
export const ADMIN_API_ENDPOINTS: AdminApiEndpoints = {
  // Authentication endpoints - using auth controller
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  refresh: "/api/v1/auth/refresh",
  profile: "/api/v1/auth/profile",

  // User Management endpoints - using admin controller
  users: "/api/v1/admin/users",
  userById: (id: string) => `/api/v1/admin/users/${id}`,
  userSessions: (id: string) => `/api/v1/admin/users/${id}/sessions`,

  // Security & Audit endpoints - using security events controller
  auditLogs: "/api/v1/admin/audit",
  securityEvents: "/api/v1/security/events",
  sessions: "/api/v1/admin/sessions",
  notifications: "/api/v1/admin/notifications",

  // Resources & Permissions endpoints - using admin controller
  resources: "/api/v1/admin/resources",
  permissions: "/api/v1/admin/permissions",
  roles: "/api/v1/admin/roles",

  // System Configuration endpoints - using admin/configuration controller
  settings: "/api/v1/admin/configuration/settings",
  systemHealth: "/api/v1/health",
  analytics: "/api/v1/admin/analytics",
};

/**
 * Request timeout configurations
 * Cấu hình timeout cho requests
 */
export const REQUEST_TIMEOUTS = {
  // Standard operations
  DEFAULT: 10000, // 10 seconds

  // Quick operations
  HEALTH_CHECK: 3000, // 3 seconds
  LOGOUT: 5000, // 5 seconds

  // Medium operations
  LOGIN: 15000, // 15 seconds
  USER_OPERATIONS: 12000, // 12 seconds

  // Heavy operations
  ANALYTICS: 30000, // 30 seconds
  BULK_OPERATIONS: 45000, // 45 seconds
  EXPORT_OPERATIONS: 60000, // 60 seconds
} as const;

/**
 * HTTP status codes for admin operations
 * Mã trạng thái HTTP cho operations admin
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Admin-specific error messages
 * Thông báo lỗi specific cho admin
 */
export const ADMIN_ERROR_MESSAGES = {
  // Authentication errors
  AUTHENTICATION_ERROR: "Lỗi xác thực. Vui lòng đăng nhập lại",
  AUTHORIZATION_ERROR: "Bạn không có quyền thực hiện thao tác này",
  INVALID_CREDENTIALS: "Thông tin đăng nhập không chính xác",
  SESSION_EXPIRED: "Phiên đăng nhập đã hết hạn",
  INSUFFICIENT_PERMISSIONS: "Bạn không có quyền thực hiện thao tác này",

  // Network errors
  NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet",
  TIMEOUT_ERROR: "Yêu cầu quá thời gian chờ. Vui lòng thử lại",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau ít phút",

  // Admin-specific errors
  ADMIN_PERMISSION_ERROR: "Chức năng này chỉ dành cho quản trị viên",
  RESOURCE_NOT_FOUND: "Không tìm thấy tài nguyên",
  RATE_LIMIT_ERROR: "Quá nhiều yêu cầu. Vui lòng thử lại sau",
  ADMIN_ONLY: "Chức năng này chỉ dành cho quản trị viên",
  RESOURCE_LOCKED: "Tài nguyên đang được sử dụng bởi admin khác",
  BULK_OPERATION_FAILED: "Thao tác hàng loạt thất bại",

  // Generic errors
  UNKNOWN_ERROR: "Đã xảy ra lỗi không xác định",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ",
  RATE_LIMIT_EXCEEDED: "Quá nhiều yêu cầu. Vui lòng thử lại sau",
} as const;

/**
 * Performance thresholds for admin operations
 * Ngưỡng hiệu suất cho operations admin
 */
export const PERFORMANCE_THRESHOLDS = {
  // Response time thresholds (in milliseconds)
  FAST: 200, // < 200ms - Fast
  NORMAL: 1000, // 200ms - 1s - Normal
  SLOW: 3000, // 1s - 3s - Slow
  VERY_SLOW: 5000, // > 3s - Very slow

  // Request size thresholds (in bytes)
  SMALL_REQUEST: 1024, // < 1KB
  MEDIUM_REQUEST: 10240, // 1KB - 10KB
  LARGE_REQUEST: 102400, // 10KB - 100KB
  VERY_LARGE_REQUEST: 1048576, // > 100KB
} as const;

/**
 * Admin security configuration
 * Cấu hình bảo mật admin
 */
export const ADMIN_SECURITY_CONFIG = {
  // Token configuration
  TOKEN_STORAGE_KEY: "admin_auth_token",
  REFRESH_TOKEN_STORAGE_KEY: "admin_refresh_token",

  // Session configuration
  MAX_CONCURRENT_SESSIONS: 3,
  SESSION_WARNING_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry

  // Request security
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [".jpg", ".jpeg", ".png", ".pdf", ".csv", ".xlsx"],

  // Rate limiting (client-side tracking)
  MAX_REQUESTS_PER_MINUTE: 100,
  BURST_LIMIT: 20,
} as const;

/**
 * Default headers for admin requests
 * Headers mặc định cho admin requests
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Client-Type": "admin-dashboard",
  "X-Client-Version": "1.0.0",
} as const;
