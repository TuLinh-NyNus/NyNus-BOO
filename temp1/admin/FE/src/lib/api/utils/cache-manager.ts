/**
 * Admin Cache Manager
 * Quản lý cache cho admin API services
 */

/**
 * Cache entry interface
 * Interface entry cache
 */
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
  tags?: string[];
}

/**
 * Cache configuration
 * Cấu hình cache
 */
interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enablePersistence: boolean;
  storagePrefix: string;
}

/**
 * Cache statistics
 * Thống kê cache
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
}

/**
 * Cache strategy types
 * Các loại strategy cache
 */
type CacheStrategy = "cache-first" | "network-first" | "cache-only" | "network-only";

/**
 * Admin Cache Manager Class
 * Class quản lý cache admin
 */
export class AdminCacheManager {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    memoryUsage: 0,
  };

  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    enablePersistence: true,
    storagePrefix: "admin_cache_",
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Load persisted cache on initialization
    if (this.config.enablePersistence && typeof window !== "undefined") {
      this.loadPersistedCache();
    }

    // Setup cleanup interval
    this.setupCleanupInterval();
  }

  /**
   * Get item from cache
   * Lấy item từ cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    this.stats.hits++;
    this.updateHitRate();
    return entry.data as T;
  }

  /**
   * Set item in cache
   * Set item vào cache
   */
  set<T>(key: string, data: T, ttl?: number, tags?: string[]): void {
    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key,
      tags,
    };

    this.cache.set(key, entry);
    this.updateStats();

    // Persist to storage if enabled
    if (this.config.enablePersistence) {
      this.persistEntry(key, entry);
    }
  }

  /**
   * Delete item from cache
   * Xóa item khỏi cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);

    if (deleted) {
      this.updateStats();

      // Remove from persistent storage
      if (this.config.enablePersistence && typeof window !== "undefined") {
        localStorage.removeItem(this.config.storagePrefix + key);
      }
    }

    return deleted;
  }

  /**
   * Clear cache by tags
   * Xóa cache theo tags
   */
  clearByTags(tags: string[]): number {
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.some((tag) => tags.includes(tag))) {
        this.cache.delete(key);
        cleared++;

        // Remove from persistent storage
        if (this.config.enablePersistence && typeof window !== "undefined") {
          localStorage.removeItem(this.config.storagePrefix + key);
        }
      }
    }

    this.updateStats();
    return cleared;
  }

  /**
   * Clear all cache
   * Xóa tất cả cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      memoryUsage: 0,
    };

    // Clear persistent storage
    if (this.config.enablePersistence && typeof window !== "undefined") {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.config.storagePrefix)
      );
      keys.forEach((key) => localStorage.removeItem(key));
    }
  }

  /**
   * Check if cache has key
   * Kiểm tra xem cache có key không
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Get cache statistics
   * Lấy thống kê cache
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Warm cache with data
   * Làm ấm cache với dữ liệu
   */
  warm<T>(entries: Array<{ key: string; data: T; ttl?: number; tags?: string[] }>): void {
    entries.forEach(({ key, data, ttl, tags }) => {
      this.set(key, data, ttl, tags);
    });
  }

  /**
   * Get cache keys by pattern
   * Lấy cache keys theo pattern
   */
  getKeysByPattern(pattern: RegExp): string[] {
    return Array.from(this.cache.keys()).filter((key) => pattern.test(key));
  }

  /**
   * Check if entry is expired
   * Kiểm tra xem entry có hết hạn không
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict oldest entries when cache is full
   * Loại bỏ entries cũ nhất khi cache đầy
   */
  private evictOldest(): void {
    let oldestKey = "";
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Update cache statistics
   * Cập nhật thống kê cache
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.calculateMemoryUsage();
  }

  /**
   * Update hit rate
   * Cập nhật tỷ lệ hit
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Calculate memory usage
   * Tính toán memory usage
   */
  private calculateMemoryUsage(): number {
    let size = 0;
    for (const entry of this.cache.values()) {
      size += JSON.stringify(entry).length;
    }
    return size;
  }

  /**
   * Setup cleanup interval
   * Thiết lập interval cleanup
   */
  private setupCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Cleanup every minute
  }

  /**
   * Cleanup expired entries
   * Dọn dẹp entries hết hạn
   */
  private cleanupExpired(): void {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.delete(key));
  }

  /**
   * Persist entry to storage
   * Lưu entry vào storage
   */
  private persistEntry(key: string, entry: CacheEntry): void {
    if (typeof window === "undefined") return;

    try {
      const storageKey = this.config.storagePrefix + key;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.warn("Failed to persist cache entry:", error);
    }
  }

  /**
   * Load persisted cache
   * Load cache đã lưu
   */
  private loadPersistedCache(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.config.storagePrefix)
      );

      keys.forEach((storageKey) => {
        const key = storageKey.replace(this.config.storagePrefix, "");
        const entryStr = localStorage.getItem(storageKey);

        if (entryStr) {
          const entry: CacheEntry = JSON.parse(entryStr);

          // Only load if not expired
          if (!this.isExpired(entry)) {
            this.cache.set(key, entry);
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      });

      this.updateStats();
    } catch (error) {
      console.warn("Failed to load persisted cache:", error);
    }
  }
}

/**
 * Default cache configurations for different data types
 * Cấu hình cache mặc định cho các loại dữ liệu khác nhau
 */
export const CACHE_CONFIGS = {
  USER_DATA: {
    ttl: 10 * 60 * 1000, // 10 minutes
    tags: ["users"],
  },
  ANALYTICS: {
    ttl: 2 * 60 * 1000, // 2 minutes
    tags: ["analytics"],
  },
  SYSTEM_SETTINGS: {
    ttl: 30 * 60 * 1000, // 30 minutes
    tags: ["settings"],
  },
  SECURITY_EVENTS: {
    ttl: 1 * 60 * 1000, // 1 minute
    tags: ["security"],
  },
  STATIC_DATA: {
    ttl: 60 * 60 * 1000, // 1 hour
    tags: ["static"],
  },
} as const;

/**
 * Create default admin cache manager instance
 * Tạo instance cache manager admin mặc định
 */
export const adminCacheManager = new AdminCacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  enablePersistence: true,
  storagePrefix: "nynus_admin_cache_",
});
