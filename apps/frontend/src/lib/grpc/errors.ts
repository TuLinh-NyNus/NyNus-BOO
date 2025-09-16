/**
 * gRPC-Web Error Handling Utilities
 * Thay thế cho REST client error handling
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { grpc } from '@improbable-eng/grpc-web';

// ===== TYPES =====

/**
 * gRPC Service Error interface
 * Thay thế cho APIError từ REST client
 */
export interface GrpcServiceError {
  code: grpc.Code;
  message: string;
  metadata?: grpc.Metadata;
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
 * User-friendly error messages map
 */
const ERROR_MESSAGES: Record<grpc.Code, string> = {
  [grpc.Code.OK]: 'Thành công',
  [grpc.Code.Canceled]: 'Yêu cầu đã bị hủy',
  [grpc.Code.Unknown]: 'Đã xảy ra lỗi không xác định',
  [grpc.Code.InvalidArgument]: 'Dữ liệu đầu vào không hợp lệ',
  [grpc.Code.DeadlineExceeded]: 'Hết thời gian chờ. Vui lòng thử lại',
  [grpc.Code.NotFound]: 'Không tìm thấy dữ liệu',
  [grpc.Code.AlreadyExists]: 'Dữ liệu đã tồn tại',
  [grpc.Code.PermissionDenied]: 'Bạn không có quyền thực hiện hành động này',
  [grpc.Code.ResourceExhausted]: 'Hệ thống đang quá tải. Vui lòng thử lại sau',
  [grpc.Code.FailedPrecondition]: 'Điều kiện tiên quyết không được đáp ứng',
  [grpc.Code.Aborted]: 'Yêu cầu đã bị hủy bởi hệ thống',
  [grpc.Code.OutOfRange]: 'Tham số nằm ngoài phạm vi cho phép',
  [grpc.Code.Unimplemented]: 'Chức năng chưa được hỗ trợ',
  [grpc.Code.Internal]: 'Lỗi hệ thống nội bộ. Vui lòng thử lại sau',
  [grpc.Code.Unavailable]: 'Hệ thống tạm thời không khả dụng. Vui lòng thử lại sau',
  [grpc.Code.DataLoss]: 'Mất mát dữ liệu không thể khôi phục',
  [grpc.Code.Unauthenticated]: 'Vui lòng đăng nhập để tiếp tục'
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
 * Check if error is from @improbable-eng/grpc-web
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
    return ERROR_MESSAGES[error.code] || error.message || ERROR_MESSAGES[grpc.Code.Unknown];
  }
  
  if (isGrpcWebError(error)) {
    const err = error as Record<string, unknown>;
    const code = err.code as grpc.Code;
    const message = err.message as string;
    
    return ERROR_MESSAGES[code] || message || ERROR_MESSAGES[grpc.Code.Unknown];
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
  const code = err.code as grpc.Code;
  
  switch (code) {
    case grpc.Code.Unauthenticated:
      return ErrorCategory.AUTHENTICATION;
    
    case grpc.Code.PermissionDenied:
      return ErrorCategory.AUTHORIZATION;
    
    case grpc.Code.InvalidArgument:
    case grpc.Code.FailedPrecondition:
    case grpc.Code.OutOfRange:
      return ErrorCategory.VALIDATION;
    
    case grpc.Code.NotFound:
      return ErrorCategory.NOT_FOUND;
    
    case grpc.Code.DeadlineExceeded:
      return ErrorCategory.TIMEOUT;
    
    case grpc.Code.Unavailable:
    case grpc.Code.ResourceExhausted:
      return ErrorCategory.NETWORK;
    
    case grpc.Code.Internal:
    case grpc.Code.DataLoss:
    case grpc.Code.Unknown:
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
export function mapGrpcCodeToHttp(code: grpc.Code): number {
  switch (code) {
    case grpc.Code.OK:
      return 200;
    case grpc.Code.InvalidArgument:
    case grpc.Code.FailedPrecondition:
    case grpc.Code.OutOfRange:
      return 400;
    case grpc.Code.Unauthenticated:
      return 401;
    case grpc.Code.PermissionDenied:
      return 403;
    case grpc.Code.NotFound:
      return 404;
    case grpc.Code.AlreadyExists:
    case grpc.Code.Aborted:
      return 409;
    case grpc.Code.ResourceExhausted:
      return 429;
    case grpc.Code.Canceled:
      return 499;
    case grpc.Code.Unimplemented:
      return 501;
    case grpc.Code.Unavailable:
      return 503;
    case grpc.Code.DeadlineExceeded:
      return 504;
    case grpc.Code.Internal:
    case grpc.Code.DataLoss:
    case grpc.Code.Unknown:
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
      code: err.code as grpc.Code,
      message: err.message as string,
      metadata: err.metadata as grpc.Metadata,
      details: err
    };
  }
  
  // Fallback for unknown errors
  return {
    code: grpc.Code.Unknown,
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    details: error
  };
}

/**
 * Create GrpcServiceError from error object
 */
export function createGrpcError(
  code: grpc.Code, 
  message: string, 
  metadata?: grpc.Metadata,
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