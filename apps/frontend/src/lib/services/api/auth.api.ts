/**
 * Auth API Service
 * Service cho authentication API calls với backend
 * Xử lý login, logout, token management
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { apiPost, isAPIError } from '@/lib/api/client';
import type { APIError } from '@/lib/api/client';

// ===== TYPES =====

/**
 * Login request payload
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * User information từ backend
 */
export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login response từ backend
 */
export interface LoginResponse {
  accessToken: string;
  user: BackendUser;
}

/**
 * Register request payload (dự phòng)
 */
export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'teacher';
}

/**
 * Register response từ backend
 */
export interface RegisterResponse {
  message: string;
  user: BackendUser;
}

/**
 * Auth error codes
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_INACTIVE = 'USER_INACTIVE',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// ===== CONSTANTS =====

/**
 * localStorage keys
 */
const AUTH_TOKEN_KEY = 'nynus-auth-token';
const AUTH_USER_KEY = 'nynus-auth-user';

/**
 * API endpoints
 */
const AUTH_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
} as const;

// ===== UTILITY FUNCTIONS =====

/**
 * Convert backend user to frontend user format
 */
function mapBackendUserToFrontend(backendUser: BackendUser) {
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    role: backendUser.role,
    avatar: undefined, // Backend không có avatar trong response
    isActive: backendUser.isActive,
    lastLoginAt: new Date(), // Set current time as last login
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
  };
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
function isValidPassword(password: string): boolean {
  // Tối thiểu 6 ký tự
  return password.length >= 6;
}

// ===== MAIN AUTH SERVICE =====

/**
 * Auth API Service class
 */
export class AuthService {
  /**
   * Đăng nhập với email/password
   */
  static async login(payload: LoginPayload): Promise<{
    token: string;
    user: ReturnType<typeof mapBackendUserToFrontend>;
  }> {
    // Validate input
    if (!payload.email || !payload.password) {
      throw {
        status: 400,
        statusText: 'Bad Request',
        message: 'Email và mật khẩu là bắt buộc',
      } as APIError;
    }

    if (!isValidEmail(payload.email)) {
      throw {
        status: 400,
        statusText: 'Bad Request',
        message: 'Email không hợp lệ',
      } as APIError;
    }

    if (!isValidPassword(payload.password)) {
      throw {
        status: 400,
        statusText: 'Bad Request',
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      } as APIError;
    }

    try {
      // Gọi API login (skip auth vì chưa có token)
      const response = await apiPost<LoginResponse>(
        AUTH_ENDPOINTS.LOGIN,
        payload,
        { skipAuth: true }
      );

      // Lưu token vào localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
      }

      // Convert user format
      const user = mapBackendUserToFrontend(response.user);

      return {
        token: response.accessToken,
        user,
      };

    } catch (error) {
      // Handle specific auth errors
      if (isAPIError(error)) {
        // Customize error messages
        if (error.status === 401) {
          throw {
            ...error,
            message: 'Email hoặc mật khẩu không chính xác'
          };
        } else if (error.status === 403) {
          throw {
            ...error,
            message: 'Tài khoản đã bị vô hiệu hóa'
          };
        } else if (error.status === 404) {
          throw {
            ...error,
            message: 'Không tìm thấy tài khoản với email này'
          };
        }
      }
      
      throw error;
    }
  }

  /**
   * Đăng ký tài khoản mới (dự phòng)
   */
  static async register(payload: RegisterPayload): Promise<{
    message: string;
    user: ReturnType<typeof mapBackendUserToFrontend>;
  }> {
    // Validate input
    if (!payload.email || !payload.password || !payload.firstName) {
      throw {
        status: 400,
        statusText: 'Bad Request',
        message: 'Email, mật khẩu và họ tên là bắt buộc',
      } as APIError;
    }

    if (!isValidEmail(payload.email)) {
      throw {
        status: 400,
        statusText: 'Bad Request',
        message: 'Email không hợp lệ',
      } as APIError;
    }

    if (!isValidPassword(payload.password)) {
      throw {
        status: 400,
        statusText: 'Bad Request',
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      } as APIError;
    }

    try {
      // Gọi API register (skip auth vì chưa có token)
      const response = await apiPost<RegisterResponse>(
        AUTH_ENDPOINTS.REGISTER,
        payload,
        { skipAuth: true }
      );

      // Convert user format
      const user = mapBackendUserToFrontend(response.user);

      return {
        message: response.message,
        user,
      };

    } catch (error) {
      // Handle specific register errors
      if (isAPIError(error)) {
        if (error.status === 409) {
          throw {
            ...error,
            message: 'Email đã được sử dụng'
          };
        }
      }
      
      throw error;
    }
  }

  /**
   * Lấy token từ localStorage
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Lấy user từ localStorage
   */
  static getStoredUser(): ReturnType<typeof mapBackendUserToFrontend> | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem(AUTH_USER_KEY);
      if (!userStr) return null;
      
      const backendUser = JSON.parse(userStr) as BackendUser;
      return mapBackendUserToFrontend(backendUser);
    } catch {
      // Clear corrupted data
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  }

  /**
   * Xóa token và user khỏi localStorage
   */
  static clearAuth(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  /**
   * Kiểm tra xem có token hợp lệ không
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  /**
   * Validate token format (basic check)
   */
  static isTokenValid(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // JWT should have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
  }
}

// ===== UTILITY EXPORTS =====

/**
 * Check if error is authentication error
 */
export function isAuthError(error: unknown): boolean {
  return isAPIError(error) && (error.status === 401 || error.status === 403);
}

/**
 * Get auth-specific error message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    switch (error.status) {
      case 401:
        return 'Thông tin đăng nhập không chính xác';
      case 403:
        return 'Tài khoản không có quyền truy cập';
      case 404:
        return 'Không tìm thấy tài khoản';
      case 409:
        return 'Email đã được sử dụng';
      case 422:
        return 'Thông tin không hợp lệ';
      default:
        return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Đã xảy ra lỗi đăng nhập';
}
