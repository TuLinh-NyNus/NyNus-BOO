import { blacklistTokenClientSafe, BLACKLIST_REASONS } from '@/lib/auth/client-safe-blacklist';
import CookieAuthClient from '@/lib/auth/cookie-auth-client';
import { ClientCSRFManager } from '@/lib/auth/csrf';
import logger from '@/lib/utils/logger';

import { authApiClient } from './auth-client';

/**
 * Interface cho login request
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

/**
 * Interface cho register request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: 'STUDENT' | 'INSTRUCTOR';
}

/**
 * Interface cho user object
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastActiveAt?: string;
  createdAt?: string;
  lastPasswordChange?: string;
  currentSessionId?: string;
}

/**
 * Interface cho login response
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

/**
 * Interface cho register response
 */
export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
  emailVerified: boolean;
  user?: User; // Optional user object for compatibility
}

/**
 * Interface cho forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Interface cho reset password request
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Interface cho change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Authentication Service cho NyNus platform
 * 
 * Service này cung cấp:
 * - Login/logout functionality
 * - User registration
 * - Password management
 * - Token management
 * - User profile management
 */
class AuthService {
  /**
   * Đăng nhập người dùng
   * Updated để use secure cookie-based token storage với CSRF protection
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Ensure CSRF token is available trước khi login
    try {
      await ClientCSRFManager.fetchCSRFToken();
    } catch (error) {
      // Log only in development
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Failed to fetch CSRF token, proceeding with login:', error);
      }
    }

    const response = await authApiClient.post<LoginResponse>('/auth/login', credentials);

    // Store tokens in secure cookies
    await authApiClient.setAuthTokens(response.accessToken, response.refreshToken);

    // Also handle via CookieAuthClient for additional security
    await CookieAuthClient.handleAuthSuccess({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
    });

    return response;
  }

  /**
   * Đăng ký người dùng mới
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return authApiClient.post<RegisterResponse>('/auth/register', userData);
  }

  /**
   * Đăng xuất người dùng
   * Updated để use secure cookie-based token clearing với token blacklisting
   */
  async logout(): Promise<void> {
    try {
      // Get current token before clearing để blacklist it
      const currentToken = this.getCurrentToken();

      // Call backend logout endpoint
      await authApiClient.post('/auth/logout');

      // Blacklist current token để prevent reuse
      if (currentToken) {
        await blacklistTokenClientSafe(currentToken, BLACKLIST_REASONS.LOGOUT);
      }

    } catch (error) {
      // Log error but don't throw - we still want to clear local tokens
      if (process.env.NODE_ENV === 'development') {
        logger.error('Backend logout error:', error);
      }

      // Still blacklist token even if backend call fails
      const currentToken = this.getCurrentToken();
      if (currentToken) {
        await blacklistTokenClientSafe(currentToken, BLACKLIST_REASONS.LOGOUT);
      }
    } finally {
      // Always clear local authentication
      // Clear via auth client
      await authApiClient.clearAuth();

      // Also clear via CookieAuthClient for additional security
      await CookieAuthClient.handleLogout();
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<User> {
    return authApiClient.get<User>('/auth/me');
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(): Promise<{ accessToken: string; refreshToken?: string }> {
    const refreshToken = authApiClient.getCurrentToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await authApiClient.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
      refreshToken,
    });

    // Update stored tokens
    authApiClient.setAuthTokens(response.accessToken, response.refreshToken || refreshToken);

    return response;
  }

  /**
   * Yêu cầu reset mật khẩu
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    return authApiClient.post<{ message: string }>('/auth/forgot-password', request);
  }

  /**
   * Reset mật khẩu với token
   */
  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    return authApiClient.post<{ message: string }>('/auth/reset-password', request);
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
    return authApiClient.post<{ message: string }>('/auth/change-password', request);
  }

  /**
   * Xác thực email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return authApiClient.post<{ message: string }>('/auth/verify-email', { token });
  }

  /**
   * Gửi lại email xác thực
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return authApiClient.post<{ message: string }>('/auth/resend-verification', { email });
  }

  /**
   * Kiểm tra trạng thái authentication
   */
  isAuthenticated(): boolean {
    return authApiClient.isAuthenticated();
  }

  /**
   * Lấy access token hiện tại
   */
  getCurrentToken(): string | null {
    return authApiClient.getCurrentToken();
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    authApiClient.clearAuth();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
