/**
 * Analytics Module Index
 * ======================
 *
 * Exports all analytics components for easy import
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 5 Advanced Analytics
 */

// Token Analytics
export {
  TokenAnalyticsService,
  getTokenAnalytics,
  type TokenMetric,
  type TokenAnalytics,
  type TokenInsight,
  type TokenAnalyticsConfig,
} from './token-analytics';

// Insights Engine
export {
  InsightsEngine,
  getInsightsEngine,
  type InsightCategory,
  type Recommendation,
  type BenchmarkComparison,
  type PerformanceBenchmark,
  type InsightsEngineConfig,
} from './insights-engine';

// Latex Analytics (existing)
// Note: LatexAnalyticsService is exported as singleton 'latexAnalytics' in latex-analytics.ts

