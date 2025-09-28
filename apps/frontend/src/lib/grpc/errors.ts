/**
 * gRPC-Web Error Handling Utilities
 * Thay thế cho REST client error handling
 *
 * @author NyNus Development Team
 * @version 1.0.0
 */

import * as grpcWeb from 'grpc-web';

// ===== TYPES =====

/**
 * gRPC Service Error interface
 * Thay thế cho APIError từ REST client
 */
export interface GrpcServiceError {
  code: number;
  message: string;
  metadata?: grpcWeb.Metadata;
  details?: unknown;
}

/**
 * Error categories for UX handling
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

// ===== CONSTANTS =====

/**
 * gRPC Status Codes (compatible with grpc-web library)
 */
export const GrpcCode = {
  OK: 0,
  CANCELLED: 1,
  UNKNOWN: 2,
  INVALID_ARGUMENT: 3,
  DEADLINE_EXCEEDED: 4,
  NOT_FOUND: 5,
  ALREADY_EXISTS: 6,
  PERMISSION_DENIED: 7,
  RESOURCE_EXHAUSTED: 8,
  FAILED_PRECONDITION: 9,
  ABORTED: 10,
  OUT_OF_RANGE: 11,
  UNIMPLEMENTED: 12,
  INTERNAL: 13,
  UNAVAILABLE: 14,
  DATA_LOSS: 15,
  UNAUTHENTICATED: 16
} as const;

/**
 * User-friendly error messages map
 */
const ERROR_MESSAGES: Record<number, string> = {
  [GrpcCode.OK]: 'Thành công',
  [GrpcCode.CANCELLED]: 'Yêu cầu đã bị hủy',
  [GrpcCode.UNKNOWN]: 'Đã xảy ra lỗi không xác định',
  [GrpcCode.INVALID_ARGUMENT]: 'Dữ liệu đầu vào không hợp lệ',
  [GrpcCode.DEADLINE_EXCEEDED]: 'Hết thời gian chờ. Vui lòng thử lại',
  [GrpcCode.NOT_FOUND]: 'Không tìm thấy dữ liệu',
  [GrpcCode.ALREADY_EXISTS]: 'Dữ liệu đã tồn tại',
  [GrpcCode.PERMISSION_DENIED]: 'Bạn không có quyền thực hiện hành động này',
  [GrpcCode.RESOURCE_EXHAUSTED]: 'Hệ thống đang quá tải. Vui lòng thử lại sau',
  [GrpcCode.FAILED_PRECONDITION]: 'Điều kiện tiên quyết không được đáp ứng',
  [GrpcCode.ABORTED]: 'Yêu cầu đã bị hủy bởi hệ thống',
  [GrpcCode.OUT_OF_RANGE]: 'Tham số nằm ngoài phạm vi cho phép',
  [GrpcCode.UNIMPLEMENTED]: 'Chức năng chưa được hỗ trợ',
  [GrpcCode.INTERNAL]: 'Lỗi hệ thống nội bộ. Vui lòng thử lại sau',
  [GrpcCode.UNAVAILABLE]: 'Hệ thống tạm thời không khả dụng. Vui lòng thử lại sau',
  [GrpcCode.DATA_LOSS]: 'Mất mát dữ liệu không thể khôi phục',
  [GrpcCode.UNAUTHENTICATED]: 'Vui lòng đăng nhập để tiếp tục'
};

// ===== UTILITY FUNCTIONS =====

/**
 * Check if error is a gRPC service error
 */
export function isGrpcError(error: unknown): error is GrpcServiceError {
  if (!error || typeof error !== 'object') return false;
  
  const err = error as Record<string, unknown>;
  return typeof err.code === 'number' && typeof err.message === 'string';
}

/**
 * Check if error is from grpc-web library
 */
export function isGrpcWebError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  
  const err = error as Record<string, unknown>;
  // gRPC-Web errors typically have these properties
  return 'code' in err && 'message' in err && ('metadata' in err || 'trailers' in err);
}

/**
 * Extract user-friendly error message from gRPC error
 */
export function getGrpcErrorMessage(error: unknown): string {
  if (isGrpcError(error)) {
    return ERROR_MESSAGES[error.code] || error.message || ERROR_MESSAGES[GrpcCode.UNKNOWN];
  }

  if (isGrpcWebError(error)) {
    const err = error as Record<string, unknown>;
    const code = err.code as number;
    const message = err.message as string;

    return ERROR_MESSAGES[code] || message || ERROR_MESSAGES[GrpcCode.UNKNOWN];
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định';
}

/**
 * Categorize error for UX handling
 */
export function categorizeError(error: unknown): ErrorCategory {
  if (!isGrpcError(error) && !isGrpcWebError(error)) {
    return ErrorCategory.UNKNOWN;
  }

  const err = error as Record<string, unknown>;
  const code = err.code as number;

  switch (code) {
    case GrpcCode.UNAUTHENTICATED:
      return ErrorCategory.AUTHENTICATION;

    case GrpcCode.PERMISSION_DENIED:
      return ErrorCategory.AUTHORIZATION;

    case GrpcCode.INVALID_ARGUMENT:
    case GrpcCode.FAILED_PRECONDITION:
    case GrpcCode.OUT_OF_RANGE:
      return ErrorCategory.VALIDATION;

    case GrpcCode.NOT_FOUND:
      return ErrorCategory.NOT_FOUND;

    case GrpcCode.DEADLINE_EXCEEDED:
      return ErrorCategory.TIMEOUT;

    case GrpcCode.UNAVAILABLE:
    case GrpcCode.RESOURCE_EXHAUSTED:
      return ErrorCategory.NETWORK;

    case GrpcCode.INTERNAL:
    case GrpcCode.DATA_LOSS:
    case GrpcCode.UNKNOWN:
      return ErrorCategory.SERVER_ERROR;

    default:
      return ErrorCategory.UNKNOWN;
  }
}

/**
 * Check if error indicates authentication is required
 */
export function isAuthError(error: unknown): boolean {
  return categorizeError(error) === ErrorCategory.AUTHENTICATION;
}

/**
 * Check if error indicates authorization failure
 */
export function isPermissionError(error: unknown): boolean {
  return categorizeError(error) === ErrorCategory.AUTHORIZATION;
}

/**
 * Check if error indicates network/connectivity issues
 */
export function isNetworkError(error: unknown): boolean {
  const category = categorizeError(error);
  return category === ErrorCategory.NETWORK || category === ErrorCategory.TIMEOUT;
}

/**
 * Check if error indicates validation issues
 */
export function isValidationError(error: unknown): boolean {
  return categorizeError(error) === ErrorCategory.VALIDATION;
}

/**
 * Map gRPC code to HTTP status code (if needed for compatibility)
 */
export function mapGrpcCodeToHttp(code: number): number {
  switch (code) {
    case GrpcCode.OK:
      return 200;
    case GrpcCode.INVALID_ARGUMENT:
    case GrpcCode.FAILED_PRECONDITION:
    case GrpcCode.OUT_OF_RANGE:
      return 400;
    case GrpcCode.UNAUTHENTICATED:
      return 401;
    case GrpcCode.PERMISSION_DENIED:
      return 403;
    case GrpcCode.NOT_FOUND:
      return 404;
    case GrpcCode.ALREADY_EXISTS:
    case GrpcCode.ABORTED:
      return 409;
    case GrpcCode.RESOURCE_EXHAUSTED:
      return 429;
    case GrpcCode.CANCELLED:
      return 499;
    case GrpcCode.UNIMPLEMENTED:
      return 501;
    case GrpcCode.UNAVAILABLE:
      return 503;
    case GrpcCode.DEADLINE_EXCEEDED:
      return 504;
    case GrpcCode.INTERNAL:
    case GrpcCode.DATA_LOSS:
    case GrpcCode.UNKNOWN:
    default:
      return 500;
  }
}

/**
 * Unwrap ServiceError from gRPC-Web callback
 */
export function unwrapServiceError(error: unknown): GrpcServiceError {
  if (isGrpcError(error)) {
    return error;
  }

  if (isGrpcWebError(error)) {
    const err = error as Record<string, unknown>;
    return {
      code: err.code as number,
      message: err.message as string,
      metadata: err.metadata as grpcWeb.Metadata,
      details: err
    };
  }

  // Fallback for unknown errors
  return {
    code: GrpcCode.UNKNOWN,
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    details: error
  };
}

/**
 * Create GrpcServiceError from error object
 */
export function createGrpcError(
  code: number,
  message: string,
  metadata?: grpcWeb.Metadata,
  details?: unknown
): GrpcServiceError {
  return {
    code,
    message,
    metadata,
    details
  };
}

/**
 * Wrap unary gRPC call with consistent error handling
 */
export function wrapUnaryCall<T>(
  grpcCall: Promise<T>
): Promise<T> {
  return grpcCall.catch(error => {
    // Ensure error is properly formatted
    const grpcError = unwrapServiceError(error);
    throw grpcError;
  });
}

// ===== LOGGING UTILITIES =====

/**
 * Log gRPC error with context (for development)
 */
export function logGrpcError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    const grpcError = unwrapServiceError(error);
    console.error(`[gRPC Error${context ? ` - ${context}` : ''}]:`, {
      code: grpcError.code,
      message: grpcError.message,
      category: categorizeError(error),
      httpStatus: mapGrpcCodeToHttp(grpcError.code),
      details: grpcError.details
    });
  }
}