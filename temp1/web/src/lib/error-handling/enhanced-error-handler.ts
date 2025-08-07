/**
 * Enhanced Error Handler
 * 
 * Xử lý lỗi toàn diện với retry logic, user feedback, và logging
 */

import { authToast, networkToast } from "@/components/ui/feedback/enhanced-toast";
import logger from '@/lib/utils/logger';

import { classifyError, logError, shouldRetry, getRetryDelay, getErrorMessage, ClassifiedError, ErrorType } from './error-classifier';

export interface ErrorHandlerOptions {
  context?: string;
  showToast?: boolean;
  enableRetry?: boolean;
  onRetry?: () => Promise<void>;
  onAuthRequired?: () => void;
  onRefreshRequired?: () => void;
  metadata?: Record<string, string | number | boolean | undefined>;
}

export interface ErrorHandlerResult {
  classification: ClassifiedError;
  handled: boolean;
  shouldRetry: boolean;
  retryDelay?: number;
}

/**
 * Enhanced Error Handler Class
 */
export class EnhancedErrorHandler {
  private retryAttempts: Map<string, number> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Handle error với comprehensive processing
   */
  async handleError(
    error: unknown,
    Options: ErrorHandlerOptions = {}
  ): Promise<ErrorHandlerResult> {
    const {
      context = 'unknown',
      showToast = true,
      enableRetry = true,
      onRetry,
      onAuthRequired,
      onRefreshRequired,
      metadata = {}
    } = options;

    // Classify the error
    const classification = classifyError(error);
    
    // Log error if needed
    logError(classification, error, { context, ...metadata });

    // Get current retry count
    const retryKey = `${context}-${classification.type}`;
    const currentRetryCount = this.retryAttempts.get(retryKey) || 0;

    // Determine if should retry
    const canRetry = enableRetry && 
                    shouldRetry(classification, currentRetryCount) && 
                    onRetry;

    // Handle specific error types
    await this.handleSpecificErrorType(classification, {
      onAuthRequired,
      onRefreshRequired,
      showToast
    });

    // Show toast notification if enabled
    if (showToast) {
      this.showErrorToast(classification, !!canRetry, onRetry);
    }

    // Setup retry if applicable
    let retryDelay: number | undefined;
    if (canRetry && onRetry) {
      retryDelay = getRetryDelay(classification, currentRetryCount);
      this.setupRetry(retryKey, onRetry, retryDelay);
    }

    return {
      classification,
      handled: true,
      shouldRetry: !!canRetry,
      retryDelay
    };
  }

  /**
   * Handle specific error types với custom logic
   */
  private async handleSpecificErrorType(
    classification: ClassifiedError,
    handlers: {
      onAuthRequired?: () => void;
      onRefreshRequired?: () => void;
      showToast?: boolean;
    }
  ) {
    const { onAuthRequired, onRefreshRequired } = handlers;

    switch (classification.type) {
      case ErrorType.SESSION_EXPIRED:
      case ErrorType.TOKEN_INVALID:
        if (classification.requiresRefresh && onRefreshRequired) {
          onRefreshRequired();
        } else if (classification.requiresAuth && onAuthRequired) {
          onAuthRequired();
        }
        break;

      case ErrorType.INVALID_CREDENTIALS:
      case ErrorType.INSUFFICIENT_PERMISSIONS:
        if (onAuthRequired) {
          onAuthRequired();
        }
        break;

      case ErrorType.ACCOUNT_LOCKED:
      case ErrorType.ACCOUNT_DISABLED:
        // Clear any stored auth data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          sessionStorage.clear();
        }
        break;

      case ErrorType.NETWORK_ERROR:
      case ErrorType.CONNECTION_ERROR:
        // Check network status
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          networkToast.offline();
        }
        break;
    }
  }

  /**
   * Show appropriate toast notification
   */
  private showErrorToast(
    classification: ClassifiedError,
    canRetry: boolean,
    onRetry?: () => Promise<void>
  ) {
    const message = getErrorMessage(classification);

    switch (classification.type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.CONNECTION_ERROR:
        networkToast.offline();
        break;

      case ErrorType.SESSION_EXPIRED:
        authToast.sessionExpired();
        break;

      case ErrorType.INVALID_CREDENTIALS:
        authToast.loginError(message, canRetry, onRetry);
        break;

      case ErrorType.RATE_LIMIT_EXCEEDED:
        const retryAfter = classification.metadata?.retryAfter;
        authToast.rateLimitExceeded(retryAfter);
        break;

      case ErrorType.SERVER_ERROR:
      case ErrorType.SERVICE_UNAVAILABLE:
        authToast.serverError(canRetry ? onRetry : undefined);
        break;

      case ErrorType.ACCOUNT_LOCKED:
      case ErrorType.ACCOUNT_DISABLED:
        authToast.loginError(message, false);
        break;

      default:
        // Generic error toast
        authToast.loginError(message, canRetry, onRetry);
        break;
    }
  }

  /**
   * Setup retry với delay
   */
  private setupRetry(
    retryKey: string,
    onRetry: () => Promise<void>,
    delay: number
  ) {
    // Clear existing timeout
    const existingTimeout = this.retryTimeouts.get(retryKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Increment retry count
    const currentCount = this.retryAttempts.get(retryKey) || 0;
    this.retryAttempts.set(retryKey, currentCount + 1);

    // Setup new timeout
    const timeout = setTimeout(async () => {
      try {
        await onRetry();
        // Reset retry count on success
        this.retryAttempts.delete(retryKey);
        this.retryTimeouts.delete(retryKey);
      } catch (error) {
        // Handle retry failure
        logger.error('Retry failed:', error);
      }
    }, delay);

    this.retryTimeouts.set(retryKey, timeout);
  }

  /**
   * Reset retry attempts cho một context
   */
  resetRetryAttempts(context: string) {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.retryAttempts) {
      if (key.startsWith(context)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.retryAttempts.delete(key);
      
      const timeout = this.retryTimeouts.get(key);
      if (timeout) {
        clearTimeout(timeout);
        this.retryTimeouts.delete(key);
      }
    });
  }

  /**
   * Clear all retry attempts và timeouts
   */
  clearAll() {
    // Clear all timeouts
    for (const timeout of this.retryTimeouts.values()) {
      clearTimeout(timeout);
    }

    // Clear maps
    this.retryAttempts.clear();
    this.retryTimeouts.clear();
  }

  /**
   * Get retry status cho một context
   */
  getRetryStatus(context: string): { attempts: number; hasActiveRetry: boolean } {
    let totalAttempts = 0;
    let hasActiveRetry = false;

    for (const [key, attempts] of this.retryAttempts) {
      if (key.startsWith(context)) {
        totalAttempts += attempts;
        if (this.retryTimeouts.has(key)) {
          hasActiveRetry = true;
        }
      }
    }

    return { attempts: totalAttempts, hasActiveRetry };
  }
}

// Global error handler instance
export const globalErrorHandler = new EnhancedErrorHandler();

/**
 * Convenience function để handle errors
 */
export async function handleError(
  error: unknown,
  Options: ErrorHandlerOptions = {}
): Promise<ErrorHandlerResult> {
  return globalErrorHandler.handleError(error, options);
}

/**
 * Hook để sử dụng error handler trong React components
 */
export function useEnhancedErrorHandler():  {
  handleError: (error: unknown, options?: ErrorHandlerOptions) => Promise<ErrorHandlerResult>;
  resetRetryAttempts: (context: string) => void;
  getRetryStatus: (context: string) => { attempts: number; hasActiveRetry: boolean };
  clearAll: () => void;
} {
  return {
    handleError: (error: unknown, Options: ErrorHandlerOptions = {}) =>
      globalErrorHandler.handleError(error, options),
    resetRetryAttempts: (context: string) =>
      globalErrorHandler.resetRetryAttempts(context),
    getRetryStatus: (context: string) =>
      globalErrorHandler.getRetryStatus(context),
    clearAll: () => globalErrorHandler.clearAll()
  };
}
