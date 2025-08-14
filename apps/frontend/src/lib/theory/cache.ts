/**
 * Theory Content Caching System
 * In-memory cache cho parsed LaTeX content với TTL và invalidation
 */

import type { ParsedLatexFile } from './latex-parser';

// ===== INTERFACES =====

interface CacheEntry<T> {
  /** Cached data */
  data: T;
  /** Timestamp khi cache được tạo */
  timestamp: number;
  /** TTL (Time To Live) in milliseconds */
  ttl: number;
  /** Số lần cache được access */
  accessCount: number;
  /** Last access timestamp */
  lastAccessed: number;
}

interface CacheStats {
  /** Tổng số entries trong cache */
  totalEntries: number;
  /** Cache hit rate */
  hitRate: number;
  /** Cache miss rate */
  missRate: number;
  /** Total hits */
  totalHits: number;
  /** Total misses */
  totalMisses: number;
  /** Memory usage estimate (bytes) */
  memoryUsage: number;
}

interface CacheConfig {
  /** Default TTL in milliseconds */
  defaultTTL: number;
  /** Maximum number of entries */
  maxEntries: number;
  /** Cleanup interval in milliseconds */
  cleanupInterval: number;
  /** Enable cache statistics */
  enableStats: boolean;
}

// ===== CACHE IMPLEMENTATION =====

/**
 * Generic In-Memory Cache với TTL support
 */
class InMemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats = {
    totalHits: 0,
    totalMisses: 0
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private config: CacheConfig) {
    // Start cleanup timer
    if (this.config.cleanupInterval > 0) {
      this.startCleanupTimer();
    }
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.totalMisses++;
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.totalMisses++;
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.totalHits++;

    return entry.data;
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl || this.config.defaultTTL;

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: entryTTL,
      accessCount: 0,
      lastAccessed: now
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.totalHits = 0;
    this.stats.totalMisses = 0;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.totalHits + this.stats.totalMisses;
    const hitRate = totalRequests > 0 ? this.stats.totalHits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.stats.totalMisses / totalRequests : 0;

    // Estimate memory usage
    let memoryUsage = 0;
    for (const [key, entry] of this.cache) {
      memoryUsage += key.length * 2; // String characters (UTF-16)
      memoryUsage += JSON.stringify(entry.data).length * 2; // Rough estimate
      memoryUsage += 64; // Entry metadata overhead
    }

    return {
      totalEntries: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      missRate: Math.round(missRate * 100) / 100,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      memoryUsage
    };
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Start cleanup timer để remove expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Destroy cache và cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// ===== THEORY CACHE INSTANCES =====

/**
 * Cache configuration cho theory content
 */
const THEORY_CACHE_CONFIG: CacheConfig = {
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  maxEntries: 500,
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  enableStats: true
};

/**
 * Cache cho parsed LaTeX content
 */
export const parsedContentCache = new InMemoryCache<ParsedLatexFile>(THEORY_CACHE_CONFIG);

/**
 * Cache cho file content (raw LaTeX)
 */
export const fileContentCache = new InMemoryCache<string>({
  ...THEORY_CACHE_CONFIG,
  defaultTTL: 60 * 60 * 1000, // 1 hour for raw content
  maxEntries: 1000
});

/**
 * Cache cho theory metadata
 */
export const metadataCache = new InMemoryCache<unknown>({
  ...THEORY_CACHE_CONFIG,
  defaultTTL: 2 * 60 * 60 * 1000, // 2 hours for metadata
  maxEntries: 200
});

// ===== CACHE UTILITIES =====

/**
 * Generate cache key cho theory content
 */
export function generateTheoryCacheKey(filePath: string, type: 'parsed' | 'raw' | 'metadata'): string {
  return `theory:${type}:${filePath}`;
}

/**
 * Get cached parsed content
 */
export function getCachedParsedContent(filePath: string): ParsedLatexFile | null {
  const key = generateTheoryCacheKey(filePath, 'parsed');
  return parsedContentCache.get(key);
}

/**
 * Cache parsed content
 */
export function cacheParsedContent(filePath: string, content: ParsedLatexFile, ttl?: number): void {
  const key = generateTheoryCacheKey(filePath, 'parsed');
  parsedContentCache.set(key, content, ttl);
}

/**
 * Get cached file content
 */
export function getCachedFileContent(filePath: string): string | null {
  const key = generateTheoryCacheKey(filePath, 'raw');
  return fileContentCache.get(key);
}

/**
 * Cache file content
 */
export function cacheFileContent(filePath: string, content: string, ttl?: number): void {
  const key = generateTheoryCacheKey(filePath, 'raw');
  fileContentCache.set(key, content, ttl);
}

/**
 * Invalidate cache cho specific file
 */
export function invalidateFileCache(filePath: string): void {
  const parsedKey = generateTheoryCacheKey(filePath, 'parsed');
  const rawKey = generateTheoryCacheKey(filePath, 'raw');
  const metadataKey = generateTheoryCacheKey(filePath, 'metadata');

  parsedContentCache.delete(parsedKey);
  fileContentCache.delete(rawKey);
  metadataCache.delete(metadataKey);
}

/**
 * Get cache statistics cho all theory caches
 */
export function getTheoryCacheStats() {
  return {
    parsedContent: parsedContentCache.getStats(),
    fileContent: fileContentCache.getStats(),
    metadata: metadataCache.getStats()
  };
}

/**
 * Clear all theory caches
 */
export function clearAllTheoryCaches(): void {
  parsedContentCache.clear();
  fileContentCache.clear();
  metadataCache.clear();
}

/**
 * Warm up cache với popular content
 */
export async function warmUpCache(popularFiles: string[]): Promise<void> {
  // This would be implemented to pre-load popular theory content
  console.log('Warming up cache for', popularFiles.length, 'files');
  // Implementation would depend on how we load theory content
}

// ===== BROWSER CACHE HEADERS =====

/**
 * Get cache headers cho theory static assets
 */
export function getTheoryCacheHeaders(fileType: 'latex' | 'image' | 'css' | 'js') {
  const headers: Record<string, string> = {};

  switch (fileType) {
    case 'latex':
      headers['Cache-Control'] = 'public, max-age=3600, s-maxage=7200'; // 1 hour browser, 2 hours CDN
      break;
    case 'image':
      headers['Cache-Control'] = 'public, max-age=86400, s-maxage=604800'; // 1 day browser, 1 week CDN
      break;
    case 'css':
    case 'js':
      headers['Cache-Control'] = 'public, max-age=31536000, immutable'; // 1 year for versioned assets
      break;
  }

  headers['ETag'] = `"${Date.now()}"`;
  headers['Last-Modified'] = new Date().toUTCString();

  return headers;
}

// ===== CLEANUP ON APP SHUTDOWN =====

/**
 * Cleanup cache resources khi app shutdown
 */
export function cleanupCacheResources(): void {
  parsedContentCache.destroy();
  fileContentCache.destroy();
  metadataCache.destroy();
}
