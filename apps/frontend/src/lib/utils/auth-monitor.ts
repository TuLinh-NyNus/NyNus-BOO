/**
 * Authentication Performance Monitor
 * ==================================
 * 
 * Theo dõi hiệu suất của authentication system
 * Bao gồm: token validation, caching, batching, connection pooling
 * 
 * Metrics Collection:
 * - Token validation latency (P50, P95, P99)
 * - Cache hit/miss rates
 * - Batch formation time
 * - Connection pool utilization
 * - Error rates và types
 * 
 * Performance Targets:
 * - Token validation < 50ms (P95)
 * - Cache lookup < 5ms
 * - Batch overhead < 10%
 * - Pool utilization 40-80%
 * 
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3 Performance Monitoring
 */

import { logger } from '@/lib/logger';
import { getAllPoolStats, PoolStats } from '@/services/grpc/client-factory';

/**
 * Latency metric data point
 */
interface LatencyMetric {
  value: number; // milliseconds
  timestamp: number;
  operation: string;
  context?: string;
}

/**
 * Cache metric
 */
interface CacheMetric {
  hits: number;
  misses: number;
  size: number;
  ttl: number;
  evictions: number;
}

/**
 * Performance metrics aggregate
 */
interface PerformanceMetrics {
  tokenValidation: {
    latencies: LatencyMetric[];
    p50: number;
    p95: number;
    p99: number;
    totalCalls: number;
    errorRate: number;
  };
  caching: {
    hitRate: number; // Percentage
    missRate: number; // Percentage
    avgLookupTime: number;
    totalOperations: number;
    currentCacheSize: number;
  };
  batching: {
    avgBatchSize: number;
    latencySavings: number; // Percentage
    totalBatches: number;
    successRate: number;
    avgFormationTime: number;
  };
  connectionPool: {
    reuseRate: number; // Percentage
    avgConnectionAge: number;
    poolUtilization: Record<string, PoolStats>;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    recentErrors: Array<{ message: string; timestamp: number; context?: string }>;
  };
  timestamp: number;
  uptime: number; // milliseconds
}

/**
 * AuthMonitor - Centralized performance monitoring
 */
class AuthMonitor {
  private latencies: LatencyMetric[] = [];
  private cacheMetrics: CacheMetric = {
    hits: 0,
    misses: 0,
    size: 0,
    ttl: 0,
    evictions: 0
  };
  private batchingMetrics = {
    totalBatches: 0,
    successfulBatches: 0,
    formationTimes: [] as number[]
  };
  private errorMetrics = new Map<string, number>();
  private recentErrors: Array<{ message: string; timestamp: number; context?: string }> = [];
  private startTime = Date.now();
  private readonly maxLatencyHistorySize = 1000;
  private readonly maxRecentErrorsSize = 100;

  /**
   * Record token validation latency
   */
  recordTokenValidation(
    latency: number,
    success: boolean = true,
    context?: string
  ): void {
    const metric: LatencyMetric = {
      value: latency,
      timestamp: Date.now(),
      operation: 'token_validation',
      context
    };

    this.latencies.push(metric);

    // Keep history size manageable
    if (this.latencies.length > this.maxLatencyHistorySize) {
      this.latencies.shift();
    }

    if (!success) {
      this.recordError('token_validation_failed', context);
    }

    logger.debug('[AuthMonitor] Token validation recorded', {
      latency: `${latency}ms`,
      success,
      totalValidations: this.getTokenValidationCount()
    });
  }

  /**
   * Record cache operation
   */
  recordCacheOperation(
    operation: 'hit' | 'miss' | 'eviction',
    lookupTime?: number
  ): void {
    if (operation === 'hit') {
      this.cacheMetrics.hits++;
    } else if (operation === 'miss') {
      this.cacheMetrics.misses++;
    } else if (operation === 'eviction') {
      this.cacheMetrics.evictions++;
    }

    if (lookupTime && lookupTime > 10) {
      logger.warn('[AuthMonitor] Slow cache lookup', {
        time: `${lookupTime}ms`,
        operation
      });
    }
  }

  /**
   * Update cache metrics
   */
  updateCacheMetrics(size: number, ttl: number): void {
    this.cacheMetrics.size = size;
    this.cacheMetrics.ttl = ttl;
  }

  /**
   * Record batch metrics
   */
  recordBatchMetrics(
    batchSize: number,
    formationTime: number,
    success: boolean = true
  ): void {
    this.batchingMetrics.totalBatches++;
    if (success) {
      this.batchingMetrics.successfulBatches++;
    }
    this.batchingMetrics.formationTimes.push(formationTime);

    // Keep history manageable
    if (this.batchingMetrics.formationTimes.length > 1000) {
      this.batchingMetrics.formationTimes.shift();
    }

    logger.debug('[AuthMonitor] Batch metrics recorded', {
      size: batchSize,
      formationTime: `${formationTime}ms`,
      success
    });
  }

  /**
   * Record error
   */
  recordError(
    errorType: string,
    context?: string,
    message?: string
  ): void {
    // Increment error count by type
    const current = this.errorMetrics.get(errorType) || 0;
    this.errorMetrics.set(errorType, current + 1);

    // Add to recent errors list
    this.recentErrors.push({
      message: message || errorType,
      timestamp: Date.now(),
      context
    });

    // Keep size manageable
    if (this.recentErrors.length > this.maxRecentErrorsSize) {
      this.recentErrors.shift();
    }

    logger.error('[AuthMonitor] Error recorded', {
      type: errorType,
      context,
      totalErrors: this.errorMetrics.get(errorType)
    });
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics(): PerformanceMetrics {
    const totalLatencies = this.latencies.length;
    const successfulLatencies = this.latencies.length;
    const sortedLatencies = [...this.latencies]
      .sort((a, b) => a.value - b.value);

    const p50 = totalLatencies > 0 ? sortedLatencies[Math.floor(totalLatencies * 0.5)].value : 0;
    const p95 = totalLatencies > 0 ? sortedLatencies[Math.floor(totalLatencies * 0.95)].value : 0;
    const p99 = totalLatencies > 0 ? sortedLatencies[Math.floor(totalLatencies * 0.99)].value : 0;

    const totalCacheOps = this.cacheMetrics.hits + this.cacheMetrics.misses;
    const hitRate = totalCacheOps > 0
      ? Math.round((this.cacheMetrics.hits / totalCacheOps) * 100)
      : 0;

    const avgFormationTime = this.batchingMetrics.formationTimes.length > 0
      ? Math.round(
          this.batchingMetrics.formationTimes.reduce((a, b) => a + b, 0) /
          this.batchingMetrics.formationTimes.length
        )
      : 0;

    // Calculate average latency savings from batching
    // Assuming batching saves ~90% of overhead per additional item
    const avgBatchSize = this.batchingMetrics.totalBatches > 0
      ? Math.ceil(totalLatencies / this.batchingMetrics.totalBatches)
      : 0;
    const latencySavings = avgBatchSize >= 2
      ? Math.round(((avgBatchSize - 1) / avgBatchSize) * 100)
      : 0;

    const totalErrors = Array.from(this.errorMetrics.values()).reduce((a, b) => a + b, 0);
    const errorRate = successfulLatencies > 0
      ? Math.round((totalErrors / (successfulLatencies + totalErrors)) * 100)
      : 0;

    // Get pool stats
    const poolStats = getAllPoolStats();

    // Calculate average pool utilization
    let totalReuseRate = 0;
    let poolCount = 0;
    for (const stats of Object.values(poolStats)) {
      totalReuseRate += stats.reuseRate;
      poolCount++;
    }
    const avgPoolReuseRate = poolCount > 0
      ? Math.round(totalReuseRate / poolCount)
      : 0;

    // Calculate average connection age
    let totalAge = 0;
    for (const stats of Object.values(poolStats)) {
      totalAge += stats.avgConnectionAge;
    }
    const avgConnectionAge = poolCount > 0
      ? Math.round(totalAge / poolCount)
      : 0;

    return {
      tokenValidation: {
        latencies: sortedLatencies.slice(-100), // Last 100 only
        p50,
        p95,
        p99,
        totalCalls: successfulLatencies,
        errorRate
      },
      caching: {
        hitRate,
        missRate: 100 - hitRate,
        avgLookupTime: 0, // Calculated from cache backend
        totalOperations: totalCacheOps,
        currentCacheSize: this.cacheMetrics.size
      },
      batching: {
        avgBatchSize,
        latencySavings,
        totalBatches: this.batchingMetrics.totalBatches,
        successRate: this.batchingMetrics.totalBatches > 0
          ? Math.round((this.batchingMetrics.successfulBatches / this.batchingMetrics.totalBatches) * 100)
          : 0,
        avgFormationTime
      },
      connectionPool: {
        reuseRate: avgPoolReuseRate,
        avgConnectionAge,
        poolUtilization: poolStats
      },
      errors: {
        total: totalErrors,
        byType: Object.fromEntries(this.errorMetrics),
        recentErrors: this.recentErrors
      },
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Get token validation metrics
   */
  getTokenValidationMetrics() {
    const metrics = this.getMetrics();
    return metrics.tokenValidation;
  }

  /**
   * Get cache metrics
   */
  getCacheMetrics() {
    const metrics = this.getMetrics();
    return metrics.caching;
  }

  /**
   * Get batching metrics
   */
  getBatchingMetrics() {
    const metrics = this.getMetrics();
    return metrics.batching;
  }

  /**
   * Get connection pool metrics
   */
  getConnectionPoolMetrics() {
    const metrics = this.getMetrics();
    return metrics.connectionPool;
  }

  /**
   * Get error metrics
   */
  getErrorMetrics() {
    const metrics = this.getMetrics();
    return metrics.errors;
  }

  /**
   * Check if performance meets targets
   */
  isPerformanceHealthy(): boolean {
    const metrics = this.getMetrics();

    // Check token validation (target: P95 < 50ms)
    if (metrics.tokenValidation.p95 > 50) {
      logger.warn('[AuthMonitor] Token validation P95 exceeds target', {
        current: metrics.tokenValidation.p95,
        target: 50
      });
      return false;
    }

    // Check cache hit rate (target: >= 70%)
    if (metrics.caching.hitRate < 70 && metrics.caching.totalOperations > 100) {
      logger.warn('[AuthMonitor] Cache hit rate below target', {
        current: metrics.caching.hitRate,
        target: 70
      });
      return false;
    }

    // Check connection pool reuse rate (target: >= 80%)
    if (metrics.connectionPool.reuseRate < 80 && metrics.connectionPool.reuseRate > 0) {
      logger.warn('[AuthMonitor] Connection pool reuse rate below target', {
        current: metrics.connectionPool.reuseRate,
        target: 80
      });
      return false;
    }

    // Check error rate (target: < 5%)
    if (metrics.errors.total > 0 && metrics.tokenValidation.errorRate > 5) {
      logger.warn('[AuthMonitor] Error rate exceeds target', {
        current: metrics.tokenValidation.errorRate,
        target: 5
      });
      return false;
    }

    return true;
  }

  /**
   * Get health report
   */
  getHealthReport(): {
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check token validation
    if (metrics.tokenValidation.p95 > 50) {
      issues.push(`Token validation P95 is ${metrics.tokenValidation.p95}ms (target: 50ms)`);
      recommendations.push('Consider reducing token validation complexity or increasing cache TTL');
    }

    // Check cache
    if (metrics.caching.hitRate < 70 && metrics.caching.totalOperations > 100) {
      issues.push(`Cache hit rate is ${metrics.caching.hitRate}% (target: 70%)`);
      recommendations.push('Increase cache TTL or pre-warm cache on startup');
    }

    // Check batching
    if (metrics.batching.totalBatches > 0 && metrics.batching.successRate < 90) {
      issues.push(`Batch success rate is ${metrics.batching.successRate}% (target: 90%)`);
      recommendations.push('Investigate batch failure causes and implement retry logic');
    }

    // Check connection pool
    if (metrics.connectionPool.reuseRate < 60 && metrics.connectionPool.reuseRate > 0) {
      issues.push(`Connection pool reuse rate is ${metrics.connectionPool.reuseRate}% (target: 80%)`);
      recommendations.push('Increase max pool size or reduce idle timeout');
    }

    // Check errors
    if (metrics.errors.total > 100) {
      issues.push(`High error count: ${metrics.errors.total}`);
      recommendations.push('Review recent errors and implement error handling improvements');
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.latencies = [];
    this.cacheMetrics = {
      hits: 0,
      misses: 0,
      size: 0,
      ttl: 0,
      evictions: 0
    };
    this.batchingMetrics = {
      totalBatches: 0,
      successfulBatches: 0,
      formationTimes: []
    };
    this.errorMetrics.clear();
    this.recentErrors = [];
    this.startTime = Date.now();
    logger.info('[AuthMonitor] All metrics reset');
  }

  /**
   * Record token refresh attempt
   */
  recordTokenRefreshAttempt(userId: string, context?: Record<string, unknown>): void {
    logger.debug('[AuthMonitor] Token refresh attempt recorded', {
      userId,
      context,
      timestamp: Date.now()
    });
  }

  /**
   * Record successful token refresh
   */
  recordTokenRefreshSuccess(duration: number, userId: string, context?: Record<string, unknown>): void {
    this.recordLatency({
      value: duration,
      operation: 'token_refresh_success',
      context: `user:${userId}`
    });
    logger.debug('[AuthMonitor] Token refresh success recorded', {
      duration,
      userId,
      context
    });
  }

  /**
   * Record token refresh failure
   */
  recordTokenRefreshFailure(
    errorType: string,
    errorMessage: string,
    duration: number,
    context?: Record<string, unknown>
  ): void {
    this.recordError('token_refresh_failure', errorMessage, {
      errorType,
      duration,
      ...context
    });
    logger.debug('[AuthMonitor] Token refresh failure recorded', {
      errorType,
      errorMessage,
      duration,
      context
    });
  }

  /**
   * Record forced logout
   */
  recordForcedLogout(userId: string, reason: string, context?: Record<string, unknown>): void {
    logger.warn('[AuthMonitor] Forced logout recorded', {
      userId,
      reason,
      context,
      timestamp: Date.now()
    });
  }

  /**
   * Private helper to get token validation count
   */
  private getTokenValidationCount(): number {
    return this.latencies.filter(m => m.operation === 'token_validation').length;
  }
}

/**
 * Export singleton instance
 */
export const authMonitor = new AuthMonitor();

/**
 * Export class for testing
 */
export { AuthMonitor };

/**
 * Export types
 */
export type { PerformanceMetrics, LatencyMetric, CacheMetric };

/**
 * Start authentication monitoring
 * @param reportIntervalMs - Interval for health reports (default: 5 minutes)
 */
export function startAuthMonitoring(reportIntervalMs: number = 5 * 60 * 1000): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Send health report every interval
  setInterval(() => {
    const report = authMonitor.getHealthReport();
    if (!report.healthy) {
      logger.warn('[AuthMonitor] Health check failed', {
        issues: report.issues,
        recommendations: report.recommendations
      });
    } else {
      logger.debug('[AuthMonitor] Health check passed');
    }
  }, reportIntervalMs);

  logger.info('[AuthMonitor] Started authentication monitoring');
}


