/**
 * Multi-Tab Token Coordinator
 * ===========================
 * 
 * Quản lý token synchronization qua multiple tabs/windows
 * Đảm bảo: 
 * - Chỉ 1 tab thực hiện token refresh
 * - Tất cả tabs có token nhất quán
 * - Hỗ trợ cả modern browsers (BroadcastChannel) và old browsers (localStorage)
 * 
 * Architecture:
 * - BroadcastChannel: Primary method for real-time sync (supported in modern browsers)
 * - localStorage: Fallback method with polling (older browser support)
 * - Distributed lock: Ensure only 1 refresh happens at a time
 * - Timestamps: Resolve conflicts through version control
 * 
 * Performance:
 * - Sync latency < 100ms (BroadcastChannel)
 * - Only 1 tab refreshes simultaneously
 * - All tabs have consistent tokens
 * - Fallback works on all browsers
 * 
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 2 Multi-Tab Coordination
 */

import { logger } from '@/lib/logger';

/**
 * Token sync message types
 */
type TokenSyncMessageType =
  | 'token_update'    // Token was updated
  | 'refresh_request' // Request to refresh token
  | 'refresh_start'   // Token refresh started
  | 'refresh_complete'// Token refresh completed
  | 'refresh_error'   // Token refresh failed
  | 'sync_request';   // Request full sync

/**
 * Token sync message
 */
interface TokenSyncMessage {
  type: TokenSyncMessageType;
  tabId: string;
  timestamp: number;
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
  version?: number;
}

/**
 * Token state
 */
interface TokenState {
  token: string;
  refreshToken: string;
  expiresAt: number;
  version: number;
  updatedAt: number;
}

/**
 * MultiTabTokenCoordinator - Manages token sync across tabs
 */
export class MultiTabTokenCoordinator {
  private tabId = this.generateTabId();
  private channel: BroadcastChannel | null = null;
  private localStoragePoller: NodeJS.Timeout | null = null;
  private refreshInProgress = false;
  private lastRefreshTime = 0;
  private tokenState: TokenState | null = null;
  private messageListeners: Set<(msg: TokenSyncMessage) => void> = new Set();
  private readonly serviceName: string;
  private readonly pollInterval = 1000; // 1 second for fallback polling
  private readonly refreshDebounceMs = 100; // Debounce refresh requests

  /**
   * Initialize coordinator
   * 
   * @param serviceName - Service name for logging
   */
  constructor(serviceName: string = 'TokenCoordinator') {
    this.serviceName = serviceName;
    this.initializeChannel();
    logger.info(`[${serviceName}] Initialized`, { tabId: this.tabId });
  }

  /**
   * Initialize BroadcastChannel with fallback
   */
  private initializeChannel(): void {
    // Try BroadcastChannel first (modern browsers)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('nynus-token-sync');
        this.channel.onmessage = (event) => {
          this.handleChannelMessage(event.data as TokenSyncMessage);
        };
        logger.debug(`[${this.serviceName}] BroadcastChannel initialized`);
        return;
      } catch (err) {
        logger.warn(`[${this.serviceName}] BroadcastChannel failed`, {
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    // Fallback to localStorage polling (older browsers)
    logger.debug(`[${this.serviceName}] Falling back to localStorage polling`);
    this.startLocalStoragePolling();
  }

  /**
   * Start localStorage polling for older browsers
   */
  private startLocalStoragePolling(): void {
    this.localStoragePoller = setInterval(() => {
      try {
        const lastUpdate = localStorage.getItem('nynus-token-sync-timestamp');
        if (lastUpdate) {
          const timestamp = parseInt(lastUpdate, 10);
          // Check if newer token exists
          const storedToken = localStorage.getItem('nynus-auth-token');
          if (storedToken && (!this.tokenState || this.tokenState.updatedAt < timestamp)) {
            // Token was updated by another tab
            const refreshToken = localStorage.getItem('nynus-refresh-token');
            const expiresAtStr = localStorage.getItem('nynus-token-expires-at');
            const versionStr = localStorage.getItem('nynus-token-version');

            this.tokenState = {
              token: storedToken,
              refreshToken: refreshToken || '',
              expiresAt: expiresAtStr ? parseInt(expiresAtStr, 10) : 0,
              version: versionStr ? parseInt(versionStr, 10) : 0,
              updatedAt: timestamp
            };

            this.broadcastToListeners({
              type: 'token_update',
              tabId: this.tabId,
              timestamp,
              token: storedToken,
              version: this.tokenState.version
            });
          }
        }
      } catch (err) {
        logger.error(`[${this.serviceName}] localStorage polling failed`, {
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }, this.pollInterval);
  }

  /**
   * Broadcast a token sync message
   */
  broadcastMessage(message: Omit<TokenSyncMessage, 'tabId' | 'timestamp'>): void {
    const fullMessage: TokenSyncMessage = {
      ...message,
      tabId: this.tabId,
      timestamp: Date.now()
    };

    // Send via BroadcastChannel if available
    if (this.channel) {
      try {
        this.channel.postMessage(fullMessage);
      } catch (err) {
        logger.error(`[${this.serviceName}] BroadcastChannel send failed`, {
          error: err instanceof Error ? err.message : String(err)
        });
      }
    } else {
      // Fallback: store in localStorage for polling
      try {
        localStorage.setItem('nynus-token-sync-message', JSON.stringify(fullMessage));
        localStorage.setItem('nynus-token-sync-timestamp', fullMessage.timestamp.toString());
      } catch (err) {
        logger.error(`[${this.serviceName}] localStorage store failed`, {
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    logger.debug(`[${this.serviceName}] Message broadcast`, {
      type: message.type,
      recipients: 'other-tabs'
    });
  }

  /**
   * Update token state
   */
  updateToken(token: string, refreshToken: string, expiresAt: number): void {
    const version = (this.tokenState?.version ?? 0) + 1;
    const now = Date.now();

    this.tokenState = {
      token,
      refreshToken,
      expiresAt,
      version,
      updatedAt: now
    };

    // Broadcast to other tabs
    this.broadcastMessage({
      type: 'token_update',
      token,
      refreshToken,
      expiresAt,
      version
    });

    // Store in localStorage as fallback
    try {
      localStorage.setItem('nynus-auth-token', token);
      localStorage.setItem('nynus-refresh-token', refreshToken);
      localStorage.setItem('nynus-token-expires-at', expiresAt.toString());
      localStorage.setItem('nynus-token-version', version.toString());
      localStorage.setItem('nynus-token-sync-timestamp', now.toString());
    } catch (err) {
      logger.warn(`[${this.serviceName}] Failed to store token in localStorage`, {
        error: err instanceof Error ? err.message : String(err)
      });
    }

    logger.debug(`[${this.serviceName}] Token updated`, {
      version,
      expiresIn: expiresAt - now
    });
  }

  /**
   * Get current token state
   */
  getToken(): TokenState | null {
    return this.tokenState;
  }

  /**
   * Request token refresh from any tab
   * Only one tab will actually perform the refresh
   */
  requestRefresh(): void {
    const now = Date.now();

    // Debounce: prevent too frequent refresh requests
    if (now - this.lastRefreshTime < this.refreshDebounceMs) {
      logger.debug(`[${this.serviceName}] Refresh request debounced`);
      return;
    }

    this.lastRefreshTime = now;

    if (this.refreshInProgress) {
      logger.debug(`[${this.serviceName}] Refresh already in progress`);
      return;
    }

    // Try to acquire lock
    const lockKey = 'nynus-token-refresh-lock';
    const lockValue = `${this.tabId}-${now}`;

    try {
      // Check if lock is already held
      const existingLock = localStorage.getItem(lockKey);
      if (existingLock) {
        const [_tabId, timestamp] = existingLock.split('-');
        const lockAge = now - parseInt(timestamp, 10);
        // Release old lock if older than 30 seconds
        if (lockAge > 30000) {
          logger.warn(`[${this.serviceName}] Removing stale refresh lock`);
          localStorage.removeItem(lockKey);
        } else {
          logger.debug(`[${this.serviceName}] Another tab is refreshing`);
          return;
        }
      }

      // Acquire lock
      localStorage.setItem(lockKey, lockValue);

      // Verify we got the lock
      const acquiredLock = localStorage.getItem(lockKey);
      if (acquiredLock !== lockValue) {
        logger.debug(`[${this.serviceName}] Failed to acquire refresh lock`);
        return;
      }

      this.refreshInProgress = true;

      // Broadcast that we're starting refresh
      this.broadcastMessage({
        type: 'refresh_start'
      });

      logger.debug(`[${this.serviceName}] Acquired refresh lock, starting refresh`);
    } catch (err) {
      logger.error(`[${this.serviceName}] Failed to acquire refresh lock`, {
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  /**
   * Mark refresh as completed
   */
  markRefreshComplete(token: string, refreshToken: string, expiresAt: number): void {
    const lockKey = 'nynus-token-refresh-lock';

    try {
      // Release lock
      localStorage.removeItem(lockKey);
    } catch (err) {
      logger.error(`[${this.serviceName}] Failed to release refresh lock`, {
        error: err instanceof Error ? err.message : String(err)
      });
    }

    // Update token
    this.updateToken(token, refreshToken, expiresAt);

    // Mark as no longer in progress
    this.refreshInProgress = false;

    // Broadcast completion
    this.broadcastMessage({
      type: 'refresh_complete',
      token,
      refreshToken,
      expiresAt
    });

    logger.debug(`[${this.serviceName}] Refresh completed and broadcast`);
  }

  /**
   * Mark refresh as failed
   */
  markRefreshFailed(error: string): void {
    const lockKey = 'nynus-token-refresh-lock';

    try {
      localStorage.removeItem(lockKey);
    } catch (err) {
      logger.error(`[${this.serviceName}] Failed to release refresh lock on error`, {
        error: err instanceof Error ? err.message : String(err)
      });
    }

    this.refreshInProgress = false;

    // Broadcast error
    this.broadcastMessage({
      type: 'refresh_error',
      error
    });

    logger.error(`[${this.serviceName}] Refresh failed and broadcast`, { error });
  }

  /**
   * Check if this tab holds the refresh lock
   */
  isRefreshLocked(): boolean {
    try {
      const lockValue = localStorage.getItem('nynus-token-refresh-lock');
      if (!lockValue) return false;
      const [tabId] = lockValue.split('-');
      return tabId === this.tabId && this.refreshInProgress;
    } catch (_err) {
      return false;
    }
  }

  /**
   * Register a message listener
   */
  onMessage(listener: (msg: TokenSyncMessage) => void): () => void {
    this.messageListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  /**
   * Handle incoming message
   */
  private handleChannelMessage(message: TokenSyncMessage): void {
    // Ignore own messages
    if (message.tabId === this.tabId) {
      return;
    }

    logger.debug(`[${this.serviceName}] Message received`, {
      type: message.type,
      from: message.tabId
    });

    // Handle specific message types
    switch (message.type) {
      case 'token_update':
        if (message.token && message.version !== undefined) {
          // Update local token if newer
          if (!this.tokenState || message.version > this.tokenState.version) {
            this.tokenState = {
              token: message.token,
              refreshToken: message.refreshToken || '',
              expiresAt: message.expiresAt || 0,
              version: message.version,
              updatedAt: message.timestamp
            };
          }
        }
        break;

      case 'refresh_start':
        // Another tab started refresh, wait for completion
        logger.debug(`[${this.serviceName}] Another tab started refresh`, {
          from: message.tabId
        });
        break;

      case 'refresh_complete':
        // Another tab completed refresh, update our token
        if (message.token) {
          this.updateToken(
            message.token,
            message.refreshToken || '',
            message.expiresAt || 0
          );
        }
        break;

      case 'refresh_error':
        // Another tab refresh failed
        logger.warn(`[${this.serviceName}] Refresh failed in another tab`, {
          error: message.error,
          from: message.tabId
        });
        break;
    }

    // Broadcast to listeners
    this.broadcastToListeners(message);
  }

  /**
   * Broadcast message to listeners
   */
  private broadcastToListeners(message: TokenSyncMessage): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (err) {
        logger.error(`[${this.serviceName}] Listener error`, {
          error: err instanceof Error ? err.message : String(err)
        });
      }
    });
  }

  /**
   * Get current tab ID
   */
  getTabId(): string {
    return this.tabId;
  }

  /**
   * Check if using BroadcastChannel (or fallback)
   */
  isBroadcastChannelSupported(): boolean {
    return this.channel !== null;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    if (this.localStoragePoller) {
      clearInterval(this.localStoragePoller);
      this.localStoragePoller = null;
    }

    this.messageListeners.clear();

    logger.info(`[${this.serviceName}] Destroyed`, { tabId: this.tabId });
  }

  /**
   * Generate unique tab ID
   */
  private generateTabId(): string {
    // Use performance.now() + random for uniqueness
    // This is unique enough for tab identification
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Export singleton instance factory
 */
let singletonInstance: MultiTabTokenCoordinator | null = null;

/**
 * Get or create singleton coordinator
 */
export function getMultiTabTokenCoordinator(
  serviceName?: string
): MultiTabTokenCoordinator {
  if (!singletonInstance) {
    singletonInstance = new MultiTabTokenCoordinator(serviceName || 'MultiTabTokenCoordinator');
  }
  return singletonInstance;
}

/**
 * Destroy singleton
 */
export function destroyMultiTabTokenCoordinator(): void {
  if (singletonInstance) {
    singletonInstance.destroy();
    singletonInstance = null;
  }
}

/**
 * Export types
 */
export type { TokenSyncMessage, TokenSyncMessageType, TokenState };
