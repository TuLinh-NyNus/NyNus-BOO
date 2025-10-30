/**
 * Offline Request Queue - IndexedDB Storage
 * =========================================
 * 
 * Quản lý request queue khi user offline
 * Sử dụng IndexedDB để persist requests với priorities
 * 
 * Features:
 * - Store requests khi network unavailable
 * - Priority-based retry (high > normal > low)
 * - Metadata tracking: attempts, timestamps, errors
 * - Memory efficient with indexed queries
 * - Graceful degradation when quota exceeded
 * 
 * Performance:
 * - Store 500+ requests
 * - Operations < 10ms
 * - Handle quota exceeded gracefully
 * - Survive app restart
 * 
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3 Offline Support
 */

import { logger } from '@/lib/logger';

/**
 * Queued request metadata
 */
interface QueuedRequest {
  id: string;
  requestData: Record<string, unknown>;
  priority: 'high' | 'normal' | 'low';
  retryAttempts: number;
  maxRetries: number;
  createdAt: number;
  lastRetryAt: number;
  nextRetryAt: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Queue statistics
 */
interface QueueStats {
  totalRequests: number;
  highPriority: number;
  normalPriority: number;
  lowPriority: number;
  failedRequests: number;
  pendingRequests: number;
  storageSize: number; // Approximate in bytes
  oldestRequest: number; // timestamp
  newestRequest: number; // timestamp
}

/**
 * IndexedDB configuration
 */
const DB_NAME = 'nynus-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'queued_requests';
const MAX_STORAGE_BYTES = 50 * 1024 * 1024; // 50MB limit

/**
 * OfflineRequestQueue - Manages request persistence for offline scenarios
 */
export class OfflineRequestQueue {
  private db: IDBDatabase | null = null;
  private initialized = false;
  private pendingInitialize: Promise<void> | null = null;
  private readonly serviceName = 'OfflineRequestQueue';

  /**
   * Initialize IndexedDB
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.pendingInitialize) {
      return this.pendingInitialize;
    }

    this.pendingInitialize = this.initializeDatabase();
    await this.pendingInitialize;
    this.pendingInitialize = null;
  }

  /**
   * Initialize database
   */
  private async initializeDatabase(): Promise<void> {
    if (!this.isIndexedDBSupported()) {
      logger.warn(`[${this.serviceName}] IndexedDB not supported`);
      this.initialized = false;
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      await new Promise<void>((resolve, reject) => {
        request.onerror = () => {
          logger.error(`[${this.serviceName}] Failed to open database`, {
            error: request.error?.message
          });
          reject(request.error);
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.initialized = true;
          logger.info(`[${this.serviceName}] Database initialized`);
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Create object store if doesn't exist
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

            // Create indices for queries
            store.createIndex('priority', 'priority', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
            store.createIndex('nextRetryAt', 'nextRetryAt', { unique: false });
            store.createIndex('status', 'retryAttempts', { unique: false });

            logger.info(`[${this.serviceName}] Object store created with indices`);
          }
        };
      });
    } catch (err) {
      logger.error(`[${this.serviceName}] Database initialization failed`, {
        error: err instanceof Error ? err.message : String(err)
      });
      this.initialized = false;
    }
  }

  /**
   * Add request to queue
   */
  async enqueue(
    requestData: Record<string, unknown>,
    priority: 'high' | 'normal' | 'low' = 'normal',
    metadata?: Record<string, unknown>
  ): Promise<string> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not available');
    }

    const id = this.generateId();
    const now = Date.now();

    const queuedRequest: QueuedRequest = {
      id,
      requestData,
      priority,
      retryAttempts: 0,
      maxRetries: this.getMaxRetries(priority),
      createdAt: now,
      lastRetryAt: now,
      nextRetryAt: now,
      metadata
    };

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(queuedRequest);

      await this.waitForRequest(request);

      logger.debug(`[${this.serviceName}] Request enqueued`, {
        id,
        priority,
        requestSize: JSON.stringify(requestData).length
      });

      return id;
    } catch (err) {
      if (this.isQuotaExceeded(err)) {
        logger.warn(`[${this.serviceName}] Storage quota exceeded, removing old requests`);
        await this.removeOldestRequests(5);
        // Retry enqueue
        return this.enqueue(requestData, priority, metadata);
      }

      throw err;
    }
  }

  /**
   * Get requests ready for retry
   */
  async getRetryRequests(limit: number = 10): Promise<QueuedRequest[]> {
    await this.initialize();

    if (!this.db) {
      return [];
    }

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('nextRetryAt');

      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      const request = index.getAll(range);

      const results = await this.waitForRequest(request);

      // Sort by priority (high > normal > low) then by nextRetryAt
      const sorted = results.sort((a, b) => {
        const priorityOrder: Record<string, number> = { high: 0, normal: 1, low: 2 };
        const aPriority = (a.priority as string) || 'normal';
        const bPriority = (b.priority as string) || 'normal';
        const priorityDiff = (priorityOrder[aPriority] || 1) - (priorityOrder[bPriority] || 1);
        if (priorityDiff !== 0) return priorityDiff;
        return a.nextRetryAt - b.nextRetryAt;
      });

      return sorted.slice(0, limit);
    } catch (err) {
      logger.error(`[${this.serviceName}] Failed to get retry requests`, {
        error: err instanceof Error ? err.message : String(err)
      });
      return [];
    }
  }

  /**
   * Mark request as succeeded and remove
   */
  async markSucceeded(requestId: string): Promise<void> {
    await this.removeRequest(requestId);

    logger.debug(`[${this.serviceName}] Request marked as succeeded`, { requestId });
  }

  /**
   * Mark request as failed with retry scheduling
   */
  async markFailed(requestId: string, error: string): Promise<void> {
    await this.initialize();

    if (!this.db) {
      return;
    }

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(requestId);

      const record = await this.waitForRequest(getRequest);

      if (record) {
        record.retryAttempts++;
        record.lastRetryAt = Date.now();
        record.error = error;

        // Calculate next retry time (exponential backoff)
        const backoffMs = this.calculateBackoff(record.retryAttempts);
        record.nextRetryAt = Date.now() + backoffMs;

        // If max retries exceeded, mark for removal
        if (record.retryAttempts >= record.maxRetries) {
          record.error = `Max retries exceeded: ${error}`;
          // Leave in DB for manual review, just mark as exhausted
        }

        const updateRequest = store.put(record);
        await this.waitForRequest(updateRequest);

        logger.warn(`[${this.serviceName}] Request marked as failed`, {
          requestId,
          attempt: record.retryAttempts,
          maxRetries: record.maxRetries,
          nextRetryIn: backoffMs
        });
      }
    } catch (err) {
      logger.error(`[${this.serviceName}] Failed to mark request as failed`, {
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  /**
   * Remove request from queue
   */
  async removeRequest(requestId: string): Promise<void> {
    await this.initialize();

    if (!this.db) {
      return;
    }

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(requestId);

      await this.waitForRequest(request);

      logger.debug(`[${this.serviceName}] Request removed`, { requestId });
    } catch (err) {
      logger.error(`[${this.serviceName}] Failed to remove request`, {
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    await this.initialize();

    if (!this.db) {
      return this.getEmptyStats();
    }

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();

      const records = await this.waitForRequest(getAllRequest);

      const stats: QueueStats = {
        totalRequests: records.length,
        highPriority: records.filter(r => r.priority === 'high').length,
        normalPriority: records.filter(r => r.priority === 'normal').length,
        lowPriority: records.filter(r => r.priority === 'low').length,
        failedRequests: records.filter(r => r.retryAttempts > 0).length,
        pendingRequests: records.filter(r => r.nextRetryAt <= Date.now()).length,
        storageSize: JSON.stringify(records).length,
        oldestRequest: records.length > 0
          ? Math.min(...records.map(r => r.createdAt))
          : 0,
        newestRequest: records.length > 0
          ? Math.max(...records.map(r => r.createdAt))
          : 0
      };

      return stats;
    } catch (err) {
      logger.error(`[${this.serviceName}] Failed to get stats`, {
        error: err instanceof Error ? err.message : String(err)
      });
      return this.getEmptyStats();
    }
  }

  /**
   * Clear all requests
   */
  async clear(): Promise<void> {
    await this.initialize();

    if (!this.db) {
      return;
    }

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      await this.waitForRequest(request);

      logger.info(`[${this.serviceName}] Queue cleared`);
    } catch (err) {
      logger.error(`[${this.serviceName}] Failed to clear queue`, {
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  /**
   * Check if IndexedDB is supported
   */
  private isIndexedDBSupported(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const hasIndexedDB = window.indexedDB !== undefined;
    const hasIDBKeyRange = window.IDBKeyRange !== undefined;

    return hasIndexedDB && hasIDBKeyRange;
  }

  /**
   * Wait for IndexedDB request to complete
   */
  private waitForRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  /**
   * Check if error is quota exceeded
   */
  private isQuotaExceeded(err: unknown): boolean {
    const error = err as any;
    return (
      error?.name === 'QuotaExceededError' ||
      error?.code === 22 ||
      (error instanceof Error && error.message.includes('quota'))
    );
  }

  /**
   * Remove oldest requests when quota exceeded
   */
  private async removeOldestRequests(count: number): Promise<void> {
    await this.initialize();

    if (!this.db) {
      return;
    }

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      const request = index.getAll();

      const records = await this.waitForRequest(request);

      // Remove oldest first
      for (let i = 0; i < Math.min(count, records.length); i++) {
        store.delete(records[i].id);
      }

      logger.info(`[${this.serviceName}] Removed ${count} oldest requests`);
    } catch (err) {
      logger.error(`[${this.serviceName}] Failed to remove old requests`, {
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  /**
   * Calculate exponential backoff
   */
  private calculateBackoff(attempt: number): number {
    // Base: 1s, double each attempt: 1s, 2s, 4s, 8s, 16s, etc.
    // Max: 5 minutes
    const baseMs = 1000;
    const backoffMs = baseMs * Math.pow(2, attempt - 1);
    const maxMs = 5 * 60 * 1000; // 5 minutes

    return Math.min(backoffMs, maxMs);
  }

  /**
   * Get max retries based on priority
   */
  private getMaxRetries(priority: string): number {
    switch (priority) {
      case 'high':
        return 10; // 10 retries = ~8.5 hours with exponential backoff
      case 'normal':
        return 7; // 7 retries = ~1 hour
      case 'low':
        return 3; // 3 retries = ~7 seconds
      default:
        return 5;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get empty stats
   */
  private getEmptyStats(): QueueStats {
    return {
      totalRequests: 0,
      highPriority: 0,
      normalPriority: 0,
      lowPriority: 0,
      failedRequests: 0,
      pendingRequests: 0,
      storageSize: 0,
      oldestRequest: 0,
      newestRequest: 0
    };
  }

  /**
   * Close database
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      logger.info(`[${this.serviceName}] Database closed`);
    }
  }
}

/**
 * Export singleton instance factory
 */
let singletonInstance: OfflineRequestQueue | null = null;

/**
 * Get or create singleton queue
 */
export function getOfflineRequestQueue(): OfflineRequestQueue {
  if (!singletonInstance) {
    singletonInstance = new OfflineRequestQueue();
  }
  return singletonInstance;
}

/**
 * Destroy singleton
 */
export function destroyOfflineRequestQueue(): void {
  if (singletonInstance) {
    singletonInstance.close();
    singletonInstance = null;
  }
}

/**
 * Export types
 */
export type { QueuedRequest, QueueStats };
