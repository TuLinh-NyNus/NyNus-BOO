/**
 * Proactive Token Manager
 * =======================
 * 
 * Background service that proactively refreshes JWT tokens before expiry
 * Prevents token expiry errors by maintaining fresh tokens automatically
 * 
 * Features:
 * - Background token monitoring
 * - Proactive refresh before expiry
 * - Smart refresh scheduling
 * - Error handling and recovery
 * - Performance optimization
 * 
 * @author NyNus Development Team
 * @version 2.0.0 - Phase 2 Auto-Retry Implementation
 */

import { getSession } from 'next-auth/react';
import { AuthHelpers } from '@/lib/utils/auth-helpers';
import { logger } from '@/lib/utils/logger';
import { toast } from 'sonner';

/**
 * Token refresh configuration
 */
interface TokenRefreshConfig {
  checkInterval: number;        // How often to check token status (ms)
  refreshThreshold: number;     // Refresh when token expires in X seconds
  maxRetries: number;          // Max retry attempts for failed refresh
  retryDelay: number;          // Delay between retry attempts (ms)
  silentMode: boolean;         // Whether to show notifications
  enableBackgroundRefresh: boolean; // Enable/disable background refresh
}

/**
 * Token refresh statistics
 */
interface RefreshStats {
  totalRefreshes: number;
  successfulRefreshes: number;
  failedRefreshes: number;
  lastRefreshTime: number;
  lastRefreshDuration: number;
  averageRefreshDuration: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: TokenRefreshConfig = {
  checkInterval: 2 * 60 * 1000,      // Check every 2 minutes
  refreshThreshold: 5 * 60,          // Refresh when < 5 minutes left
  maxRetries: 3,                     // Max 3 retry attempts
  retryDelay: 2000,                  // 2 second delay between retries
  silentMode: false,                 // Show notifications by default
  enableBackgroundRefresh: true,     // Enable background refresh
};

/**
 * Proactive Token Manager Class
 */
export class ProactiveTokenManager {
  private static instance: ProactiveTokenManager | null = null;
  
  private config: TokenRefreshConfig;
  private refreshInterval: NodeJS.Timeout | null = null;
  private isActive = false;
  private isRefreshing = false;
  private stats: RefreshStats = {
    totalRefreshes: 0,
    successfulRefreshes: 0,
    failedRefreshes: 0,
    lastRefreshTime: 0,
    lastRefreshDuration: 0,
    averageRefreshDuration: 0,
  };

  /**
   * Singleton pattern - get or create instance
   */
  static getInstance(config?: Partial<TokenRefreshConfig>): ProactiveTokenManager {
    if (!ProactiveTokenManager.instance) {
      ProactiveTokenManager.instance = new ProactiveTokenManager(config);
    }
    return ProactiveTokenManager.instance;
  }

  /**
   * Private constructor for singleton pattern
   */
  private constructor(config?: Partial<TokenRefreshConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.debug('[ProactiveTokenManager] Initialized with config:', this.config as unknown as Record<string, unknown>);
  }

  /**
   * Start proactive token refresh service
   */
  start(): void {
    if (this.isActive) {
      logger.debug('[ProactiveTokenManager] Already active, skipping start');
      return;
    }

    if (!this.config.enableBackgroundRefresh) {
      logger.debug('[ProactiveTokenManager] Background refresh disabled');
      return;
    }

    this.isActive = true;
    logger.info('[ProactiveTokenManager] Starting proactive token refresh service', {
      checkInterval: this.config.checkInterval,
      refreshThreshold: this.config.refreshThreshold,
    });

    // Start monitoring interval
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, this.config.checkInterval);

    // Initial check
    this.checkAndRefreshToken();

    // Show startup notification (if not silent)
    if (!this.config.silentMode) {
      toast.success('Dịch vụ làm mới phiên tự động đã khởi động', {
        duration: 2000,
        position: 'bottom-right',
      });
    }
  }

  /**
   * Stop proactive token refresh service
   */
  stop(): void {
    if (!this.isActive) {
      logger.debug('[ProactiveTokenManager] Already inactive, skipping stop');
      return;
    }

    this.isActive = false;

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    logger.info('[ProactiveTokenManager] Stopped proactive token refresh service', {
      stats: this.getStats(),
    });

    // Show shutdown notification (if not silent)
    if (!this.config.silentMode) {
      toast.info('Dịch vụ làm mới phiên tự động đã dừng', {
        duration: 2000,
        position: 'bottom-right',
      });
    }
  }

  /**
   * Check token status and refresh if needed
   */
  private async checkAndRefreshToken(): Promise<void> {
    if (!this.isActive || this.isRefreshing) {
      return;
    }

    try {
      const token = AuthHelpers.getAccessToken();

      if (!token) {
        logger.debug('[ProactiveTokenManager] No token found, skipping check');
        return;
      }

      // Check if token is expiring soon
      if (AuthHelpers.isTokenExpiringSoon(token, this.config.refreshThreshold)) {
        const expiration = AuthHelpers.getTokenExpiration(token);
        const timeLeft = expiration ? expiration - Math.floor(Date.now() / 1000) : 0;

        logger.info('[ProactiveTokenManager] Token expiring soon, initiating refresh', {
          timeLeft: `${timeLeft}s`,
          threshold: `${this.config.refreshThreshold}s`,
        });

        await this.refreshTokenSilently();
      } else {
        logger.debug('[ProactiveTokenManager] Token still valid, no refresh needed');
      }
    } catch (error) {
      logger.error('[ProactiveTokenManager] Error in token check:', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * Perform silent token refresh with retry logic
   */
  private async refreshTokenSilently(): Promise<void> {
    if (this.isRefreshing) {
      logger.debug('[ProactiveTokenManager] Refresh already in progress');
      return;
    }

    this.isRefreshing = true;
    const startTime = Date.now();
    let lastError: Error | null = null;

    try {
      this.stats.totalRefreshes++;

      for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
        try {
          logger.debug(`[ProactiveTokenManager] Refresh attempt ${attempt}/${this.config.maxRetries}`);

          // Get session from NextAuth
          const session = await getSession();

          if (!session?.backendRefreshToken) {
            throw new Error('No refresh token available in session');
          }

          // ✅ FIX: Use dynamic import to avoid circular dependency
          const { AuthService } = await import('@/services/grpc/auth.service');
          const response = await AuthService.refreshToken(session.backendRefreshToken);
          const newToken = response.getAccessToken();

          if (!newToken) {
            throw new Error('No access token in refresh response');
          }

          // Update localStorage with new token
          AuthHelpers.saveAccessToken(newToken);

          // Update statistics
          const duration = Date.now() - startTime;
          this.stats.successfulRefreshes++;
          this.stats.lastRefreshTime = Date.now();
          this.stats.lastRefreshDuration = duration;
          this.updateAverageRefreshDuration(duration);

          logger.info('[ProactiveTokenManager] Token refreshed successfully', {
            attempt,
            duration: `${duration}ms`,
            stats: this.getBasicStats(),
          });

          // Show success notification (if not silent)
          if (!this.config.silentMode) {
            toast.success('Phiên đăng nhập đã được làm mới tự động', {
              duration: 2000,
              position: 'bottom-right',
            });
          }

          return; // Success - exit retry loop

        } catch (error) {
          lastError = error as Error;
          logger.warn(`[ProactiveTokenManager] Refresh attempt ${attempt} failed:`, { 
            error: error instanceof Error ? error.message : String(error) 
          });

          // Check if this is a refresh token expiry (don't retry)
          if (error instanceof Error && 
              (error.message.includes('REFRESH_TOKEN_EXPIRED') || 
               error.message.includes('refresh token'))) {
            logger.error('[ProactiveTokenManager] Refresh token expired, stopping service');
            this.handleRefreshTokenExpiry();
            return;
          }

          // Wait before retry (if not last attempt)
          if (attempt < this.config.maxRetries) {
            const delay = this.config.retryDelay * attempt; // Linear backoff
            logger.debug(`[ProactiveTokenManager] Waiting ${delay}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed
      this.stats.failedRefreshes++;
      
      logger.error('[ProactiveTokenManager] All refresh attempts failed', {
        attempts: this.config.maxRetries,
        finalError: lastError?.message,
        stats: this.getBasicStats(),
      });

      // Show error notification (if not silent)
      if (!this.config.silentMode) {
        toast.error('Không thể làm mới phiên tự động. Vui lòng đăng nhập lại nếu cần.', {
          duration: 4000,
          position: 'bottom-right',
        });
      }

    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Handle refresh token expiry
   */
  private handleRefreshTokenExpiry(): void {
    // Stop the service
    this.stop();

    // Clear tokens
    AuthHelpers.clearTokens();

    // Show notification
    toast.error('Phiên đăng nhập đã hết hạn. Đang chuyển hướng đến trang đăng nhập...', {
      duration: 5000,
      position: 'top-center',
    });

    // Redirect to login after delay
    setTimeout(() => {
      const currentPath = window.location.pathname;
      const redirectUrl = `/login?reason=session_expired&redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
    }, 3000);
  }

  /**
   * Update average refresh duration
   */
  private updateAverageRefreshDuration(newDuration: number): void {
    if (this.stats.successfulRefreshes === 1) {
      this.stats.averageRefreshDuration = newDuration;
    } else {
      // Calculate running average
      const totalDuration = this.stats.averageRefreshDuration * (this.stats.successfulRefreshes - 1) + newDuration;
      this.stats.averageRefreshDuration = totalDuration / this.stats.successfulRefreshes;
    }
  }

  /**
   * Get basic statistics (for logging)
   */
  private getBasicStats(): Partial<RefreshStats> {
    return {
      totalRefreshes: this.stats.totalRefreshes,
      successfulRefreshes: this.stats.successfulRefreshes,
      failedRefreshes: this.stats.failedRefreshes,
    };
  }

  /**
   * Get full statistics
   */
  getStats(): Readonly<RefreshStats> {
    return { ...this.stats };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<TokenRefreshConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TokenRefreshConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    logger.info('[ProactiveTokenManager] Configuration updated', {
      oldConfig,
      newConfig: this.config,
    });

    // Restart if interval changed and service is active
    if (this.isActive && oldConfig.checkInterval !== this.config.checkInterval) {
      logger.info('[ProactiveTokenManager] Restarting due to interval change');
      this.stop();
      this.start();
    }
  }

  /**
   * Force immediate token refresh
   */
  async forceRefresh(): Promise<void> {
    logger.info('[ProactiveTokenManager] Force refresh requested');
    await this.refreshTokenSilently();
  }

  /**
   * Check if service is active
   */
  isServiceActive(): boolean {
    return this.isActive;
  }

  /**
   * Check if currently refreshing
   */
  isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalRefreshes: 0,
      successfulRefreshes: 0,
      failedRefreshes: 0,
      lastRefreshTime: 0,
      lastRefreshDuration: 0,
      averageRefreshDuration: 0,
    };
    logger.info('[ProactiveTokenManager] Statistics reset');
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    isActive: boolean;
    isRefreshing: boolean;
    successRate: number;
    lastRefreshAge: number;
    config: TokenRefreshConfig;
    stats: RefreshStats;
  } {
    const successRate = this.stats.totalRefreshes > 0 
      ? (this.stats.successfulRefreshes / this.stats.totalRefreshes) * 100 
      : 0;
    
    const lastRefreshAge = this.stats.lastRefreshTime > 0 
      ? Date.now() - this.stats.lastRefreshTime 
      : -1;

    return {
      isActive: this.isActive,
      isRefreshing: this.isRefreshing,
      successRate: Math.round(successRate * 100) / 100,
      lastRefreshAge,
      config: this.getConfig(),
      stats: this.getStats(),
    };
  }
}

/**
 * Convenience functions for global usage
 */

/**
 * Start proactive token refresh service
 */
export function startProactiveTokenRefresh(config?: Partial<TokenRefreshConfig>): void {
  const manager = ProactiveTokenManager.getInstance(config);
  manager.start();
}

/**
 * Stop proactive token refresh service
 */
export function stopProactiveTokenRefresh(): void {
  const manager = ProactiveTokenManager.getInstance();
  manager.stop();
}

/**
 * Get proactive token manager instance
 */
export function getProactiveTokenManager(): ProactiveTokenManager {
  return ProactiveTokenManager.getInstance();
}

/**
 * Export types
 */
export type { TokenRefreshConfig, RefreshStats };
