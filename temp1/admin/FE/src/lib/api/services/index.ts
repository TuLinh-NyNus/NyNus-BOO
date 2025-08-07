/**
 * Admin API Services Index
 * Export tất cả admin API services
 */

// Export service classes
export {
  AdminAuthService,
  AdminUserService,
  AdminSecurityService,
  AdminSystemService,
} from "./admin.api";

// Export service instances
export {
  adminAuthService,
  adminUserService,
  adminSecurityService,
  adminSystemService,
} from "./admin.api";

// Re-export types for convenience
export type {
  AdminUser,
  AdminLoginCredentials,
  AdminLoginResponse,
  AdminStatsResponse,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from "../types";
