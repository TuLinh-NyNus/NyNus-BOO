/**
 * Prisma Error Handler
 * =================================================
 * ⚠️ USAGE RESTRICTION WARNING
 *
 * This error handler should ONLY be used for:
 * - Database seeding scripts (prisma/seed.ts)
 * - Integration testing
 * - Development utilities
 *
 * ❌ DO NOT USE in production API routes!
 * Production API routes should use gRPC services instead.
 *
 * Why restricted:
 * - Prisma creates dual database access anti-pattern
 * - Backend uses Go with raw SQL, not Prisma ORM
 * - Direct database access bypasses security layers
 *
 * For production, use gRPC error handling instead.
 *
 * Centralized error handling cho Prisma Client operations
 *
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { Prisma } from '@prisma/client';
import { retryWithBackoff, CircuitBreaker, type ErrorRecoveryOptions } from '@/lib/utils/error-recovery';
import { logger } from '@/lib/utils/logger';

// ===== TYPES =====

/**
 * Prisma Error Types
 */
export type PrismaErrorType = 
  | 'UNIQUE_CONSTRAINT'
  | 'FOREIGN_KEY_CONSTRAINT'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONNECTION'
  | 'TIMEOUT'
  | 'TRANSACTION'
  | 'UNKNOWN';

/**
 * Prisma Error Details
 */
export interface PrismaErrorDetails {
  type: PrismaErrorType;
  code?: string;
  message?: string;
  userMessage: string; // Vietnamese message for users
  field?: string;
  value?: unknown;
  meta?: Record<string, unknown>;
  isRetryable: boolean;
  httpStatus: number;
}

/**
 * Prisma Error Handler Options
 */
export interface PrismaErrorHandlerOptions {
  /** Custom user message */
  customMessage?: string;
  /** Include technical details in response */
  includeTechnicalDetails?: boolean;
  /** Log error to console */
  logError?: boolean;
  /** Retry options */
  retryOptions?: ErrorRecoveryOptions;
}

// ===== CONSTANTS =====

/**
 * Prisma Error Code Mappings
 */
const PRISMA_ERROR_CODES = {
  // Unique constraint violation
  P2002: 'UNIQUE_CONSTRAINT',
  // Foreign key constraint violation
  P2003: 'FOREIGN_KEY_CONSTRAINT',
  // Record not found
  P2025: 'NOT_FOUND',
  // Connection error
  P1001: 'CONNECTION',
  P1002: 'CONNECTION',
  P1008: 'TIMEOUT',
  P1017: 'CONNECTION',
  // Transaction error
  P2034: 'TRANSACTION',
  // Validation error
  P2000: 'VALIDATION',
  P2001: 'VALIDATION',
  P2011: 'VALIDATION',
  P2012: 'VALIDATION',
  P2013: 'VALIDATION',
  P2014: 'VALIDATION',
} as const;

/**
 * User-friendly error messages (Vietnamese)
 */
const USER_ERROR_MESSAGES: Record<PrismaErrorType, string> = {
  UNIQUE_CONSTRAINT: 'Dữ liệu đã tồn tại trong hệ thống',
  FOREIGN_KEY_CONSTRAINT: 'Không thể thực hiện do ràng buộc dữ liệu',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  VALIDATION: 'Dữ liệu không hợp lệ',
  CONNECTION: 'Không thể kết nối đến cơ sở dữ liệu',
  TIMEOUT: 'Thời gian xử lý quá lâu, vui lòng thử lại',
  TRANSACTION: 'Lỗi khi xử lý giao dịch',
  UNKNOWN: 'Đã xảy ra lỗi không xác định',
};

/**
 * HTTP Status Codes for each error type
 */
const ERROR_HTTP_STATUS: Record<PrismaErrorType, number> = {
  UNIQUE_CONSTRAINT: 409, // Conflict
  FOREIGN_KEY_CONSTRAINT: 400, // Bad Request
  NOT_FOUND: 404, // Not Found
  VALIDATION: 400, // Bad Request
  CONNECTION: 503, // Service Unavailable
  TIMEOUT: 504, // Gateway Timeout
  TRANSACTION: 500, // Internal Server Error
  UNKNOWN: 500, // Internal Server Error
};

/**
 * Retryable error types
 */
const RETRYABLE_ERRORS: Set<PrismaErrorType> = new Set([
  'CONNECTION',
  'TIMEOUT',
  'TRANSACTION',
]);

// ===== CIRCUIT BREAKER INSTANCE =====

/**
 * Global circuit breaker for Prisma operations
 */
const prismaCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 60000, // 1 minute
  monitoringPeriod: 300000, // 5 minutes
});

// ===== ERROR CLASSIFICATION =====

/**
 * Classify Prisma error
 */
export function classifyPrismaError(error: unknown): PrismaErrorDetails {
  // Handle PrismaClientKnownRequestError
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const errorType = (PRISMA_ERROR_CODES[error.code as keyof typeof PRISMA_ERROR_CODES] || 'UNKNOWN') as PrismaErrorType;
    
    return {
      type: errorType,
      code: error.code,
      message: error.message,
      userMessage: USER_ERROR_MESSAGES[errorType],
      meta: error.meta as Record<string, unknown>,
      isRetryable: RETRYABLE_ERRORS.has(errorType),
      httpStatus: ERROR_HTTP_STATUS[errorType],
    };
  }

  // Handle PrismaClientValidationError
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      type: 'VALIDATION',
      message: error.message,
      userMessage: 'Dữ liệu không hợp lệ',
      isRetryable: false,
      httpStatus: 400,
    };
  }

  // Handle PrismaClientUnknownRequestError
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return {
      type: 'UNKNOWN',
      message: error.message,
      userMessage: 'Đã xảy ra lỗi không xác định',
      isRetryable: false,
      httpStatus: 500,
    };
  }

  // Handle PrismaClientInitializationError
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      type: 'CONNECTION',
      code: error.errorCode,
      message: error.message,
      userMessage: 'Không thể kết nối đến cơ sở dữ liệu',
      isRetryable: true,
      httpStatus: 503,
    };
  }

  // Handle PrismaClientRustPanicError
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return {
      type: 'UNKNOWN',
      message: error.message,
      userMessage: 'Đã xảy ra lỗi nghiêm trọng',
      isRetryable: false,
      httpStatus: 500,
    };
  }

  // Handle generic Error
  if (error instanceof Error) {
    return {
      type: 'UNKNOWN',
      message: error.message,
      userMessage: 'Đã xảy ra lỗi không xác định',
      isRetryable: false,
      httpStatus: 500,
    };
  }

  // Unknown error type
  return {
    type: 'UNKNOWN',
    message: String(error),
    userMessage: 'Đã xảy ra lỗi không xác định',
    isRetryable: false,
    httpStatus: 500,
  };
}

// ===== ERROR HANDLER =====

/**
 * Handle Prisma error with detailed information
 */
export function handlePrismaError(
  error: unknown,
  options: PrismaErrorHandlerOptions = {}
): PrismaErrorDetails {
  const {
    customMessage,
    includeTechnicalDetails = process.env.NODE_ENV === 'development',
    logError = true,
  } = options;

  const errorDetails = classifyPrismaError(error);

  // Override user message if custom message provided
  if (customMessage) {
    errorDetails.userMessage = customMessage;
  }

  /**
   * Log error in development
   * Business Logic: Development-only logging để debug Prisma errors
   * - Chỉ log trong development environment
   * - Structured logging với contextual fields
   */
  if (logError && process.env.NODE_ENV === 'development') {
    logger.debug('[PrismaError] Database error occurred', {
      operation: 'prismaError',
      type: errorDetails.type,
      code: errorDetails.code,
      message: errorDetails.message,
      meta: errorDetails.meta,
      httpStatus: errorDetails.httpStatus,
    });
  }

  // Remove technical details in production
  if (!includeTechnicalDetails) {
    delete errorDetails.message;
    delete errorDetails.code;
    delete errorDetails.meta;
  }

  return errorDetails;
}

// ===== RETRY WRAPPER =====

/**
 * Execute Prisma operation with retry logic
 */
export async function executePrismaWithRetry<T>(
  operation: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
): Promise<T> {
  return await retryWithBackoff(operation, {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    ...options,
  });
}

// ===== CIRCUIT BREAKER WRAPPER =====

/**
 * Execute Prisma operation with circuit breaker protection
 */
export async function executePrismaWithCircuitBreaker<T>(
  operation: () => Promise<T>
): Promise<T> {
  return prismaCircuitBreaker.execute(operation);
}

// ===== COMBINED WRAPPER =====

/**
 * Execute Prisma operation with full error handling (retry + circuit breaker)
 */
export async function executePrismaOperation<T>(
  operation: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
): Promise<T> {
  return executePrismaWithCircuitBreaker(() =>
    executePrismaWithRetry(operation, options)
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get circuit breaker state
 */
export function getPrismaCircuitBreakerState() {
  return prismaCircuitBreaker.getState();
}

/**
 * Reset circuit breaker
 */
export function resetPrismaCircuitBreaker() {
  prismaCircuitBreaker.reset();
}

