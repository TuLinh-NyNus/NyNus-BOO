/**
 * Authentication State Cache
 * =========================
 * Caching authentication state để tránh repeated validation
 * và improve user experience khi navigate nhanh
 * 
 * Business Logic:
 * - Cache authentication status trong sessionStorage
 * - Provide fallback khi NextAuth session chưa available
 * - Handle cache invalidation khi logout
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { logger } from '@/lib/utils/logger';

/**
 * Authentication state cache entry
 */
interface AuthStateCacheEntry {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  role?: string;
  level?: number;
  timestamp: number;
  expiresAt: number;
}

/**
 * Authentication State Cache Manager
 */
export class AuthStateCache {
  private static readonly CACHE_KEY = 'nynus-auth-state-cache';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_AGE = 30 * 60 * 1000; // 30 minutes max

  /**
   * Set authentication state in cache
   * 
   * @param authState - Authentication state to cache
   */
  static setAuthState(authState: {
    isAuthenticated: boolean;
    userId?: string;
    email?: string;
    role?: string;
    level?: number;
  }): void {
    // Only cache on client-side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const now = Date.now();
      const cacheEntry: AuthStateCacheEntry = {
        ...authState,
        timestamp: now,
        expiresAt: now + this.CACHE_DURATION,
      };

      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheEntry));
      
      logger.debug('[AuthStateCacheEntry] Authentication state cached', {
        isAuthenticated: authState.isAuthenticated,
        userId: authState.userId,
        role: authState.role,
        expiresAt: new Date(cacheEntry.expiresAt).toISOString(),
      });
    } catch (error) {
      logger.error('[AuthStateCacheEntry] Failed to cache authentication state', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get authentication state from cache
   * 
   * @returns Cached authentication state hoặc null nếu không có/expired
   */
  static getAuthState(): AuthStateCacheEntry | null {
    // Only get cache on client-side
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        return null;
      }

      const cacheEntry: AuthStateCacheEntry = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now > cacheEntry.expiresAt) {
        logger.debug('[AuthStateCacheEntry] Cache expired, removing', {
          timestamp: new Date(cacheEntry.timestamp).toISOString(),
          expiresAt: new Date(cacheEntry.expiresAt).toISOString(),
          now: new Date(now).toISOString(),
        });
        this.clearAuthState();
        return null;
      }

      // Check if cache is too old (safety check)
      if (now - cacheEntry.timestamp > this.MAX_CACHE_AGE) {
        logger.warn('[AuthStateCacheEntry] Cache too old, removing', {
          age: Math.floor((now - cacheEntry.timestamp) / 1000) + 's',
          maxAge: Math.floor(this.MAX_CACHE_AGE / 1000) + 's',
        });
        this.clearAuthState();
        return null;
      }

      logger.debug('[AuthStateCacheEntry] Retrieved cached authentication state', {
        isAuthenticated: cacheEntry.isAuthenticated,
        userId: cacheEntry.userId,
        role: cacheEntry.role,
        age: Math.floor((now - cacheEntry.timestamp) / 1000) + 's',
      });

      return cacheEntry;
    } catch (error) {
      logger.error('[AuthStateCacheEntry] Failed to retrieve cached authentication state', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Clear corrupted cache
      this.clearAuthState();
      return null;
    }
  }

  /**
   * Check if user is likely authenticated based on cache
   * 
   * @returns Boolean indicating if user is likely authenticated
   */
  static isLikelyAuthenticated(): boolean {
    const cached = this.getAuthState();
    return cached?.isAuthenticated === true;
  }

  /**
   * Get cached user info
   * 
   * @returns Cached user info hoặc null
   */
  static getCachedUserInfo(): {
    userId?: string;
    email?: string;
    role?: string;
    level?: number;
  } | null {
    const cached = this.getAuthState();
    if (!cached || !cached.isAuthenticated) {
      return null;
    }

    return {
      userId: cached.userId,
      email: cached.email,
      role: cached.role,
      level: cached.level,
    };
  }

  /**
   * Clear authentication state cache
   */
  static clearAuthState(): void {
    // Only clear on client-side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.removeItem(this.CACHE_KEY);
      logger.debug('[AuthStateCacheEntry] Authentication state cache cleared');
    } catch (error) {
      logger.error('[AuthStateCacheEntry] Failed to clear authentication state cache', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Update cache expiry (extend cache lifetime)
   * Useful khi user actively using app
   */
  static extendCacheLifetime(): void {
    const cached = this.getAuthState();
    if (!cached) {
      return;
    }

    // Extend expiry by cache duration
    const now = Date.now();
    cached.expiresAt = now + this.CACHE_DURATION;

    try {
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(cached));
      logger.debug('[AuthStateCacheEntry] Cache lifetime extended', {
        newExpiresAt: new Date(cached.expiresAt).toISOString(),
      });
    } catch (error) {
      logger.error('[AuthStateCacheEntry] Failed to extend cache lifetime', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Check if cache exists (regardless of content)
   * 
   * @returns Boolean indicating if cache exists
   */
  static hasCachedState(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return sessionStorage.getItem(this.CACHE_KEY) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cache age in seconds
   * 
   * @returns Cache age in seconds hoặc null nếu không có cache
   */
  static getCacheAge(): number | null {
    const cached = this.getAuthState();
    if (!cached) {
      return null;
    }

    return Math.floor((Date.now() - cached.timestamp) / 1000);
  }

  /**
   * Validate cache integrity
   * 
   * @returns Boolean indicating if cache is valid
   */
  static validateCache(): boolean {
    const cached = this.getAuthState();
    if (!cached) {
      return false;
    }

    // Check required fields
    if (typeof cached.isAuthenticated !== 'boolean') {
      logger.warn('[AuthStateCacheEntry] Invalid cache - missing isAuthenticated');
      this.clearAuthState();
      return false;
    }

    if (typeof cached.timestamp !== 'number' || typeof cached.expiresAt !== 'number') {
      logger.warn('[AuthStateCacheEntry] Invalid cache - invalid timestamps');
      this.clearAuthState();
      return false;
    }

    return true;
  }
}

/**
 * Hook để sử dụng authentication state cache
 */
export function useAuthStateCache() {
  return {
    setAuthState: AuthStateCache.setAuthState,
    getAuthState: AuthStateCache.getAuthState,
    isLikelyAuthenticated: AuthStateCache.isLikelyAuthenticated,
    getCachedUserInfo: AuthStateCache.getCachedUserInfo,
    clearAuthState: AuthStateCache.clearAuthState,
    extendCacheLifetime: AuthStateCache.extendCacheLifetime,
    hasCachedState: AuthStateCache.hasCachedState,
    getCacheAge: AuthStateCache.getCacheAge,
    validateCache: AuthStateCache.validateCache,
  };
}

export default AuthStateCache;

