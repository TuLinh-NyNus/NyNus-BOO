import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import logger from '@/lib/utils/logger';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * API route để lấy token mới từ API backend
 * @param request NextRequest
 * @returns NextResponse với token mới
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('API Token: Đang lấy token');

    // Lấy token từ cookie
    const cookieStore = cookies();
    const apiAuthToken = cookieStore.get('api_auth_token')?.value;

    // Nếu có token trong cookie, trả về token đó
    if (apiAuthToken) {
      logger.debug('API Token: Đã tìm thấy token trong cookie', {
        tokenLength: apiAuthToken.length
      });

      return NextResponse.json({
        success: true,
        accessToken: apiAuthToken,
        source: 'cookie'
      });
    }

    // Nếu không có token trong cookie, verify với backend
    logger.debug('API Token: Không tìm thấy token trong cookie');

    // Kiểm tra xem có token trong Authorization header không
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (bearerToken) {
      // Verify token với backend
      const apiUrl = process.env.API_URL || 'http://localhost:5000';

      try {
        const response = await fetch(`${apiUrl}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();

          logger.info('API Token: Token hợp lệ, trả về user info', {
            userEmail: userData.user?.email
          });

          return NextResponse.json({
            success: true,
            user: userData.user,
            token: bearerToken
          });
        } else {
          logger.debug('API Token: Token không hợp lệ hoặc đã hết hạn');
        }
      } catch (error) {
        logger.error('API Token: Lỗi khi verify token với backend:', error);
      }
    }

    // Không có token hợp lệ
    logger.debug('API Token: Không có token hợp lệ, cần đăng nhập lại');

    return NextResponse.json({
      success: false,
      message: 'Không có token hợp lệ, cần đăng nhập lại'
    }, { status: 401 });
  } catch (error) {
    logger.error('API Token: Lỗi khi xử lý yêu cầu lấy token:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi lấy token',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
