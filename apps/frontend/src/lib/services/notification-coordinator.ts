/**
 * Notification Fetch Coordinator
 * ===============================
 * Singleton service to coordinate notification fetching across multiple hooks
 * 
 * Problem:
 * - useNotifications and use-backend-notifications both fetch notifications on login
 * - This causes multiple concurrent API calls → rate limit exceeded
 * 
 * Solution:
 * - Centralized coordinator ensures only ONE fetch happens at a time
 * - Debouncing and deduplication prevent duplicate calls
 * - All hooks share the same fetch result
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { logger } from '@/lib/logger';

/**
 * Notification Fetch Coordinator
 * Singleton class to coordinate notification fetching
 */
class NotificationFetchCoordinator {
  private static instance: NotificationFetchCoordinator;
  
  /** Last fetch timestamp */
  private lastFetchTime: number = 0;
  
  /** Minimum interval between fetches (milliseconds) */
  private readonly MIN_FETCH_INTERVAL = 5000; // 5 seconds
  
  /** Debounce timeout */
  private debounceTimeout: NodeJS.Timeout | null = null;
  
  /** Current fetch promise (for deduplication) */
  private currentFetchPromise: Promise<void> | null = null;
  
  /** Pending fetch callbacks */
  private pendingCallbacks: Array<() => Promise<void>> = [];

  private constructor() {
    logger.debug('[NotificationCoordinator] Initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NotificationFetchCoordinator {
    if (!NotificationFetchCoordinator.instance) {
      NotificationFetchCoordinator.instance = new NotificationFetchCoordinator();
    }
    return NotificationFetchCoordinator.instance;
  }

  /**
   * Check if fetch is allowed based on timing
   */
  private isFetchAllowed(): boolean {
    const now = Date.now();
    const timeSinceLastFetch = now - this.lastFetchTime;
    return timeSinceLastFetch >= this.MIN_FETCH_INTERVAL;
  }

  /**
   * Schedule a notification fetch with debouncing and deduplication
   * 
   * Business Logic:
   * 1. If a fetch is already in progress, return the existing promise
   * 2. If last fetch was recent (< 5s), skip
   * 3. Debounce multiple requests within 200ms window
   * 4. Execute only one fetch for all pending requests
   * 
   * @param fetchCallback - Function to execute the actual fetch
   * @returns Promise that resolves when fetch completes
   */
  async scheduleFetch(fetchCallback: () => Promise<void>): Promise<void> {
    // If fetch is already in progress, return existing promise
    if (this.currentFetchPromise) {
      logger.debug('[NotificationCoordinator] Fetch already in progress, reusing promise');
      return this.currentFetchPromise;
    }

    // Check if fetch is allowed based on timing
    if (!this.isFetchAllowed()) {
      const timeSinceLastFetch = Date.now() - this.lastFetchTime;
      logger.debug('[NotificationCoordinator] Fetch skipped - too soon', {
        timeSinceLastFetch,
        minInterval: this.MIN_FETCH_INTERVAL,
      });
      return Promise.resolve();
    }

    // Add callback to pending queue
    this.pendingCallbacks.push(fetchCallback);

    // Clear existing debounce timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    // Create new debounced fetch promise
    return new Promise<void>((resolve, reject) => {
      this.debounceTimeout = setTimeout(async () => {
        try {
          logger.debug('[NotificationCoordinator] Executing debounced fetch', {
            pendingCallbacks: this.pendingCallbacks.length,
          });

          // Execute the FIRST callback (all callbacks should do the same thing)
          const callback = this.pendingCallbacks[0];
          if (!callback) {
            resolve();
            return;
          }

          // Create fetch promise
          this.currentFetchPromise = callback();
          
          // Update last fetch time
          this.lastFetchTime = Date.now();
          
          // Wait for fetch to complete
          await this.currentFetchPromise;
          
          logger.debug('[NotificationCoordinator] Fetch completed successfully');
          
          // Clear state
          this.currentFetchPromise = null;
          this.pendingCallbacks = [];
          
          resolve();
        } catch (error) {
          logger.error(
            '[NotificationCoordinator] Fetch failed',
            error instanceof Error ? error : new Error(String(error))
          );

          // Clear state
          this.currentFetchPromise = null;
          this.pendingCallbacks = [];

          reject(error);
        }
      }, 200); // 200ms debounce window
    });
  }

  /**
   * Reset coordinator state (for testing or logout)
   */
  reset(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    this.currentFetchPromise = null;
    this.pendingCallbacks = [];
    this.lastFetchTime = 0;
    logger.debug('[NotificationCoordinator] Reset');
  }

  /**
   * Get time since last fetch (for debugging)
   */
  getTimeSinceLastFetch(): number {
    return Date.now() - this.lastFetchTime;
  }
}

// Export singleton instance
export const notificationCoordinator = NotificationFetchCoordinator.getInstance();
