/**
 * Performance Monitoring Types
 * Types cho performance monitoring system
 */

/**
 * Performance metric types
 * Các loại performance metrics
 */
export type PerformanceMetricType =
  | "dashboard_load"
  | "api_response"
  | "websocket_latency"
  | "search_results"
  | "database_query"
  | "system_resource";

/**
 * Performance status levels
 * Các mức độ performance status
 */
export type PerformanceStatus = "GOOD" | "WARNING" | "CRITICAL";

/**
 * Performance metric interface
 * Interface cho performance metric
 */
export interface PerformanceMetric {
  id: string;
  type: PerformanceMetricType;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: PerformanceStatus;
  timestamp: Date;
  endpoint?: string;
  metadata?: Record<string, any>;
}

/**
 * Database performance metrics
 * Metrics hiệu suất database
 */
export interface DatabasePerformanceMetrics {
  connectionPool: {
    active: number;
    idle: number;
    total: number;
    maxConnections: number;
    usage: number; // percentage
  };
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    totalQueries: number;
    queriesPerSecond: number;
  };
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
    frequency: number;
  }>;
  indexUsage: {
    totalIndexes: number;
    unusedIndexes: number;
    indexHitRatio: number;
  };
}

/**
 * API performance metrics
 * Metrics hiệu suất API
 */
export interface APIPerformanceMetrics {
  responseTime: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    totalRequests: number;
  };
  errorRate: {
    percentage: number;
    total: number;
    by4xx: number;
    by5xx: number;
  };
  endpointBreakdown: Array<{
    endpoint: string;
    method: string;
    averageResponseTime: number;
    requestCount: number;
    errorRate: number;
    status: PerformanceStatus;
  }>;
}

/**
 * System resource metrics
 * Metrics tài nguyên hệ thống
 */
export interface SystemResourceMetrics {
  cpu: {
    usage: number; // percentage
    cores: number;
    loadAverage: number[];
    processes: number;
  };
  memory: {
    used: number; // MB
    total: number; // MB
    percentage: number;
    available: number; // MB
    cached: number; // MB
  };
  disk: {
    used: number; // GB
    total: number; // GB
    percentage: number;
    available: number; // GB
    iops: number;
  };
  network: {
    inbound: number; // MB/s
    outbound: number; // MB/s
    connections: number;
    bandwidth: number; // MB/s
  };
}

/**
 * Performance alert configuration
 * Cấu hình performance alert
 */
export interface PerformanceAlert {
  id: string;
  name: string;
  metricType: PerformanceMetricType;
  threshold: number;
  operator: "greater_than" | "less_than" | "equals";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  isEnabled: boolean;
  description: string;
  actions: PerformanceAlertAction[];
  cooldownPeriod: number; // minutes
  lastTriggered?: Date;
}

/**
 * Performance alert action
 * Hành động khi alert được trigger
 */
export interface PerformanceAlertAction {
  type: "email" | "webhook" | "notification";
  target: string;
  template?: string;
  isEnabled: boolean;
}

/**
 * Performance alert instance
 * Instance của performance alert
 */
export interface PerformanceAlertInstance {
  id: string;
  alertId: string;
  alertName: string;
  metricType: PerformanceMetricType;
  currentValue: number;
  threshold: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "ACTIVE" | "RESOLVED" | "ACKNOWLEDGED";
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Performance benchmark
 * Benchmark hiệu suất
 */
export interface PerformanceBenchmark {
  id: string;
  name: string;
  description: string;
  targets: Record<PerformanceMetricType, number>;
  currentValues: Record<PerformanceMetricType, number>;
  overallScore: number; // 0-100
  status: PerformanceStatus;
  lastUpdated: Date;
  history: Array<{
    timestamp: Date;
    score: number;
    metrics: Record<PerformanceMetricType, number>;
  }>;
}

/**
 * Performance monitoring configuration
 * Cấu hình performance monitoring
 */
export interface PerformanceMonitoringConfig {
  isEnabled: boolean;
  collectionInterval: number; // seconds
  retentionPeriod: number; // days
  targets: Record<PerformanceMetricType, number>;
  alerts: PerformanceAlert[];
  dashboardRefreshRate: number; // seconds
  enableRealTimeUpdates: boolean;
  enableAlertNotifications: boolean;
}

/**
 * Performance monitoring state
 * State của performance monitoring
 */
export interface PerformanceMonitoringState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Metrics data
  databaseMetrics: DatabasePerformanceMetrics | null;
  apiMetrics: APIPerformanceMetrics | null;
  systemMetrics: SystemResourceMetrics | null;

  // Alerts
  activeAlerts: PerformanceAlertInstance[];
  alertHistory: PerformanceAlertInstance[];

  // Benchmarks
  currentBenchmark: PerformanceBenchmark | null;
  benchmarkHistory: PerformanceBenchmark[];

  // Configuration
  config: PerformanceMonitoringConfig;
}

/**
 * Performance widget configuration
 * Cấu hình performance widget
 */
export interface PerformanceWidgetConfig {
  type: "database" | "api" | "system" | "alerts" | "benchmark";
  title: string;
  refreshInterval: number; // seconds
  showTrends: boolean;
  showAlerts: boolean;
  compactMode: boolean;
  chartType: "line" | "bar" | "gauge" | "table";
  timeRange: "5m" | "15m" | "1h" | "6h" | "24h";
  metrics: string[]; // specific metrics to show
}

/**
 * Performance targets từ implement.md
 * Performance targets theo requirements
 */
export const PERFORMANCE_TARGETS: Record<PerformanceMetricType, number> = {
  dashboard_load: 300, // ms
  api_response: 200, // ms
  websocket_latency: 50, // ms
  search_results: 150, // ms
  database_query: 100, // ms
  system_resource: 80, // percentage
};

/**
 * Performance status thresholds
 * Ngưỡng performance status
 */
export const PERFORMANCE_THRESHOLDS = {
  GOOD: 0.8, // 80% of target
  WARNING: 1.0, // 100% of target
  CRITICAL: 1.5, // 150% of target
};

/**
 * Default performance monitoring configuration
 * Cấu hình performance monitoring mặc định
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceMonitoringConfig = {
  isEnabled: true,
  collectionInterval: 30, // 30 seconds
  retentionPeriod: 30, // 30 days
  targets: PERFORMANCE_TARGETS,
  alerts: [],
  dashboardRefreshRate: 30, // 30 seconds
  enableRealTimeUpdates: true,
  enableAlertNotifications: true,
};
