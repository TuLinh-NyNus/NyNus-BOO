/**
 * Admin Path Utilities
 * Utilities cho admin routing và path management
 */

/**
 * Admin base path constant
 * Base path cho tất cả admin routes
 */
export const ADMIN_BASE_PATH = '/3141592654/admin' as const;

/**
 * Admin paths constants
 * Constants cho tất cả admin routes
 */
export const ADMIN_PATHS = {
  // Main routes
  DASHBOARD: '/3141592654/admin',
  USERS: '/3141592654/admin/users',
  QUESTIONS: '/3141592654/admin/questions',
  ROLES: '/3141592654/admin/roles',
  PERMISSIONS: '/3141592654/admin/permissions',
  
  // Analytics & Reports
  ANALYTICS: '/3141592654/admin/analytics',
  AUDIT: '/3141592654/admin/audit',
  
  // Content Management
  BOOKS: '/3141592654/admin/books',
  FAQ: '/3141592654/admin/faq',
  RESOURCES: '/3141592654/admin/resources',
  
  // System Management
  SETTINGS: '/3141592654/admin/settings',
  SECURITY: '/3141592654/admin/security',
  SESSIONS: '/3141592654/admin/sessions',
  NOTIFICATIONS: '/3141592654/admin/notifications',
  
  // Advanced Features
  LEVEL_PROGRESSION: '/3141592654/admin/level-progression',
  MAPCODE: '/3141592654/admin/mapcode',
  
  // Question Management Sub-routes
  QUESTIONS_CREATE: '/3141592654/admin/questions/create',
  QUESTIONS_EDIT: (id: string) => `/3141592654/admin/questions/${id}/edit`,
  QUESTIONS_VIEW: (id: string) => `/3141592654/admin/questions/${id}`,
  QUESTIONS_INPUT_LATEX: '/3141592654/admin/questions/inputques',
  QUESTIONS_INPUT_AUTO: '/3141592654/admin/questions/inputauto',
  QUESTIONS_DATABASE: '/3141592654/admin/questions/database',
  QUESTIONS_SAVED: '/3141592654/admin/questions/saved',
  QUESTIONS_MAP_ID: '/3141592654/admin/questions/map-id',
  
  // User Management Sub-routes
  USERS_CREATE: '/3141592654/admin/users/create',
  USERS_EDIT: (id: string) => `/3141592654/admin/users/${id}/edit`,
  USERS_VIEW: (id: string) => `/3141592654/admin/users/${id}`,
} as const;

/**
 * Build admin path utility
 * Utility function để build admin paths
 */
export function buildAdminPath(path: string = ''): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Return base path if no additional path
  if (!cleanPath) {
    return ADMIN_BASE_PATH;
  }
  
  // Build full admin path
  return `${ADMIN_BASE_PATH}/${cleanPath}`;
}

/**
 * Check if path is admin path
 * Kiểm tra xem path có phải là admin path không
 */
export function isAdminPath(pathname: string): boolean {
  return pathname.startsWith(ADMIN_BASE_PATH);
}

/**
 * Get admin path segments
 * Lấy path segments từ admin path
 */
export function getAdminPathSegments(pathname: string): string[] {
  if (!isAdminPath(pathname)) {
    return [];
  }
  
  // Remove admin base path và split
  const relativePath = pathname.replace(ADMIN_BASE_PATH, '');
  const segments = relativePath.split('/').filter(Boolean);
  
  return segments;
}

/**
 * Get current admin section
 * Lấy section hiện tại từ admin path
 */
export function getCurrentAdminSection(pathname: string): string | null {
  const segments = getAdminPathSegments(pathname);
  return segments.length > 0 ? segments[0] : null;
}

/**
 * Admin route type definitions
 * Type definitions cho admin routes
 */
export type AdminPathKey = keyof typeof ADMIN_PATHS;
export type AdminPath = typeof ADMIN_PATHS[AdminPathKey];

/**
 * Admin route metadata
 * Metadata cho admin routes
 */
export interface AdminRouteMetadata {
  path: string;
  title: string;
  description?: string;
  icon?: string;
  requiresPermission?: string[];
  isPublic?: boolean;
}

/**
 * Admin routes metadata mapping
 * Mapping metadata cho admin routes
 */
export const ADMIN_ROUTES_METADATA: Record<string, AdminRouteMetadata> = {
  [ADMIN_PATHS.DASHBOARD]: {
    path: ADMIN_PATHS.DASHBOARD,
    title: 'Dashboard',
    description: 'Tổng quan hệ thống',
    icon: 'LayoutDashboard',
    isPublic: false
  },
  [ADMIN_PATHS.USERS]: {
    path: ADMIN_PATHS.USERS,
    title: 'Quản lý người dùng',
    description: 'Quản lý tài khoản và quyền hạn',
    icon: 'Users',
    requiresPermission: ['users.read']
  },
  [ADMIN_PATHS.QUESTIONS]: {
    path: ADMIN_PATHS.QUESTIONS,
    title: 'Quản lý câu hỏi',
    description: 'Tạo và quản lý ngân hàng câu hỏi',
    icon: 'FileQuestion',
    requiresPermission: ['questions.read']
  },
  [ADMIN_PATHS.ANALYTICS]: {
    path: ADMIN_PATHS.ANALYTICS,
    title: 'Thống kê',
    description: 'Báo cáo và phân tích dữ liệu',
    icon: 'BarChart3',
    requiresPermission: ['analytics.read']
  },
  [ADMIN_PATHS.SETTINGS]: {
    path: ADMIN_PATHS.SETTINGS,
    title: 'Cài đặt',
    description: 'Cấu hình hệ thống',
    icon: 'Settings',
    requiresPermission: ['system.settings']
  }
};

/**
 * Get route metadata
 * Lấy metadata của route
 */
export function getRouteMetadata(pathname: string): AdminRouteMetadata | null {
  return ADMIN_ROUTES_METADATA[pathname] || null;
}

/**
 * Navigation helper functions
 * Helper functions cho navigation
 */
export const AdminPathUtils = {
  build: buildAdminPath,
  isAdmin: isAdminPath,
  getSegments: getAdminPathSegments,
  getCurrentSection: getCurrentAdminSection,
  getMetadata: getRouteMetadata,
  
  // Convenience methods
  dashboard: () => ADMIN_PATHS.DASHBOARD,
  users: () => ADMIN_PATHS.USERS,
  questions: () => ADMIN_PATHS.QUESTIONS,
  analytics: () => ADMIN_PATHS.ANALYTICS,
  settings: () => ADMIN_PATHS.SETTINGS,
  
  // Dynamic routes
  userEdit: (id: string) => ADMIN_PATHS.USERS_EDIT(id),
  userView: (id: string) => ADMIN_PATHS.USERS_VIEW(id),
  questionEdit: (id: string) => ADMIN_PATHS.QUESTIONS_EDIT(id),
  questionView: (id: string) => ADMIN_PATHS.QUESTIONS_VIEW(id),
} as const;

/**
 * Convert path to secret admin path
 * Chuyển đổi path thành secret admin path (alias cho buildAdminPath)
 */
export function toSecretPath(path: string): string {
  return buildAdminPath(path);
}

export default AdminPathUtils;
