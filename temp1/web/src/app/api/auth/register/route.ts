/**
 * Register API Route
 * 
 * POST /api/auth/register
 * Xử lý đăng ký user mới
 */

import { NextRequest, NextResponse } from 'next/server';

import { API_BASE_URL } from '@/lib/api/constants';
import { SecurityAuditLogger, SecurityEventType, SecuritySeverity } from '@/lib/auth/security-audit-logger';
import logger from '@/lib/utils/logger';

/**
 * Register request interface
 */
interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  confirmPassword: string;
}

/**
 * Register response interface
 */
interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isEmailVerified: boolean;
  };
  message?: string;
  error?: string;
}

/**
 * Backend register response
 */
interface BackendRegisterResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isEmailVerified: boolean;
  };
  message?: string;
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
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password: string):  { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 1 số' };
  }
  
  return { valid: true };
}

/**
 * POST /api/auth/register
 * 
 * Register new user
 */
export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse>> {
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  try {
    logger.info('📝 Register API: Processing registration request');
    
    // Parse request body
    const body: RegisterRequest = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password || !body.fullName || !body.confirmPassword) {
      logger.error('❌ Register API: Missing required fields');
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.REGISTRATION_FAILED,
        SecuritySeverity.LOW,
        { 
          reason: 'Missing required fields',
          email: body.email || 'unknown',
          ipAddress,
          userAgent 
        }
      );
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Tất cả các trường là bắt buộc' 
        },
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!isValidEmail(body.email)) {
      logger.error('❌ Register API: Invalid email format');
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.REGISTRATION_FAILED,
        SecuritySeverity.LOW,
        { 
          reason: 'Invalid email format',
          email: body.email,
          ipAddress,
          userAgent 
        }
      );
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Định dạng email không hợp lệ' 
        },
        { status: 400 }
      );
    }
    
    // Validate password strength
    const passwordValidation = isValidPassword(body.password);
    if (!passwordValidation.valid) {
      logger.error('❌ Register API: Weak password');
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.REGISTRATION_FAILED,
        SecuritySeverity.LOW,
        { 
          reason: 'Weak password',
          email: body.email,
          ipAddress,
          userAgent 
        }
      );
      
      return NextResponse.json(
        { 
          success: false,
          error: passwordValidation.message 
        },
        { status: 400 }
      );
    }
    
    // Validate password confirmation
    if (body.password !== body.confirmPassword) {
      logger.error('❌ Register API: Password confirmation mismatch');
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.REGISTRATION_FAILED,
        SecuritySeverity.LOW,
        { 
          reason: 'Password confirmation mismatch',
          email: body.email,
          ipAddress,
          userAgent 
        }
      );
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Xác nhận mật khẩu không khớp' 
        },
        { status: 400 }
      );
    }
    
    // Forward registration request to backend
    const backendResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': ipAddress,
        'User-Agent': userAgent,
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        fullName: body.fullName,
      }),
    });
    
    const responseData: BackendRegisterResponse = await backendResponse.json();
    
    if (!backendResponse.ok) {
      logger.error('❌ Register API: Backend registration failed:', responseData);
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.REGISTRATION_FAILED,
        SecuritySeverity.MEDIUM,
        { 
          reason: 'Backend registration failed',
          email: body.email,
          ipAddress,
          userAgent,
          backendError: responseData.message || 'Unknown error'
        }
      );
      
      // Handle specific error cases
      if (backendResponse.status === 409) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Email đã được sử dụng' 
          },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Đăng ký thất bại' 
        },
        { status: backendResponse.status }
      );
    }
    
    if (!responseData.success || !responseData.user) {
      logger.error('❌ Register API: Invalid response from backend');
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.REGISTRATION_FAILED,
        SecuritySeverity.MEDIUM,
        { 
          reason: 'Invalid backend response',
          email: body.email,
          ipAddress,
          userAgent 
        }
      );
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Đăng ký thất bại' 
        },
        { status: 500 }
      );
    }
    
    // Log successful registration
    SecurityAuditLogger.logEvent(
      SecurityEventType.REGISTRATION_SUCCESS,
      SecuritySeverity.LOW,
      { 
        userId: responseData.user.id,
        email: responseData.user.email,
        fullName: responseData.user.fullName || "",
        role: responseData.user.role,
        ipAddress,
        userAgent 
      }
    );
    
    logger.info('✅ Register API: User registered successfully:', {
      userId: responseData.user.id,
      email: responseData.user.email,
      role: responseData.user.role,
    });
    
    return NextResponse.json({
      success: true,
      user: responseData.user,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
    });
    
  } catch (error) {
    logger.error('❌ Register API: Unexpected error:', error);
    
    // Log security event
    SecurityAuditLogger.logEvent(
      SecurityEventType.REGISTRATION_FAILED,
      SecuritySeverity.HIGH,
      { 
        error: error instanceof Error ? error.message : String(error),
        ipAddress,
        userAgent 
      }
    );
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Đã xảy ra lỗi trong quá trình đăng ký' 
      },
      { status: 500 }
    );
  }
}

/**
 * Method not allowed for other HTTP methods
 */
export async function GET(): Promise<NextResponse> {
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
