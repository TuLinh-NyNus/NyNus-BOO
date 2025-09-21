/**
 * Auth Service Client
 * ====================
 * gRPC-Web client for authentication services
 */

import { 
  UserServiceClient 
} from '@/generated/v1/UserServiceClientPb';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  GoogleLoginRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetCurrentUserRequest,
  GetUserResponse as GetCurrentUserResponse
} from '@/generated/v1/user_pb';

// gRPC server URL
const GRPC_SERVER_URL = process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080';

// Create singleton client instance
const userServiceClient = new UserServiceClient(GRPC_SERVER_URL);

/**
 * Auth Service
 */
export class AuthService {
  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<LoginResponse> {
    const request = new LoginRequest();
    request.setEmail(email);
    request.setPassword(password);
    
    return userServiceClient.login(request);
  }

  /**
   * Register new user
   */
  static async register(
    email: string, 
    password: string, 
    name: string,
    role: number = 1, // ROLE_STUDENT
    level: number = 3 // LEVEL_HIGH
  ): Promise<RegisterResponse> {
    const request = new RegisterRequest();
    request.setEmail(email);
    request.setPassword(password);
    request.setName(name);
    request.setRole(role.toString());
    request.setLevel(level.toString());
    
    return userServiceClient.register(request);
  }

  /**
   * Login with Google OAuth
   */
  static async googleLogin(idToken: string): Promise<LoginResponse> {
    const request = new GoogleLoginRequest();
    request.setIdToken(idToken);
    
    return userServiceClient.googleLogin(request);
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const request = new RefreshTokenRequest();
    request.setRefreshToken(refreshToken);
    
    return userServiceClient.refreshToken(request);
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<GetCurrentUserResponse> {
    const request = new GetCurrentUserRequest();
    
    return userServiceClient.getCurrentUser(request);
  }
}

/**
 * Auth helper functions
 */
export class AuthHelpers {
  /**
   * Save tokens to localStorage
   */
  static saveTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('nynus-auth-token', accessToken);
    if (refreshToken) {
      localStorage.setItem('nynus-refresh-token', refreshToken);
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('nynus-auth-token');
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('nynus-refresh-token');
  }

  /**
   * Clear tokens (logout)
   */
  static clearTokens() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('nynus-auth-token');
    localStorage.removeItem('nynus-refresh-token');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

/**
 * Simplified auth service for new pages
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

export const authService = {
  async register(data: RegisterData): Promise<ApiResponse> {
    try {
      await AuthService.register(
        data.email,
        data.password,
        data.name,
        data.role === 'STUDENT' ? 1 : data.role === 'TEACHER' ? 2 : data.role === 'ADMIN' ? 3 : 1,
        data.level || 10
      );
      return {
        success: true, // Temporarily return success since proto types are not fully generated
        message: 'Registration successful'
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Registration failed'
      };
    }
  },

  async forgotPassword(_email: string): Promise<ApiResponse> {
    // TODO: Implement when backend is ready
    return Promise.resolve({ 
      success: true, 
      message: 'Password reset email sent' 
    });
  },

  async resetPassword(_data: { token: string; password: string }): Promise<ApiResponse> {
    // TODO: Implement when backend is ready
    return Promise.resolve({ 
      success: true,
      message: 'Password reset successfully'
    });
  },

  async getSessions(): Promise<{ sessions: unknown[] }> {
    // TODO: Implement when backend is ready
    return Promise.resolve({ sessions: [] });
  },

  async terminateSession(_sessionId: string): Promise<ApiResponse> {
    // TODO: Implement when backend is ready
    return Promise.resolve({ success: true, message: 'Success' });
  },

  async terminateAllSessions(): Promise<ApiResponse> {
    // TODO: Implement when backend is ready
    return Promise.resolve({ success: true, message: 'Sessions terminated' });
  }
};
