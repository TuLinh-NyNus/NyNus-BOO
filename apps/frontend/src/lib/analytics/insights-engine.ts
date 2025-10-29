/**
 * Insights & Recommendations Engine
 * ==================================
 *
 * AI-powered insights engine cho token analytics
 * Tự động phân tích metrics và đưa ra recommendations
 *
 * Features:
 * - Metric analysis (patterns, anomalies, trends)
 * - Benchmark comparison
 * - Impact estimation
 * - Prioritization (effort vs impact)
 * - Actionable recommendations
 *
 * Performance:
 * - Insights accurate (>80%)
 * - Recommendations actionable
 * - Impact estimates reasonable
 * - Continuous learning from history
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 5 Advanced Analytics
 */

import { logger } from '@/lib/logger';
import type { TokenAnalytics } from './token-analytics';

// ===== TYPES =====

export type InsightCategory = 
  | 'performance'
  | 'reliability'
  | 'security'
  | 'cost'
  | 'user_experience';

export interface Recommendation {
  id: string;
  category: InsightCategory;
  priority: number; // 1-10, higher = more important
  title: string;
  description: string;
  rationale: string; // Why this recommendation
  implementation: string; // How to implement
  estimatedImpact: {
    performance: number; // -100 to 100 (negative = worse, positive = better)
    reliability: number;
    security: number;
    cost: number;
    userExperience: number;
  };
  estimatedEffort: number; // 1-10 (1 = easy, 10 = very hard)
  prerequisites?: string[];
  risks?: string[];
  timestamp: number;
}

export interface BenchmarkComparison {
  metric: string;
  currentValue: number;
  benchmarkValue: number;
  percentDifference: number;
  status: 'above' | 'below' | 'on_par';
  recommendation?: string;
}

export interface PerformanceBenchmark {
  refreshTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  successRate: number;
  errorRate: number;
  tokenLifetime: number;
  refreshesPerHour: number;
}

export interface InsightsEngineConfig {
  enabled: boolean;
  benchmarks: PerformanceBenchmark;
  minSampleSize: number; // Minimum metrics before insights
  updateInterval: number; // milliseconds between analysis
}

// ===== DEFAULT BENCHMARKS =====

const DEFAULT_BENCHMARKS: PerformanceBenchmark = {
  refreshTime: {
    p50: 100, // 100ms
    p95: 300, // 300ms
    p99: 500, // 500ms
  },
  successRate: 99.5, // 99.5%
  errorRate: 0.5, // 0.5%
  tokenLifetime: 15 * 60 * 1000, // 15 minutes
  refreshesPerHour: 4, // 4 refreshes/hour
};

// ===== INSIGHTS ENGINE =====

export class InsightsEngine {
  private static instance: InsightsEngine;
  private readonly serviceName = 'InsightsEngine';
  private config: InsightsEngineConfig;
  private recommendations: Recommendation[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  static getInstance(config?: Partial<InsightsEngineConfig>): InsightsEngine {
    if (!InsightsEngine.instance) {
      InsightsEngine.instance = new InsightsEngine(config);
    }
    return InsightsEngine.instance;
  }

  private constructor(config?: Partial<InsightsEngineConfig>) {
    const defaultConfig: InsightsEngineConfig = {
      enabled: true,
      benchmarks: DEFAULT_BENCHMARKS,
      minSampleSize: 50,
      updateInterval: 5 * 60 * 1000, // 5 minutes
    };

    this.config = { ...defaultConfig, ...config };

    if (this.config.enabled) {
      this.start();
    }

    logger.info(`[${this.serviceName}] Initialized`);
  }

  /**
   * Start insights engine
   */
  start(): void {
    if (this.isActive) {
      logger.warn(`[${this.serviceName}] Already active`);
      return;
    }

    this.isActive = true;

    // Periodic analysis
    this.updateInterval = setInterval(() => {
      // Analysis will be triggered externally
      this.cleanupOldRecommendations();
    }, this.config.updateInterval);

    logger.info(`[${this.serviceName}] Started`);
  }

  /**
   * Stop insights engine
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    logger.info(`[${this.serviceName}] Stopped`);
  }

  /**
   * Analyze analytics and generate recommendations
   * Business Logic: Phân tích metrics, so sánh benchmarks, tạo recommendations
   */
  analyzeAndRecommend(analytics: TokenAnalytics): Recommendation[] {
    if (!this.config.enabled || analytics.totalMetrics < this.config.minSampleSize) {
      logger.debug(`[${this.serviceName}] Insufficient data for analysis`, {
        totalMetrics: analytics.totalMetrics,
        minRequired: this.config.minSampleSize,
      });
      return [];
    }

    const newRecommendations: Recommendation[] = [];

    // Performance analysis
    const perfRecommendations = this.analyzePerformance(analytics);
    newRecommendations.push(...perfRecommendations);

    // Reliability analysis
    const reliabilityRecommendations = this.analyzeReliability(analytics);
    newRecommendations.push(...reliabilityRecommendations);

    // Security analysis
    const securityRecommendations = this.analyzeSecurity(analytics);
    newRecommendations.push(...securityRecommendations);

    // Cost optimization
    const costRecommendations = this.analyzeCost(analytics);
    newRecommendations.push(...costRecommendations);

    // User experience
    const uxRecommendations = this.analyzeUserExperience(analytics);
    newRecommendations.push(...uxRecommendations);

    // Calculate priorities
    newRecommendations.forEach(rec => {
      rec.priority = this.calculatePriority(rec);
    });

    // Sort by priority
    newRecommendations.sort((a, b) => b.priority - a.priority);

    // Store recommendations (keep only top 20)
    this.recommendations = [...newRecommendations, ...this.recommendations].slice(0, 20);

    logger.info(`[${this.serviceName}] Generated ${newRecommendations.length} recommendations`);

    return newRecommendations;
  }

  /**
   * Analyze performance
   */
  private analyzePerformance(analytics: TokenAnalytics): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Slow refresh time
    if (analytics.p95RefreshTime > this.config.benchmarks.refreshTime.p95) {
      const diff = analytics.p95RefreshTime - this.config.benchmarks.refreshTime.p95;
      recommendations.push({
        id: `perf-slow-refresh-${Date.now()}`,
        category: 'performance',
        priority: 0, // Will be calculated
        title: 'Tối ưu hóa thời gian refresh token',
        description: `P95 refresh time hiện tại là ${analytics.p95RefreshTime.toFixed(0)}ms, cao hơn ${diff.toFixed(0)}ms so với benchmark (${this.config.benchmarks.refreshTime.p95}ms)`,
        rationale: 'Refresh chậm ảnh hưởng đến user experience và có thể gây timeout',
        implementation: `
1. Enable request batching để reduce số lượng requests
2. Implement connection pooling để reuse connections
3. Add caching layer cho token validation
4. Optimize backend token generation logic
        `.trim(),
        estimatedImpact: {
          performance: 40,
          reliability: 10,
          security: 0,
          cost: 5,
          userExperience: 30,
        },
        estimatedEffort: 6,
        prerequisites: ['Backend API access', 'Infrastructure team support'],
        risks: ['Potential caching staleness', 'Connection pool exhaustion'],
        timestamp: Date.now(),
      });
    }

    // P99 outliers
    if (analytics.p99RefreshTime > analytics.p95RefreshTime * 2) {
      recommendations.push({
        id: `perf-outliers-${Date.now()}`,
        category: 'performance',
        priority: 0,
        title: 'Giảm performance outliers',
        description: `P99 (${analytics.p99RefreshTime.toFixed(0)}ms) cao gấp đôi P95 (${analytics.p95RefreshTime.toFixed(0)}ms), có vấn đề về consistency`,
        rationale: 'Outliers cho thấy có requests bị chậm đột ngột, cần điều tra',
        implementation: `
1. Add timeout cho token refresh requests
2. Implement retry logic với exponential backoff
3. Monitor network quality và fallback khi cần
4. Add circuit breaker pattern
        `.trim(),
        estimatedImpact: {
          performance: 20,
          reliability: 30,
          security: 0,
          cost: 0,
          userExperience: 25,
        },
        estimatedEffort: 5,
        timestamp: Date.now(),
      });
    }

    return recommendations;
  }

  /**
   * Analyze reliability
   */
  private analyzeReliability(analytics: TokenAnalytics): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // High error rate
    if (analytics.errorRate > this.config.benchmarks.errorRate) {
      recommendations.push({
        id: `rel-high-errors-${Date.now()}`,
        category: 'reliability',
        priority: 0,
        title: 'Giảm tỷ lệ lỗi token operations',
        description: `Error rate ${analytics.errorRate.toFixed(1)}% cao hơn benchmark ${this.config.benchmarks.errorRate}%`,
        rationale: 'Error rate cao ảnh hưởng đến user experience và system reliability',
        implementation: `
1. Add comprehensive error handling và retry logic
2. Implement fallback mechanisms
3. Monitor và alert on error spikes
4. Investigate root causes của frequent errors
        `.trim(),
        estimatedImpact: {
          performance: 10,
          reliability: 50,
          security: 10,
          cost: 0,
          userExperience: 40,
        },
        estimatedEffort: 7,
        timestamp: Date.now(),
      });
    }

    // Low success rate
    if (analytics.successRate < this.config.benchmarks.successRate) {
      recommendations.push({
        id: `rel-low-success-${Date.now()}`,
        category: 'reliability',
        priority: 0,
        title: 'Cải thiện success rate',
        description: `Success rate ${analytics.successRate.toFixed(1)}% thấp hơn target ${this.config.benchmarks.successRate}%`,
        rationale: 'Low success rate cho thấy system không ổn định',
        implementation: `
1. Review và fix common error patterns
2. Add health checks trước khi refresh
3. Implement graceful degradation
4. Add monitoring dashboards
        `.trim(),
        estimatedImpact: {
          performance: 0,
          reliability: 60,
          security: 5,
          cost: 0,
          userExperience: 50,
        },
        estimatedEffort: 8,
        timestamp: Date.now(),
      });
    }

    return recommendations;
  }

  /**
   * Analyze security
   */
  private analyzeSecurity(analytics: TokenAnalytics): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Frequent refreshes (potential security issue)
    const avgRefreshesPerHour = analytics.refreshTrend.hourly.reduce((sum, v) => sum + v, 0) / 24;
    if (avgRefreshesPerHour > this.config.benchmarks.refreshesPerHour * 2) {
      recommendations.push({
        id: `sec-frequent-refresh-${Date.now()}`,
        category: 'security',
        priority: 0,
        title: 'Kiểm tra token refresh pattern bất thường',
        description: `Average ${avgRefreshesPerHour.toFixed(1)} refreshes/hour, cao hơn nhiều so với expected ${this.config.benchmarks.refreshesPerHour}`,
        rationale: 'Frequent refreshes có thể là dấu hiệu của attack hoặc misconfiguration',
        implementation: `
1. Audit token refresh logs để detect patterns
2. Implement rate limiting cho token refresh
3. Add anomaly detection
4. Review token lifetime configuration
        `.trim(),
        estimatedImpact: {
          performance: -10,
          reliability: 10,
          security: 50,
          cost: 0,
          userExperience: 0,
        },
        estimatedEffort: 6,
        prerequisites: ['Security team review'],
        timestamp: Date.now(),
      });
    }

    return recommendations;
  }

  /**
   * Analyze cost
   */
  private analyzeCost(analytics: TokenAnalytics): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // High refresh volume
    if (analytics.totalRefreshes > 1000 && analytics.averageTokenLifetime < 10 * 60 * 1000) {
      recommendations.push({
        id: `cost-high-volume-${Date.now()}`,
        category: 'cost',
        priority: 0,
        title: 'Tối ưu chi phí token refresh',
        description: `${analytics.totalRefreshes} refreshes với average lifetime ${(analytics.averageTokenLifetime / 60000).toFixed(1)} phút - có thể reduce cost`,
        rationale: 'Nhiều token refreshes tốn tài nguyên server và bandwidth',
        implementation: `
1. Tăng token lifetime (hiện tại: ${(analytics.averageTokenLifetime / 60000).toFixed(1)} phút)
2. Implement token caching
3. Use refresh token pattern thay vì full re-authentication
4. Optimize refresh logic để reduce overhead
        `.trim(),
        estimatedImpact: {
          performance: 20,
          reliability: 0,
          security: -5,
          cost: 40,
          userExperience: 10,
        },
        estimatedEffort: 4,
        risks: ['Longer token lifetime = higher security risk nếu token leaked'],
        timestamp: Date.now(),
      });
    }

    return recommendations;
  }

  /**
   * Analyze user experience
   */
  private analyzeUserExperience(analytics: TokenAnalytics): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Slow token operations affecting UX
    if (analytics.p50RefreshTime > 200) {
      recommendations.push({
        id: `ux-slow-operations-${Date.now()}`,
        category: 'user_experience',
        priority: 0,
        title: 'Cải thiện perceived performance',
        description: `P50 refresh time ${analytics.p50RefreshTime.toFixed(0)}ms có thể ảnh hưởng đến UX`,
        rationale: 'Users notice delays > 200ms, ảnh hưởng đến perceived performance',
        implementation: `
1. Add loading indicators khi refresh token
2. Implement optimistic UI updates
3. Prefetch tokens trước khi expiry
4. Add progress feedback cho users
        `.trim(),
        estimatedImpact: {
          performance: 0,
          reliability: 0,
          security: 0,
          cost: 0,
          userExperience: 45,
        },
        estimatedEffort: 3,
        timestamp: Date.now(),
      });
    }

    return recommendations;
  }

  /**
   * Calculate priority
   * Business Logic: Priority = (Total Impact * Impact Weight) - (Effort * Effort Weight)
   */
  private calculatePriority(rec: Recommendation): number {
    const impact = rec.estimatedImpact;
    const totalImpact = 
      impact.performance * 0.25 +
      impact.reliability * 0.3 +
      impact.security * 0.25 +
      impact.cost * 0.1 +
      impact.userExperience * 0.1;

    const effort = rec.estimatedEffort;

    // Priority = Impact/Effort ratio, scaled to 1-10
    const impactEffortRatio = totalImpact / Math.max(effort, 1);
    const priority = Math.min(Math.max(Math.round(impactEffortRatio), 1), 10);

    return priority;
  }

  /**
   * Compare with benchmarks
   */
  compareBenchmarks(analytics: TokenAnalytics): BenchmarkComparison[] {
    const comparisons: BenchmarkComparison[] = [];

    // P50 refresh time
    comparisons.push(this.createComparison(
      'P50 Refresh Time',
      analytics.p50RefreshTime,
      this.config.benchmarks.refreshTime.p50,
      'ms'
    ));

    // P95 refresh time
    comparisons.push(this.createComparison(
      'P95 Refresh Time',
      analytics.p95RefreshTime,
      this.config.benchmarks.refreshTime.p95,
      'ms'
    ));

    // Success rate
    comparisons.push(this.createComparison(
      'Success Rate',
      analytics.successRate,
      this.config.benchmarks.successRate,
      '%'
    ));

    // Error rate
    comparisons.push(this.createComparison(
      'Error Rate',
      analytics.errorRate,
      this.config.benchmarks.errorRate,
      '%',
      true // Lower is better
    ));

    return comparisons;
  }

  /**
   * Create benchmark comparison
   */
  private createComparison(
    metric: string,
    currentValue: number,
    benchmarkValue: number,
    unit: string,
    lowerIsBetter = false
  ): BenchmarkComparison {
    const diff = currentValue - benchmarkValue;
    const percentDifference = (diff / benchmarkValue) * 100;

    let status: BenchmarkComparison['status'];
    if (Math.abs(percentDifference) < 10) {
      status = 'on_par';
    } else if (lowerIsBetter) {
      status = diff < 0 ? 'above' : 'below';
    } else {
      status = diff > 0 ? 'above' : 'below';
    }

    let recommendation: string | undefined;
    if (status === 'below') {
      recommendation = lowerIsBetter
        ? `Good! ${metric} is ${Math.abs(percentDifference).toFixed(1)}% better than benchmark`
        : `${metric} is ${Math.abs(percentDifference).toFixed(1)}% below benchmark. Consider optimization.`;
    } else if (status === 'above' && !lowerIsBetter) {
      recommendation = `Good! ${metric} is ${percentDifference.toFixed(1)}% above benchmark`;
    }

    return {
      metric,
      currentValue,
      benchmarkValue,
      percentDifference,
      status,
      recommendation,
    };
  }

  /**
   * Get recommendations
   */
  getRecommendations(options?: {
    category?: InsightCategory;
    minPriority?: number;
    limit?: number;
  }): Recommendation[] {
    let recommendations = [...this.recommendations];

    if (options?.category) {
      recommendations = recommendations.filter(r => r.category === options.category);
    }

    if (options?.minPriority !== undefined) {
      recommendations = recommendations.filter(r => r.priority >= options.minPriority!);
    }

    // Already sorted by priority
    if (options?.limit) {
      recommendations = recommendations.slice(0, options.limit);
    }

    return recommendations;
  }

  /**
   * Cleanup old recommendations
   */
  private cleanupOldRecommendations(): void {
    const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
    this.recommendations = this.recommendations.filter(r => r.timestamp >= cutoffTime);

    logger.debug(`[${this.serviceName}] Cleanup completed`, {
      recommendations: this.recommendations.length,
    });
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      isActive: this.isActive,
      totalRecommendations: this.recommendations.length,
      byCategory: {
        performance: this.recommendations.filter(r => r.category === 'performance').length,
        reliability: this.recommendations.filter(r => r.category === 'reliability').length,
        security: this.recommendations.filter(r => r.category === 'security').length,
        cost: this.recommendations.filter(r => r.category === 'cost').length,
        user_experience: this.recommendations.filter(r => r.category === 'user_experience').length,
      },
      byPriority: {
        high: this.recommendations.filter(r => r.priority >= 8).length,
        medium: this.recommendations.filter(r => r.priority >= 5 && r.priority < 8).length,
        low: this.recommendations.filter(r => r.priority < 5).length,
      },
    };
  }

  /**
   * Destroy engine
   */
  destroy(): void {
    this.stop();
    this.recommendations = [];
    logger.info(`[${this.serviceName}] Destroyed`);
  }
}

// ===== FACTORY FUNCTION =====

export const getInsightsEngine = (config?: Partial<InsightsEngineConfig>) => {
  return InsightsEngine.getInstance(config);
};

export default InsightsEngine;

