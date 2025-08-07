/**
 * Admin API Index
 * Main export file cho admin API client và services
 */

// Import services for api object
import {
  adminAuthService,
  adminUserService,
  adminSecurityService,
  adminSystemService,
} from "./services";
import type { LogLevel } from "./types";
import { AdminApiClient, adminApiClient } from "./client";

// Export main API client
export { AdminApiClient, adminApiClient } from "./client";

// Export all services
export * from "./services";

// Export configuration
export {
  getApiClientConfig,
  ADMIN_API_ENDPOINTS,
  REQUEST_TIMEOUTS,
  HTTP_STATUS,
  ADMIN_ERROR_MESSAGES,
  PERFORMANCE_THRESHOLDS,
  ADMIN_SECURITY_CONFIG,
  DEFAULT_HEADERS,
} from "./config";

// Export all types
export type * from "./types";

// Export utility functions
export const createAdminApiClient = () => new AdminApiClient();

/**
 * Quick access to commonly used services
 * Truy cập nhanh đến các services thường dùng
 */
export const api = {
  // Main client
  client: adminApiClient,

  // Service shortcuts
  auth: adminAuthService,
  users: adminUserService,
  security: adminSecurityService,
  system: adminSystemService,

  // Utility methods
  isAuthenticated: () => adminApiClient.isAuthenticated(),
  clearAuth: () => adminApiClient.clearAuthentication(),
  getStats: () => adminApiClient.getRequestStats(),
  getLogs: (level?: LogLevel) => adminApiClient.getLogs(level),
  getMetrics: () => adminApiClient.getPerformanceMetrics(),
  healthCheck: () => adminApiClient.healthCheck(),
} as const;
