import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define role hierarchy
const ROLE_HIERARCHY = {
  ADMIN: 5,
  TEACHER: 4,
  TUTOR: 3,
  STUDENT: 2,
  GUEST: 1,
};

// Define route permissions
const ROUTE_PERMISSIONS: Record<string, { roles?: string[], minLevel?: number, requireAuth: boolean }> = {
  // Admin routes
  '/admin': { roles: ['ADMIN'], requireAuth: true },
  '/admin/dashboard': { roles: ['ADMIN'], requireAuth: true },
  '/admin/users': { roles: ['ADMIN'], requireAuth: true },
  '/admin/security': { roles: ['ADMIN'], requireAuth: true },
  '/admin/audit-logs': { roles: ['ADMIN'], requireAuth: true },
  
  // Teacher routes
  '/teacher': { roles: ['TEACHER', 'ADMIN'], requireAuth: true },
  '/teacher/courses': { roles: ['TEACHER', 'ADMIN'], requireAuth: true },
  '/teacher/students': { roles: ['TEACHER', 'ADMIN'], requireAuth: true },
  
  // Tutor routes
  '/tutor': { roles: ['TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true },
  '/tutor/sessions': { roles: ['TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true },
  
  // Student routes
  '/courses': { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true },

  // Exam routes - Comprehensive permissions
  '/exams': { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], minLevel: 1, requireAuth: true },
  '/exams/browse': { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true },
  '/exams/search': { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true },
  '/exams/my-exams': { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true },
  '/exams/my-results': { roles: ['STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'], requireAuth: true },

  // Teacher/Admin only exam management routes
  '/exams/create': { roles: ['TEACHER', 'ADMIN'], requireAuth: true },
  '/exams/manage': { roles: ['TEACHER', 'ADMIN'], requireAuth: true },
  
  // Authenticated user routes
  '/dashboard': { requireAuth: true },
  '/profile': { requireAuth: true },
  '/settings': { requireAuth: true },
  '/sessions': { requireAuth: true },
  
  // Public routes
  '/': { requireAuth: false },
  '/login': { requireAuth: false },
  '/register': { requireAuth: false },
  '/forgot-password': { requireAuth: false },
  '/reset-password': { requireAuth: false },
  '/about': { requireAuth: false },
  '/contact': { requireAuth: false },
};

// Protected route patterns
const PROTECTED_PATTERNS = [
  /^\/api\/admin\/.*/,
  /^\/api\/teacher\/.*/,
  /^\/api\/protected\/.*/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and api routes (except protected ones)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    (pathname.startsWith('/api') && !PROTECTED_PATTERNS.some(pattern => pattern.test(pathname)))
  ) {
    return NextResponse.next();
  }

  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Find matching route permission
  let routePermission = ROUTE_PERMISSIONS[pathname];
  
  // If no exact match, check for partial matches
  if (!routePermission) {
    const routeKeys = Object.keys(ROUTE_PERMISSIONS).filter(route => 
      pathname.startsWith(route) && route !== '/'
    );
    if (routeKeys.length > 0) {
      // Use the most specific match
      const mostSpecific = routeKeys.reduce((a, b) => a.length > b.length ? a : b);
      routePermission = ROUTE_PERMISSIONS[mostSpecific];
    }
  }

  // Default to public route if no permission defined
  if (!routePermission) {
    routePermission = { requireAuth: false };
  }

  // Check if authentication is required
  if (routePermission.requireAuth && !token) {
    // Redirect to login with return URL
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check role-based access
  if (routePermission.roles && token) {
    const userRole = token.role as string || 'GUEST';
    const hasAccess = routePermission.roles.includes(userRole);
    
    if (!hasAccess) {
      // Check if user has a higher role in hierarchy
      const userRoleLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
      const requiredMinLevel = Math.min(
        ...routePermission.roles.map(role => 
          ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0
        )
      );
      
      if (userRoleLevel < requiredMinLevel) {
        // Redirect to unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // Check level-based access
  if (routePermission.minLevel && token) {
    const userLevel = token.level as number || 0;
    const userRole = token.role as string || 'GUEST';
    
    // Only check level for roles that have levels (STUDENT, TUTOR, TEACHER)
    if (['STUDENT', 'TUTOR', 'TEACHER'].includes(userRole)) {
      if (userLevel < routePermission.minLevel) {
        // Redirect to unauthorized page with level requirement message
        const url = new URL('/unauthorized', request.url);
        url.searchParams.set('reason', `level_${routePermission.minLevel}`);
        return NextResponse.redirect(url);
      }
    }
  }

  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  if (token) {
    requestHeaders.set('x-user-id', token.sub || '');
    requestHeaders.set('x-user-role', token.role as string || 'GUEST');
    requestHeaders.set('x-user-level', (token.level || 0).toString());
    requestHeaders.set('x-user-email', token.email as string || '');
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};