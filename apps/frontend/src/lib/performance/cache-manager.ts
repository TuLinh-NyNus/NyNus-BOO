/**
 * Cache Manager for Performance Optimization
 * Quản lý caching strategies cho authentication system
 */

// Cache configuration
const CACHE_CONFIG = {
  // User data cache - 5 minutes
  USER_DATA: {
    key: 'nynus_user_data',
    ttl: 5 * 60 * 1000,
    version: '1.0'
  },
  
  // Session cache - 15 minutes
  SESSION_DATA: {
    key: 'nynus_session',
    ttl: 15 * 60 * 1000,
    version: '1.0'
  },
  
  // Role permissions cache - 30 minutes
  ROLE_PERMISSIONS: {
    key: 'nynus_permissions',
    ttl: 30 * 60 * 1000,
    version: '1.0'
  },
  
  // Resource access cache - 2 minutes
  RESOURCE_ACCESS: {
    key: 'nynus_resource_access',
    ttl: 2 * 60 * 1000,
    version: '1.0'
  },
  
  // Notification cache - 1 minute
  NOTIFICATIONS: {
    key: 'nynus_notifications',
    ttl: 1 * 60 * 1000,
    version: '1.0'
  }
} as const;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
  ttl: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
  [key: string]: unknown;
}

interface SessionData {
  sessionId: string;
  userId: string;
  expiresAt: string;
  isActive: boolean;
  [key: string]: unknown;
}

interface RolePermissions {
  role: string;
  permissions: string[];
  level?: number;
  [key: string]: unknown;
}

/**
 * Memory Cache Implementation
 */
class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  };

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.deletes++;
      return null;
    }
    
    this.stats.hits++;
    return item.data as T;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl: number, version: string = '1.0'): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      version,
      ttl
    };
    
    this.cache.set(key, item);
    this.stats.sets++;
    this.updateSize();
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.updateSize();
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clean expired items
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    this.stats.deletes += cleaned;
    this.updateSize();
    return cleaned;
  }

  private updateSize(): void {
    this.stats.size = this.cache.size;
  }
}

/**
 * LocalStorage Cache Implementation
 */
class LocalStorageCache {
  private prefix = 'nynus_cache_';

  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;
      
      const parsed: CacheItem<T> = JSON.parse(item);
      
      // Check if expired
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.warn('LocalStorage cache get error:', error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  set<T>(key: string, data: T, ttl: number, version: string = '1.0'): void {
    if (typeof window === 'undefined') return;
    
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version,
        ttl
      };
      
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('LocalStorage cache set error:', error);
      // If localStorage is full, try to clean up
      this.cleanup();
    }
  }

  /**
   * Delete item from localStorage
   */
  delete(key: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.warn('LocalStorage cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('LocalStorage cache clear error:', error);
    }
  }

  /**
   * Clean expired items
   */
  cleanup(): number {
    if (typeof window === 'undefined') return 0;
    
    let cleaned = 0;
    const now = Date.now();
    
    try {
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed: CacheItem<unknown> = JSON.parse(item);
              if (now - parsed.timestamp > parsed.ttl) {
                localStorage.removeItem(key);
                cleaned++;
              }
            }
          } catch (error) {
            console.warn('Failed to parse cache item:', key, error);
            // Remove corrupted items
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      });
    } catch (error) {
      console.warn('LocalStorage cleanup error:', error);
    }
    
    return cleaned;
  }
}

/**
 * Main Cache Manager
 */
class CacheManager {
  private memoryCache = new MemoryCache();
  private localStorageCache = new LocalStorageCache();

  /**
   * Get cached data with fallback strategy
   */
  get<T>(cacheKey: keyof typeof CACHE_CONFIG, fallbackKey?: string): T | null {
    const config = CACHE_CONFIG[cacheKey];
    const key = fallbackKey || config.key;
    
    // Try memory cache first (fastest)
    let data = this.memoryCache.get<T>(key);
    if (data !== null) {
      return data;
    }
    
    // Try localStorage cache
    data = this.localStorageCache.get<T>(key);
    if (data !== null) {
      // Store in memory cache for faster access
      this.memoryCache.set(key, data, config.ttl, config.version);
      return data;
    }
    
    return null;
  }

  /**
   * Set cached data in both memory and localStorage
   */
  set<T>(cacheKey: keyof typeof CACHE_CONFIG, data: T, fallbackKey?: string): void {
    const config = CACHE_CONFIG[cacheKey];
    const key = fallbackKey || config.key;
    
    // Store in both caches
    this.memoryCache.set(key, data, config.ttl, config.version);
    this.localStorageCache.set(key, data, config.ttl, config.version);
  }

  /**
   * Delete cached data from both caches
   */
  delete(cacheKey: keyof typeof CACHE_CONFIG, fallbackKey?: string): void {
    const config = CACHE_CONFIG[cacheKey];
    const key = fallbackKey || config.key;
    
    this.memoryCache.delete(key);
    this.localStorageCache.delete(key);
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.memoryCache.clear();
    this.localStorageCache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memory: this.memoryCache.getStats(),
      localStorage: {
        size: typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.startsWith('nynus_cache_')).length : 0
      }
    };
  }

  /**
   * Cleanup expired items in both caches
   */
  cleanup(): { memory: number; localStorage: number } {
    return {
      memory: this.memoryCache.cleanup(),
      localStorage: this.localStorageCache.cleanup()
    };
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): void {
    // For memory cache
    const memoryKeys = Array.from((this.memoryCache as unknown as { cache: Map<string, unknown> }).cache.keys());
    memoryKeys.forEach((key: string) => {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    });

    // For localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('nynus_cache_') && key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup();
  }, 5 * 60 * 1000);
}

// Cache helper functions
export const CacheHelpers = {
  /**
   * Cache user data
   */
  cacheUserData: (userData: UserData) => {
    cacheManager.set('USER_DATA', userData);
  },

  /**
   * Get cached user data
   */
  getCachedUserData: () => {
    return cacheManager.get('USER_DATA');
  },

  /**
   * Cache session data
   */
  cacheSessionData: (sessionData: SessionData) => {
    cacheManager.set('SESSION_DATA', sessionData);
  },

  /**
   * Get cached session data
   */
  getCachedSessionData: () => {
    return cacheManager.get('SESSION_DATA');
  },

  /**
   * Cache role permissions
   */
  cacheRolePermissions: (permissions: RolePermissions) => {
    cacheManager.set('ROLE_PERMISSIONS', permissions);
  },

  /**
   * Get cached role permissions
   */
  getCachedRolePermissions: () => {
    return cacheManager.get('ROLE_PERMISSIONS');
  },

  /**
   * Invalidate user-related caches
   */
  invalidateUserCaches: () => {
    cacheManager.delete('USER_DATA');
    cacheManager.delete('SESSION_DATA');
    cacheManager.delete('ROLE_PERMISSIONS');
  },

  /**
   * Get cache statistics
   */
  getStats: () => {
    return cacheManager.getStats();
  }
};

export default cacheManager;
