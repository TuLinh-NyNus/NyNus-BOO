/**
 * Auth Service gRPC Client (Clean Implementation)
 * ================================================
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
} from '@/generated/v1/user_pb';
// Import enums from common protobuf
import { UserRole, UserStatus } from '@/generated/common/common_pb';
import { RpcError } from 'grpc-web';
import { AuthHelpers } from '@/lib/utils/auth-helpers';

/**
 * gRPC client configuration
 */
const GRPC_ENDPOINT = process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080';

/**
 * Create UserService client instance
 */
const userServiceClient = new UserServiceClient(GRPC_ENDPOINT);

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
  static async register(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<RegisterResponse> {
    const request = new RegisterRequest();
    request.setEmail(params.email);
    request.setPassword(params.password);
    request.setName(`${params.firstName} ${params.lastName}`);

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
  static async resetPassword(params: {
    token: string;
    newPassword: string;
  }): Promise<ResetPasswordResponse> {
    const request = new ResetPasswordRequest();
    request.setToken(params.token);
    request.setNewPassword(params.newPassword);

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
    const metadata = AuthHelpers.getAuthMetadata();

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
    AuthHelpers.clearAuth();
  }
}

// Export singleton instance for backward compatibility
export const authService = AuthService;

// Export AuthHelpers for convenience
export { AuthHelpers } from '@/lib/utils/auth-helpers';

// Export commonly used enums for convenience
export { UserRole, UserStatus };
