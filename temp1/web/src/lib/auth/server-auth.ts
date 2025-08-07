import { cookies } from 'next/headers';

import logger from '@/lib/utils/logger';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthData {
  user: User | null;
  token: string | null;
}

/**
 * Server-side function để lấy authentication data từ cookies
 * Sử dụng trong Server Components để verify user authentication
 *
 * ⚠️ WARNING: This function uses cookies() API which forces dynamic rendering
 * Avoid using in layout.tsx or pages that need static generation
 * Use client-side authentication instead for better performance
 */
export async function getServerAuthData(): Promise<AuthData> {
  try {
    const cookieStore = cookies();
    const apiAuthToken = cookieStore.get('api_auth_token')?.value;

    if (!apiAuthToken) {
      logger.debug('getServerAuthData: Không tìm thấy api_auth_token cookie');
      return { user: null, token: null };
    }

    logger.debug('getServerAuthData: Tìm thấy token, đang verify...', {
      tokenLength: apiAuthToken.length
    });

    // Verify token bằng cách gọi API backend
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${apiAuthToken}`,
          'Content-Type': 'application/json'
        },
        // Thêm timeout để tránh hang
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        logger.debug('getServerAuthData: Token không hợp lệ', {
          status: response.status,
          statusText: response.statusText
        });
        return { user: null, token: null };
      }

      const data = await response.json();

      if (!data.user) {
        logger.debug('getServerAuthData: API không trả về user data');
        return { user: null, token: null };
      }

      logger.info('getServerAuthData: Verify token thành công', {
        userEmail: data.user.email,
        userRole: data.user.role
      });

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: data.user.role
        },
        token: apiAuthToken
      };

    } catch (fetchError) {
      logger.error('getServerAuthData: Lỗi khi gọi API verify token:', fetchError);
      return { user: null, token: null };
    }

  } catch (error) {
    logger.error('getServerAuthData: Lỗi khi lấy auth data:', error);
    return { user: null, token: null };
  }
}

/**
 * Helper function để check xem user có authenticated không
 */
export async function isAuthenticated(): Promise<boolean> {
  const { user, token } = await getServerAuthData();
  return !!(user && token);
}

/**
 * Helper function để check xem user có role cụ thể không
 */
export async function hasRole(role: string): Promise<boolean> {
  const { user } = await getServerAuthData();
  return user?.role === role;
}
