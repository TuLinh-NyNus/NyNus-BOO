import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { BackendJwtService } from '@/lib/backend-jwt';
import logger from '@/lib/utils/logger';

/**
 * API route để đăng nhập và lấy token
 * @param request NextRequest
 * @returns NextResponse
 */
// Force reload - debug URL issue
export async function POST(request: NextRequest) {
  try {
    // Lấy thông tin đăng nhập từ request body
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }
    
    logger.info('API Login: Đang gọi API backend để đăng nhập', { email });
    
    // Gọi API backend để đăng nhập - HARDCODE để test
    const fullUrl = 'http://localhost:5000/api/auth/login';

    console.log('[API Login Debug - HARDCODED]', {
      fullUrl,
      env_API_URL: process.env.API_URL
    });

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    // Kiểm tra response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('API Login: Đăng nhập thất bại', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Đăng nhập thất bại',
          error: errorData.message || response.statusText
        },
        { status: response.status }
      );
    }
    
    // Lấy dữ liệu từ response
    const data = await response.json();

    logger.info('API Login: Đăng nhập thành công từ backend', {
      tokenLength: data.accessToken?.length,
      expiresIn: data.expiresIn
    });

    // Lưu backend token vào cookie
    const cookieStore = cookies();

    // Cookie cho server-side (httpOnly)
    cookieStore.set('api_auth_token', data.accessToken, {
      path: '/',
      maxAge: data.expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Cookie cho client-side (không httpOnly để JavaScript có thể đọc)
    cookieStore.set('auth_token', data.accessToken, {
      path: '/',
      maxAge: data.expiresIn,
      httpOnly: false, // Cho phép JavaScript truy cập
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Trả về token cho client
    return NextResponse.json({
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn
    });
  } catch (error) {
    logger.error('API Login: Lỗi khi xử lý đăng nhập', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server khi xử lý đăng nhập',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
