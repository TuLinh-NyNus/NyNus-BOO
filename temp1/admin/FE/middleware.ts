import { NextRequest, NextResponse } from "next/server";

/**
 * Admin Secret Path Middleware
 * Middleware để bảo vệ admin routes với secret path
 * 
 * Logic:
 * 1. Block direct access to /admin/* routes
 * 2. Only allow access through secret path /{NEXT_PUBLIC_ADMIN_SECRET_PATH}/*
 * 3. Redirect unauthorized access to 404 page
 */

/**
 * Get secret path from environment variables
 * Lấy secret path từ environment variables
 */
function getSecretPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH || "3141592654";
}

/**
 * Check if request is accessing admin routes directly
 * Kiểm tra request có truy cập admin routes trực tiếp không
 */
function isDirectAdminAccess(pathname: string): boolean {
  // Check if path starts with /admin but not through secret path
  return pathname.startsWith("/admin") && !pathname.startsWith(`/${getSecretPath()}`);
}

/**
 * Check if request is using secret path
 * Kiểm tra request có sử dụng secret path không
 */
function isSecretPathAccess(pathname: string): boolean {
  const secretPath = getSecretPath();
  return pathname.startsWith(`/${secretPath}`);
}

/**
 * Add security headers to response
 * Thêm security headers vào response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent admin pages from being indexed
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  // Prevent admin pages from being embedded in frames
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Strict referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Enhanced Content Security Policy for admin
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join("; ")
  );

  // Additional security headers
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  // Strict Transport Security (HTTPS only)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "accelerometer=()",
      "gyroscope=()"
    ].join(", ")
  );

  return response;
}

/**
 * Log security events for monitoring
 * Ghi log security events để monitoring
 */
function logSecurityEvent(
  eventType: string,
  request: NextRequest,
  details?: Record<string, any>
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    eventType,
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    url: request.url,
    pathname: request.nextUrl.pathname,
    method: request.method,
    referer: request.headers.get("referer") || "unknown",
    origin: request.headers.get("origin") || "unknown",
    host: request.headers.get("host") || "unknown",
    ...details,
  };

  // Enhanced logging with severity levels
  const severity = getSeverityLevel(eventType);
  const logPrefix = `[ADMIN_SECURITY][${severity}]`;

  // In production, this should be sent to a logging service
  console.log(logPrefix, JSON.stringify(logData, null, 2));

  // For critical events, also log to error console
  if (severity === "CRITICAL") {
    console.error(logPrefix, logData);
  }
}

/**
 * Get severity level for security events
 * Lấy mức độ nghiêm trọng cho security events
 */
function getSeverityLevel(eventType: string): "INFO" | "WARNING" | "CRITICAL" {
  const criticalEvents = ["DIRECT_ADMIN_ACCESS_BLOCKED", "MIDDLEWARE_ERROR"];
  const warningEvents = ["SECRET_PATH_ACCESS"];

  if (criticalEvents.includes(eventType)) {
    return "CRITICAL";
  } else if (warningEvents.includes(eventType)) {
    return "WARNING";
  } else {
    return "INFO";
  }
}

/**
 * Main middleware function
 * Hàm middleware chính
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secretPath = getSecretPath();

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") // Static files (css, js, images, etc.)
  ) {
    return NextResponse.next();
  }

  try {
    // Case 1: Direct admin access - BLOCK and redirect to 404
    if (isDirectAdminAccess(pathname)) {
      logSecurityEvent("DIRECT_ADMIN_ACCESS_BLOCKED", request, {
        blockedPath: pathname,
        reason: "Direct admin access not allowed",
      });

      // Redirect to 404 page to hide admin existence
      const notFoundUrl = new URL("/404", request.url);
      const response = NextResponse.redirect(notFoundUrl);
      return addSecurityHeaders(response);
    }

    // Case 2: Secret path access - ALLOW with security headers
    if (isSecretPathAccess(pathname)) {
      logSecurityEvent("SECRET_PATH_ACCESS", request, {
        secretPath: pathname,
        reason: "Authorized secret path access",
      });

      // Continue with the request but add security headers
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Case 3: Root path access - handled by next.config.ts redirects
    if (pathname === "/") {
      // This will be handled by redirects in next.config.ts
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Case 4: Other paths - continue normally with security headers
    const response = NextResponse.next();
    return addSecurityHeaders(response);

  } catch (error) {
    // Log error and allow request to continue
    logSecurityEvent("MIDDLEWARE_ERROR", request, {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // In case of error, continue with the request but add security headers
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
}

/**
 * Middleware configuration
 * Cấu hình middleware - chỉ định routes nào chạy middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     * - manifest.json (PWA manifest)
     * - Static files with extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\..*).*)",
  ],
};
