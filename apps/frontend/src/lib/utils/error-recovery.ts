/**
 * Enhanced Error Recovery System
 * ==============================
 * 
 * Advanced error recovery mechanisms for authentication and network errors
 * Provides intelligent recovery strategies based on error types and context
 * 
 * Features:
 * - Smart error classification
 * - Context-aware recovery strategies
 * - Automatic retry with exponential backoff
 * - Network connectivity monitoring
 * - User-friendly error reporting
 * - Recovery success tracking
 * 
 * @author NyNus Development Team
 * @version 2.0.0 - Phase 2 Auto-Retry Implementation
 */

import { getSession } from 'next-auth/react';
import { AuthHelpers } from '@/lib/utils/auth-helpers';
import { GrpcErrorHandler, GrpcErrorType } from '@/lib/utils/grpc-error-handler';
import { logger } from '@/lib/utils/logger';
import { toast } from 'sonner';
import type { RpcError } from 'grpc-web';

/**
 * Recovery strategy types
 */
export enum RecoveryStrategy {
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  NETWORK_RETRY = 'NETWORK_RETRY',
  FALLBACK_API = 'FALLBACK_API',
  CACHE_FALLBACK = 'CACHE_FALLBACK',
  USER_INTERVENTION = 'USER_INTERVENTION',
  GRACEFUL_DEGRADATION = 'GRACEFUL_DEGRADATION',
  FORCE_LOGOUT = 'FORCE_LOGOUT',
  NO_RECOVERY = 'NO_RECOVERY',
}

/**
 * Recovery context information
 */
export interface RecoveryContext {
  operation: string;
  userAction?: string;
  retryCount: number;
  maxRetries: number;
  originalError: Error;
  timestamp: number;
  userAgent?: string;
  networkStatus?: 'online' | 'offline' | 'slow';
}

/**
 * Recovery result
 */
export interface RecoveryResult {
  success: boolean;
  strategy: RecoveryStrategy;
  message: string;
  shouldRetry: boolean;
  retryDelay?: number;
  data?: any;
  fallbackUsed?: boolean;
}

/**
 * Recovery statistics
 */
interface RecoveryStats {
  totalAttempts: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  strategyCounts: Record<RecoveryStrategy, number>;
  averageRecoveryTime: number;
}

/**
 * Network connectivity monitor
 */
class NetworkMonitor {
  private static instance: NetworkMonitor;
  private isOnline = navigator.onLine;
  private connectionSpeed: 'fast' | 'slow' | 'unknown' = 'unknown';
  private listeners: ((status: 'online' | 'offline' | 'slow') => void)[] = [];

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private constructor() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
    });

    // Monitor connection speed (simplified)
    this.checkConnectionSpeed();
  }

  private async checkConnectionSpeed(): Promise<void> {
    try {
      const startTime = Date.now();
      await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' });
      const duration = Date.now() - startTime;
      
      this.connectionSpeed = duration > 2000 ? 'slow' : 'fast';
      
      if (this.connectionSpeed === 'slow') {
        this.notifyListeners('slow');
      }
    } catch {
      this.connectionSpeed = 'unknown';
    }
  }

  private notifyListeners(status: 'online' | 'offline' | 'slow'): void {
    this.listeners.forEach(listener => listener(status));
  }

  getStatus(): 'online' | 'offline' | 'slow' {
    if (!this.isOnline) return 'offline';
    return this.connectionSpeed === 'slow' ? 'slow' : 'online';
  }

  addListener(listener: (status: 'online' | 'offline' | 'slow') => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (status: 'online' | 'offline' | 'slow') => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
}

/**
 * Enhanced Error Recovery Class
 */
export class ErrorRecovery {
  private static stats: RecoveryStats = {
    totalAttempts: 0,
    successfulRecoveries: 0,
    failedRecoveries: 0,
    strategyCounts: {} as Record<RecoveryStrategy, number>,
    averageRecoveryTime: 0,
  };

  private static networkMonitor = NetworkMonitor.getInstance();

  /**
   * Main error recovery entry point
   * 
   * @param error - The error that occurred
   * @param context - Context information about the error
   * @returns Promise<RecoveryResult> - Recovery result
   */
  static async handleError(error: Error, context: RecoveryContext): Promise<RecoveryResult> {
    const startTime = Date.now();
    this.stats.totalAttempts++;

    logger.info(`[ErrorRecovery] Handling error in ${context.operation}`, {
      error: error.message,
      retryCount: context.retryCount,
      maxRetries: context.maxRetries,
    });

    try {
      // Classify error and determine strategy
      const strategy = this.determineRecoveryStrategy(error, context);
      this.updateStrategyCount(strategy);

      // Execute recovery strategy
      const result = await this.executeRecoveryStrategy(strategy, error, context);

      // Update statistics
      const duration = Date.now() - startTime;
      if (result.success) {
        this.stats.successfulRecoveries++;
        this.updateAverageRecoveryTime(duration);
      } else {
        this.stats.failedRecoveries++;
      }

      logger.info(`[ErrorRecovery] Recovery ${result.success ? 'successful' : 'failed'}`, {
        strategy,
        duration: `${duration}ms`,
        message: result.message,
      });

      return result;

    } catch (recoveryError) {
      this.stats.failedRecoveries++;
      
      logger.error('[ErrorRecovery] Recovery process failed:', { 
        error: recoveryError instanceof Error ? recoveryError.message : String(recoveryError) 
      });
      
      return {
        success: false,
        strategy: RecoveryStrategy.NO_RECOVERY,
        message: 'Không thể khôi phục từ lỗi này',
        shouldRetry: false,
      };
    }
  }

  /**
   * Determine the best recovery strategy for the given error
   */
  private static determineRecoveryStrategy(error: Error, context: RecoveryContext): RecoveryStrategy {
    const rpcError = error as RpcError;
    const networkStatus = this.networkMonitor.getStatus();

    // Token expiry errors
    if (GrpcErrorHandler.isTokenExpiredError(rpcError)) {
      return RecoveryStrategy.TOKEN_REFRESH;
    }

    // Network connectivity issues
    if (networkStatus === 'offline') {
      return RecoveryStrategy.CACHE_FALLBACK;
    }

    if (networkStatus === 'slow' || GrpcErrorHandler.isNetworkError?.(rpcError)) {
      return RecoveryStrategy.NETWORK_RETRY;
    }

    // Authentication errors (non-token expiry)
    if (GrpcErrorHandler.isAuthenticationError?.(rpcError)) {
      return context.retryCount === 0 
        ? RecoveryStrategy.TOKEN_REFRESH 
        : RecoveryStrategy.FORCE_LOGOUT;
    }

    // Server errors (retryable)
    if (rpcError.code >= 13 && rpcError.code <= 16) {
      return context.retryCount < context.maxRetries 
        ? RecoveryStrategy.NETWORK_RETRY 
        : RecoveryStrategy.GRACEFUL_DEGRADATION;
    }

    // Permission errors
    if (rpcError.code === 7) { // PERMISSION_DENIED
      return RecoveryStrategy.USER_INTERVENTION;
    }

    // Validation errors
    if (rpcError.code === 3) { // INVALID_ARGUMENT
      return RecoveryStrategy.NO_RECOVERY;
    }

    // Default strategy
    return context.retryCount < context.maxRetries 
      ? RecoveryStrategy.NETWORK_RETRY 
      : RecoveryStrategy.GRACEFUL_DEGRADATION;
  }

  /**
   * Execute the determined recovery strategy
   */
  private static async executeRecoveryStrategy(
    strategy: RecoveryStrategy,
    error: Error,
    context: RecoveryContext
  ): Promise<RecoveryResult> {
    switch (strategy) {
      case RecoveryStrategy.TOKEN_REFRESH:
        return await this.recoverFromTokenExpiry(context);

      case RecoveryStrategy.NETWORK_RETRY:
        return await this.recoverFromNetworkError(context);

      case RecoveryStrategy.CACHE_FALLBACK:
        return await this.recoverWithCacheFallback(context);

      case RecoveryStrategy.GRACEFUL_DEGRADATION:
        return await this.recoverWithGracefulDegradation(context);

      case RecoveryStrategy.USER_INTERVENTION:
        return await this.recoverWithUserIntervention(error, context);

      case RecoveryStrategy.FORCE_LOGOUT:
        return await this.recoverWithForceLogout(context);

      case RecoveryStrategy.NO_RECOVERY:
      default:
        return {
          success: false,
          strategy,
          message: 'Không thể khôi phục từ lỗi này',
          shouldRetry: false,
        };
    }
  }

  /**
   * Recover from token expiry by refreshing token
   */
  private static async recoverFromTokenExpiry(context: RecoveryContext): Promise<RecoveryResult> {
    try {
      logger.info('[ErrorRecovery] Attempting token refresh recovery');

      // Get session from NextAuth
      const session = await getSession();
      if (!session?.backendRefreshToken) {
        throw new Error('No refresh token available');
      }

      // ✅ FIX: Use dynamic import to avoid circular dependency
      const { AuthService } = await import('@/services/grpc/auth.service');
      const response = await AuthService.refreshToken(session.backendRefreshToken);
      if (!response.getAccessToken()) {
        throw new Error('No access token in refresh response');
      }

      // Update localStorage
      AuthHelpers.saveAccessToken(response.getAccessToken());

      toast.success('Phiên đăng nhập đã được làm mới', {
        duration: 2000,
        position: 'bottom-right',
      });

      return {
        success: true,
        strategy: RecoveryStrategy.TOKEN_REFRESH,
        message: 'Token đã được làm mới thành công',
        shouldRetry: true,
        retryDelay: 1000,
      };

    } catch (error) {
      logger.error('[ErrorRecovery] Token refresh recovery failed:', { 
        error: error instanceof Error ? error.message : String(error) 
      });

      // If refresh token is expired, force logout
      if (error instanceof Error && error.message.includes('refresh token')) {
        return await this.recoverWithForceLogout(context);
      }

      return {
        success: false,
        strategy: RecoveryStrategy.TOKEN_REFRESH,
        message: 'Không thể làm mới token',
        shouldRetry: false,
      };
    }
  }

  /**
   * Recover from network errors with retry
   */
  private static async recoverFromNetworkError(context: RecoveryContext): Promise<RecoveryResult> {
    try {
      logger.info('[ErrorRecovery] Attempting network retry recovery');

      // Wait for network to stabilize
      const retryDelay = Math.min(1000 * Math.pow(2, context.retryCount), 10000); // Max 10 seconds
      
      // Test connectivity
      await fetch('/api/health', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });

      toast.info('Kết nối mạng đã ổn định. Đang thử lại...', {
        duration: 2000,
        position: 'bottom-right',
      });

      return {
        success: true,
        strategy: RecoveryStrategy.NETWORK_RETRY,
        message: 'Kết nối mạng đã được khôi phục',
        shouldRetry: true,
        retryDelay,
      };

    } catch (error) {
      logger.warn('[ErrorRecovery] Network still unavailable:', { 
        error: error instanceof Error ? error.message : String(error) 
      });

      return {
        success: false,
        strategy: RecoveryStrategy.NETWORK_RETRY,
        message: 'Kết nối mạng vẫn chưa ổn định',
        shouldRetry: context.retryCount < context.maxRetries,
        retryDelay: 5000,
      };
    }
  }

  /**
   * Recover using cached data
   */
  private static async recoverWithCacheFallback(context: RecoveryContext): Promise<RecoveryResult> {
    try {
      logger.info('[ErrorRecovery] Attempting cache fallback recovery');

      // Try to get cached data (simplified implementation)
      const cacheKey = `cache_${context.operation}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        toast.info('Đang sử dụng dữ liệu đã lưu (offline)', {
          duration: 3000,
          position: 'bottom-right',
        });

        return {
          success: true,
          strategy: RecoveryStrategy.CACHE_FALLBACK,
          message: 'Sử dụng dữ liệu cache thành công',
          shouldRetry: false,
          data: JSON.parse(cachedData),
          fallbackUsed: true,
        };
      }

      return {
        success: false,
        strategy: RecoveryStrategy.CACHE_FALLBACK,
        message: 'Không có dữ liệu cache khả dụng',
        shouldRetry: false,
      };

    } catch (error) {
      logger.error('[ErrorRecovery] Cache fallback failed:', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      return {
        success: false,
        strategy: RecoveryStrategy.CACHE_FALLBACK,
        message: 'Lỗi khi truy cập cache',
        shouldRetry: false,
      };
    }
  }

  /**
   * Recover with graceful degradation
   */
  private static async recoverWithGracefulDegradation(context: RecoveryContext): Promise<RecoveryResult> {
    logger.info('[ErrorRecovery] Applying graceful degradation');

    toast.warning('Một số tính năng có thể bị hạn chế do lỗi hệ thống', {
      duration: 4000,
      position: 'top-center',
    });

    return {
      success: true,
      strategy: RecoveryStrategy.GRACEFUL_DEGRADATION,
      message: 'Chế độ hoạt động hạn chế được kích hoạt',
      shouldRetry: false,
      fallbackUsed: true,
    };
  }

  /**
   * Recover with user intervention
   */
  private static async recoverWithUserIntervention(error: Error, context: RecoveryContext): Promise<RecoveryResult> {
    logger.info('[ErrorRecovery] Requesting user intervention');

    const errorMessage = error.message || 'Lỗi không xác định';
    
    toast.error(`Cần can thiệp thủ công: ${errorMessage}`, {
      duration: 6000,
      position: 'top-center',
      action: {
        label: 'Thử lại',
        onClick: () => window.location.reload(),
      },
    });

    return {
      success: false,
      strategy: RecoveryStrategy.USER_INTERVENTION,
      message: 'Cần can thiệp của người dùng',
      shouldRetry: false,
    };
  }

  /**
   * Recover with force logout
   */
  private static async recoverWithForceLogout(context: RecoveryContext): Promise<RecoveryResult> {
    logger.info('[ErrorRecovery] Forcing logout for security');

    // Clear tokens
    AuthHelpers.clearTokens();

    toast.error('Phiên đăng nhập không hợp lệ. Đang chuyển hướng...', {
      duration: 4000,
      position: 'top-center',
    });

    // Redirect to login
    setTimeout(() => {
      const currentPath = window.location.pathname;
      const redirectUrl = `/login?reason=security_logout&redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
    }, 2000);

    return {
      success: true,
      strategy: RecoveryStrategy.FORCE_LOGOUT,
      message: 'Đăng xuất bảo mật đã được thực hiện',
      shouldRetry: false,
    };
  }

  /**
   * Update strategy usage count
   */
  private static updateStrategyCount(strategy: RecoveryStrategy): void {
    if (!this.stats.strategyCounts[strategy]) {
      this.stats.strategyCounts[strategy] = 0;
    }
    this.stats.strategyCounts[strategy]++;
  }

  /**
   * Update average recovery time
   */
  private static updateAverageRecoveryTime(duration: number): void {
    if (this.stats.successfulRecoveries === 1) {
      this.stats.averageRecoveryTime = duration;
    } else {
      const totalTime = this.stats.averageRecoveryTime * (this.stats.successfulRecoveries - 1) + duration;
      this.stats.averageRecoveryTime = totalTime / this.stats.successfulRecoveries;
    }
  }

  /**
   * Get recovery statistics
   */
  static getStats(): Readonly<RecoveryStats> {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  static resetStats(): void {
    this.stats = {
      totalAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      strategyCounts: {} as Record<RecoveryStrategy, number>,
      averageRecoveryTime: 0,
    };
  }

  /**
   * Get network monitor instance
   */
  static getNetworkMonitor(): NetworkMonitor {
    return this.networkMonitor;
  }
}

/**
 * Convenience function for handling authentication errors
 */
export async function handleAuthError(error: any, context: string): Promise<boolean> {
  const recoveryContext: RecoveryContext = {
    operation: context,
    retryCount: 0,
    maxRetries: 2,
    originalError: error,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    networkStatus: ErrorRecovery.getNetworkMonitor().getStatus(),
  };

  const result = await ErrorRecovery.handleError(error, recoveryContext);
  return result.success;
}

/**
 * Error Recovery Options for retry operations
 */
export interface ErrorRecoveryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  timeout?: number;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    timeout = 30000
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), timeout);
      });

      return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Circuit Breaker State
 */
export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Circuit Breaker Configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold?: number;
  recoveryTimeout?: number;
  monitoringPeriod?: number;
}

/**
 * Circuit Breaker Implementation
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      recoveryTimeout: config.recoveryTimeout ?? 60000,
      monitoringPeriod: config.monitoringPeriod ?? 10000
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitBreakerState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Export types and classes
 */
export { NetworkMonitor };