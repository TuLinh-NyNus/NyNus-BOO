/**
 * Route Permissions Configuration
 * ===============================
 * Centralized route permission definitions for middleware
 * 
 * Business Logic:
 * - Define which routes require authentication
 * - Define which roles can access which routes
 * - Define minimum level requirements for routes
 * - Optimize with Map for O(1) lookup performance
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import type { RoleString } from '@/lib/utils/role-converter';

/**
 * Route permission interface
 */
export interface RoutePermission {
  /** Allowed roles for this route */
  roles?: RoleString[];
  /** Minimum level required (for STUDENT, TUTOR, TEACHER roles) */
  minLevel?: number;
  /** Whether authentication is required */
  requireAuth: boolean;
}

/**
 * Route permissions map
 * Sử dụng Map cho O(1) lookup performance
 */
export const ROUTE_PERMISSIONS = new Map<string, RoutePermission>([
  // ===== ADMIN ROUTES =====
  ['/admin', { roles: ['ADMIN'], requireAuth: true }],
  ['/admin/dashboard', { roles: ['ADMIN'], requireAuth: true }],
  ['/admin/users', { roles: ['ADMIN'], requireAuth: true }],
  ['/admin/security', { roles: ['ADMIN'], requireAuth: true }],
  ['/admin/audit-logs', { roles: ['ADMIN'], requireAuth: true }],
  ['/admin/settings', { roles: ['ADMIN'], requireAuth: true }],
  ['/admin/roles', { roles: ['ADMIN'], requireAuth: true }],
  ['/admin/permissions', { roles: ['ADMIN'], requireAuth: true }],

  // ===== SECURE ADMIN ROUTES (Hidden Path) =====
  // Security: Admin dashboard accessible via obfuscated path /3141592654/admin
  ['/3141592654/admin', { roles: ['ADMIN'], requireAuth: true }],

  // ===== TEACHER ROUTES =====
  ['/teacher', { roles: ['TEACHER', 'ADMIN'], requireAuth: true }],
  ['/teacher/courses', { roles: ['TEACHER', 'ADMIN'], requireAuth: true }],
  ['/teacher/students', { roles: ['TEACHER', 'ADMIN'], requireAuth: true }],
  ['/teacher/exams', { roles: ['TEACHER', 'ADMIN'], requireAuth: true }],
  ['/teacher/analytics', { roles: ['TEACHER', 'ADMIN'], requireAuth: true }],

  // ===== TUTOR ROUTES =====
  ['/tutor', { roles: ['TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],
  ['/tutor/sessions', { roles: ['TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],
  ['/tutor/students', { roles: ['TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],

  // ===== STUDENT ROUTES =====
  ['/courses', { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],
  ['/courses/browse', { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],
  ['/courses/my-courses', { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],

  // ===== EXAM ROUTES =====
  // Student-accessible exam routes
  ['/exams', { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], minLevel: 1, requireAuth: true }],
  ['/exams/browse', { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],
  ['/exams/search', { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],
  ['/exams/my-exams', { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],
  ['/exams/my-results', { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],
  ['/exams/history', { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true }],

  // Teacher/Admin only exam management routes
  ['/exams/create', { roles: ['TEACHER', 'ADMIN'], requireAuth: true }],
  ['/exams/manage', { roles: ['TEACHER', 'ADMIN'], requireAuth: true }],
  ['/exams/analytics', { roles: ['TEACHER', 'ADMIN'], requireAuth: true }],

  // ===== AUTHENTICATED USER ROUTES =====
  ['/dashboard', { requireAuth: true }],
  ['/profile', { requireAuth: true }],
  ['/settings', { requireAuth: true }],
  ['/sessions', { requireAuth: true }],
  ['/notifications', { requireAuth: true }],
  ['/help', { requireAuth: true }],
]);

/**
 * Public routes (no authentication required)
 * Sử dụng Set cho O(1) lookup performance
 */
export const PUBLIC_ROUTES = new Set<string>([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/help',
]);

/**
 * Protected API route patterns
 * Routes matching these patterns require authentication
 */
export const PROTECTED_API_PATTERNS: RegExp[] = [
  /^\/api\/admin\/.*/,
  /^\/api\/teacher\/.*/,
  /^\/api\/tutor\/.*/,
  /^\/api\/protected\/.*/,
  /^\/api\/user\/.*/,
];

/**
 * Static file patterns to skip middleware
 */
export const STATIC_FILE_PATTERNS: RegExp[] = [
  /^\/_next\/.*/,
  /^\/static\/.*/,
  /\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/,
];

/**
 * Check if a route is public
 * @param pathname - Route pathname
 * @returns true if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname);
}

/**
 * Check if a route is a static file
 * @param pathname - Route pathname
 * @returns true if route is a static file
 */
export function isStaticFile(pathname: string): boolean {
  return STATIC_FILE_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Check if an API route is protected
 * @param pathname - API route pathname
 * @returns true if API route is protected
 */
export function isProtectedApiRoute(pathname: string): boolean {
  return PROTECTED_API_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Get route permission for a pathname
 * Supports exact match and prefix match (most specific wins)
 * 
 * @param pathname - Route pathname
 * @returns RoutePermission or undefined if not found
 */
export function getRoutePermission(pathname: string): RoutePermission | undefined {
  // Try exact match first
  const exactMatch = ROUTE_PERMISSIONS.get(pathname);
  if (exactMatch) {
    return exactMatch;
  }

  // Find all matching routes (prefix match)
  const matchingRoutes = Array.from(ROUTE_PERMISSIONS.keys())
    .filter(route => pathname.startsWith(route) && route !== '/');

  if (matchingRoutes.length === 0) {
    return undefined;
  }

  // Use most specific match (longest route)
  const mostSpecific = matchingRoutes.reduce((a, b) =>
    a.length > b.length ? a : b
  );

  return ROUTE_PERMISSIONS.get(mostSpecific);
}

