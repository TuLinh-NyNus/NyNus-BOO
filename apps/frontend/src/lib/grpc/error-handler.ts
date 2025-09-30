/**
 * Centralized gRPC Error Handler
 * Handles all gRPC errors with consistent error messages and actions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { RpcError } from 'grpc-web';
import { toast } from '@/hooks';

/**
 * gRPC Status Codes
 * Reference: https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export enum GrpcStatusCode {
  OK = 0,
  CANCELLED = 1,
  UNKNOWN = 2,
  INVALID_ARGUMENT = 3,
  DEADLINE_EXCEEDED = 4,
  NOT_FOUND = 5,
  ALREADY_EXISTS = 6,
  PERMISSION_DENIED = 7,
  RESOURCE_EXHAUSTED = 8,
  FAILED_PRECONDITION = 9,
  ABORTED = 10,
  OUT_OF_RANGE = 11,
  UNIMPLEMENTED = 12,
  INTERNAL = 13,
  UNAVAILABLE = 14,
  DATA_LOSS = 15,
  UNAUTHENTICATED = 16,
}

/**
 * Error messages in Vietnamese for user-facing errors
 */
const ERROR_MESSAGES: Record<GrpcStatusCode, string> = {
  [GrpcStatusCode.OK]: 'Thành công',
  [GrpcStatusCode.CANCELLED]: 'Yêu cầu đã bị hủy',
  [GrpcStatusCode.UNKNOWN]: 'Lỗi không xác định',
  [GrpcStatusCode.INVALID_ARGUMENT]: 'Dữ liệu không hợp lệ',
  [GrpcStatusCode.DEADLINE_EXCEEDED]: 'Yêu cầu quá thời gian chờ',
  [GrpcStatusCode.NOT_FOUND]: 'Không tìm thấy dữ liệu',
  [GrpcStatusCode.ALREADY_EXISTS]: 'Dữ liệu đã tồn tại',
  [GrpcStatusCode.PERMISSION_DENIED]: 'Bạn không có quyền thực hiện thao tác này',
  [GrpcStatusCode.RESOURCE_EXHAUSTED]: 'Tài nguyên đã hết',
  [GrpcStatusCode.FAILED_PRECONDITION]: 'Điều kiện tiên quyết không được đáp ứng',
  [GrpcStatusCode.ABORTED]: 'Yêu cầu đã bị hủy bỏ',
  [GrpcStatusCode.OUT_OF_RANGE]: 'Giá trị nằm ngoài phạm vi cho phép',
  [GrpcStatusCode.UNIMPLEMENTED]: 'Chức năng chưa được triển khai',
  [GrpcStatusCode.INTERNAL]: 'Lỗi hệ thống nội bộ',
  [GrpcStatusCode.UNAVAILABLE]: 'Dịch vụ tạm thời không khả dụng',
  [GrpcStatusCode.DATA_LOSS]: 'Mất dữ liệu',
  [GrpcStatusCode.UNAUTHENTICATED]: 'Bạn cần đăng nhập để tiếp tục',
};

/**
 * Error actions based on status code
 */
interface ErrorAction {
  shouldRedirect?: boolean;
  redirectUrl?: string;
  shouldRetry?: boolean;
  shouldLogout?: boolean;
  shouldShowToast?: boolean;
}

const ERROR_ACTIONS: Partial<Record<GrpcStatusCode, ErrorAction>> = {
  [GrpcStatusCode.UNAUTHENTICATED]: {
    shouldRedirect: true,
    redirectUrl: '/login',
    shouldLogout: true,
    shouldShowToast: true,
  },
  [GrpcStatusCode.PERMISSION_DENIED]: {
    shouldShowToast: true,
  },
  [GrpcStatusCode.UNAVAILABLE]: {
    shouldRetry: true,
    shouldShowToast: true,
  },
  [GrpcStatusCode.DEADLINE_EXCEEDED]: {
    shouldRetry: true,
    shouldShowToast: true,
  },
  [GrpcStatusCode.INTERNAL]: {
    shouldShowToast: true,
  },
};

/**
 * Centralized gRPC Error Handler
 */
export class GrpcErrorHandler {
  /**
   * Handle gRPC error with appropriate action
   * @param error - RpcError from gRPC call
   * @param customMessage - Optional custom error message
   * @returns Never (always throws)
   */
  static handle(error: RpcError, customMessage?: string): never {
    const code = error.code as unknown as GrpcStatusCode;
    const message = customMessage || error.message || ERROR_MESSAGES[code] || 'Lỗi không xác định';
    const action = ERROR_ACTIONS[code];

    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('[gRPC Error]', {
        code,
        message: error.message,
        metadata: error.metadata,
      });
    }

    // Show toast notification
    if (action?.shouldShowToast !== false) {
      toast({
        title: 'Lỗi',
        description: message,
        variant: 'destructive',
      });
    }

    // Logout if needed
    if (action?.shouldLogout && typeof window !== 'undefined') {
      localStorage.removeItem('nynus-auth-token');
      localStorage.removeItem('nynus-refresh-token');
    }

    // Redirect if needed
    if (action?.shouldRedirect && action.redirectUrl && typeof window !== 'undefined') {
      window.location.href = action.redirectUrl;
    }

    // Throw error for caller to handle
    throw new Error(message);
  }

  /**
   * Handle error with retry logic
   * @param error - RpcError from gRPC call
   * @param retryFn - Function to retry
   * @param maxRetries - Maximum number of retries (default: 3)
   * @returns Promise that resolves when retry succeeds
   */
  static async handleWithRetry<T>(
    error: RpcError,
    retryFn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    const code = error.code as unknown as GrpcStatusCode;
    const action = ERROR_ACTIONS[code];

    // Only retry if action allows it
    if (!action?.shouldRetry) {
      return this.handle(error);
    }

    // Retry with exponential backoff
    for (let i = 0; i < maxRetries; i++) {
      try {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        return await retryFn();
      } catch (_retryError) {
        if (i === maxRetries - 1) {
          return this.handle(error, `Không thể kết nối sau ${maxRetries} lần thử`);
        }
      }
    }

    // This should never be reached, but TypeScript requires it
    return this.handle(error);
  }

  /**
   * Get user-friendly error message
   * @param error - RpcError from gRPC call
   * @returns User-friendly error message in Vietnamese
   */
  static getMessage(error: RpcError): string {
    const code = error.code as unknown as GrpcStatusCode;
    return ERROR_MESSAGES[code] || error.message || 'Lỗi không xác định';
  }

  /**
   * Check if error is retryable
   * @param error - RpcError from gRPC call
   * @returns True if error can be retried
   */
  static isRetryable(error: RpcError): boolean {
    const code = error.code as unknown as GrpcStatusCode;
    const action = ERROR_ACTIONS[code];
    return action?.shouldRetry === true;
  }

  /**
   * Check if error requires authentication
   * @param error - RpcError from gRPC call
   * @returns True if error is authentication-related
   */
  static isAuthError(error: RpcError): boolean {
    const code = error.code as unknown as GrpcStatusCode;
    return code === GrpcStatusCode.UNAUTHENTICATED;
  }

  /**
   * Check if error is permission-related
   * @param error - RpcError from gRPC call
   * @returns True if error is permission-related
   */
  static isPermissionError(error: RpcError): boolean {
    const code = error.code as unknown as GrpcStatusCode;
    return code === GrpcStatusCode.PERMISSION_DENIED;
  }
}

/**
 * Utility function to wrap gRPC calls with error handling
 * @param fn - gRPC function to call
 * @param customMessage - Optional custom error message
 * @returns Promise that resolves with result or rejects with handled error
 */
export async function withGrpcErrorHandling<T>(
  fn: () => Promise<T>,
  customMessage?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      return GrpcErrorHandler.handle(error as RpcError, customMessage);
    }
    throw error;
  }
}

/**
 * Utility function to wrap gRPC calls with retry logic
 * @param fn - gRPC function to call
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Promise that resolves with result or rejects with handled error
 */
export async function withGrpcRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      return GrpcErrorHandler.handleWithRetry(error as RpcError, fn, maxRetries);
    }
    throw error;
  }
}

