/**
 * Current User API Route
 * 
 * GET /api/auth/me
 * Lấy thông tin user hiện tại từ token
 */

import { NextRequest, NextResponse } from 'next/server';

import { API_BASE_URL } from '@/lib/api/constants';
import { CookieManager, SecurityContext } from '@/lib/auth/cookie-manager';
import { SecurityAuditLogger, SecurityEventType, SecuritySeverity } from '@/lib/auth/security-audit-logger';
import { isTokenBlacklisted } from '@/lib/auth/token-blacklist';
import logger from '@/lib/utils/logger';

/**
 * Current user response interface
 */
interface MeResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
  error?: string;
}

/**
 * Backend me response
 */
interface BackendMeResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || remoteAddr || 'unknown';
}

/**
 * GET /api/auth/me
 * 
 * Get current authenticated user information
 */
export async function GET(request: NextRequest): Promise<NextResponse<MeResponse>> {
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  try {
    // Log in development only
    if (process.env.NODE_ENV === 'development') {
      logger.info('👤 Me API: Processing current user request');
    }
    
    // Prepare security context
    const securityContext: SecurityContext = {
      ipAddress,
      userAgent,
    };
    
    // Get access token
    const accessToken = CookieManager.getAccessToken(securityContext);
    const sessionId = CookieManager.getSessionId();
    
    if (!accessToken) {
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        logger.error('❌ Me API: No access token found');
      }
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.UNAUTHORIZED_ACCESS,
        SecuritySeverity.MEDIUM,
        { 
          reason: 'No access token found',
          endpoint: '/api/auth/me',
          ipAddress,
          userAgent 
        }
      );
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Không tìm thấy token xác thực' 
        },
        { status: 401 }
      );
    }
    
    // Check if access token is blacklisted
    if (await isTokenBlacklisted(accessToken)) {
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        logger.error('❌ Me API: Access token is blacklisted');
      }
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.UNAUTHORIZED_ACCESS,
        SecuritySeverity.HIGH,
        { 
          reason: 'Access token is blacklisted',
          endpoint: '/api/auth/me',
          ipAddress,
          userAgent 
        }
      );
      
      // Clear cookies since token is invalid
      CookieManager.clearAuthTokens(securityContext);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Token không hợp lệ' 
        },
        { status: 401 }
      );
    }
    
    // Validate session fingerprint
    if (!CookieManager.validateSessionFingerprint(request, securityContext)) {
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        logger.error('❌ Me API: Session fingerprint validation failed');
      }
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.SUSPICIOUS_SESSION_ACTIVITY,
        SecuritySeverity.HIGH,
        { 
          reason: 'Session fingerprint mismatch',
          endpoint: '/api/auth/me',
          ipAddress,
          userAgent 
        }
      );
      
      // Clear cookies for security
      CookieManager.clearAuthTokens(securityContext);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Phiên đăng nhập không hợp lệ' 
        },
        { status: 401 }
      );
    }
    
    // Forward request to backend
    const backendResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Forwarded-For': ipAddress,
        'User-Agent': userAgent,
      },
    });
    
    const responseData: BackendMeResponse = await backendResponse.json();
    
    if (!backendResponse.ok) {
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        logger.error('❌ Me API: Backend request failed:', responseData);
      }
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.UNAUTHORIZED_ACCESS,
        SecuritySeverity.MEDIUM,
        { 
          reason: 'Backend authentication failed',
          endpoint: '/api/auth/me',
          ipAddress,
          userAgent,
          backendStatus: backendResponse.status
        }
      );
      
      // Clear cookies if authentication failed
      if (backendResponse.status === 401) {
        CookieManager.clearAuthTokens(securityContext);
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Không thể xác thực người dùng' 
        },
        { status: 401 }
      );
    }
    
    if (!responseData.success || !responseData.user) {
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        logger.error('❌ Me API: Invalid response from backend');
      }
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.UNAUTHORIZED_ACCESS,
        SecuritySeverity.MEDIUM,
        { 
          reason: 'Invalid backend response',
          endpoint: '/api/auth/me',
          ipAddress,
          userAgent 
        }
      );
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Phản hồi không hợp lệ từ server' 
        },
        { status: 500 }
      );
    }
    
    // Update security context with user info
    securityContext.userId = responseData.user.id;
    securityContext.sessionId = sessionId || undefined;
    
    // Log successful access
    SecurityAuditLogger.logEvent(
      SecurityEventType.USER_ACCESS,
      SecuritySeverity.LOW,
      { 
        userId: responseData.user.id,
        email: responseData.user.email,
        endpoint: '/api/auth/me',
        ipAddress,
        userAgent 
      },
      securityContext
    );
    
    // Log success in development only
    if (process.env.NODE_ENV === 'development') {
      logger.info('✅ Me API: User information retrieved successfully:', {
        userId: responseData.user.id,
        email: responseData.user.email,
        role: responseData.user.role,
      });
    }
    
    return NextResponse.json({
      success: true,
      user: responseData.user,
      message: 'Thông tin người dùng được lấy thành công'
    });
    
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      logger.error('❌ Me API: Unexpected error:', error);
    }
    
    // Log security event
    SecurityAuditLogger.logEvent(
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecuritySeverity.HIGH,
      { 
        error: error instanceof Error ? error.message : String(error),
        endpoint: '/api/auth/me',
        ipAddress,
        userAgent 
      }
    );
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Đã xảy ra lỗi trong quá trình lấy thông tin người dùng' 
      },
      { status: 500 }
    );
  }
}

/**
 * Method not allowed for other HTTP methods
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed'
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed'
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed' 
    },
    { status: 405 }
  );
}
