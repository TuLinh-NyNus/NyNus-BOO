'use client';

import logger from '@/lib/utils/logger';

/**
 * Lấy token từ cookie hoặc localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Ưu tiên lấy từ cookie
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('api_auth_token='));
  if (authCookie) {
    const token = authCookie.split('=')[1];
    if (token) {
      logger.debug('Sử dụng token từ cookie');
      return token;
    }
  }

  // Fallback về localStorage
  const localToken = localStorage.getItem('authToken') || localStorage.getItem('token');
  if (localToken) {
    logger.debug('Sử dụng token từ localStorage');
    return localToken;
  }

  logger.debug('Không tìm thấy token');
  return null;
}

/**
 * Utility function để thực hiện API call với token
 * Hỗ trợ cả trường hợp server-side và client-side
 * Sử dụng AuthContext token để xác thực
 */
export async function fetchWithAuth(url: string, Options: RequestInit = {}) {
  try {
    let token = '';
    let redirectAttempted = false;

    // Lấy token từ cookie hoặc localStorage
    const authToken = getAuthToken();
    if (authToken) {
      token = authToken;
    }

    // Merge headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    // Thực hiện request
    const response = await fetch(url, {
      ...options,
      headers,
      // Thêm cache: 'no-store' để tránh cache trên trình duyệt
      cache: 'no-store',
    });

    // Nếu response status là 401 Unauthorized hoặc 403 Forbidden
    if ((response.status === 401 || response.status === 403) && !redirectAttempted) {
      logger.error('Lỗi xác thực:', response.status);
      redirectAttempted = true;

      // Nếu đang ở client-side, xóa token và chuyển hướng
      if (typeof window !== 'undefined') {
        // Xóa token từ localStorage và cookie
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        document.cookie = 'api_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Lấy đường dẫn hiện tại
        const currentPath = window.location.pathname;

        // Xác định URL đăng nhập dựa vào đường dẫn hiện tại
        let loginUrl = '/auth/signin'; // Mặc định cho website chung

        // Nếu truy cập trang admin, chuyển về trang đăng nhập admin
        if (currentPath.includes('/3141592654') ||
            currentPath.includes('/admin')) {
          loginUrl = '/3141592654'; // Trang đăng nhập admin
        }

        // Tránh redirect loop - chỉ redirect nếu không đang ở trang đăng nhập
        if (currentPath !== loginUrl &&
            currentPath !== '/auth/signin' &&
            currentPath !== '/3141592654') {
          // Lưu URL hiện tại vào localStorage để redirect sau khi đăng nhập
          localStorage.setItem('redirectAfterLogin', currentPath);

          // Kiểm tra nếu không phải là API call (không bắt đầu bằng /api)
          if (!currentPath.startsWith('/api')) {
            // Nếu đường dẫn chứa 'inputques', không chuyển hướng
            if (currentPath.includes('inputques')) {
              logger.debug(`Không chuyển hướng từ trang ${currentPath} để tránh vòng lặp`);
            } else {
              logger.debug(`Chuyển hướng đến ${loginUrl} từ ${currentPath}`);
              window.location.href = loginUrl;
            }
          } else {
            logger.debug('Không chuyển hướng vì đây là API call');
          }
        } else {
          logger.debug('Không chuyển hướng vì đã ở trang đăng nhập');
        }
      }

      // Trả về response lỗi
      return response;
    }

    return response;
  } catch (error) {
    logger.error('API call error:', error);
    // Trả về lỗi để xử lý ở cấp cao hơn
    throw error;
  }
}
