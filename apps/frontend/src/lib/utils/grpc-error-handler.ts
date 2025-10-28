/**
 * gRPC Error Handler - Enhanced Token Expiry Handling
 * ===================================================
 * 
 * Handles gRPC errors with specific focus on JWT token expiry
 * Provides user-friendly error messages and recovery mechanisms
 * 
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 1 Quick Fix
 */

import { RpcError } from 'grpc-web';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import { AuthHelpers } from '@/lib/utils/auth-helpers';

/**
 * gRPC Error Types for better error classification
 */
export enum GrpcErrorType {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error Recovery Actions
 */
export enum RecoveryAction {
  REFRESH_PAGE = 'REFRESH_PAGE',
  REDIRECT_LOGIN = 'REDIRECT_LOGIN',
  RETRY_REQUEST = 'RETRY_REQUEST',
  SHOW_MESSAGE = 'SHOW_MESSAGE',
  NO_ACTION = 'NO_ACTION',
}

/**
 * Error Classification Result
 */
export interface ErrorClassification {
  type: GrpcErrorType;
  userMessage: string;
  technicalMessage: string;
  recoveryAction: RecoveryAction;
  shouldLog: boolean;
  retryable: boolean;
}

/**
 * Main gRPC Error Handler Class
 */
export class GrpcErrorHandler {
  /**
   * Handle gRPC error with automatic classification and recovery
   * 
   * @param error - RpcError from gRPC call
   * @param context - Context where error occurred (for logging)
   * @returns Promise<boolean> - true if error was handled/recovered
   */
  static async handleError(error: RpcError, context: string = 'unknown'): Promise<boolean> {
    const classification = this.classifyError(error);
    
    // Log error if needed
    if (classification.shouldLog) {
      logger.error(`[GrpcErrorHandler] ${context}:`, {
        type: classification.type,
        code: error.code,
        message: error.message,
        technicalMessage: classification.technicalMessage,
      });
    }
    
    // Execute recovery action
    return await this.executeRecoveryAction(classification, context);
  }
  
  /**
   * Check if error is token expired specifically
   */
  static isTokenExpiredError(error: RpcError): boolean {
    const message = error.message?.toLowerCase() || '';
    
    return (
      message.includes('token has expired') ||
      message.includes('jwt:validateaccesstoken') ||
      message.includes('token expired') ||
      (error.code === 16 && message.includes('invalid token')) // UNAUTHENTICATED with token context
    );
  }
  
  /**
   * Check if error is authentication related
   */
  static isAuthenticationError(error: RpcError): boolean {
    return (
      error.code === 16 || // UNAUTHENTICATED
      this.isTokenExpiredError(error) ||
      error.message?.toLowerCase().includes('unauthorized') ||
      error.message?.toLowerCase().includes('authentication')
    );
  }
  
  /**
   * Check if error is network related
   */
  static isNetworkError(error: RpcError): boolean {
    const message = error.message?.toLowerCase() || '';
    
    return (
      error.code === 14 || // UNAVAILABLE
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('fetch')
    );
  }
  
  /**
   * Classify error into specific type with recovery strategy
   */
  private static classifyError(error: RpcError): ErrorClassification {
    // Token Expired - Highest Priority
    if (this.isTokenExpiredError(error)) {
      return {
        type: GrpcErrorType.TOKEN_EXPIRED,
        userMessage: 'Phiên đăng nhập đã hết hạn. Đang làm mới trang...',
        technicalMessage: `JWT token expired: ${error.message}`,
        recoveryAction: RecoveryAction.REFRESH_PAGE,
        shouldLog: true,
        retryable: true,
      };
    }
    
    // General Authentication Error
    if (this.isAuthenticationError(error)) {
      return {
        type: GrpcErrorType.UNAUTHENTICATED,
        userMessage: 'Bạn cần đăng nhập để thực hiện thao tác này.',
        technicalMessage: `Authentication failed: ${error.message}`,
        recoveryAction: RecoveryAction.REDIRECT_LOGIN,
        shouldLog: true,
        retryable: false,
      };
    }
    
    // Permission Denied
    if (error.code === 7) { // PERMISSION_DENIED
      return {
        type: GrpcErrorType.PERMISSION_DENIED,
        userMessage: 'Bạn không có quyền thực hiện thao tác này.',
        technicalMessage: `Permission denied: ${error.message}`,
        recoveryAction: RecoveryAction.SHOW_MESSAGE,
        shouldLog: true,
        retryable: false,
      };
    }
    
    // Network Error
    if (this.isNetworkError(error)) {
      return {
        type: GrpcErrorType.NETWORK_ERROR,
        userMessage: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.',
        technicalMessage: `Network error: ${error.message}`,
        recoveryAction: RecoveryAction.RETRY_REQUEST,
        shouldLog: true,
        retryable: true,
      };
    }
    
    // Server Error
    if (error.code >= 13 && error.code <= 16) { // INTERNAL, UNAVAILABLE, DATA_LOSS, UNAUTHENTICATED
      return {
        type: GrpcErrorType.SERVER_ERROR,
        userMessage: 'Lỗi máy chủ. Vui lòng thử lại sau ít phút.',
        technicalMessage: `Server error (${error.code}): ${error.message}`,
        recoveryAction: RecoveryAction.SHOW_MESSAGE,
        shouldLog: true,
        retryable: true,
      };
    }
    
    // Validation Error
    if (error.code === 3) { // INVALID_ARGUMENT
      return {
        type: GrpcErrorType.VALIDATION_ERROR,
        userMessage: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra và thử lại.',
        technicalMessage: `Validation error: ${error.message}`,
        recoveryAction: RecoveryAction.SHOW_MESSAGE,
        shouldLog: false, // Don't log validation errors
        retryable: false,
      };
    }
    
    // Unknown Error
    return {
      type: GrpcErrorType.UNKNOWN_ERROR,
      userMessage: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
      technicalMessage: `Unknown error (${error.code}): ${error.message}`,
      recoveryAction: RecoveryAction.SHOW_MESSAGE,
      shouldLog: true,
      retryable: false,
    };
  }
  
  /**
   * Execute recovery action based on error classification
   */
  private static async executeRecoveryAction(
    classification: ErrorClassification,
    context: string
  ): Promise<boolean> {
    switch (classification.recoveryAction) {
      case RecoveryAction.REFRESH_PAGE:
        // Show loading toast before refresh
        toast.loading(classification.userMessage, {
          duration: 2000,
        });
        
        // Small delay to show message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
        return true;
      
      case RecoveryAction.REDIRECT_LOGIN:
        // Show message before redirect
        toast.error(classification.userMessage, {
          duration: 3000,
        });
        
        // Clear tokens and redirect
        AuthHelpers.clearTokens();
        
        setTimeout(() => {
          const currentPath = window.location.pathname;
          const redirectUrl = `/login?reason=token_expired&redirect=${encodeURIComponent(currentPath)}`;
          window.location.href = redirectUrl;
        }, 2000);
        
        return true;
      
      case RecoveryAction.RETRY_REQUEST:
        // Show retry message
        toast.warning(`${classification.userMessage} Đang thử lại...`, {
          duration: 3000,
        });
        
        // Return false to indicate caller should retry
        return false;
      
      case RecoveryAction.SHOW_MESSAGE:
        // Show appropriate toast based on error type
        if (classification.type === GrpcErrorType.PERMISSION_DENIED) {
          toast.warning(classification.userMessage, {
            duration: 4000,
          });
        } else if (classification.type === GrpcErrorType.VALIDATION_ERROR) {
          toast.error(classification.userMessage, {
            duration: 3000,
          });
        } else {
          toast.error(classification.userMessage, {
            duration: 4000,
          });
        }
        
        return true;
      
      case RecoveryAction.NO_ACTION:
      default:
        return false;
    }
  }
  
  /**
   * Handle token expiry specifically (legacy method for backward compatibility)
   */
  static handleTokenExpiredError(error: RpcError, context: string = 'unknown'): void {
    if (this.isTokenExpiredError(error)) {
      logger.warn(`[GrpcErrorHandler] Token expired in ${context}, refreshing page`);
      
      // Show user-friendly message
      toast.loading('Phiên đăng nhập đã hết hạn. Đang làm mới trang...', {
        duration: 2000,
      });
      
      // Refresh page after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }
  
  /**
   * Get user-friendly error message for any gRPC error
   */
  static getUserFriendlyMessage(error: RpcError): string {
    const classification = this.classifyError(error);
    return classification.userMessage;
  }
  
  /**
   * Check if error should trigger automatic retry
   */
  static shouldRetry(error: RpcError): boolean {
    const classification = this.classifyError(error);
    return classification.retryable;
  }
}

/**
 * Convenience function for handling gRPC errors in components
 * 
 * @example
 * ```typescript
 * try {
 *   const response = await examService.getExam(examId);
 * } catch (error) {
 *   const handled = await handleGrpcError(error as RpcError, 'getExam');
 *   if (!handled) {
 *     // Handle error manually if needed
 *   }
 * }
 * ```
 */
export async function handleGrpcError(error: RpcError, context: string = 'unknown'): Promise<boolean> {
  return await GrpcErrorHandler.handleError(error, context);
}

/**
 * Get error message from RpcError (synchronous)
 * For use in error constructors where async is not possible
 */
export function getGrpcErrorMessage(error: RpcError): string {
  return GrpcErrorHandler.getUserFriendlyMessage(error);
}

/**
 * Export types for external use
 */


