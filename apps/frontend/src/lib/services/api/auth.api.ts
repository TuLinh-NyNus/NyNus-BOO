/**
 * Auth API Service
 * Service cho authentication API calls với backend
 * Xử lý login, logout, token management
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { 
  isGrpcError, 
  getGrpcErrorMessage, 
  logGrpcError
} from '@/lib/grpc/errors';
import { AuthService as GrpcAuthService, AuthHelpers } from '@/services/grpc/auth.service';
import type { LoginResponse as PbLoginResponse, RegisterResponse as PbRegisterResponse, User as PbUser } from '@/generated/v1/user_pb';
import { UserRole, UserStatus } from '@/lib/types/user/roles';

// gRPC Error interface for consistent error handling
interface AuthError {
  code: number;
  message: string;
  details?: string;
}

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


// ===== UTILITY FUNCTIONS =====

/**
 * Map backend role string to UserRole enum
 */
function mapBackendRoleToUserRole(backendRole: 'admin' | 'teacher' | 'student'): UserRole {
  switch (backendRole.toLowerCase()) {
    case 'admin':
      return UserRole.ADMIN;
    case 'teacher':
      return UserRole.TEACHER;
    case 'student':
      return UserRole.STUDENT;
    default:
      return UserRole.STUDENT; // Default fallback
  }
}

/**
 * Convert backend user to frontend user format
 */
function mapBackendUserToFrontend(backendUser: BackendUser) {
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    role: mapBackendRoleToUserRole(backendUser.role),
    avatar: undefined, // Backend không có avatar trong response
    isActive: backendUser.isActive,
    lastLoginAt: new Date(), // Set current time as last login
    createdAt: new Date(backendUser.createdAt), // Convert to Date
    updatedAt: new Date(backendUser.updatedAt), // Convert to Date
    // Required fields for User interface
    status: backendUser.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE,
    emailVerified: true, // Assume verified for logged in users
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

// ===== gRPC MAPPERS =====

type FrontendRole = 'student' | 'teacher' | 'admin';

type ProtoUserLike = {
  getId: () => string;
  getEmail: () => string;
  getFirstName?: () => string;
  getLastName?: () => string;
  getName?: () => string;
  getRole?: () => unknown;
  getIsActive?: () => boolean;
  getCreatedAt?: () => string;
  getUpdatedAt?: () => string;
};

function mapProtoRoleToFrontend(role: unknown): FrontendRole {
  if (typeof role === 'string') {
    const r = role.toUpperCase();
    if (r.includes('ADMIN')) return 'admin';
    if (r.includes('TEACH')) return 'teacher';
    if (r.includes('STUDENT')) return 'student';
  }
  if (typeof role === 'number') {
    // Guess common mapping: 1-STUDENT, 2-TEACHER, 3-ADMIN
    if (role === 3) return 'admin';
    if (role === 2) return 'teacher';
    return 'student';
  }
  return 'student';
}

function mapGrpcUserToBackendUser(grpcUser: PbUser | undefined): BackendUser {
  if (!grpcUser) {
    return {
      id: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'student',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  const like = grpcUser as unknown as ProtoUserLike;
  const id = like.getId();
  const email = like.getEmail();
  // Some builds have first_name/last_name, others have name
  const name = like.getName ? like.getName() : undefined;
  const firstName = like.getFirstName ? like.getFirstName() : (name ? String(name).split(' ')[0] : '');
  const lastName = like.getLastName ? like.getLastName() : (name ? String(name).split(' ').slice(1).join(' ') : '');
  const role = mapProtoRoleToFrontend(like.getRole ? like.getRole() : undefined);
  const isActive = like.getIsActive ? !!like.getIsActive() : true;
  const createdAt = like.getCreatedAt ? like.getCreatedAt() : new Date().toISOString();
  const updatedAt = like.getUpdatedAt ? like.getUpdatedAt() : new Date().toISOString();
  return {
    id: String(id),
    email: String(email),
    firstName: String(firstName || ''),
    lastName: String(lastName || ''),
    role,
    isActive,
    createdAt: String(createdAt),
    updatedAt: String(updatedAt),
  };
}

function mapGrpcErrorToAuthError(err: unknown): AuthError {
  logGrpcError(err, 'AuthService');
  
  const message = getGrpcErrorMessage(err);
  let code = 13; // INTERNAL (default)

  if (isGrpcError(err)) {
    code = err.code;
  }

  return { code, message };
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
      throw new Error('Email và mật khẩu là bắt buộc');
    }

    if (!isValidEmail(payload.email)) {
      throw new Error('Email không hợp lệ');
    }

    if (!isValidPassword(payload.password)) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    try {
      // gRPC-Web login
const resp = await GrpcAuthService.login(payload.email, payload.password);
      const accessToken = (resp as unknown as PbLoginResponse).getAccessToken();
      const refreshToken = (resp as unknown as PbLoginResponse).getRefreshToken();

      // Save tokens using shared helper
      if (typeof window !== 'undefined') {
        AuthHelpers.saveTokens(accessToken, refreshToken);
      }

      // Map gRPC user to backend user shape then to frontend
const grpcUser = (resp as unknown as PbLoginResponse).getUser();
      const backendUser: BackendUser = grpcUser
        ? mapGrpcUserToBackendUser(grpcUser)
        : {
            id: '',
            email: payload.email,
            firstName: '',
            lastName: '',
            role: 'student',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

      // Persist for backward compatibility with existing consumers
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(backendUser));
      }

      const user = mapBackendUserToFrontend(backendUser);
      return {
        token: accessToken,
        user,
      };

    } catch (error) {
      const authError = mapGrpcErrorToAuthError(error);
      
      // Customize messages for specific error codes
      let userMessage = authError.message;
      switch (authError.code) {
        case 16: // UNAUTHENTICATED
          userMessage = 'Email hoặc mật khẩu không chính xác';
          break;
        case 7: // PERMISSION_DENIED
          userMessage = 'Tài khoản đã bị vô hiệu hóa';
          break;
        case 5: // NOT_FOUND
          userMessage = 'Không tìm thấy tài khoản với email này';
          break;
      }
      
      throw new Error(userMessage);
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
      throw new Error('Email, mật khẩu và họ tên là bắt buộc');
    }

    if (!isValidEmail(payload.email)) {
      throw new Error('Email không hợp lệ');
    }

    if (!isValidPassword(payload.password)) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    try {
      // gRPC-Web register
      const resp = await GrpcAuthService.register({
        email: payload.email,
        password: payload.password,
        firstName: payload.firstName,
        lastName: payload.lastName || ''
      });

      const grpcUser = (resp as unknown as PbRegisterResponse).getUser();
      const backendUser: BackendUser = grpcUser
        ? mapGrpcUserToBackendUser(grpcUser)
        : {
            id: '',
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName || '',
            role: 'student',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

      return {
        message: 'Đăng ký thành công',
        user: mapBackendUserToFrontend(backendUser),
      };

    } catch (error) {
      const authError = mapGrpcErrorToAuthError(error);
      
      // Customize messages for specific error codes
      let userMessage = authError.message;
      if (authError.code === 6) { // ALREADY_EXISTS
        userMessage = 'Email đã được sử dụng';
      }
      
      throw new Error(userMessage);
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
  if (!isGrpcError(error)) return false;
  return error.code === 16 || error.code === 7; // UNAUTHENTICATED || PERMISSION_DENIED
}

/**
 * Get auth-specific error message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (isGrpcError(error)) {
    switch (error.code) {
      case 16: // UNAUTHENTICATED
        return 'Thông tin đăng nhập không chính xác';
      case 7: // PERMISSION_DENIED
        return 'Tài khoản không có quyền truy cập';
      case 5: // NOT_FOUND
        return 'Không tìm thấy tài khoản';
      case 6: // ALREADY_EXISTS
        return 'Email đã được sử dụng';
      case 3: // INVALID_ARGUMENT
        return 'Thông tin không hợp lệ';
      default:
        return getGrpcErrorMessage(error);
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Đã xảy ra lỗi đăng nhập';
}
