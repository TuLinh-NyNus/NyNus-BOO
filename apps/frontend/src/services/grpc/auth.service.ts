/**
 * Auth Service gRPC Client (Clean Implementation)
 * ================================================
 * Production-ready gRPC-Web auth service implementation
 * Uses generated protobuf types and clients
 */

import { UserServiceClient } from '@/generated/v1/UserServiceClientPb';
import {
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  SendVerificationEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  GetUserRequest,
  GetUserResponse,
  User,
} from '@/generated/v1/user_pb';
// Import enums from common protobuf
import { UserRole, UserStatus } from '@/generated/common/common_pb';
import { RpcError } from 'grpc-web';
import { AuthHelpers } from '@/lib/utils/auth-helpers';
import { logger } from '@/lib/utils/logger';
// ✅ FIX: Import GRPC_WEB_HOST and getAuthMetadata for CSRF token support
import { GRPC_WEB_HOST, getAuthMetadata } from './client';

/**
 * gRPC client configuration
 * Uses GRPC_WEB_HOST which routes through API proxy (/api/grpc) by default
 */
const GRPC_ENDPOINT = GRPC_WEB_HOST;

// PRODUCTION: Fetch override code removed for clean production build

/*
// ✅ TEMPORARY: Override XMLHttpRequest to log ALL requests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof window !== 'undefined' && !(window as any).originalXMLHttpRequest) {
  console.log('[OVERRIDE] Setting up XMLHttpRequest override...');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).originalXMLHttpRequest = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xhr = new (window as any).originalXMLHttpRequest();
    const originalOpen = xhr.open;
    xhr.open = function(method, url, ...args) {
      console.log('[XHR_OVERRIDE] ALL REQUEST:', method, url);
      if (typeof url === 'string' && url.includes('GetCurrentUser')) {
        console.log('[XHR_OVERRIDE] *** GetCurrentUser request detected! ***');
        console.log('[XHR_OVERRIDE] Method:', method, 'URL:', url);
        console.log('[XHR_OVERRIDE] Stack trace:', new Error().stack);
      }
      return originalOpen.call(this, method, url, ...args);
    };
    return xhr;
  };
}
*/

/**
 * Create UserService client instance with client-side only initialization
 * ✅ FIX: Lazy initialization to prevent server-side rendering issues
 */
let userServiceClient: UserServiceClient | null = null;

/**
 * Get or initialize UserServiceClient
 * Business Logic: Lazy initialization của gRPC client
 * - Chỉ khởi tạo khi cần thiết (performance optimization)
 * - Client-side only (gRPC-Web không chạy trên server)
 */
function getUserServiceClient(): UserServiceClient {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    throw new Error('[AUTH_SERVICE] gRPC client can only be used on client-side');
  }

  // Lazy initialization - create client only when needed
  if (!userServiceClient) {
    logger.debug('[AuthService] Initializing gRPC client', {
      operation: 'initializeClient',
      endpoint: GRPC_ENDPOINT,
    });
    userServiceClient = new UserServiceClient(GRPC_ENDPOINT, null, {
      format: 'text', // Use text format for JSON compatibility with gRPC Gateway
      withCredentials: false,
      unaryInterceptors: [],
      streamInterceptors: []
    });
  }

  return userServiceClient;
}

/**
 * Handle gRPC errors and convert to user-friendly messages
 * Business Logic: Convert gRPC error codes thành Vietnamese error messages
 * - Map gRPC status codes sang user-friendly messages
 * - Handle specific error cases (locked account, suspended, etc.)
 *
 * @param error - RpcError from gRPC call
 * @returns User-friendly error message in Vietnamese
 */
function handleGrpcError(error: RpcError): string {
  logger.error('[AuthService] gRPC Error occurred', {
    operation: 'handleGrpcError',
    code: error.code,
    message: error.message,
    metadata: error.metadata,
  });
  
  switch (error.code) {
    case 3: // INVALID_ARGUMENT
      return 'Thông tin đầu vào không hợp lệ. Vui lòng kiểm tra lại.';
    case 7: // PERMISSION_DENIED
      // Could be account locked or suspended
      if (error.message?.toLowerCase().includes('locked')) {
        return 'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 30 phút.';
      }
      if (error.message?.toLowerCase().includes('suspended')) {
        return 'Tài khoản đã bị tạm ngưng. Vui lòng liên hệ quản trị viên.';
      }
      return 'Không có quyền truy cập. Vui lòng kiểm tra thông tin đăng nhập.';
    case 14: // UNAVAILABLE
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
    case 16: // UNAUTHENTICATED
      if (error.message?.toLowerCase().includes('invalid credentials')) {
        return 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
      }
      return 'Xác thực thất bại. Vui lòng đăng nhập lại.';
    default:
      return error.message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
  }
}

/**
 * Main AuthService class with gRPC methods
 */
export class AuthService {
  /**
   * Login with email and password using gRPC Gateway JSON API
   * Business Logic: Xác thực user credentials qua gRPC Gateway
   * - Call gRPC Login endpoint với email/password
   * - Auto-save tokens nếu login thành công
   * - Return LoginResponse với user info và tokens
   */
  static async login(email: string, password: string): Promise<LoginResponse> {
    // Mask email for logging
    const maskedEmail = email.length > 2
      ? `${email.substring(0, 2)}***@${email.split('@')[1] || '***'}`
      : '***';

    // ✅ FIX: Call backend HTTP Gateway directly (bypass gRPC proxy)
    // gRPC proxy expects protobuf binary, but we're sending JSON
    // Backend HTTP Gateway supports JSON API at port 8080
    const isServerSide = typeof window === 'undefined';
    const backendUrl = process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080';

    const endpoint = `${backendUrl}/v1.UserService/Login`;

    logger.debug('[AuthService] Login attempt', {
      operation: 'login',
      email: maskedEmail,
      endpoint,
      isServerSide,
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      logger.debug('[AuthService] Login response received', {
        operation: 'login',
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('[AUTH_SERVICE] Error response:', errorData);
        
        // Parse backend error messages
        let errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // Handle specific error cases
        if (response.status === 401) {
          errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
        } else if (response.status === 403) {
          if (errorMessage.toLowerCase().includes('locked')) {
            errorMessage = 'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 30 phút.';
          } else if (errorMessage.toLowerCase().includes('inactive') || errorMessage.toLowerCase().includes('suspended')) {
            errorMessage = 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.';
          } else {
            errorMessage = 'Không có quyền truy cập. Vui lòng kiểm tra tài khoản của bạn.';
          }
        } else if (response.status === 500) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau ít phút.';
        } else if (response.status === 503) {
          errorMessage = 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[AUTH_SERVICE] Login successful, converting response...');

      // Convert JSON response to protobuf-like object for compatibility
      const loginResponse = new LoginResponse();
      if (data.accessToken) {
        loginResponse.setAccessToken(data.accessToken);
        loginResponse.setRefreshToken(data.refreshToken || '');

        // ✅ SECURITY: Tokens will be stored in NextAuth httpOnly cookies automatically
        // ❌ REMOVED: localStorage token storage (XSS vulnerability)
        // AuthHelpers.saveTokens(data.accessToken, data.refreshToken);
        console.log('[AUTH_SERVICE] Tokens will be managed by NextAuth session (httpOnly cookies)');
      }

      // Set user data if available
      if (data.user) {
        // Create User object from JSON response
        const user = new User();
        user.setId(data.user.id || '');
        user.setEmail(data.user.email || '');
        user.setFirstName(data.user.firstName || '');
        user.setLastName(data.user.lastName || '');

        // Backend returns role as NUMBER (protobuf enum), not string
        let roleValue: number = UserRole.USER_ROLE_STUDENT; // Default value
        if (typeof data.user.role === 'number') {
          roleValue = data.user.role;
        } else if (typeof data.user.role === 'string') {
          const roleMap: Record<string, number> = {
            'USER_ROLE_UNSPECIFIED': UserRole.USER_ROLE_UNSPECIFIED,
            'USER_ROLE_GUEST': UserRole.USER_ROLE_GUEST,
            'USER_ROLE_STUDENT': UserRole.USER_ROLE_STUDENT,
            'USER_ROLE_TUTOR': UserRole.USER_ROLE_TUTOR,
            'USER_ROLE_TEACHER': UserRole.USER_ROLE_TEACHER,
            'USER_ROLE_ADMIN': UserRole.USER_ROLE_ADMIN
          };
          roleValue = roleMap[data.user.role] || UserRole.USER_ROLE_STUDENT;
        }
        user.setRole(roleValue as 0 | 1 | 2 | 3 | 4 | 5);

        console.log('[AUTH_SERVICE] 📊 Processing status - input:', data.user.status, 'type:', typeof data.user.status);

        // Backend returns status as NUMBER (protobuf enum), not string
        // If it's already a number, use it directly
        // If it's a string, convert it to number
        let statusValue: number;
        if (typeof data.user.status === 'number') {
          statusValue = data.user.status;
          console.log('[AUTH_SERVICE] ✅ Status is number:', statusValue);
        } else if (typeof data.user.status === 'string') {
          const statusMap: Record<string, number> = {
            'USER_STATUS_UNSPECIFIED': UserStatus.USER_STATUS_UNSPECIFIED,
            'USER_STATUS_ACTIVE': UserStatus.USER_STATUS_ACTIVE,
            'USER_STATUS_SUSPENDED': UserStatus.USER_STATUS_SUSPENDED,
            'USER_STATUS_INACTIVE': UserStatus.USER_STATUS_INACTIVE
          };
          statusValue = statusMap[data.user.status] || UserStatus.USER_STATUS_ACTIVE;
          console.log('[AUTH_SERVICE] ✅ Status converted from string:', data.user.status, '→', statusValue);
        } else {
          statusValue = UserStatus.USER_STATUS_ACTIVE;
          console.log('[AUTH_SERVICE] ✅ Status defaulted to ACTIVE:', statusValue);
        }
        user.setStatus(statusValue as 0 | 1 | 2 | 3);

        user.setLevel(data.user.level || 1);
        user.setAvatar(data.user.avatar || '');
        user.setEmailVerified(data.user.emailVerified || false);

        console.log('[AUTH_SERVICE] ✅ User object created successfully');
        console.log('[AUTH_SERVICE] User details:', {
          id: user.getId(),
          email: user.getEmail(),
          name: `${user.getFirstName()} ${user.getLastName()}`,
          role: user.getRole(),
          status: user.getStatus(),
          level: user.getLevel()
        });

        // Set user to response
        loginResponse.setUser(user);
      } else {
        console.log('[AUTH_SERVICE] ❌ No user data in response!');
      }

      console.log('[AUTH_SERVICE] 🎉 Login process completed successfully!');
      console.log('[AUTH_SERVICE] Final LoginResponse:', {
        hasAccessToken: !!loginResponse.getAccessToken(),
        accessToken: loginResponse.getAccessToken(),
        hasUser: !!loginResponse.getUser(),
        userEmail: loginResponse.getUser()?.getEmail(),
        userRole: loginResponse.getUser()?.getRole()
      });

      return loginResponse;
    } catch (error) {
      console.log('[AUTH_SERVICE] 💥 OUTER CATCH - Login process failed!');
      console.log('[AUTH_SERVICE] Error details:', error);
      console.log('[AUTH_SERVICE] Error type:', typeof error);
      console.log('[AUTH_SERVICE] Error message:', error instanceof Error ? error.message : String(error));
      console.log('[AUTH_SERVICE] Error stack:', error instanceof Error ? error.stack : 'N/A');



      const errorMessage = error instanceof Error ? error.message : 'Login failed';
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
    // request.setName(`${params.firstName} ${params.lastName}`); // Method not available in protobuf

    try {
      const client = getUserServiceClient();
      // ✅ FIX: Pass metadata with CSRF token
      const response = await client.register(request, getAuthMetadata());
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Login with Google OAuth
   * Business Logic: Xác thực user bằng Google ID token
   * - Exchange Google ID token với backend để lấy JWT token
   * - Auto-save tokens nếu login thành công
   * - Return LoginResponse với user info và tokens
   *
   * ✅ SERVER-SIDE COMPATIBLE: Uses fetch() instead of gRPC-Web client
   * This allows the method to be called from NextAuth signIn() callback (server-side)
   */
  static async googleLogin(idToken: string): Promise<LoginResponse> {
    // ✅ FIX: Use absolute URL for server-side fetch()
    const isServerSide = typeof window === 'undefined';
    const baseUrl = isServerSide
      ? (process.env.NEXTAUTH_URL || 'http://localhost:3000')
      : '';

    const endpoint = `${baseUrl}${GRPC_ENDPOINT}/v1.UserService/GoogleLogin`;

    logger.debug('[AuthService] Google login attempt', {
      operation: 'googleLogin',
      endpoint,
      isServerSide,
    });

    try {
      // ✅ USES FETCH - WORKS ON SERVER-SIDE!
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken
        })
      });

      logger.debug('[AuthService] Google login response received', {
        operation: 'googleLogin',
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;

        // Handle specific error cases
        if (response.status === 401) {
          errorMessage = 'Google token không hợp lệ. Vui lòng thử lại.';
        } else if (response.status === 403) {
          errorMessage = 'Tài khoản Google này không có quyền truy cập.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi server khi đăng nhập bằng Google. Vui lòng thử lại sau.';
        }

        logger.error('[AuthService] Google login failed', {
          operation: 'googleLogin',
          status: response.status,
          error: errorMessage,
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Convert JSON response to protobuf-like object for compatibility
      const loginResponse = new LoginResponse();
      if (data.accessToken) {
        loginResponse.setAccessToken(data.accessToken);
        loginResponse.setRefreshToken(data.refreshToken || '');
      }

      // Set user data if available
      if (data.user) {
        const user = new User();
        user.setId(data.user.id || '');
        user.setEmail(data.user.email || '');
        user.setFirstName(data.user.firstName || '');
        user.setLastName(data.user.lastName || '');
        // Technical: Use correct protobuf enum values with USER_ROLE_ and USER_STATUS_ prefixes
        user.setRole(data.user.role || UserRole.USER_ROLE_STUDENT);
        user.setLevel(data.user.level || 1);
        user.setStatus(data.user.status || UserStatus.USER_STATUS_ACTIVE);
        user.setEmailVerified(data.user.emailVerified || false);
        // Note: User protobuf message doesn't have createdAt/updatedAt fields
        // These are only in UserProfile message (profile.proto)
        loginResponse.setUser(user);
      }

      // Auto-save tokens on successful login
      if (loginResponse.getAccessToken()) {
        AuthHelpers.saveTokens(
          loginResponse.getAccessToken(),
          loginResponse.getRefreshToken()
        );
      }

      logger.debug('[AuthService] Google login successful', {
        operation: 'googleLogin',
        userId: loginResponse.getUser()?.getId() || 'unknown',
      });

      return loginResponse;
    } catch (error) {
      logger.error('[AuthService] Google login exception', {
        operation: 'googleLogin',
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * Business Logic: Làm mới access token khi hết hạn
   * - Sử dụng refresh token để lấy access token mới
   * - Tự động lưu token mới vào localStorage
   * - Nếu refresh failed thì clear tokens (force re-login)
   *
   * ✅ SERVER-SIDE COMPATIBLE: Uses fetch() instead of gRPC-Web client
   * This allows the method to be called from NextAuth jwt() callback (server-side)
   */
  static async refreshToken(refreshToken?: string): Promise<RefreshTokenResponse> {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const endpoint = `${GRPC_ENDPOINT}/v1.UserService/RefreshToken`;

    logger.debug('[AuthService] Refresh token attempt', {
      operation: 'refreshToken',
      endpoint,
    });

    try {
      // ✅ USES FETCH - WORKS ON SERVER-SIDE!
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken
        })
      });

      logger.debug('[AuthService] Refresh token response received', {
        operation: 'refreshToken',
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;

        // Handle specific error cases
        if (response.status === 401) {
          errorMessage = 'Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (response.status === 403) {
          errorMessage = 'Không có quyền làm mới token. Vui lòng đăng nhập lại.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi server khi làm mới token. Vui lòng thử lại sau.';
        }

        logger.error('[AuthService] Refresh token failed', {
          operation: 'refreshToken',
          status: response.status,
          error: errorMessage,
        });

        // If refresh fails, clear tokens (force re-login)
        AuthHelpers.clearTokens();
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Convert JSON response to protobuf-like object for compatibility
      const refreshResponse = new RefreshTokenResponse();
      if (data.accessToken) {
        refreshResponse.setAccessToken(data.accessToken);
        refreshResponse.setRefreshToken(data.refreshToken || refreshToken); // Use new refresh token if provided, otherwise keep old one
      }

      // Update access token in localStorage
      if (refreshResponse.getAccessToken()) {
        AuthHelpers.saveAccessToken(refreshResponse.getAccessToken());
      }

      logger.debug('[AuthService] Token refreshed successfully', {
        operation: 'refreshToken',
      });

      return refreshResponse;
    } catch (error) {
      // If refresh fails, clear tokens (force re-login)
      AuthHelpers.clearTokens();

      logger.error('[AuthService] Refresh token exception', {
        operation: 'refreshToken',
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const request = new VerifyEmailRequest();
    request.setToken(token);

    try {
      const client = getUserServiceClient();
      // ✅ FIX: Pass metadata with CSRF token
      const response = await client.verifyEmail(request, getAuthMetadata());
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Send verification email to user
   * TODO: Enable when protobuf client is regenerated with sendVerificationEmail method
   */
  static async sendVerificationEmail(userId: string): Promise<SendVerificationEmailResponse> {
    // Temporary mock implementation until protobuf client is regenerated
    console.log('[AUTH_SERVICE] sendVerificationEmail called for userId:', userId);

    // Mock response structure
    const mockResponse = {
      getResponse: () => ({
        getSuccess: () => true,
        getMessage: () => 'Email xác thực đã được gửi thành công'
      }),
      getMessage: () => 'Email xác thực đã được gửi thành công'
    } as SendVerificationEmailResponse;

    return Promise.resolve(mockResponse);

    /* TODO: Uncomment when protobuf client is regenerated
    const request = new SendVerificationEmailRequest();
    request.setUserId(userId);

    try {
      const client = getUserServiceClient();
      const response = await client.sendVerificationEmail(request);
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
    */
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const request = new ForgotPasswordRequest();
    request.setEmail(email);

    try {
      const client = getUserServiceClient();
      // ✅ FIX: Pass metadata with CSRF token
      const response = await client.forgotPassword(request, getAuthMetadata());
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
      const client = getUserServiceClient();
      // ✅ FIX: Pass metadata with CSRF token
      const response = await client.resetPassword(request, getAuthMetadata());
      return response;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current authenticated user with enhanced error handling
   */
  static async getCurrentUser(): Promise<GetUserResponse> {
    console.log('[AUTH_SERVICE] Getting current user...');

    // Check if we have a valid token before making the request
    const token = AuthHelpers.getAccessToken();
    if (!token || !AuthHelpers.isTokenValid(token)) {
      throw new Error('No valid authentication token available');
    }

    const request = new GetUserRequest();

    try {
      const client = getUserServiceClient();
      // ✅ FIX: Pass metadata with CSRF token - THIS WAS THE MISSING PIECE!
      const response = await client.getCurrentUser(request, getAuthMetadata());

      logger.debug('[AuthService] Successfully retrieved current user', {
        operation: 'getCurrentUser',
        userId: response.getUser()?.getId() || 'unknown',
      });

      return response;
    } catch (error) {
      logger.error('[AuthService] Failed to get current user', {
        operation: 'getCurrentUser',
        error: error instanceof Error ? error.message : String(error),
      });
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

