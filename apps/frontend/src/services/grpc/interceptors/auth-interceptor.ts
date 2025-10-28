/**
 * gRPC Authentication Interceptor
 * ==============================
 * 
 * Provides automatic token refresh and retry logic for gRPC calls
 * Handles token expiry transparently without user intervention
 * 
 * Features:
 * - Automatic token expiry detection
 * - Token refresh with retry logic
 * - Concurrent request deduplication
 * - Error classification and recovery
 * 
 * @author NyNus Development Team
 * @version 2.0.0 - Phase 2 Auto-Retry Implementation
 */

import { getSession } from 'next-auth/react';
import { AuthHelpers } from '@/lib/utils/auth-helpers';
import { GrpcErrorHandler } from '@/lib/utils/grpc-error-handler';
import { logger } from '@/lib/utils/logger';
import { toast } from 'sonner';
import type { RpcError } from 'grpc-web';

/**
 * Token refresh state management
 */
interface RefreshState {
  isRefreshing: boolean;
  refreshPromise: Promise<string> | null;
  lastRefreshTime: number;
  refreshAttempts: number;
}

/**
 * Request retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  retryDelay: 1000, // 1 second
  exponentialBackoff: true,
};

/**
 * gRPC Authentication Interceptor Class
 */
export class AuthInterceptor {
  private refreshState: RefreshState = {
    isRefreshing: false,
    refreshPromise: null,
    lastRefreshTime: 0,
    refreshAttempts: 0,
  };

  private readonly config: RetryConfig;
  private readonly minRefreshInterval = 30 * 1000; // 30 seconds minimum between refreshes

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
    logger.debug('[AuthInterceptor] Initialized with config:', this.config as unknown as Record<string, unknown>);
  }

  /**
   * Intercept unary gRPC calls with automatic retry logic
   * 
   * @param request - gRPC request object
   * @param invoker - Function to invoke the actual gRPC call
   * @returns Promise<Response> - gRPC response or throws error
   */
  async interceptUnary<TRequest, TResponse>(
    request: TRequest,
    invoker: (request: TRequest, metadata?: Record<string, string>) => Promise<TResponse>,
    context: string = 'unknown'
  ): Promise<TResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    logger.debug(`[AuthInterceptor] Intercepting ${context} request`);

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Get fresh token for each attempt
        const token = await this.getFreshToken();
        const metadata = this.buildMetadata(token);

        logger.debug(`[AuthInterceptor] ${context} attempt ${attempt + 1}/${this.config.maxRetries + 1}`, {
          hasToken: !!token,
          tokenLength: token?.length || 0,
        });

        // Make the gRPC call
        const response = await invoker(request, metadata);

        // Log successful call
        const duration = Date.now() - startTime;
        logger.debug(`[AuthInterceptor] ${context} successful`, {
          attempt: attempt + 1,
          duration: `${duration}ms`,
        });

        return response;

      } catch (error) {
        lastError = error as Error;
        const rpcError = error as RpcError;

        logger.warn(`[AuthInterceptor] ${context} attempt ${attempt + 1} failed`, {
          error: rpcError.message,
          code: rpcError.code,
        });

        // Check if this is a token expiry error and we can retry
        if (this.isTokenExpiredError(rpcError) && attempt < this.config.maxRetries) {
          logger.info(`[AuthInterceptor] Token expired in ${context}, refreshing... (attempt ${attempt + 1})`);
          
          try {
            await this.refreshTokenIfNeeded(true); // Force refresh
            
            // Add delay before retry if configured
            if (this.config.retryDelay > 0) {
              const delay = this.config.exponentialBackoff 
                ? this.config.retryDelay * Math.pow(2, attempt)
                : this.config.retryDelay;
              
              logger.debug(`[AuthInterceptor] Waiting ${delay}ms before retry`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            continue; // Retry with new token
          } catch (refreshError) {
            logger.error(`[AuthInterceptor] Token refresh failed for ${context}:`, { 
              error: refreshError instanceof Error ? refreshError.message : String(refreshError) 
            });
            // Don't retry if refresh fails
            break;
          }
        }

        // Check if this is a retryable network error
        if (this.isRetryableError(rpcError) && attempt < this.config.maxRetries) {
          logger.info(`[AuthInterceptor] Retryable error in ${context}, retrying... (attempt ${attempt + 1})`);
          
          const delay = this.config.exponentialBackoff 
            ? this.config.retryDelay * Math.pow(2, attempt)
            : this.config.retryDelay;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Non-retryable error or max retries reached
        break;
      }
    }

    // All retries failed
    const duration = Date.now() - startTime;
    logger.error(`[AuthInterceptor] ${context} failed after all retries`, {
      attempts: this.config.maxRetries + 1,
      duration: `${duration}ms`,
      finalError: lastError?.message,
    });

    // Use enhanced error handler for final error
    if (lastError && 'code' in lastError) {
      const handled = await GrpcErrorHandler.handleError(lastError as RpcError, context);
      if (handled) {
        // Error was handled (e.g., page refresh), throw a handled error
        throw new Error(`Request ${context} was handled by error recovery`);
      }
    }

    throw lastError || new Error(`Request ${context} failed after ${this.config.maxRetries + 1} attempts`);
  }

  /**
   * Get fresh token with automatic refresh if needed
   * 
   * @param forceRefresh - Force token refresh even if current token seems valid
   * @returns Promise<string> - Fresh access token
   */
  private async getFreshToken(forceRefresh: boolean = false): Promise<string> {
    const token = AuthHelpers.getAccessToken();

    // If no token or token is expiring soon, refresh it
    if (!token || forceRefresh || AuthHelpers.isTokenExpiringSoon(token, 120)) { // 2 minutes
      logger.debug('[AuthInterceptor] Token missing or expiring soon, refreshing...');
      return await this.refreshTokenIfNeeded(forceRefresh);
    }

    return token;
  }

  /**
   * Refresh token if needed with deduplication
   * 
   * @param forceRefresh - Force refresh even if recently refreshed
   * @returns Promise<string> - New access token
   */
  private async refreshTokenIfNeeded(forceRefresh: boolean = false): Promise<string> {
    const now = Date.now();

    // Check if we recently refreshed (prevent spam)
    if (!forceRefresh && 
        this.refreshState.lastRefreshTime > 0 && 
        (now - this.refreshState.lastRefreshTime) < this.minRefreshInterval) {
      logger.debug('[AuthInterceptor] Recently refreshed, using existing token');
      const existingToken = AuthHelpers.getAccessToken();
      if (existingToken) {
        return existingToken;
      }
    }

    // If already refreshing, wait for existing refresh
    if (this.refreshState.isRefreshing && this.refreshState.refreshPromise) {
      logger.debug('[AuthInterceptor] Refresh already in progress, waiting...');
      return await this.refreshState.refreshPromise;
    }

    // Start new refresh
    this.refreshState.isRefreshing = true;
    this.refreshState.refreshAttempts++;
    this.refreshState.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshState.refreshPromise;
      this.refreshState.lastRefreshTime = now;
      
      logger.info('[AuthInterceptor] Token refresh successful', {
        attempts: this.refreshState.refreshAttempts,
      });

      return newToken;
    } catch (error) {
      logger.error('[AuthInterceptor] Token refresh failed:', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    } finally {
      this.refreshState.isRefreshing = false;
      this.refreshState.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh operation
   * 
   * @returns Promise<string> - New access token
   */
  private async performTokenRefresh(): Promise<string> {
    try {
      // Get session from NextAuth
      const session = await getSession();

      if (!session?.backendRefreshToken) {
        throw new Error('No refresh token available in session');
      }

      logger.debug('[AuthInterceptor] Calling AuthService.refreshToken...');

      // ✅ FIX: Use dynamic import to avoid circular dependency
      const { AuthService } = await import('@/services/grpc/auth.service');
      const response = await AuthService.refreshToken(session.backendRefreshToken);
      const newToken = response.getAccessToken();

      if (!newToken) {
        throw new Error('No access token in refresh response');
      }

      // Update localStorage with new token
      AuthHelpers.saveAccessToken(newToken);

      // Show subtle success notification
      toast.success('Phiên đăng nhập đã được làm mới', {
        duration: 2000,
        position: 'bottom-right',
      });

      logger.info('[AuthInterceptor] Token refresh completed successfully');
      return newToken;

    } catch (error) {
      logger.error('[AuthInterceptor] Token refresh operation failed:', { 
        error: error instanceof Error ? error.message : String(error) 
      });

      // Check if this is a refresh token expiry
      if (error instanceof Error && 
          (error.message.includes('REFRESH_TOKEN_EXPIRED') || 
           error.message.includes('refresh token'))) {
        
        // Clear tokens and redirect to login
        AuthHelpers.clearTokens();
        
        toast.error('Phiên đăng nhập đã hết hạn. Đang chuyển hướng...', {
          duration: 3000,
        });

        setTimeout(() => {
          const currentPath = window.location.pathname;
          const redirectUrl = `/login?reason=session_expired&redirect=${encodeURIComponent(currentPath)}`;
          window.location.href = redirectUrl;
        }, 2000);
      }

      throw error;
    }
  }

  /**
   * Build gRPC metadata with authentication token
   * 
   * @param token - Access token
   * @returns Record<string, string> - gRPC metadata
   */
  private buildMetadata(token: string): Record<string, string> {
    const metadata: Record<string, string> = {};

    // Add authorization header
    if (token) {
      metadata['authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token if available
    const csrfToken = AuthHelpers.getCSRFToken();
    if (csrfToken) {
      metadata['x-csrf-token'] = csrfToken;
    }

    return metadata;
  }

  /**
   * Check if error is token expired
   * 
   * @param error - RpcError from gRPC call
   * @returns boolean - true if token expired
   */
  private isTokenExpiredError(error: RpcError): boolean {
    return GrpcErrorHandler.isTokenExpiredError(error);
  }

  /**
   * Check if error is retryable (network issues, temporary server errors)
   * 
   * @param error - RpcError from gRPC call
   * @returns boolean - true if error is retryable
   */
  private isRetryableError(error: RpcError): boolean {
    // Network errors (UNAVAILABLE)
    if (error.code === 14) return true;
    
    // Internal server errors (INTERNAL)
    if (error.code === 13) return true;
    
    // Deadline exceeded (DEADLINE_EXCEEDED)
    if (error.code === 4) return true;

    // Check message for network-related errors
    const message = error.message?.toLowerCase() || '';
    return (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('fetch') ||
      message.includes('unavailable')
    );
  }

  /**
   * Reset refresh state (useful for testing or manual reset)
   */
  public resetRefreshState(): void {
    this.refreshState = {
      isRefreshing: false,
      refreshPromise: null,
      lastRefreshTime: 0,
      refreshAttempts: 0,
    };
    logger.debug('[AuthInterceptor] Refresh state reset');
  }

  /**
   * Get current refresh statistics
   */
  public getRefreshStats(): Readonly<RefreshState> {
    return { ...this.refreshState };
  }
}

/**
 * Global interceptor instance
 * Singleton pattern to ensure consistent state across all gRPC calls
 */
let globalAuthInterceptor: AuthInterceptor | null = null;

/**
 * Get or create global auth interceptor instance
 * 
 * @param config - Optional configuration override
 * @returns AuthInterceptor - Global interceptor instance
 */
export function getAuthInterceptor(config?: Partial<RetryConfig>): AuthInterceptor {
  if (!globalAuthInterceptor) {
    globalAuthInterceptor = new AuthInterceptor(config);
    logger.debug('[AuthInterceptor] Global instance created');
  }
  return globalAuthInterceptor;
}

/**
 * Reset global interceptor (useful for testing)
 */
export function resetGlobalInterceptor(): void {
  globalAuthInterceptor = null;
  logger.debug('[AuthInterceptor] Global instance reset');
}

/**
 * Convenience function for intercepting gRPC calls
 * 
 * @example
 * ```typescript
 * const response = await interceptGrpcCall(
 *   request,
 *   (req, metadata) => client.someMethod(req, metadata),
 *   'someMethod'
 * );
 * ```
 */
export async function interceptGrpcCall<TRequest, TResponse>(
  request: TRequest,
  invoker: (request: TRequest, metadata?: Record<string, string>) => Promise<TResponse>,
  context: string = 'grpc-call'
): Promise<TResponse> {
  const interceptor = getAuthInterceptor();
  return await interceptor.interceptUnary(request, invoker, context);
}

/**
 * Export types for external use
 */
export type { RetryConfig, RefreshState };
