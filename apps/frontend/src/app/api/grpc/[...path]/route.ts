/**
 * gRPC API Route Proxy
 * ====================
 * 
 * Purpose:
 * - Proxy gRPC-Web calls from client to backend
 * - Extract JWT token from NextAuth session (server-side)
 * - Add Authorization header to gRPC metadata
 * - Solve httpOnly cookie + gRPC-Web authentication mismatch
 * 
 * Architecture:
 * Client (browser) → API Route (Next.js server) → Backend (gRPC)
 *                    ↑ getServerSession() extracts JWT
 * 
 * Security:
 * - JWT tokens remain in httpOnly cookies (secure)
 * - No token exposure to client JavaScript
 * - CSRF token validation maintained
 * 
 * @author NyNus Development Team
 * @created 2025-10-24
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Backend gRPC endpoint configuration
const BACKEND_GRPC_URL = process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080';

/**
 * POST /api/grpc/[...path]
 * 
 * Proxy gRPC-Web requests to backend with authentication
 * 
 * Flow:
 * 1. Extract session from NextAuth (server-side)
 * 2. Get JWT token from session
 * 3. Forward request to backend with Authorization header
 * 4. Return backend response to client
 * 
 * @param request - Next.js request object
 * @param params - Dynamic route parameters
 * @returns Backend gRPC response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const startTime = performance.now();
  const resolvedParams = await params;
  const grpcPath = resolvedParams.path.join('/');
  
  logger.debug('[gRPC Proxy] Incoming request', {
    path: grpcPath,
    method: 'POST',
    contentType: request.headers.get('content-type'),
  });

  try {
    // ===== WHITELIST: PUBLIC ENDPOINTS =====
    // These endpoints don't require authentication
    const publicEndpoints = [
      'v1.UserService/Login',
      'v1.UserService/Register',
      'v1.UserService/GoogleLogin',
      'v1.UserService/ForgotPassword',
      'v1.UserService/ResetPassword',
      'v1.UserService/VerifyEmail',
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => grpcPath === endpoint);

    logger.debug('[gRPC Proxy] Endpoint check', {
      path: grpcPath,
      isPublic: isPublicEndpoint,
    });

    // Capture client-provided authorization metadata as fallback
    const clientAuthHeader = request.headers.get('authorization');

    // ===== STEP 1: EXTRACT SESSION (SKIP FOR PUBLIC ENDPOINTS) =====

    let backendToken: string | undefined;

    if (!isPublicEndpoint) {
      // Get NextAuth session (server-side only)
      // This accesses httpOnly cookies that client JavaScript cannot read
      const session = await auth();

      if (!session) {
        logger.warn('[gRPC Proxy] No session found', {
          hasClientAuthHeader: !!clientAuthHeader,
        });

        if (!clientAuthHeader) {
          // ? FIX: Return gRPC-Web format response instead of JSON
          // grpc-web client expects application/grpc-web-text content-type
          return new NextResponse(null, {
            status: 401,
            headers: {
              'content-type': 'application/grpc-web-text',
              'grpc-status': '16', // UNAUTHENTICATED
              'grpc-message': 'Unauthorized - No active session',
            }
          });
        }

        logger.warn('[gRPC Proxy] Proceeding with client Authorization header fallback (missing session)', {
          path: grpcPath,
        });
      } else {
        logger.debug('[gRPC Proxy] Session found', {
          userEmail: session.user?.email,
          hasBackendToken: !!session.backendAccessToken,
        });

        // ===== STEP 2: EXTRACT JWT TOKEN =====

        // Get backend JWT token from session
        // This token was stored during login via jwt() callback
        backendToken = session.backendAccessToken;
      }

      if (!backendToken && !clientAuthHeader) {
        logger.error('[gRPC Proxy] No backend token available (session or client header missing)');
        // ? FIX: Return gRPC-Web format response instead of JSON
        // grpc-web client expects application/grpc-web-text content-type
        return new NextResponse(null, {
          status: 401,
          headers: {
            'content-type': 'application/grpc-web-text',
            'grpc-status': '16', // UNAUTHENTICATED
            'grpc-message': 'Unauthorized - No backend access token',
          }
        });
      }

    } else {
      logger.debug('[gRPC Proxy] Public endpoint - skipping authentication');
    }

    // ===== STEP 3: PREPARE BACKEND REQUEST =====
    
    // Read request body
    const requestBody = await request.arrayBuffer();
    
    // Extract CSRF token from request headers
    const csrfToken = request.headers.get('x-csrf-token');
    
    // Build backend URL
    const backendUrl = `${BACKEND_GRPC_URL}/${grpcPath}`;
    
    logger.debug('[gRPC Proxy] Forwarding to backend', {
      url: backendUrl,
      bodySize: requestBody.byteLength,
      hasCSRF: !!csrfToken,
    });

    // ===== STEP 4: FORWARD REQUEST TO BACKEND =====

    // Prepare headers for backend gRPC call
    const backendHeaders: HeadersInit = {
      // Forward content type
      'Content-Type': request.headers.get('content-type') || 'application/grpc-web+proto',

      // Forward CSRF token if present
      ...(csrfToken && { 'x-csrf-token': csrfToken }),

      // ✅ FIX: Forward cookies to backend for CSRF validation
      // Backend CSRF interceptor needs cookies to validate CSRF token
      // It compares token in header (x-csrf-token) vs token in cookie (next-auth.csrf-token)
      ...(request.headers.get('cookie') && { 'Cookie': request.headers.get('cookie')! }),

      // Forward user agent for audit logs
      'User-Agent': request.headers.get('user-agent') || 'gRPC-Proxy',

      // Forward client IP for security
      'X-Forwarded-For': request.headers.get('x-forwarded-for') ||
                         request.headers.get('x-real-ip') ||
                         'unknown',

      // gRPC-Web specific headers
      'X-Grpc-Web': '1',
      'X-User-Agent': 'grpc-web-javascript/0.1',

      // ✅ CONDITIONAL: Add Authorization header only for authenticated endpoints
      ...(backendToken
        ? { 'Authorization': `Bearer ${backendToken}` }
        : clientAuthHeader
          ? { 'Authorization': clientAuthHeader }
          : {}),
    };

    if (!backendToken && clientAuthHeader) {
      logger.warn('[gRPC Proxy] Using client-provided Authorization header fallback', {
        path: grpcPath,
      });
    }

    // Make request to backend
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: backendHeaders,
      body: requestBody,
      // Don't follow redirects
      redirect: 'manual',
    });

    logger.debug('[gRPC Proxy] Backend response received', {
      path: grpcPath,
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      contentType: backendResponse.headers.get('content-type'),
    });

    // ===== STEP 5: RETURN RESPONSE TO CLIENT =====
    
    // Read backend response body
    const responseBody = await backendResponse.arrayBuffer();
    
    // Forward backend response to client
    // Preserve all gRPC-Web headers
    const responseHeaders = new Headers();
    
    // Copy important headers from backend response
    const headersToForward = [
      'content-type',
      'grpc-status',
      'grpc-message',
      'grpc-status-details-bin',
    ];
    
    headersToForward.forEach(header => {
      const value = backendResponse.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    });

    // Log performance metrics
    const duration = performance.now() - startTime;
    logger.info('[gRPC Proxy] Request completed', {
      path: grpcPath,
      status: backendResponse.status,
      duration: `${duration.toFixed(2)}ms`,
      bodySize: responseBody.byteLength,
    });

    // Return response with same status code as backend
    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });

  } catch (error) {
    // ===== ERROR HANDLING =====
    
    const duration = performance.now() - startTime;

    logger.error(
      '[gRPC Proxy] Request failed',
      error instanceof Error ? error : new Error(String(error)),
      {
        duration: `${duration.toFixed(2)}ms`,
      }
    );

    // ✅ FIX: Return gRPC-Web format error response instead of JSON
    // grpc-web client expects application/grpc-web-text content-type
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new NextResponse(null, {
      status: 500,
      headers: {
        'content-type': 'application/grpc-web-text',
        'grpc-status': '13', // INTERNAL
        'grpc-message': errorMessage,
      }
    });
  }
}

/**
 * GET /api/grpc/[...path]
 * 
 * Handle HTTP GET requests for gRPC Gateway endpoints
 * Some gRPC services expose HTTP GET endpoints via gRPC Gateway
 * 
 * @param request - Next.js request object
 * @param params - Dynamic route parameters
 * @returns Backend HTTP response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const startTime = performance.now();
  const resolvedParams = await params;
  const grpcPath = resolvedParams.path.join('/');
  
  logger.debug('[gRPC Proxy] GET request', {
    path: grpcPath,
    method: 'GET',
    searchParams: request.nextUrl.searchParams.toString(),
  });

  try {
    // ===== AUTHENTICATION CHECK =====
    
    // Get NextAuth session (server-side only)
    const session = await auth();
    
    if (!session) {
      logger.warn('[gRPC Proxy] No session found for GET request', {
        path: grpcPath,
      });
      
      return new NextResponse(JSON.stringify({
        error: 'Unauthorized',
        message: 'No active session'
      }), {
        status: 401,
        headers: {
          'content-type': 'application/json',
        }
      });
    }

    logger.debug('[gRPC Proxy] Session found for GET request', {
      userEmail: session.user?.email,
      hasBackendToken: !!session.backendAccessToken,
    });

    // ===== PREPARE BACKEND REQUEST =====
    
    // Extract CSRF token from request headers
    const csrfToken = request.headers.get('x-csrf-token');
    
    // Build backend URL with query parameters
    const backendUrl = new URL(`${BACKEND_GRPC_URL}/${grpcPath}`);
    
    // Forward all query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });
    
    logger.debug('[gRPC Proxy] Forwarding GET to backend', {
      url: backendUrl.toString(),
      hasCSRF: !!csrfToken,
    });

    // ===== FORWARD REQUEST TO BACKEND =====

    // Prepare headers for backend HTTP call
    const backendHeaders: HeadersInit = {
      // Forward content type
      'Content-Type': 'application/json',

      // Forward CSRF token if present
      ...(csrfToken && { 'x-csrf-token': csrfToken }),

      // Forward cookies to backend for CSRF validation
      ...(request.headers.get('cookie') && { 'Cookie': request.headers.get('cookie')! }),

      // Forward user agent for audit logs
      'User-Agent': request.headers.get('user-agent') || 'gRPC-Proxy-GET',

      // Forward client IP for security
      'X-Forwarded-For': request.headers.get('x-forwarded-for') ||
                         request.headers.get('x-real-ip') ||
                         'unknown',

      // Add Authorization header from session
      ...(session.backendAccessToken && { 'Authorization': `Bearer ${session.backendAccessToken}` }),
    };

    // Make GET request to backend
    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: backendHeaders,
      // Don't follow redirects
      redirect: 'manual',
    });

    logger.debug('[gRPC Proxy] Backend GET response received', {
      path: grpcPath,
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      contentType: backendResponse.headers.get('content-type'),
    });

    // ===== RETURN RESPONSE TO CLIENT =====
    
    // Read backend response body
    const responseBody = await backendResponse.text();
    
    // Forward backend response to client
    const responseHeaders = new Headers();
    
    // Copy important headers from backend response
    const headersToForward = [
      'content-type',
      'cache-control',
      'etag',
    ];
    
    headersToForward.forEach(header => {
      const value = backendResponse.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    });

    // Log performance metrics
    const duration = performance.now() - startTime;
    logger.info('[gRPC Proxy] GET request completed', {
      path: grpcPath,
      status: backendResponse.status,
      duration: `${duration.toFixed(2)}ms`,
      bodySize: responseBody.length,
    });

    // Return response with same status code as backend
    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });

  } catch (error) {
    // ===== ERROR HANDLING =====
    
    const duration = performance.now() - startTime;

    logger.error(
      '[gRPC Proxy] GET request failed',
      error instanceof Error ? error : new Error(String(error)),
      {
        path: grpcPath,
        duration: `${duration.toFixed(2)}ms`,
      }
    );

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new NextResponse(JSON.stringify({
      error: 'Internal Server Error',
      message: errorMessage
    }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
      }
    });
  }
}

/**
 * OPTIONS /api/grpc/[...path]
 * 
 * Handle CORS preflight requests
 * Required for gRPC-Web from browser
 */
export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const grpcPath = resolvedParams.path.join('/');
  
  logger.debug('[gRPC Proxy] CORS preflight', { path: grpcPath });

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Grpc-Web, X-User-Agent, X-CSRF-Token, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
