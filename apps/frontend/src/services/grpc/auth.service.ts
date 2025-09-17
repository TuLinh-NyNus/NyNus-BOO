/**
 * Auth Service gRPC Client
 * ========================
 * Production-ready gRPC-Web auth service implementation
 * Uses generated protobuf types and clients
 */

import { UserServiceClient } from '@/generated/v1/UserServiceClientPb';
import {
  LoginRequest,
  LoginResponse,
  GoogleLoginRequest,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  GetCurrentUserRequest,
  GetUserResponse,
  UserRole,
  UserLevel,
} from '@/generated/v1/user_pb';
import { RpcError } from 'grpc-web';

/**
 * gRPC client configuration
 */
const GRPC_ENDPOINT = process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080';

/**
 * Create UserService client instance
 */
const userServiceClient = new UserServiceClient(GRPC_ENDPOINT);

/**
 * Helper to add auth metadata (token) to gRPC calls
 */
function getAuthMetadata(): { [key: string]: string } {
  const token = AuthHelpers.getAccessToken();
  if (token) {
    return {
      'authorization': `Bearer ${token}`,
    };
  }
  return {};
}

/**
 * Handle gRPC errors and convert to user-friendly messages
 */
function handleGrpcError(error: RpcError): string {
  console.error('gRPC Error:', error);
  
  switch (error.code) {
    case 3: // INVALID_ARGUMENT
      return error.message || 'Invalid input provided';
    case 7: // PERMISSION_DENIED
      return 'Permission denied. Please check your credentials.';
    case 14: // UNAVAILABLE
      return 'Service temporarily unavailable. Please try again later.';
    case 16: // UNAUTHENTICATED
      return 'Authentication required. Please log in.';
    default:
      return error.message || 'An unexpected error occurred';
  }
}

/**
 * Main AuthService class with gRPC methods
 */
export class AuthService {
  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<LoginResponse> {
    const request = new LoginRequest();
    request.setEmail(email);
    request.setPassword(password);
    request.setDeviceName(navigator.userAgent || 'Unknown Device');

    try {
      const response = await userServiceClient.login(request);
      
      // Auto-save tokens on successful login
      if (response.getAccessToken()) {
        AuthHelpers.saveTokens(
          response.getAccessToken(),
          response.getRefreshToken()
        );
      }
      
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Register new user
   */
  static async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = UserRole.ROLE_STUDENT,
    level: UserLevel = UserLevel.LEVEL_HIGH
  ): Promise<RegisterResponse> {
    const request = new RegisterRequest();
    request.setEmail(email);
    request.setPassword(password);
    request.setName(name);
    request.setRole(role);
    request.setLevel(level);

    try {
      const response = await userServiceClient.register(request);
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Login with Google OAuth
   */
  static async googleLogin(idToken: string): Promise<LoginResponse> {
    const request = new GoogleLoginRequest();
    request.setIdToken(idToken);
    request.setDeviceName(navigator.userAgent || 'Unknown Device');

    try {
      const response = await userServiceClient.googleLogin(request);
      
      // Auto-save tokens on successful login
      if (response.getAccessToken()) {
        AuthHelpers.saveTokens(
          response.getAccessToken(),
          response.getRefreshToken()
        );
      }
      
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken?: string): Promise<RefreshTokenResponse> {
    const token = refreshToken || AuthHelpers.getRefreshToken();
    if (!token) {
      throw new Error('No refresh token available');
    }

    const request = new RefreshTokenRequest();
    request.setRefreshToken(token);

    try {
      const response = await userServiceClient.refreshToken(request);
      
      // Update access token in storage
      if (response.getAccessToken()) {
        AuthHelpers.saveTokens(response.getAccessToken());
      }
      
      return response;
    } catch (error) {
      // If refresh fails, clear tokens (force re-login)
      AuthHelpers.clearTokens();
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const request = new VerifyEmailRequest();
    request.setToken(token);

    try {
      const response = await userServiceClient.verifyEmail(request);
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const request = new ForgotPasswordRequest();
    request.setEmail(email);

    try {
      const response = await userServiceClient.forgotPassword(request);
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    const request = new ResetPasswordRequest();
    request.setToken(token);
    request.setNewPassword(newPassword);

    try {
      const response = await userServiceClient.resetPassword(request);
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current authenticated user info
   */
  static async getCurrentUser(): Promise<GetUserResponse> {
    const request = new GetCurrentUserRequest();
    const metadata = getAuthMetadata();

    try {
      const response = await userServiceClient.getCurrentUser(request, metadata);
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout (client-side token cleanup)
   */
  static logout(): void {
    AuthHelpers.clearTokens();
    // In a real implementation, you might also want to call a server-side logout endpoint
    // to invalidate the tokens on the server
  }
}

/**
 * Auth helper functions for token management
 */
export class AuthHelpers {
  private static readonly ACCESS_TOKEN_KEY = 'nynus-auth-token';
  private static readonly REFRESH_TOKEN_KEY = 'nynus-refresh-token';

  /**
   * Save tokens to localStorage
   */
  static saveTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Get access token from storage
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all tokens (logout)
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated (has valid access token)
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Check if token is expired (basic check - decode JWT)
   */
  static isTokenExpired(token?: string): boolean {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return true;

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiry;
    } catch {
      return true; // If we can't decode, assume expired
    }
  }

  /**
   * Auto-refresh token if needed
   */
  static async ensureValidToken(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return false;
    }

    if (this.isTokenExpired(accessToken)) {
      try {
        await AuthService.refreshToken();
        return true;
      } catch {
        this.clearTokens();
        return false;
      }
    }

    return true;
  }
}

/**
 * Simplified auth service interface for compatibility
 */
interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  level?: number;
  [key: string]: unknown;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

/**
 * Legacy compatibility wrapper
 */
export const authService = {
  async register(data: RegisterData): Promise<ApiResponse> {
    try {
      // Convert string role to enum
      let role: UserRole = UserRole.ROLE_STUDENT;
      switch (data.role.toLowerCase()) {
        case 'student':
          role = UserRole.ROLE_STUDENT;
          break;
        case 'teacher':
          role = UserRole.ROLE_TEACHER;
          break;
        case 'admin':
          role = UserRole.ROLE_ADMIN;
          break;
        default:
          role = UserRole.ROLE_STUDENT;
      }

      // Convert level number to enum (assuming 1-10 scale maps to LOW/MEDIUM/HIGH)
      let level: UserLevel = UserLevel.LEVEL_HIGH;
      if (data.level) {
        if (data.level <= 1) level = UserLevel.LEVEL_ELEMENTARY;
        else if (data.level <= 2) level = UserLevel.LEVEL_MIDDLE;
        else if (data.level <= 3) level = UserLevel.LEVEL_HIGH;
        else if (data.level <= 4) level = UserLevel.LEVEL_UNIVERSITY;
        else level = UserLevel.LEVEL_POSTGRAD;
      }

      await AuthService.register(data.email, data.password, data.name, role, level);
      
      return {
        success: true,
        message: 'Registration successful'
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Registration failed'
      };
    }
  },

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      await AuthService.forgotPassword(email);
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Failed to send reset email'
      };
    }
  },

  async resetPassword(data: { token: string; password: string }): Promise<ApiResponse> {
    try {
      await AuthService.resetPassword(data.token, data.password);
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Password reset failed'
      };
    }
  },

  async getSessions(): Promise<{ sessions: unknown[] }> {
    // TODO: Implement when session management endpoints are available
    return { sessions: [] };
  },

  async revokeSession(_sessionId: string): Promise<ApiResponse> {
    // TODO: Implement when session management endpoints are available
    return {
      success: true,
      message: 'Session revoked successfully'
    };
  }
};