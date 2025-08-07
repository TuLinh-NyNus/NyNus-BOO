/**
 * Performance Metrics Service
 * Service cho performance monitoring và metrics collection
 */

import {
  PerformanceMetric,
  PerformanceMetricType,
  PerformanceStatus,
  DatabasePerformanceMetrics,
  APIPerformanceMetrics,
  SystemResourceMetrics,
  PerformanceAlert,
  PerformanceAlertInstance,
  PerformanceBenchmark,
  PERFORMANCE_TARGETS,
  PERFORMANCE_THRESHOLDS,
} from "../types/performance-monitoring";

/**
 * Performance Metrics Service Class
 * Service class cho performance monitoring
 */
export class PerformanceMetricsService {
  private static instance: PerformanceMetricsService;
  private metricsCache: Map<string, PerformanceMetric> = new Map();
  private alertsCache: PerformanceAlertInstance[] = [];
  private isCollecting: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   * Lấy singleton instance
   */
  static getInstance(): PerformanceMetricsService {
    if (!PerformanceMetricsService.instance) {
      PerformanceMetricsService.instance = new PerformanceMetricsService();
    }
    return PerformanceMetricsService.instance;
  }

  /**
   * Start performance metrics collection
   * Bắt đầu thu thập performance metrics
   */
  startCollection(): void {
    if (this.isCollecting) return;

    this.isCollecting = true;
    console.log("Performance metrics collection started");

    // Start periodic collection
    this.scheduleCollection();
  }

  /**
   * Stop performance metrics collection
   * Dừng thu thập performance metrics
   */
  stopCollection(): void {
    this.isCollecting = false;
    console.log("Performance metrics collection stopped");
  }

  /**
   * Get database performance metrics
   * Lấy metrics hiệu suất database
   */
  async getDatabaseMetrics(): Promise<DatabasePerformanceMetrics> {
    try {
      // Simulate database metrics collection
      // In production, this would call actual database monitoring APIs
      const metrics: DatabasePerformanceMetrics = {
        connectionPool: {
          active: Math.floor(Math.random() * 20) + 5,
          idle: Math.floor(Math.random() * 10) + 2,
          total: 50,
          maxConnections: 100,
          usage: Math.floor(Math.random() * 30) + 20,
        },
        queryPerformance: {
          averageQueryTime: Math.floor(Math.random() * 50) + 20,
          slowQueries: Math.floor(Math.random() * 5),
          totalQueries: Math.floor(Math.random() * 1000) + 500,
          queriesPerSecond: Math.floor(Math.random() * 50) + 10,
        },
        slowQueries: this.generateSlowQueries(),
        indexUsage: {
          totalIndexes: 45,
          unusedIndexes: Math.floor(Math.random() * 5),
          indexHitRatio: 0.95 + Math.random() * 0.04,
        },
      };

      // Record metrics
      this.recordMetric("database_query", metrics.queryPerformance.averageQueryTime);

      return metrics;
    } catch (error) {
      console.error("Failed to get database metrics:", error);
      throw error;
    }
  }

  /**
   * Get API performance metrics
   * Lấy metrics hiệu suất API
   */
  async getAPIMetrics(): Promise<APIPerformanceMetrics> {
    try {
      // Simulate API metrics collection
      const baseResponseTime = Math.floor(Math.random() * 100) + 50;

      const metrics: APIPerformanceMetrics = {
        responseTime: {
          average: baseResponseTime,
          p50: baseResponseTime * 0.8,
          p95: baseResponseTime * 1.5,
          p99: baseResponseTime * 2.0,
        },
        throughput: {
          requestsPerSecond: Math.floor(Math.random() * 100) + 20,
          requestsPerMinute: Math.floor(Math.random() * 6000) + 1200,
          totalRequests: Math.floor(Math.random() * 100000) + 50000,
        },
        errorRate: {
          percentage: Math.random() * 2,
          total: Math.floor(Math.random() * 100) + 10,
          by4xx: Math.floor(Math.random() * 60) + 5,
          by5xx: Math.floor(Math.random() * 40) + 5,
        },
        endpointBreakdown: this.generateEndpointBreakdown(),
      };

      // Record metrics
      this.recordMetric("api_response", metrics.responseTime.average);

      return metrics;
    } catch (error) {
      console.error("Failed to get API metrics:", error);
      throw error;
    }
  }

  /**
   * Get system resource metrics
   * Lấy metrics tài nguyên hệ thống
   */
  async getSystemMetrics(): Promise<SystemResourceMetrics> {
    try {
      // Simulate system metrics collection
      const cpuUsage = Math.floor(Math.random() * 40) + 20;
      const memoryUsage = Math.floor(Math.random() * 30) + 40;
      const diskUsage = Math.floor(Math.random() * 20) + 30;

      const metrics: SystemResourceMetrics = {
        cpu: {
          usage: cpuUsage,
          cores: 8,
          loadAverage: [1.2, 1.5, 1.8],
          processes: Math.floor(Math.random() * 200) + 100,
        },
        memory: {
          used: Math.floor(((memoryUsage * 16) / 100) * 1024), // MB
          total: 16 * 1024, // 16GB in MB
          percentage: memoryUsage,
          available: Math.floor((((100 - memoryUsage) * 16) / 100) * 1024),
          cached: Math.floor(Math.random() * 2048) + 512,
        },
        disk: {
          used: Math.floor((diskUsage * 500) / 100), // GB
          total: 500, // 500GB
          percentage: diskUsage,
          available: Math.floor(((100 - diskUsage) * 500) / 100),
          iops: Math.floor(Math.random() * 1000) + 200,
        },
        network: {
          inbound: Math.random() * 10 + 1, // MB/s
          outbound: Math.random() * 5 + 0.5, // MB/s
          connections: Math.floor(Math.random() * 1000) + 100,
          bandwidth: 100, // 100 MB/s
        },
      };

      // Record metrics
      this.recordMetric("system_resource", Math.max(cpuUsage, memoryUsage, diskUsage));

      return metrics;
    } catch (error) {
      console.error("Failed to get system metrics:", error);
      throw error;
    }
  }

  /**
   * Record performance metric
   * Ghi lại performance metric
   */
  private recordMetric(type: PerformanceMetricType, value: number): void {
    const target = PERFORMANCE_TARGETS[type];
    const status = this.calculateStatus(value, target);

    const metric: PerformanceMetric = {
      id: `${type}-${Date.now()}`,
      type,
      name: this.getMetricName(type),
      value,
      target,
      unit: this.getMetricUnit(type),
      status,
      timestamp: new Date(),
    };

    this.metricsCache.set(metric.id, metric);

    // Check for alerts
    this.checkAlerts(metric);
  }

  /**
   * Calculate performance status
   * Tính toán performance status
   */
  private calculateStatus(value: number, target: number): PerformanceStatus {
    const ratio = value / target;

    if (ratio <= PERFORMANCE_THRESHOLDS.GOOD) {
      return "GOOD";
    } else if (ratio <= PERFORMANCE_THRESHOLDS.WARNING) {
      return "WARNING";
    } else {
      return "CRITICAL";
    }
  }

  /**
   * Get metric name
   * Lấy tên metric
   */
  private getMetricName(type: PerformanceMetricType): string {
    const names = {
      dashboard_load: "Dashboard Load Time",
      api_response: "API Response Time",
      websocket_latency: "WebSocket Latency",
      search_results: "Search Results Time",
      database_query: "Database Query Time",
      system_resource: "System Resource Usage",
    };
    return names[type];
  }

  /**
   * Get metric unit
   * Lấy đơn vị metric
   */
  private getMetricUnit(type: PerformanceMetricType): string {
    const units = {
      dashboard_load: "ms",
      api_response: "ms",
      websocket_latency: "ms",
      search_results: "ms",
      database_query: "ms",
      system_resource: "%",
    };
    return units[type];
  }

  /**
   * Check alerts for metric
   * Kiểm tra alerts cho metric
   */
  private checkAlerts(metric: PerformanceMetric): void {
    if (metric.status === "CRITICAL") {
      const alert: PerformanceAlertInstance = {
        id: `alert-${Date.now()}`,
        alertId: `${metric.type}-threshold`,
        alertName: `${metric.name} Critical`,
        metricType: metric.type,
        currentValue: metric.value,
        threshold: metric.target,
        severity: "HIGH",
        status: "ACTIVE",
        triggeredAt: new Date(),
        message: `${metric.name} exceeded critical threshold: ${metric.value}${metric.unit} > ${metric.target}${metric.unit}`,
      };

      this.alertsCache.push(alert);
      console.warn("Performance alert triggered:", alert.message);
    }
  }

  /**
   * Generate slow queries data
   * Tạo dữ liệu slow queries
   */
  private generateSlowQueries() {
    const queries = [
      "SELECT * FROM users WHERE created_at > ?",
      "SELECT COUNT(*) FROM user_sessions WHERE ended_at IS NULL",
      "SELECT * FROM security_events ORDER BY created_at DESC",
      "UPDATE users SET last_login_at = ? WHERE id = ?",
    ];

    return queries.slice(0, Math.floor(Math.random() * 3) + 1).map((query) => ({
      query,
      duration: Math.floor(Math.random() * 500) + 100,
      timestamp: new Date(),
      frequency: Math.floor(Math.random() * 10) + 1,
    }));
  }

  /**
   * Generate endpoint breakdown data
   * Tạo dữ liệu breakdown endpoint
   */
  private generateEndpointBreakdown() {
    const endpoints = [
      { endpoint: "/api/admin/users", method: "GET" },
      { endpoint: "/api/admin/analytics", method: "GET" },
      { endpoint: "/api/admin/security", method: "GET" },
      { endpoint: "/api/admin/users", method: "POST" },
      { endpoint: "/api/admin/users/:id", method: "PUT" },
    ];

    return endpoints.map((ep) => ({
      ...ep,
      averageResponseTime: Math.floor(Math.random() * 200) + 50,
      requestCount: Math.floor(Math.random() * 1000) + 100,
      errorRate: Math.random() * 5,
      status: Math.random() > 0.8 ? "WARNING" : ("GOOD" as PerformanceStatus),
    }));
  }

  /**
   * Schedule periodic collection
   * Lên lịch thu thập định kỳ
   */
  private scheduleCollection(): void {
    if (!this.isCollecting) return;

    setTimeout(() => {
      this.collectAllMetrics();
      this.scheduleCollection();
    }, 30000); // Collect every 30 seconds
  }

  /**
   * Collect all metrics
   * Thu thập tất cả metrics
   */
  private async collectAllMetrics(): Promise<void> {
    try {
      await Promise.all([this.getDatabaseMetrics(), this.getAPIMetrics(), this.getSystemMetrics()]);
    } catch (error) {
      console.error("Failed to collect metrics:", error);
    }
  }

  /**
   * Get active alerts
   * Lấy alerts đang active
   */
  getActiveAlerts(): PerformanceAlertInstance[] {
    return this.alertsCache.filter((alert) => alert.status === "ACTIVE");
  }

  /**
   * Get recent metrics
   * Lấy metrics gần đây
   */
  getRecentMetrics(type?: PerformanceMetricType): PerformanceMetric[] {
    const metrics = Array.from(this.metricsCache.values());

    if (type) {
      return metrics.filter((m) => m.type === type);
    }

    return metrics;
  }
}
