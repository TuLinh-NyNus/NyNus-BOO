/**
 * Token Manager Service
 * ====================
 * Quản lý backend tokens trong NextAuth JWT
 * 
 * Business Logic:
 * - Lưu trữ backend access/refresh tokens trong NextAuth JWT
 * - Auto-refresh tokens khi sắp hết hạn (< 5 phút)
 * - Đảm bảo role và level luôn có giá trị (fallback)
 * 
 * Security:
 * - Tokens được lưu trong httpOnly cookies (NextAuth session)
 * - Không lưu tokens trong localStorage (XSS vulnerability)
 * - Auto-refresh để maintain session liên tục
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import type { JWT } from 'next-auth/jwt';
import type { User, Account } from 'next-auth';
import { AuthService } from '@/services/grpc/auth.service';
import { logger } from '@/lib/logger';
import { JWT_CONFIG } from '@/lib/config/auth-config';
import { AuthErrorHandler, AuthErrorType } from '@/lib/utils/auth-error-handler';
import { AuthMonitor } from '@/lib/utils/auth-monitor';

/**
 * Backend tokens interface
 */
export interface BackendTokens {
  backendAccessToken: string;
  backendRefreshToken: string;
  backendTokenExpiry: number;
  role: string;
  level: number;
}

/**
 * Token Manager - Centralized token operations
 * 
 * Responsibilities:
 * - Store backend tokens in NextAuth JWT
 * - Auto-refresh tokens when expiring
 * - Ensure role and level fallbacks
 */
export class TokenManager {
  /**
   * Lưu backend tokens từ Credentials provider vào JWT
   * 
   * Business Logic:
   * - Được gọi trong jwt callback khi user login bằng email/password
   * - Lưu access token, refresh token, role, level
   * - Set token expiry time (15 phút)
   * 
   * @param token - NextAuth JWT token
   * @param user - User object from authorize callback
   */
  static storeCredentialsTokens(token: JWT, user: User): void {
    // Type guard: Check if user has backend tokens
    if (!('backendAccessToken' in user) || !user.backendAccessToken) {
      return;
    }

    // Store tokens with proper typing
    const userWithTokens = user as User & {
      backendAccessToken: string;
      backendRefreshToken?: string;
      role?: string;
      level?: number;
    };

    token.backendAccessToken = userWithTokens.backendAccessToken;
    token.backendRefreshToken = userWithTokens.backendRefreshToken || '';
    token.role = userWithTokens.role || 'STUDENT';
    token.level = userWithTokens.level || 1;
    token.backendTokenExpiry = Date.now() + JWT_CONFIG.ACCESS_TOKEN_EXPIRY_MS;

    logger.info('[TokenManager] Stored backend tokens from Credentials provider');
  }

  /**
   * Lưu backend tokens từ OAuth provider vào JWT
   * 
   * Business Logic:
   * - Được gọi trong jwt callback khi user login bằng Google OAuth
   * - Backend đã exchange Google token thành system tokens
   * - Tokens được lưu trong account object từ signIn callback
   * 
   * @param token - NextAuth JWT token
   * @param account - Account object from OAuth provider
   */
  static storeOAuthTokens(token: JWT, account: Account): void {
    // Type guard: Check if account has backend tokens
    if (!('backendAccessToken' in account) || !account.backendAccessToken) {
      return;
    }

    // Store tokens with proper typing
    const accountWithTokens = account as Account & {
      backendAccessToken: string;
      backendRefreshToken?: string;
      backendRole?: string;
      backendLevel?: number;
    };

    token.backendAccessToken = accountWithTokens.backendAccessToken;
    token.backendRefreshToken = accountWithTokens.backendRefreshToken || '';
    token.role = accountWithTokens.backendRole || 'STUDENT';
    token.level = accountWithTokens.backendLevel || 1;
    token.backendTokenExpiry = Date.now() + JWT_CONFIG.ACCESS_TOKEN_EXPIRY_MS;

    logger.info('[TokenManager] Stored backend tokens from OAuth provider');
  }

  /**
   * Lưu Google OAuth tokens vào JWT
   * 
   * Business Logic:
   * - Lưu Google access token để có thể refresh sau này
   * - Lưu provider name để biết user login bằng phương thức nào
   * 
   * @param token - NextAuth JWT token
   * @param account - Account object from OAuth provider
   */
  static storeGoogleTokens(token: JWT, account: Account): void {
    if (account.access_token) {
      token.googleAccessToken = account.access_token;
      token.provider = account.provider;
      logger.info('[TokenManager] Stored Google OAuth tokens');
    }
  }

  /**
   * Kiểm tra và refresh token nếu cần
   * 
   * Business Logic:
   * - Kiểm tra token expiry time
   * - Nếu còn < 5 phút thì auto-refresh
   * - Sử dụng refresh token để lấy access token mới
   * - ✅ FIX: Graceful error handling - không force logout trừ khi thực sự cần thiết
   * 
   * @param token - NextAuth JWT token
   * @returns Updated token (luôn return token để maintain session)
   */
  static async refreshTokenIfNeeded(token: JWT): Promise<JWT | null> {
    // Check if we have necessary data for refresh
    if (!token.backendTokenExpiry || !token.backendRefreshToken) {
      logger.debug('[TokenManager] No backend token data - continuing with existing session');
      return token;
    }

    // Calculate time until expiry
    const timeUntilExpiry = (token.backendTokenExpiry as number) - Date.now();
    const shouldRefresh = timeUntilExpiry < JWT_CONFIG.REFRESH_THRESHOLD_MS;

    // ✅ FIX: Add comprehensive logging
    logger.debug('[TokenManager] Token refresh check', {
      timeUntilExpiry: Math.floor(timeUntilExpiry / 1000) + 's',
      shouldRefresh,
      refreshThreshold: JWT_CONFIG.REFRESH_THRESHOLD_MS / 1000 + 's',
      hasRefreshToken: !!token.backendRefreshToken,
    });

    // No need to refresh yet
    if (!shouldRefresh) {
      return token;
    }

    // ✅ FIX: Record token refresh attempt
    const startTime = Date.now();
    const userId = token.sub; // NextAuth user ID
    
    AuthMonitor.recordTokenRefreshAttempt(userId, {
      timeUntilExpiry: Math.floor(timeUntilExpiry / 1000),
      refreshThreshold: JWT_CONFIG.REFRESH_THRESHOLD_MS / 1000,
    });

    try {
      logger.info('[TokenManager] Token expiring soon, auto-refreshing...', {
        timeUntilExpiry: Math.floor(timeUntilExpiry / 1000) + 's',
      });

      // Call backend to refresh token
      const refreshed = await AuthService.refreshToken(token.backendRefreshToken as string);

      if (refreshed && refreshed.getAccessToken()) {
        // Update tokens
        token.backendAccessToken = refreshed.getAccessToken();
        token.backendRefreshToken = refreshed.getRefreshToken();
        token.backendTokenExpiry = Date.now() + JWT_CONFIG.ACCESS_TOKEN_EXPIRY_MS;

        // ✅ FIX: Record successful token refresh
        const duration = Date.now() - startTime;
        AuthMonitor.recordTokenRefreshSuccess(duration, userId, {
          newTokenExpiry: token.backendTokenExpiry,
        });

        logger.info('[TokenManager] Token refreshed successfully', {
          duration: duration + 'ms',
        });
        return token;
      } else {
        // ✅ FIX: Không force logout, chỉ log warning và continue với existing session
        const duration = Date.now() - startTime;
        AuthMonitor.recordTokenRefreshFailure(
          AuthErrorType.UNKNOWN_ERROR,
          'No new token received from backend',
          duration,
          { reason: 'empty_response' }
        );

        logger.warn('[TokenManager] Token refresh failed - no new token received, continuing with existing session');
        
        // ✅ Set retry time - thử refresh lại sau 2 phút
        token.backendTokenExpiry = Date.now() + (2 * 60 * 1000); // Retry in 2 minutes
        return token;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // ✅ FIX: Use AuthErrorHandler để classify error và determine action
      const errorClassification = AuthErrorHandler.handleAuthError(error instanceof Error ? error : String(error), {
        operation: 'refreshTokenIfNeeded',
        tokenExpiry: typeof token.backendTokenExpiry === 'number' ? token.backendTokenExpiry : undefined,
        duration,
      });
      
      // ✅ FIX: Record token refresh failure với detailed error info
      AuthMonitor.recordTokenRefreshFailure(
        errorClassification.type,
        errorClassification.message,
        duration,
        {
          shouldForceLogout: errorClassification.shouldForceLogout,
          shouldRetry: errorClassification.shouldRetry,
          retryDelayMs: errorClassification.retryDelayMs,
        }
      );
      
      if (errorClassification.shouldForceLogout) {
        // Refresh token thực sự expired hoặc account issues - cần logout
        AuthMonitor.recordForcedLogout(userId, errorClassification.message, {
          operation: 'token_refresh_failed',
          errorType: errorClassification.type,
        });

        logger.error('[TokenManager] Error requires force logout', {
          type: errorClassification.type,
          message: errorClassification.message,
          userMessage: errorClassification.userMessage,
          duration: duration + 'ms',
        });
        return null; // Force re-login
      } else {
        // Network error hoặc server error - không force logout
        logger.warn('[TokenManager] Error does not require logout - continuing with existing session', {
          type: errorClassification.type,
          message: errorClassification.message,
          userMessage: errorClassification.userMessage,
          shouldRetry: errorClassification.shouldRetry,
          duration: duration + 'ms',
        });
        
        // ✅ Use recommended retry delay từ error classification
        const retryDelay = errorClassification.retryDelayMs || (2 * 60 * 1000); // Default 2 minutes
        const maxRetryDelay = 5 * 60 * 1000; // Max 5 minutes
        token.backendTokenExpiry = Date.now() + Math.min(retryDelay, maxRetryDelay);
        
        return token; // Keep existing session
      }
    }
  }

  /**
   * Đảm bảo token luôn có role và level (fallback)
   * 
   * Business Logic:
   * - Middleware yêu cầu role và level để check permissions
   * - Nếu thiếu thì set default values
   * - Default: STUDENT role, level 1
   * 
   * @param token - NextAuth JWT token
   */
  static ensureRoleAndLevel(token: JWT): void {
    if (!token.role) {
      logger.warn('[TokenManager] Setting fallback role STUDENT for user without role');
      token.role = 'STUDENT';
    }
    if (!token.level) {
      logger.warn('[TokenManager] Setting fallback level 1 for user without level');
      token.level = 1;
    }
  }

  /**
   * Set default role cho Google OAuth users
   * 
   * Business Logic:
   * - Google OAuth users mới chưa có role trong backend
   * - Set default STUDENT role và level 1
   * - Backend sẽ update role sau khi user hoàn thành onboarding
   * 
   * @param token - NextAuth JWT token
   * @param provider - OAuth provider name
   */
  static setDefaultRoleForOAuth(token: JWT, provider: string): void {
    if (provider === 'google' && !token.role) {
      logger.info('[TokenManager] Setting default role STUDENT for Google OAuth user');
      token.role = 'STUDENT';
      token.level = 1;
    }
  }
}


