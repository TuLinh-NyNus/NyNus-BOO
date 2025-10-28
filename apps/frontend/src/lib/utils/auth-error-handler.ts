/**
 * Authentication Error Handler
 * ============================
 * Centralized error handling cho authentication operations
 * 
 * Business Logic:
 * - Classify error types (network, server, client, auth)
 * - Provide appropriate error messages in Vietnamese
 * - Determine retry strategy based on error type
 * - Handle token cleanup when necessary
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { logger } from '@/lib/utils/logger';

/**
 * Authentication error types
 */
export enum AuthErrorType {
  // Network related errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // Server errors (5xx)
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Client errors (4xx)
  CLIENT_ERROR = 'CLIENT_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  
  // Authentication specific errors
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  
  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Authentication error classification result
 */
export interface AuthErrorClassification {
  type: AuthErrorType;
  message: string;
  userMessage: string;
  shouldRetry: boolean;
  shouldClearTokens: boolean;
  shouldForceLogout: boolean;
  retryDelayMs?: number;
}

/**
 * Authentication Error Handler Class
 */
export class AuthErrorHandler {
  /**
   * Classify authentication error và determine appropriate action
   * 
   * @param error - Error object hoặc error message
   * @param context - Context information (operation, attempt, etc.)
   * @returns AuthErrorClassification với recommended actions
   */
  static classifyError(error: Error | string, context?: Record<string, any>): AuthErrorClassification {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    logger.debug('[AuthErrorHandler] Classifying error', {
      operation: 'classifyError',
      errorMessage,
      errorName,
      context,
    });

    // ✅ Network and timeout errors
    if (errorName === 'AbortError' || errorMessage.includes('timeout')) {
      return {
        type: AuthErrorType.TIMEOUT_ERROR,
        message: errorMessage,
        userMessage: 'Kết nối bị timeout. Vui lòng kiểm tra mạng và thử lại.',
        shouldRetry: true,
        shouldClearTokens: false,
        shouldForceLogout: false,
        retryDelayMs: 2000, // 2 seconds
      };
    }

    if (errorName === 'TypeError' && errorMessage.includes('fetch')) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        message: errorMessage,
        userMessage: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        shouldRetry: true,
        shouldClearTokens: false,
        shouldForceLogout: false,
        retryDelayMs: 3000, // 3 seconds
      };
    }

    // ✅ Authentication specific errors
    if (errorMessage.includes('REFRESH_TOKEN_EXPIRED') || errorMessage.includes('401')) {
      return {
        type: AuthErrorType.REFRESH_TOKEN_EXPIRED,
        message: errorMessage,
        userMessage: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        shouldRetry: false,
        shouldClearTokens: true,
        shouldForceLogout: true,
      };
    }

    if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403')) {
      return {
        type: AuthErrorType.PERMISSION_DENIED,
        message: errorMessage,
        userMessage: 'Không có quyền truy cập. Vui lòng liên hệ quản trị viên.',
        shouldRetry: false,
        shouldClearTokens: false,
        shouldForceLogout: false,
      };
    }

    if (errorMessage.toLowerCase().includes('locked')) {
      return {
        type: AuthErrorType.ACCOUNT_LOCKED,
        message: errorMessage,
        userMessage: 'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 30 phút.',
        shouldRetry: false,
        shouldClearTokens: false,
        shouldForceLogout: true,
      };
    }

    if (errorMessage.toLowerCase().includes('suspended') || errorMessage.toLowerCase().includes('inactive')) {
      return {
        type: AuthErrorType.ACCOUNT_SUSPENDED,
        message: errorMessage,
        userMessage: 'Tài khoản đã bị tạm ngưng. Vui lòng liên hệ quản trị viên.',
        shouldRetry: false,
        shouldClearTokens: false,
        shouldForceLogout: true,
      };
    }

    if (errorMessage.includes('invalid credentials') || errorMessage.includes('Email hoặc mật khẩu không đúng')) {
      return {
        type: AuthErrorType.INVALID_CREDENTIALS,
        message: errorMessage,
        userMessage: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.',
        shouldRetry: false,
        shouldClearTokens: false,
        shouldForceLogout: false,
      };
    }

    // ✅ Server errors (5xx)
    if (errorMessage.includes('SERVER_ERROR') || errorMessage.includes('500')) {
      return {
        type: AuthErrorType.SERVER_ERROR,
        message: errorMessage,
        userMessage: 'Lỗi máy chủ. Vui lòng thử lại sau ít phút.',
        shouldRetry: true,
        shouldClearTokens: false,
        shouldForceLogout: false,
        retryDelayMs: 5000, // 5 seconds
      };
    }

    if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
      return {
        type: AuthErrorType.SERVICE_UNAVAILABLE,
        message: errorMessage,
        userMessage: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
        shouldRetry: true,
        shouldClearTokens: false,
        shouldForceLogout: false,
        retryDelayMs: 10000, // 10 seconds
      };
    }

    // ✅ Client errors (4xx)
    if (errorMessage.includes('CLIENT_ERROR') || errorMessage.includes('400')) {
      return {
        type: AuthErrorType.CLIENT_ERROR,
        message: errorMessage,
        userMessage: 'Yêu cầu không hợp lệ. Vui lòng thử lại.',
        shouldRetry: false,
        shouldClearTokens: false,
        shouldForceLogout: false,
      };
    }

    // ✅ Default case - unknown error
    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      message: errorMessage,
      userMessage: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.',
      shouldRetry: true,
      shouldClearTokens: false,
      shouldForceLogout: false,
      retryDelayMs: 3000, // 3 seconds
    };
  }

  /**
   * Handle authentication error với appropriate actions
   * 
   * @param error - Error object hoặc error message
   * @param context - Context information
   * @returns AuthErrorClassification với recommended actions
   */
  static handleAuthError(error: Error | string, context?: Record<string, any>): AuthErrorClassification {
    const classification = this.classifyError(error, context);
    
    logger.info('[AuthErrorHandler] Error classified', {
      operation: 'handleAuthError',
      type: classification.type,
      shouldRetry: classification.shouldRetry,
      shouldClearTokens: classification.shouldClearTokens,
      shouldForceLogout: classification.shouldForceLogout,
      userMessage: classification.userMessage,
      context,
    });

    // ✅ Perform recommended actions
    if (classification.shouldClearTokens) {
      logger.warn('[AuthErrorHandler] Clearing tokens due to error classification', {
        type: classification.type,
      });
      // Note: Token clearing will be handled by calling code
    }

    if (classification.shouldForceLogout) {
      logger.warn('[AuthErrorHandler] Force logout recommended due to error classification', {
        type: classification.type,
      });
      // Note: Logout will be handled by calling code
    }

    return classification;
  }

  /**
   * Check if error should trigger retry
   * 
   * @param error - Error object hoặc error message
   * @param currentAttempt - Current retry attempt number
   * @param maxAttempts - Maximum retry attempts
   * @returns Boolean indicating if should retry
   */
  static shouldRetry(error: Error | string, currentAttempt: number, maxAttempts: number): boolean {
    if (currentAttempt >= maxAttempts) {
      return false;
    }

    const classification = this.classifyError(error);
    return classification.shouldRetry;
  }

  /**
   * Get retry delay for exponential backoff
   * 
   * @param attempt - Current attempt number (1-based)
   * @param baseDelayMs - Base delay in milliseconds
   * @param maxDelayMs - Maximum delay in milliseconds
   * @returns Delay in milliseconds
   */
  static getRetryDelay(attempt: number, baseDelayMs: number = 1000, maxDelayMs: number = 30000): number {
    const exponentialDelay = Math.pow(2, attempt - 1) * baseDelayMs;
    return Math.min(exponentialDelay, maxDelayMs);
  }

  /**
   * Create user-friendly error message
   * 
   * @param error - Error object hoặc error message
   * @param context - Additional context
   * @returns User-friendly error message in Vietnamese
   */
  static getUserMessage(error: Error | string, context?: Record<string, any>): string {
    const classification = this.classifyError(error, context);
    return classification.userMessage;
  }
}

/**
 * Utility functions for common error handling patterns
 */
export const AuthErrorUtils = {
  /**
   * Check if error is retryable
   */
  isRetryableError: (error: Error | string): boolean => {
    const classification = AuthErrorHandler.classifyError(error);
    return classification.shouldRetry;
  },

  /**
   * Check if error requires token cleanup
   */
  requiresTokenCleanup: (error: Error | string): boolean => {
    const classification = AuthErrorHandler.classifyError(error);
    return classification.shouldClearTokens;
  },

  /**
   * Check if error requires force logout
   */
  requiresForceLogout: (error: Error | string): boolean => {
    const classification = AuthErrorHandler.classifyError(error);
    return classification.shouldForceLogout;
  },

  /**
   * Get error type
   */
  getErrorType: (error: Error | string): AuthErrorType => {
    const classification = AuthErrorHandler.classifyError(error);
    return classification.type;
  },
};

export default AuthErrorHandler;

