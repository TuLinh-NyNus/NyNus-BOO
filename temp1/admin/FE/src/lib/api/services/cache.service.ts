/**
 * Admin Cache Service
 * Service cache cho admin API với intelligent caching strategies
 */

import { adminCacheManager, CACHE_CONFIGS, AdminCacheManager } from "../utils/cache-manager";

/**
 * Cache decorator options
 * Tùy chọn cache decorator
 */
interface CacheOptions {
  key?: string;
  ttl?: number;
  tags?: string[];
  strategy?: "cache-first" | "network-first" | "cache-only" | "network-only";
  invalidateOnError?: boolean;
}

/**
 * Cache service class
 * Class service cache
 */
export class AdminCacheService {
  public cacheManager: AdminCacheManager;

  constructor(cacheManager?: AdminCacheManager) {
    this.cacheManager = cacheManager || adminCacheManager;
  }

  /**
   * Cache decorator for service methods
   * Decorator cache cho service methods
   */
  cached<T extends (...args: any[]) => Promise<any>>(options: CacheOptions = {}) {
    const cacheService = this;

    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (this: any, ...args: any[]) {
        const cacheKey =
          options.key || `${target.constructor.name}.${propertyKey}.${JSON.stringify(args)}`;
        const strategy = options.strategy || "cache-first";

        try {
          switch (strategy) {
            case "cache-only":
              return cacheService.getCachedResult(cacheKey);

            case "network-only":
              return cacheService.fetchAndCache(originalMethod, args, cacheKey, options, this);

            case "network-first":
              try {
                return await cacheService.fetchAndCache(
                  originalMethod,
                  args,
                  cacheKey,
                  options,
                  this
                );
              } catch (error) {
                const cached = cacheService.getCachedResult(cacheKey);
                if (cached !== null) {
                  console.warn(`Network failed, using cached result for ${cacheKey}`);
                  return cached;
                }
                throw error;
              }

            case "cache-first":
            default:
              const cached = cacheService.getCachedResult(cacheKey);
              if (cached !== null) {
                return cached;
              }
              return cacheService.fetchAndCache(originalMethod, args, cacheKey, options, this);
          }
        } catch (error) {
          if (options.invalidateOnError) {
            cacheService.cacheManager.delete(cacheKey);
          }
          throw error;
        }
      };

      return descriptor;
    };
  }

  /**
   * Get cached result
   * Lấy kết quả từ cache
   */
  private getCachedResult<T>(key: string): T | null {
    return this.cacheManager.get<T>(key);
  }

  /**
   * Fetch data and cache result
   * Fetch dữ liệu và cache kết quả
   */
  private async fetchAndCache<T>(
    method: Function,
    args: any[],
    key: string,
    options: CacheOptions,
    context?: any
  ): Promise<T> {
    const result = await method.apply(context, args);
    this.cacheManager.set(key, result, options.ttl, options.tags);
    return result;
  }

  /**
   * Invalidate cache by key
   * Invalidate cache theo key
   */
  invalidate(key: string): boolean {
    return this.cacheManager.delete(key);
  }

  /**
   * Invalidate cache by tags
   * Invalidate cache theo tags
   */
  invalidateByTags(tags: string[]): number {
    return this.cacheManager.clearByTags(tags);
  }

  /**
   * Warm cache with data
   * Làm ấm cache với dữ liệu
   */
  warm<T>(entries: Array<{ key: string; data: T; ttl?: number; tags?: string[] }>): void {
    this.cacheManager.warm(entries);
  }

  /**
   * Get cache statistics
   * Lấy thống kê cache
   */
  getStats() {
    return this.cacheManager.getStats();
  }

  /**
   * Clear all cache
   * Xóa tất cả cache
   */
  clearAll(): void {
    this.cacheManager.clear();
  }
}

/**
 * Cache-aware data fetcher
 * Data fetcher có cache awareness
 */
export class CacheAwareDataFetcher {
  private cacheService: AdminCacheService;

  constructor(cacheService?: AdminCacheService) {
    this.cacheService = cacheService || new AdminCacheService();
  }

  /**
   * Fetch with cache strategy
   * Fetch với cache strategy
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const strategy = options.strategy || "cache-first";

    switch (strategy) {
      case "cache-only":
        const cached = this.cacheService.cacheManager.get<T>(key);
        if (cached === null) {
          throw new Error(`No cached data available for key: ${key}`);
        }
        return cached;

      case "network-only":
        const result = await fetcher();
        this.cacheService.cacheManager.set(key, result, options.ttl, options.tags);
        return result;

      case "network-first":
        try {
          const networkResult = await fetcher();
          this.cacheService.cacheManager.set(key, networkResult, options.ttl, options.tags);
          return networkResult;
        } catch (error) {
          const fallbackCached = this.cacheService.cacheManager.get<T>(key);
          if (fallbackCached !== null) {
            console.warn(`Network failed, using cached result for ${key}`);
            return fallbackCached;
          }
          throw error;
        }

      case "cache-first":
      default:
        const cacheFirstResult = this.cacheService.cacheManager.get<T>(key);
        if (cacheFirstResult !== null) {
          return cacheFirstResult;
        }
        const freshResult = await fetcher();
        this.cacheService.cacheManager.set(key, freshResult, options.ttl, options.tags);
        return freshResult;
    }
  }

  /**
   * Batch fetch with cache
   * Batch fetch với cache
   */
  async batchFetchWithCache<T>(
    requests: Array<{
      key: string;
      fetcher: () => Promise<T>;
      options?: CacheOptions;
    }>
  ): Promise<T[]> {
    const results = await Promise.allSettled(
      requests.map(({ key, fetcher, options }) => this.fetchWithCache(key, fetcher, options))
    );

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        console.error(`Batch fetch failed for key ${requests[index].key}:`, result.reason);
        throw result.reason;
      }
    });
  }
}

/**
 * Predefined cache strategies for common admin operations
 * Cache strategies được định nghĩa trước cho operations admin thường dùng
 */
export const ADMIN_CACHE_STRATEGIES = {
  /**
   * User data caching
   * Cache dữ liệu user
   */
  USER_DATA: {
    ...CACHE_CONFIGS.USER_DATA,
    strategy: "cache-first" as const,
  },

  /**
   * Analytics data caching
   * Cache dữ liệu analytics
   */
  ANALYTICS: {
    ...CACHE_CONFIGS.ANALYTICS,
    strategy: "network-first" as const,
  },

  /**
   * System settings caching
   * Cache cài đặt hệ thống
   */
  SYSTEM_SETTINGS: {
    ...CACHE_CONFIGS.SYSTEM_SETTINGS,
    strategy: "cache-first" as const,
  },

  /**
   * Security events caching
   * Cache security events
   */
  SECURITY_EVENTS: {
    ...CACHE_CONFIGS.SECURITY_EVENTS,
    strategy: "network-first" as const,
  },

  /**
   * Static data caching
   * Cache dữ liệu static
   */
  STATIC_DATA: {
    ...CACHE_CONFIGS.STATIC_DATA,
    strategy: "cache-first" as const,
  },
} as const;

/**
 * Cache invalidation utilities
 * Utilities invalidation cache
 */
export const CacheInvalidation = {
  /**
   * Invalidate user-related cache
   * Invalidate cache liên quan đến user
   */
  invalidateUserCache(): number {
    return adminCacheService.invalidateByTags(["users"]);
  },

  /**
   * Invalidate analytics cache
   * Invalidate cache analytics
   */
  invalidateAnalyticsCache(): number {
    return adminCacheService.invalidateByTags(["analytics"]);
  },

  /**
   * Invalidate security cache
   * Invalidate cache bảo mật
   */
  invalidateSecurityCache(): number {
    return adminCacheService.invalidateByTags(["security"]);
  },

  /**
   * Invalidate system settings cache
   * Invalidate cache cài đặt hệ thống
   */
  invalidateSettingsCache(): number {
    return adminCacheService.invalidateByTags(["settings"]);
  },

  /**
   * Invalidate all cache
   * Invalidate tất cả cache
   */
  invalidateAll(): void {
    adminCacheService.clearAll();
  },
};

/**
 * Cache warming utilities
 * Utilities làm ấm cache
 */
export const CacheWarming = {
  /**
   * Warm frequently accessed data
   * Làm ấm dữ liệu được truy cập thường xuyên
   */
  async warmFrequentData(): Promise<void> {
    // This would be implemented based on specific admin needs
    console.log("Cache warming initiated for frequently accessed data");
  },

  /**
   * Warm dashboard data
   * Làm ấm dữ liệu dashboard
   */
  async warmDashboardData(): Promise<void> {
    // This would warm up dashboard metrics and analytics
    console.log("Cache warming initiated for dashboard data");
  },
};

/**
 * Default admin cache service instance
 * Instance service cache admin mặc định
 */
export const adminCacheService = new AdminCacheService();

/**
 * Default cache-aware data fetcher instance
 * Instance data fetcher có cache awareness mặc định
 */
export const adminDataFetcher = new CacheAwareDataFetcher();
