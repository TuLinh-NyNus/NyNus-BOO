// Thêm comment để tắt linter cho file này
/* eslint-disable import/order */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import logger from '@/lib/utils/logger';
/* eslint-enable import/order */

// Hằng số
const API_URL = process.env.API_URL || 'http://localhost:5000';

export async function middleware(request: NextRequest) {
  // Kiểm tra nếu là API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Bỏ qua các route auth để tránh vòng lặp vô hạn
    if (request.nextUrl.pathname.startsWith('/api/auth/login') ||
        request.nextUrl.pathname.startsWith('/api/auth/token')) {
      return NextResponse.next();
    }

    // Chuyển tiếp token từ cookie sang header
    const apiAuthToken = request.cookies.get('api_auth_token')?.value;

    if (apiAuthToken) {
      logger.debug('Middleware: Thêm token vào API request', {
        path: request.nextUrl.pathname,
        tokenLength: apiAuthToken.length
      });

      // Tạo headers mới với token
      const headers = new Headers(request.headers);
      headers.set('Authorization', `Bearer ${apiAuthToken}`);

      // Trả về response với headers mới
      return NextResponse.next({
        request: {
          headers
        }
      });
    } else {
      logger.debug('Middleware: Không tìm thấy api_auth_token trong cookie', {
        path: request.nextUrl.pathname,
        cookies: request.cookies.getAll().map(c => c.name)
      });

      // Nếu là API route quan trọng và không có token, chuyển hướng đến trang đăng nhập
      if (request.nextUrl.pathname.startsWith('/api/admin/')) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
    }
  }

  // Kiểm tra nếu đang truy cập vào route admin
  if (request.nextUrl.pathname.startsWith('/3141592654/admin')) {
    try {
      // Lấy JWT token từ cookie
      const apiAuthToken = request.cookies.get('api_auth_token')?.value;

      // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
      if (!apiAuthToken) {
        // Lưu lại URL hiện tại để redirect sau khi đăng nhập
        const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
        return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url));
      }

      // TODO: Có thể thêm logic verify token và check role ở đây nếu cần
      // Hiện tại chỉ check có token hay không

    } catch (error) {
      logger.error('Middleware error:', error);
      // Nếu có lỗi, chuyển hướng về trang đăng nhập
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Kiểm tra nếu đang truy cập vào route /3141592654 mà không phải /3141592654/admin
  if (request.nextUrl.pathname === '/3141592654') {
    try {
      // Lấy JWT token từ cookie
      const apiAuthToken = request.cookies.get('api_auth_token')?.value;

      // Kiểm tra đã đăng nhập chưa
      if (!apiAuthToken) {
        // Nếu chưa đăng nhập, chuyển đến trang đăng nhập với callback
        const callbackUrl = encodeURIComponent('/3141592654');
        return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url));
      }

      // Nếu đã đăng nhập, chuyển hướng đến trang dashboard
      // TODO: Có thể thêm logic check role từ token nếu cần
      logger.debug('User authenticated, redirecting to dashboard');
      return NextResponse.redirect(new URL('/3141592654/admin/dashboard', request.url));

    } catch (error) {
      logger.error('Middleware error at /3141592654:', error);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route admin, trang admin chính và API
export const config = {
  matcher: ['/3141592654/admin/:path*', '/3141592654', '/api/:path*'],
};
