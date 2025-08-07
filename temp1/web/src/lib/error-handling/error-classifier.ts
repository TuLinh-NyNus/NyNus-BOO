/**
 * Error Classification System
 *
 * Phân loại và xử lý các loại lỗi khác nhau trong hệ thống authentication
 */

import {
  ErrorObject,
  isErrorObject,
  hasMessage,
  hasStatus,
  hasRetryAfter,
  getErrorMessage as getErrorMessageFromType,
  getErrorStatus,
  getErrorRetryAfter,
  normalizeError
} from '@/lib/types/error-types';
import logger from '@/lib/utils/logger';

export enum ErrorType {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  
  // Authorization Errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_FORBIDDEN = 'RESOURCE_FORBIDDEN',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server Errors
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Client Errors
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ClassifiedError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  canRetry: boolean;
  retryDelay?: number;
  maxRetries?: number;
  requiresAuth?: boolean;
  requiresRefresh?: boolean;
  shouldLog?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Phân loại lỗi dựa trên error object hoặc HTTP response
 */
export function classifyError(error: unknown): ClassifiedError {
  // Default classification
  let classification: ClassifiedError = {
    type: ErrorType.UNKNOWN_ERROR,
    severity: ErrorSeverity.MEDIUM,
    message: 'Unknown error occurred',
    userMessage: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    canRetry: true,
    shouldLog: true
  };

  // Handle different error types
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      classification = {
        type: ErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        userMessage: 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.',
        canRetry: true,
        retryDelay: 2000,
        maxRetries: 3,
        shouldLog: true
      };
    }
    
    // Timeout errors
    else if (message.includes('timeout') || message.includes('aborted')) {
      classification = {
        type: ErrorType.TIMEOUT_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        userMessage: 'Kết nối bị timeout. Vui lòng thử lại.',
        canRetry: true,
        retryDelay: 3000,
        maxRetries: 2,
        shouldLog: true
      };
    }
  }

  // Handle HTTP status codes
  if (hasStatus(error)) {
    const status = getErrorStatus(error)!;

    switch (status) {
      case 400:
        classification = {
          type: ErrorType.BAD_REQUEST,
          severity: ErrorSeverity.LOW,
          message: getErrorMessageFromType(error) || 'Bad request',
          userMessage: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra và thử lại.',
          canRetry: false,
          shouldLog: false
        };
        break;
        
      case 401:
        classification = {
          type: ErrorType.INVALID_CREDENTIALS,
          severity: ErrorSeverity.HIGH,
          message: getErrorMessageFromType(error) || 'Unauthorized',
          userMessage: 'Email hoặc mật khẩu không chính xác.',
          canRetry: false,
          requiresAuth: true,
          shouldLog: true
        };
        break;

      case 403:
        classification = {
          type: ErrorType.INSUFFICIENT_PERMISSIONS,
          severity: ErrorSeverity.HIGH,
          message: getErrorMessageFromType(error) || 'Forbidden',
          userMessage: 'Bạn không có quyền truy cập tài nguyên này.',
          canRetry: false,
          shouldLog: true
        };
        break;
        
      case 404:
        classification = {
          type: ErrorType.NOT_FOUND,
          severity: ErrorSeverity.LOW,
          message: getErrorMessageFromType(error) || 'Not found',
          userMessage: 'Không tìm thấy tài nguyên yêu cầu.',
          canRetry: false,
          shouldLog: false
        };
        break;

      case 409:
        classification = {
          type: ErrorType.CONFLICT,
          severity: ErrorSeverity.MEDIUM,
          message: getErrorMessageFromType(error) || 'Conflict',
          userMessage: 'Dữ liệu đã tồn tại hoặc xung đột. Vui lòng kiểm tra lại.',
          canRetry: false,
          shouldLog: true
        };
        break;
        
      case 429:
        classification = {
          type: ErrorType.RATE_LIMIT_EXCEEDED,
          severity: ErrorSeverity.MEDIUM,
          message: getErrorMessageFromType(error) || 'Too many requests',
          userMessage: 'Quá nhiều lần thử. Vui lòng thử lại sau.',
          canRetry: true,
          retryDelay: 60000, // 1 minute
          maxRetries: 1,
          shouldLog: true,
          metadata: { retryAfter: getErrorRetryAfter(error) }
        };
        break;
        
      case 500:
        classification = {
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.HIGH,
          message: getErrorMessageFromType(error) || 'Internal server error',
          userMessage: 'Lỗi máy chủ. Vui lòng thử lại sau.',
          canRetry: true,
          retryDelay: 5000,
          maxRetries: 2,
          shouldLog: true
        };
        break;

      case 502:
      case 503:
      case 504:
        classification = {
          type: ErrorType.SERVICE_UNAVAILABLE,
          severity: ErrorSeverity.HIGH,
          message: getErrorMessageFromType(error) || 'Service unavailable',
          userMessage: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
          canRetry: true,
          retryDelay: 10000,
          maxRetries: 3,
          shouldLog: true
        };
        break;
    }
  }

  // Handle specific auth error messages
  if (hasMessage(error)) {
    const message = getErrorMessageFromType(error).toLowerCase();

    if (message.includes('session expired') || message.includes('token expired')) {
      classification = {
        type: ErrorType.SESSION_EXPIRED,
        severity: ErrorSeverity.HIGH,
        message: getErrorMessageFromType(error),
        userMessage: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        canRetry: false,
        requiresAuth: true,
        requiresRefresh: true,
        shouldLog: true
      };
    }
    
    else if (message.includes('account locked') || message.includes('account disabled')) {
      classification = {
        type: ErrorType.ACCOUNT_LOCKED,
        severity: ErrorSeverity.CRITICAL,
        message: getErrorMessageFromType(error),
        userMessage: 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.',
        canRetry: false,
        shouldLog: true
      };
    }

    else if (message.includes('validation') || message.includes('invalid format')) {
      classification = {
        type: ErrorType.VALIDATION_ERROR,
        severity: ErrorSeverity.LOW,
        message: getErrorMessageFromType(error),
        userMessage: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra và thử lại.',
        canRetry: false,
        shouldLog: false
      };
    }
  }

  return classification;
}

/**
 * Tạo user-friendly error message dựa trên classification
 */
export function getErrorMessage(classification: ClassifiedError): string {
  return classification.userMessage;
}

/**
 * Xác định có nên retry không dựa trên error type
 */
export function shouldRetry(classification: ClassifiedError, currentRetryCount: number = 0): boolean {
  if (!classification.canRetry) return false;
  if (classification.maxRetries && currentRetryCount >= classification.maxRetries) return false;
  
  return true;
}

/**
 * Tính toán delay cho retry với exponential backoff
 */
export function getRetryDelay(classification: ClassifiedError, retryCount: number = 0): number {
  const baseDelay = classification.retryDelay || 1000;
  
  // Exponential backoff: baseDelay * 2^retryCount
  return Math.min(baseDelay * Math.pow(2, retryCount), 30000); // Max 30 seconds
}

/**
 * Log error nếu cần thiết
 */
export function logError(classification: ClassifiedError, originalError: unknown, context?: Record<string, any>): void {
  if (!classification.shouldLog) return;
  
  const logData = {
    type: classification.type,
    severity: classification.severity,
    message: classification.message,
    originalError: originalError,
    context: context,
    timestamp: new Date().toISOString()
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    logger.error('Classified Error:', logData);
  }
  
  // TODO: Send to monitoring service in production
  // Example: sendToMonitoring(logData);
}
