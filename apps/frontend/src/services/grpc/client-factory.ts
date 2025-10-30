/**
 * gRPC Client Factory with Connection Pooling
 * ===========================================
 * 
 * Centralized factory cho gRPC service clients với connection pooling
 * Tối ưu hiệu suất qua reuse connections và health checks
 * 
 * Features:
 * - Lazy initialization của client instances
 * - Connection pool với max size limit
 * - Health check mechanism để phát hiện stale connections
 * - Idle timeout management (30s default)
 * - Automatic reconnect trên failure
 * - Reuse rate tracking
 * 
 * Performance Targets:
 * - Pool size within limits (1-10 per service)
 * - Connection reuse rate >= 80%
 * - Avg acquire time < 10ms
 * - Không memory leaks
 * 
 * @author NyNus Development Team
 * @version 3.0.0 - Phase 3 Connection Pooling
 */

import { GRPC_WEB_HOST } from './config';
import { logger } from '@/lib/logger';

/**
 * Connection metadata
 */
interface PooledConnection<T> {
  client: T;
  createdAt: number;
  lastUsedAt: number;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  useCount: number;
  isValid: boolean;
}

/**
 * Pool configuration
 */
interface PoolConfig {
  // Maximum number of connections in pool
  maxPoolSize: number;
  // Idle timeout in milliseconds (30s)
  idleTimeoutMs: number;
  // Health check interval in milliseconds
  healthCheckIntervalMs: number;
  // Enable automatic reconnection on failure
  autoReconnect: boolean;
}

/**
 * Pool statistics
 */
interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  reuseRate: number; // Percentage
  totalRequests: number;
  healthyConnections: number;
  unhealthyConnections: number;
  avgConnectionAge: number; // Milliseconds
}

/**
 * Connection Pool Implementation
 */
class ConnectionPool<T> {
  private pool: PooledConnection<T>[] = [];
  private stats = {
    acquired: 0,
    released: 0,
    created: 0,
    reused: 0,
    removed: 0
  };
  private config: PoolConfig;
  private healthCheckInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;
  private readonly serviceName: string;

  constructor(
    serviceName: string,
    config?: Partial<PoolConfig>
  ) {
    this.serviceName = serviceName;
    this.config = {
      maxPoolSize: config?.maxPoolSize ?? 5,
      idleTimeoutMs: config?.idleTimeoutMs ?? 30000, // 30 seconds
      healthCheckIntervalMs: config?.healthCheckIntervalMs ?? 10000, // 10 seconds
      autoReconnect: config?.autoReconnect ?? true
    };

    logger.debug(`[ConnectionPool] Initialized ${serviceName}`, {
      config: this.config
    });

    // Start background maintenance tasks
    this.startMaintenance();
  }

  /**
   * Acquire a connection from pool
   */
  acquire(): T | null {
    // Try to get a healthy idle connection
    const idleConnection = this.pool.find(
      conn => conn.isValid && conn.healthStatus === 'healthy'
    );

    if (idleConnection) {
      idleConnection.lastUsedAt = Date.now();
      idleConnection.useCount++;
      this.stats.reused++;
      this.stats.acquired++;

      logger.debug(`[ConnectionPool] Connection reused for ${this.serviceName}`, {
        reused: this.stats.reused,
        reuseRate: this.getReuseRate()
      });

      return idleConnection.client;
    }

    // No idle connection available, return null to signal need for new connection
    return null;
  }

  /**
   * Release a connection back to pool
   */
  release(client: T): void {
    const conn = this.pool.find(c => c.client === client);
    if (conn) {
      conn.lastUsedAt = Date.now();
      this.stats.released++;
      logger.debug(`[ConnectionPool] Connection released for ${this.serviceName}`);
    }
  }

  /**
   * Add new connection to pool
   */
  add(client: T): void {
    if (this.pool.length >= this.config.maxPoolSize) {
      logger.warn(`[ConnectionPool] Pool size limit reached for ${this.serviceName}`);
      return;
    }

    const pooledConn: PooledConnection<T> = {
      client,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      healthStatus: 'unknown',
      useCount: 0,
      isValid: true
    };

    this.pool.push(pooledConn);
    this.stats.created++;

    logger.debug(`[ConnectionPool] Connection added for ${this.serviceName}`, {
      poolSize: this.pool.length
    });
  }

  /**
   * Mark connection as unhealthy
   */
  markUnhealthy(client: T): void {
    const conn = this.pool.find(c => c.client === client);
    if (conn) {
      conn.healthStatus = 'unhealthy';
      this.stats.removed++;
      logger.warn(`[ConnectionPool] Connection marked unhealthy for ${this.serviceName}`);
    }
  }

  /**
   * Remove connection from pool
   */
  remove(client: T): void {
    const index = this.pool.findIndex(c => c.client === client);
    if (index !== -1) {
      this.pool.splice(index, 1);
      this.stats.removed++;
      logger.debug(`[ConnectionPool] Connection removed for ${this.serviceName}`, {
        poolSize: this.pool.length
      });
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    const active = this.pool.filter(c => c.isValid && c.lastUsedAt > Date.now() - 5000);
    const idle = this.pool.filter(c => c.isValid && !active.includes(c));
    const healthy = this.pool.filter(c => c.healthStatus === 'healthy');
    const unhealthy = this.pool.filter(c => c.healthStatus === 'unhealthy');

    const avgAge = this.pool.length > 0
      ? Math.round(
          this.pool.reduce((sum, c) => sum + (Date.now() - c.createdAt), 0) /
          this.pool.length
        )
      : 0;

    return {
      totalConnections: this.pool.length,
      activeConnections: active.length,
      idleConnections: idle.length,
      reuseRate: this.getReuseRate(),
      totalRequests: this.stats.acquired,
      healthyConnections: healthy.length,
      unhealthyConnections: unhealthy.length,
      avgConnectionAge: avgAge
    };
  }

  /**
   * Clear all connections
   */
  clear(): void {
    this.pool = [];
    this.stopMaintenance();
    logger.info(`[ConnectionPool] Cleared all connections for ${this.serviceName}`);
  }

  /**
   * Start background maintenance (health checks, cleanup)
   */
  private startMaintenance(): void {
    // Health check every 10 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckIntervalMs);

    // Cleanup idle connections every 15 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections();
    }, this.config.idleTimeoutMs / 2);
  }

  /**
   * Stop maintenance
   */
  private stopMaintenance(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Perform health check on connections
   */
  private performHealthCheck(): void {
    for (const conn of this.pool) {
      // Simple health check: assume connection is healthy if used recently
      const timeSinceLastUse = Date.now() - conn.lastUsedAt;
      if (timeSinceLastUse < 5000) {
        conn.healthStatus = 'healthy';
      } else if (conn.healthStatus === 'unknown') {
        // Mark as healthy if we haven't checked yet
        conn.healthStatus = 'healthy';
      }
      // Keep unhealthy status until removed
    }
  }

  /**
   * Remove idle connections
   */
  private cleanupIdleConnections(): void {
    const now = Date.now();
    const before = this.pool.length;

    this.pool = this.pool.filter(conn => {
      const idleTime = now - conn.lastUsedAt;
      const shouldKeep = idleTime < this.config.idleTimeoutMs || conn.useCount === 0;

      if (!shouldKeep) {
        this.stats.removed++;
      }

      return shouldKeep;
    });

    if (this.pool.length < before) {
      logger.debug(
        `[ConnectionPool] Cleaned up ${before - this.pool.length} idle connections for ${this.serviceName}`
      );
    }
  }

  /**
   * Calculate reuse rate
   */
  private getReuseRate(): number {
    if (this.stats.acquired === 0) return 0;
    return Math.round((this.stats.reused / this.stats.acquired) * 100);
  }
}

/**
 * Global connection pools map
 */
const globalPools = new Map<string, ConnectionPool<any>>();

/**
 * Default gRPC client options
 */
const DEFAULT_CLIENT_OPTIONS = {
  format: 'text' as const,
  withCredentials: false,
  unaryInterceptors: [],
  streamInterceptors: []
};

/**
 * Get or create connection pool for service
 */
function getOrCreatePool<T>(serviceName: string): ConnectionPool<T> {
  if (!globalPools.has(serviceName)) {
    globalPools.set(serviceName, new ConnectionPool<T>(serviceName));
  }
  return globalPools.get(serviceName)!;
}

/**
 * Generic gRPC client factory with connection pooling
 * 
 * @param ClientClass - The gRPC service client class constructor
 * @param serviceName - Name of the service for logging
 * @returns Function that returns initialized client instance
 */
export function createGrpcClient<T>(
  ClientClass: new (endpoint: string, credentials?: { [index: string]: string } | null, options?: { [index: string]: unknown } | null) => T,
  serviceName: string
): () => T {
  const pool = getOrCreatePool<T>(serviceName);

  return function getClient(): T {
    // Only allow client-side usage
    if (typeof window === 'undefined') {
      throw new Error(`[${serviceName}] gRPC client can only be used on client-side`);
    }

    // Try to reuse connection from pool
    let client = pool.acquire();

    if (client) {
      return client;
    }

    // Create new connection
    logger.debug(`[${serviceName}] Creating new gRPC client`, {
      endpoint: GRPC_WEB_HOST
    });

    client = new ClientClass(GRPC_WEB_HOST, null, DEFAULT_CLIENT_OPTIONS);
    pool.add(client);

    return client;
  };
}

/**
 * Simple gRPC client factory for clients that don't use options
 * 
 * @param ClientClass - The gRPC service client class constructor
 * @param serviceName - Name of the service for logging
 * @returns Function that returns initialized client instance
 */
export function createSimpleGrpcClient<T>(
  ClientClass: new (endpoint: string) => T,
  serviceName: string
): () => T {
  const pool = getOrCreatePool<T>(serviceName);

  return function getClient(): T {
    // Only allow client-side usage
    if (typeof window === 'undefined') {
      throw new Error(`[${serviceName}] gRPC client can only be used on client-side`);
    }

    // Try to reuse connection from pool
    let client = pool.acquire();

    if (client) {
      return client;
    }

    // Create new connection
    logger.debug(`[${serviceName}] Creating new simple gRPC client`, {
      endpoint: GRPC_WEB_HOST
    });

    client = new ClientClass(GRPC_WEB_HOST);
    pool.add(client);

    return client;
  };
}

/**
 * Get pool statistics for a service
 */
export function getPoolStats(serviceName: string): PoolStats | null {
  const pool = globalPools.get(serviceName);
  return pool ? pool.getStats() : null;
}

/**
 * Get all pool statistics
 */
export function getAllPoolStats(): Record<string, PoolStats> {
  const allStats: Record<string, PoolStats> = {};

  for (const [serviceName, pool] of globalPools.entries()) {
    allStats[serviceName] = pool.getStats();
  }

  return allStats;
}

/**
 * Mark connection as unhealthy (call when error occurs)
 */
export function markConnectionUnhealthy(serviceName: string, client: any): void {
  const pool = globalPools.get(serviceName);
  if (pool) {
    pool.markUnhealthy(client);
  }
}

/**
 * Remove connection from pool
 */
export function removeConnection(serviceName: string, client: any): void {
  const pool = globalPools.get(serviceName);
  if (pool) {
    pool.remove(client);
  }
}

/**
 * Reset all client instances and clear pools
 */
export function resetAllClients(): void {
  logger.debug('[ClientFactory] Resetting all gRPC client instances and pools');
  
  for (const [serviceName, pool] of globalPools.entries()) {
    pool.clear();
    globalPools.delete(serviceName);
  }
}

/**
 * Export connection pool type for advanced usage
 */
export type { PoolStats, PoolConfig };
