'use client';

import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';
import logger from '@/lib/utils/logger';

interface AuthInitializerProps {
  initialUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  initialToken?: string | null;
}

/**
 * Component để khởi tạo authentication state từ server-side data
 * Được sử dụng để sync authentication state giữa server và client
 */
export function AuthInitializer({ initialUser, initialToken }: AuthInitializerProps) {
  const { user, token } = useAuth();

  // Debug logging để xem data có được truyền vào không
  console.log('AuthInitializer: Props received', {
    hasInitialUser: !!initialUser,
    hasInitialToken: !!initialToken,
    initialUserEmail: initialUser?.email,
    hasCurrentUser: !!user,
    hasCurrentToken: !!token
  });

  useEffect(() => {
    console.log('AuthInitializer: useEffect triggered', {
      hasUser: !!user,
      hasToken: !!token,
      hasInitialUser: !!initialUser,
      hasInitialToken: !!initialToken,
      isClient: typeof window !== 'undefined'
    });

    // Chỉ chạy trong client-side
    if (typeof window === 'undefined') {
      console.log('AuthInitializer: Skipping - running in SSR');
      return;
    }

    // Chỉ khởi tạo nếu client chưa có auth state và server có data
    if (!user && !token && initialUser && initialToken) {
      console.log('AuthInitializer: Bắt đầu khởi tạo auth state từ server data');

      logger.info('AuthInitializer: Khởi tạo auth state từ server data', {
        userEmail: initialUser.email,
        tokenLength: initialToken.length
      });

      try {
        // Set localStorage để persist auth state
        localStorage.setItem('authToken', initialToken);
        localStorage.setItem('user', JSON.stringify(initialUser));

        console.log('AuthInitializer: Đã set localStorage');

        // Trigger một custom event để AuthContext có thể listen
        window.dispatchEvent(new CustomEvent('auth-initialized', {
          detail: { user: initialUser, token: initialToken }
        }));

        console.log('AuthInitializer: Đã dispatch auth-initialized event', {
          userEmail: initialUser.email,
          tokenLength: initialToken.length
        });

        logger.debug('AuthInitializer: Đã set localStorage và dispatch auth-initialized event');

      } catch (error) {
        console.error('AuthInitializer: Lỗi khi set localStorage:', error);
        logger.error('AuthInitializer: Lỗi khi set localStorage:', error);
      }
    } else if (user && token) {
      console.log('AuthInitializer: Client đã có auth state, bỏ qua initialization');
      logger.debug('AuthInitializer: Client đã có auth state, bỏ qua initialization');
    } else if (!initialUser || !initialToken) {
      console.log('AuthInitializer: Server không có auth data');
      logger.debug('AuthInitializer: Server không có auth data');
    }
  }, [initialUser, initialToken, user, token]);

  // Component này không render gì cả, chỉ để khởi tạo state
  return null;
}
