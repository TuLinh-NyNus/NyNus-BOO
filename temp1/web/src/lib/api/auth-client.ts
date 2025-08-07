import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

import CookieAuthClient from '@/lib/auth/cookie-auth-client';
import { ClientCookieManager } from '@/lib/auth/cookie-manager';
import { ClientCSRFManager } from '@/lib/auth/csrf';
import logger from '@/lib/utils/logger';

/**
 * Interface cho API response
 */
interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  statusCode: number;
}

/**
 * Interface cho authentication response
 */
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserData;
}

/**
 * Interface cho user data
 */
interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho login credentials
 */
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Interface cho register data
 */
interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  confirmPassword: string;
}

/**
 * Interface cho token refresh response
 */
interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Interface cho queue item trong failed requests
 */
interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}

/**
 * Interface cho error response
 */
interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
  path?: string;
}

/**
 * Cookie-based Authentication Client
 * No localStorage constants needed - using secure httpOnly cookies
 */

/**
 * Authentication API Client với token management
 * 
 * Features:
 * - Automatic token attachment
 * - Token refresh logic
 * - Request/response interceptors
 * - Error handling
 * - Retry logic
 */
class AuthApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: '/api', // Use Next.js API routes instead of direct backend
      timeout: 30000,
      withCredentials: true, // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request và response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - cookie-based auth với CSRF protection
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // For cookie-based auth, always include credentials
        config.withCredentials = true;

        const token = this.getAccessToken();
        if (token === 'cookie-based') {
          logger.info('🍪 AuthClient: Using cookie-based authentication');
        } else {
          logger.info('⚠️ AuthClient: No authentication token available');
        }

        // Add CSRF protection cho state-changing requests
        if (ClientCSRFManager.requiresCSRFProtection(config.method || 'GET')) {
          try {
            const headersObj = config.headers as Record<string, string> || {};
            const updatedHeaders = await ClientCSRFManager.addCSRFHeader(headersObj);
            Object.assign(config.headers, updatedHeaders);
          } catch (error) {
            logger.warn('⚠️ AuthClient: Failed to add CSRF token:', error);
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue request while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken || refreshToken !== 'cookie-based') {
              throw new Error('No valid refresh token available');
            }

            logger.info('🔄 AuthClient: Attempting token refresh with cookies');

            // For cookie-based refresh, we don't need to send refresh token in body
            // The refresh token is automatically sent in httpOnly cookie
            const refreshResponse = await this.axiosInstance.post('/auth/refresh', {});
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

            await this.setTokens(accessToken, newRefreshToken);
            this.processQueue(null);

            logger.info('✅ AuthClient: Token refresh successful');

            // Retry original request
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            logger.error('❌ AuthClient: Token refresh failed:', refreshError);

            this.processQueue(refreshError);
            await this.clearTokens();

            // Redirect to login
            if (typeof window !== 'undefined') {
              logger.info('🔄 AuthClient: Redirecting to login page');
              window.location.href = '/auth/login';
            }

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: unknown): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.failedQueue = [];
  }

  /**
   * Get access token from storage
   * Pure cookie-based authentication - no localStorage fallback
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Use secure httpOnly cookies exclusively
    if (ClientCookieManager.hasAuthCookies()) {
      logger.info('🍪 AuthClient: Using cookie-based authentication');
      return 'cookie-based'; // Placeholder - actual token is in httpOnly cookie
    }

    logger.info('⚠️ AuthClient: No authentication cookies found');
    return null;
  }

  /**
   * Get refresh token from storage
   * Pure cookie-based authentication - no localStorage fallback
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Use secure httpOnly cookies exclusively
    if (ClientCookieManager.hasAuthCookies()) {
      logger.info('🍪 AuthClient: Using cookie-based refresh token');
      return 'cookie-based'; // Placeholder - actual token is in httpOnly cookie
    }

    logger.info('⚠️ AuthClient: No refresh token cookies found');
    return null;
  }

  /**
   * Set tokens in storage
   * Pure cookie-based authentication - no localStorage fallback
   */
  private async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      logger.info('🍪 AuthClient: Setting tokens in secure cookies');

      // Use cookie-based authentication exclusively
      const success = await CookieAuthClient.setAuthTokens({
        accessToken,
        refreshToken: refreshToken || '',
        expiresIn: 15 * 60, // 15 minutes
      });

      if (success) {
        logger.info('✅ AuthClient: Tokens set in secure cookies successfully');
      } else {
        logger.error('❌ AuthClient: Failed to set authentication cookies');
        throw new Error('Failed to set authentication cookies');
      }

    } catch (error) {
      logger.error('❌ AuthClient: Error setting tokens:', error);
      throw error; // Re-throw để caller có thể handle
    }
  }

  /**
   * Clear tokens from storage
   * Pure cookie-based authentication - no localStorage cleanup needed
   */
  private async clearTokens(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      logger.info('🍪 AuthClient: Clearing authentication cookies');

      // Clear secure httpOnly cookies
      await CookieAuthClient.clearAuthTokens();

      logger.info('✅ AuthClient: Authentication cookies cleared successfully');

    } catch (error) {
      logger.error('❌ AuthClient: Error clearing authentication cookies:', error);
      throw error; // Re-throw để caller có thể handle
    }
  }



  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): never {
    const errorResponse = error.response?.data as ApiErrorResponse;
    
    let message = 'Đã xảy ra lỗi không xác định';
    
    if (errorResponse?.message) {
      message = Array.isArray(errorResponse.message) 
        ? errorResponse.message.join(', ')
        : errorResponse.message;
    } else if (error.message) {
      message = error.message;
    }

    throw new Error(message);
  }

  /**
   * Generic request method
   */
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const apiResponse: AxiosResponse<ApiResponse<T>> = await this.axiosInstance(config);
      return apiResponse.data.data || (apiResponse.data as T);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * Set authentication tokens
   * Updated để use async cookie-based storage
   */
  async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.setTokens(accessToken, refreshToken);
  }

  /**
   * Clear authentication
   * Updated để use async cookie-based clearing
   */
  async clearAuth(): Promise<void> {
    await this.clearTokens();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get current access token
   */
  getCurrentToken(): string | null {
    return this.getAccessToken();
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserData> {
    return this.get<UserData>('/auth/me');
  }

  /**
   * Login user
   */
  async login(email: string, password: string, rememberMe?: boolean): Promise<AuthResponse> {
    const credentials: LoginCredentials = { email, password, rememberMe };
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  /**
   * Register user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', userData);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.post('/auth/logout');
    await this.clearTokens();
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<TokenRefreshResponse> {
    return this.post<TokenRefreshResponse>('/auth/refresh');
  }

  /**
   * Validate current token
   */
  async validateToken(): Promise<any> {
    return this.post('/auth/token');
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<any> {
    return this.post('/auth/forgot-password', { email });
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<any> {
    return this.post('/auth/reset-password', { token, newPassword, confirmPassword });
  }

  /**
   * Get CSRF token
   */
  async getCSRFToken(): Promise<any> {
    return this.get('/auth/csrf-token');
  }

  /**
   * Clear authentication cookies
   */
  async clearCookies(): Promise<any> {
    return this.post('/auth/clear-cookies');
  }
}

// Export singleton instance
export const authApiClient = new AuthApiClient();
export default authApiClient;
