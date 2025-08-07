/**
 * useErrorHandler Hook
 * Hook cho error handling với comprehensive error management
 */

import { useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

import { AdminError, AdminErrorType, ErrorSeverity } from "../api/utils/error-handler";
import { useAdminErrorContext } from "../error-handling/error-context";
import { adminRetryManager, ADMIN_RETRY_CONFIGS } from "../api/utils/retry-manager";

/**
 * Error handler options
 * Tùy chọn error handler
 */
interface UseErrorHandlerOptions {
  showToast?: boolean;
  enableRetry?: boolean;
  retryAttempts?: number;
  onError?: (error: AdminError) => void;
  onRecovery?: (error: AdminError) => void;
  context?: {
    component?: string;
    action?: string;
    resource?: string;
  };
}

/**
 * Error handler return type
 * Loại return của error handler
 */
interface UseErrorHandlerReturn {
  // Error handling
  handleError: (error: any, additionalContext?: any) => Promise<AdminError>;
  handleAsyncError: <T>(asyncFn: () => Promise<T>, errorContext?: any) => Promise<T | null>;

  // Error state
  hasErrors: boolean;
  lastError: AdminError | null;
  errorCount: number;

  // Recovery
  retry: (error?: AdminError) => Promise<boolean>;
  clearErrors: () => void;

  // Utility
  createErrorHandler: <T extends any[]>(
    fn: (...args: T) => Promise<any>,
    context?: any
  ) => (...args: T) => Promise<any>;
}

/**
 * useErrorHandler Hook
 * Hook chính cho error handling
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const {
    showToast = true,
    enableRetry = true,
    retryAttempts = 3,
    onError,
    onRecovery,
    context = {},
  } = options;

  const errorContext = useAdminErrorContext();
  const retryCountRef = useRef<Map<string, number>>(new Map());

  /**
   * Handle error with comprehensive processing
   * Xử lý error với processing toàn diện
   */
  const handleError = useCallback(
    async (error: any, additionalContext?: any): Promise<AdminError> => {
      const fullContext = {
        ...context,
        ...additionalContext,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      };

      try {
        const adminError = await errorContext.addError(error, fullContext);

        // Show toast notification if enabled
        if (showToast) {
          showErrorToast(adminError);
        }

        // Call onError callback
        if (onError) {
          onError(adminError);
        }

        // Attempt automatic retry for recoverable errors
        if (enableRetry && adminError.recoverable && adminError.retryable) {
          const errorKey = `${adminError.type}_${adminError.timestamp}`;
          const currentRetryCount = retryCountRef.current.get(errorKey) || 0;

          if (currentRetryCount < retryAttempts) {
            retryCountRef.current.set(errorKey, currentRetryCount + 1);

            // Schedule retry with exponential backoff
            setTimeout(
              async () => {
                try {
                  const recovered = await errorContext.attemptRecovery(adminError);
                  if (recovered && onRecovery) {
                    onRecovery(adminError);
                  }
                } catch (retryError) {
                  console.error("Automatic retry failed:", retryError);
                }
              },
              Math.min(1000 * Math.pow(2, currentRetryCount), 10000)
            );
          }
        }

        return adminError;
      } catch (handlingError) {
        console.error("Error handling failed:", handlingError);

        // Fallback error
        const fallbackError: AdminError = {
          type: AdminErrorType.UNKNOWN_ERROR,
          severity: ErrorSeverity.HIGH,
          message: "Error handling failed",
          userMessage: "Đã xảy ra lỗi trong quá trình xử lý lỗi",
          timestamp: new Date().toISOString(),
          recoverable: false,
          retryable: false,
        };

        return fallbackError;
      }
    },
    [context, errorContext, showToast, onError, enableRetry, retryAttempts, onRecovery]
  );

  /**
   * Handle async function with error catching
   * Xử lý async function với error catching
   */
  const handleAsyncError = useCallback(
    async <T>(asyncFn: () => Promise<T>, errorContext?: any): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        await handleError(error, errorContext);
        return null;
      }
    },
    [handleError]
  );

  /**
   * Retry last error or specific error
   * Retry error cuối hoặc error cụ thể
   */
  const retry = useCallback(
    async (error?: AdminError): Promise<boolean> => {
      try {
        if (error) {
          return await errorContext.attemptRecovery(error);
        } else {
          await errorContext.retryLastOperation();
          return true;
        }
      } catch (retryError) {
        console.error("Retry failed:", retryError);
        return false;
      }
    },
    [errorContext]
  );

  /**
   * Clear all errors
   * Xóa tất cả errors
   */
  const clearErrors = useCallback(() => {
    errorContext.clearErrors();
    retryCountRef.current.clear();
  }, [errorContext]);

  /**
   * Create error handler wrapper for functions
   * Tạo wrapper error handler cho functions
   */
  const createErrorHandler = useCallback(
    <T extends any[]>(fn: (...args: T) => Promise<any>, fnContext?: any) => {
      return async (...args: T) => {
        try {
          return await fn(...args);
        } catch (error) {
          await handleError(error, {
            ...fnContext,
            functionArgs: args,
            functionName: fn.name,
          });
          throw error; // Re-throw to maintain original behavior
        }
      };
    },
    [handleError]
  );

  // Computed values
  const hasErrors = errorContext.hasErrors();
  const recentErrors = errorContext.getRecentErrors(1);
  const lastError = recentErrors.length > 0 ? recentErrors[0] : null;
  const errorCount = errorContext.state.errors.length;

  // Cleanup retry counts on unmount
  useEffect(() => {
    return () => {
      retryCountRef.current.clear();
    };
  }, []);

  return {
    handleError,
    handleAsyncError,
    hasErrors,
    lastError,
    errorCount,
    retry,
    clearErrors,
    createErrorHandler,
  };
}

/**
 * Show error toast notification
 * Hiển thị toast notification cho error
 */
function showErrorToast(error: AdminError): void {
  const toastOptions = {
    description: error.suggestions?.[0] || "Vui lòng thử lại sau.",
    duration: getToastDuration(error.severity),
  };

  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      toast.error(error.userMessage, {
        ...toastOptions,
        duration: 0, // Don't auto-dismiss critical errors
      });
      break;
    case ErrorSeverity.HIGH:
      toast.error(error.userMessage, toastOptions);
      break;
    case ErrorSeverity.MEDIUM:
      toast.warning(error.userMessage, toastOptions);
      break;
    case ErrorSeverity.LOW:
      toast.info(error.userMessage, toastOptions);
      break;
  }
}

/**
 * Get toast duration based on error severity
 * Lấy duration toast dựa trên severity error
 */
function getToastDuration(severity: ErrorSeverity): number {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 0; // Don't auto-dismiss
    case ErrorSeverity.HIGH:
      return 8000;
    case ErrorSeverity.MEDIUM:
      return 5000;
    case ErrorSeverity.LOW:
      return 3000;
    default:
      return 5000;
  }
}

/**
 * useAsyncError Hook
 * Hook cho async error handling
 */
export function useAsyncError() {
  const { handleAsyncError } = useErrorHandler();

  return useCallback(
    <T>(asyncFn: () => Promise<T>, errorContext?: any): Promise<T | null> => {
      return handleAsyncError(asyncFn, errorContext);
    },
    [handleAsyncError]
  );
}

/**
 * useErrorBoundary Hook
 * Hook cho error boundary functionality
 */
export function useErrorBoundary() {
  const { handleError } = useErrorHandler();

  const captureError = useCallback(
    (error: Error, errorInfo?: any) => {
      handleError(error, {
        ...errorInfo,
        source: "ERROR_BOUNDARY",
        componentStack: errorInfo?.componentStack,
      });
    },
    [handleError]
  );

  return { captureError };
}

/**
 * useRetryableOperation Hook
 * Hook cho retryable operations
 */
export function useRetryableOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: {
    maxAttempts?: number;
    retryDelay?: number;
    retryCondition?: (error: any) => boolean;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
) {
  const { handleError } = useErrorHandler();

  const executeWithRetry = useCallback(
    async (...args: T): Promise<R> => {
      const { maxAttempts = 3, retryDelay = 1000, retryCondition = () => true, onRetry } = options;

      return adminRetryManager.retry(() => operation(...args), {
        maxAttempts,
        baseDelay: retryDelay,
        retryCondition,
        onRetry: (attempt, error) => {
          handleError(error, {
            operation: operation.name,
            attempt,
            args,
          });
          onRetry?.(attempt, error);
        },
      });
    },
    [operation, options, handleError]
  );

  return executeWithRetry;
}
