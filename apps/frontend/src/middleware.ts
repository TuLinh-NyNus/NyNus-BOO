/**
 * Next.js Middleware for Route Protection
 * =======================================
 * 
 * Responsibilities:
 * - Protect routes based on authentication status
 * - Enforce role-based access control (RBAC)
 * - Enforce level-based access control
 * - Add user info to request headers
 * 
 * Architecture:
 * - Delegates access control logic to RouteGuard service
 * - Uses route-permissions config for route definitions
 * - Integrates with NextAuth JWT for authentication
 * 
 * Performance Optimizations:
 * - Early exit for public routes
 * - Early exit for static files
 * - Route permission caching in RouteGuard
 * - Optimized matcher configuration (~70% reduction in executions)
 * 
 * @author NyNus Development Team
 * @version 2.0.0 - Refactored with Clean Architecture
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';
import { RouteGuard } from '@/lib/services/route-guard';
import {
  isPublicRoute,
  isStaticFile,
  isProtectedApiRoute,
} from '@/lib/config/route-permissions';

/**
 * Middleware function
 * Xử lý route protection và access control
 */
export async function middleware(request: NextRequest) {
  const startTime = performance.now();
  const { pathname } = request.nextUrl;

  // ===== EARLY EXIT OPTIMIZATIONS =====

  // Skip NextAuth API routes completely
  // Let NextAuth handle these routes without interference
  if (pathname.startsWith('/api/auth')) {
    logger.debug('[Middleware] NextAuth API route, skipping', { pathname });
    return NextResponse.next();
  }

  // Skip public routes (biggest performance win)
  if (isPublicRoute(pathname)) {
    logger.debug('[Middleware] Public route, skipping', { pathname });
    return NextResponse.next();
  }

  // Skip static files
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }

  // Skip non-protected API routes
  if (pathname.startsWith('/api') && !isProtectedApiRoute(pathname)) {
    return NextResponse.next();
  }

  // ===== AUTHENTICATION =====

  // Get session token from NextAuth JWT
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  });

  logger.debug('[Middleware] Processing request', {
    pathname,
    hasToken: !!token,
    role: token?.role,
    level: token?.level,
  });

  // ===== ACCESS CONTROL =====

  // Check access using RouteGuard service
  const accessCheck = RouteGuard.checkAccess(pathname, token);

  if (!accessCheck.allowed) {
    // Access denied - redirect to appropriate page
    const redirectUrl = accessCheck.redirectUrl || '/login';
    logger.warn('[Middleware] Access denied', {
      pathname,
      reason: accessCheck.reason,
      redirectUrl,
    });
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // ===== AUTHENTICATED USER REDIRECTS =====

  // Redirect authenticated users from auth pages to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    logger.debug('[Middleware] Redirecting authenticated user to dashboard', {
      pathname,
    });
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ===== ADD USER INFO TO HEADERS =====

  // Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  if (token) {
    requestHeaders.set('x-user-id', token.sub || '');
    requestHeaders.set('x-user-role', (token.role as string) || 'GUEST');
    requestHeaders.set('x-user-level', ((token.level as number) || 0).toString());
    requestHeaders.set('x-user-email', (token.email as string) || '');
  }

  // ===== PERFORMANCE LOGGING =====

  const duration = performance.now() - startTime;
  logger.debug('[Middleware] Request processed', {
    pathname,
    duration: `${duration.toFixed(2)}ms`,
    allowed: true,
  });

  // ===== RESPONSE =====

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Middleware matcher configuration
 * 
 * Performance Optimization:
 * - Only run middleware on protected routes
 * - Reduces middleware executions by ~70%
 * - Static files and public routes are automatically skipped
 * 
 * Routes included:
 * - Protected pages: /dashboard, /admin, /teacher, /tutor, /exams, /courses, /profile, /settings, /sessions
 * - Protected API routes: /api/admin, /api/teacher, /api/protected
 * - NextAuth routes: /api/auth (for CSRF handling)
 */
export const config = {
  matcher: [
    // Protected pages
    '/dashboard/:path*',
    '/admin/:path*',
    '/teacher/:path*',
    '/tutor/:path*',
    '/exams/:path*',
    '/courses/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/sessions/:path*',
    '/notifications/:path*',
    
    // Protected API routes
    '/api/admin/:path*',
    '/api/teacher/:path*',
    '/api/tutor/:path*',
    '/api/protected/:path*',
    '/api/user/:path*',
    
    // NextAuth routes (for CSRF handling)
    '/api/auth/:path*',
  ],
};

