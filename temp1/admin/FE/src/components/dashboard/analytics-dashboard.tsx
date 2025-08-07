"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  UserGrowthChart,
  SystemPerformanceChart,
  ChartControls,
  type TimeRange,
} from "@/components/charts";
import { SecurityMetricsWidget } from "@/components/admin/security-monitoring/SecurityMetricsWidget";
import { DashboardMetrics } from "./dashboard-metrics";
import { CustomizableDashboard } from "./customizable-dashboard";
import { BarChart3, TrendingUp, Activity, Download, RefreshCw } from "lucide-react";

/**
 * Analytics Dashboard Component
 * Component dashboard với comprehensive charts và analytics
 * Enhanced với customizable widget support
 */

interface AnalyticsDashboardProps {
  // Add customizable dashboard support
  enableCustomization?: boolean;
  metrics: {
    users: {
      total: number;
      active: number;
      newToday: number;
      growth: number;
      totalFormatted: string;
      activeFormatted: string;
      growthFormatted: string;
    };
    sessions: {
      total: number;
      active: number;
      averageDuration: number;
      bounceRate: number;
      totalFormatted: string;
      activeFormatted: string;
      durationFormatted: string;
      bounceRateFormatted: string;
    };
    security: {
      events: number;
      alerts: number;
      blockedIPs: number;
      riskScore: number;
      eventsFormatted: string;
      alertsFormatted: string;
      blockedIPsFormatted: string;
      riskScoreFormatted: string;
    };
    system: {
      uptime: number;
      responseTime: number;
      errorRate: number;
      performance: number;
      uptimeFormatted: string;
      responseTimeFormatted: string;
      errorRateFormatted: string;
      performanceFormatted: string;
    };
    lastUpdated: Date;
  };
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AnalyticsDashboard({
  metrics,
  isLoading = false,
  onRefresh,
  enableCustomization = false,
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [isExporting, setIsExporting] = useState(false);

  // Handle chart export
  const handleExport = async (format: "png" | "csv" | "json") => {
    setIsExporting(true);

    try {
      // Mock export functionality
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (format === "csv") {
        // Export CSV data
        const csvData = [
          ["Metric", "Value", "Formatted"],
          ["Total Users", metrics.users.total.toString(), metrics.users.totalFormatted],
          ["Active Users", metrics.users.active.toString(), metrics.users.activeFormatted],
          ["New Users Today", metrics.users.newToday.toString(), metrics.users.newToday.toString()],
          ["User Growth", metrics.users.growth.toString(), metrics.users.growthFormatted],
          ["Total Sessions", metrics.sessions.total.toString(), metrics.sessions.totalFormatted],
          ["Active Sessions", metrics.sessions.active.toString(), metrics.sessions.activeFormatted],
          [
            "Avg Duration",
            metrics.sessions.averageDuration.toString(),
            metrics.sessions.durationFormatted,
          ],
          [
            "Bounce Rate",
            metrics.sessions.bounceRate.toString(),
            metrics.sessions.bounceRateFormatted,
          ],
          ["Security Events", metrics.security.events.toString(), metrics.security.eventsFormatted],
          ["Security Alerts", metrics.security.alerts.toString(), metrics.security.alertsFormatted],
          [
            "Blocked IPs",
            metrics.security.blockedIPs.toString(),
            metrics.security.blockedIPsFormatted,
          ],
          [
            "Risk Score",
            metrics.security.riskScore.toString(),
            metrics.security.riskScoreFormatted,
          ],
          ["System Uptime", metrics.system.uptime.toString(), metrics.system.uptimeFormatted],
          [
            "Response Time",
            metrics.system.responseTime.toString(),
            metrics.system.responseTimeFormatted,
          ],
          ["Error Rate", metrics.system.errorRate.toString(), metrics.system.errorRateFormatted],
          [
            "Performance",
            metrics.system.performance.toString(),
            metrics.system.performanceFormatted,
          ],
        ];

        const csvContent = csvData.map((row) => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "json") {
        // Export JSON data
        const jsonData = {
          exportDate: new Date().toISOString(),
          timeRange,
          metrics: {
            users: metrics.users,
            sessions: metrics.sessions,
            security: metrics.security,
            system: metrics.system,
          },
        };

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "png") {
        // Mock PNG export - trong thực tế sẽ capture chart canvas
        console.log("PNG export would capture chart images");
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // If customization is enabled, use CustomizableDashboard
  if (enableCustomization) {
    return (
      <CustomizableDashboard
        data={metrics}
        isLoading={isLoading}
        onRefresh={onRefresh}
        className="space-y-6"
      />
    );
  }

  // Default analytics dashboard layout
  return (
    <div className="space-y-6">
      {/* Header với controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        </div>

        <div className="flex items-center gap-3">
          <ChartControls
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            onExport={handleExport}
            exportDisabled={isExporting}
          />

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-muted transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <DashboardMetrics metrics={metrics} isLoading={isLoading} className="mb-6" />

      {/* Charts Grid */}
      <div className="space-y-8">
        {/* User Growth Charts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Phân tích tăng trưởng người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart
              userMetrics={metrics.users}
              sessionMetrics={metrics.sessions}
              timeRange={timeRange}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* System Performance Charts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hiệu suất hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SystemPerformanceChart
              systemMetrics={metrics.system}
              timeRange={timeRange}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Security Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Phân tích bảo mật
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityMetricsWidget
              metrics={{
                totalEvents: metrics.security.events,
                criticalEvents: Math.floor(metrics.security.events * 0.02),
                highSeverityEvents: Math.floor(metrics.security.events * 0.08),
                eventsToday: metrics.security.events,
                eventsThisWeek: metrics.security.events * 7,
                eventsThisMonth: metrics.security.events * 30,
                eventsBySeverity: {
                  LOW: Math.floor(metrics.security.events * 0.6),
                  MEDIUM: Math.floor(metrics.security.events * 0.3),
                  HIGH: Math.floor(metrics.security.events * 0.08),
                  CRITICAL: Math.floor(metrics.security.events * 0.02),
                },
                eventsByType: {
                  FAILED_LOGIN: Math.floor(metrics.security.events * 0.4),
                  SUSPICIOUS_ACCESS: Math.floor(metrics.security.events * 0.3),
                  RATE_LIMIT_EXCEEDED: Math.floor(metrics.security.events * 0.2),
                  INVALID_TOKEN: Math.floor(metrics.security.events * 0.1),
                },
                topThreats: [
                  {
                    type: "FAILED_LOGIN",
                    count: Math.floor(metrics.security.events * 0.4),
                    lastOccurrence: new Date().toISOString(),
                  },
                  {
                    type: "SUSPICIOUS_ACCESS",
                    count: Math.floor(metrics.security.events * 0.3),
                    lastOccurrence: new Date().toISOString(),
                  },
                  {
                    type: "RATE_LIMIT_EXCEEDED",
                    count: Math.floor(metrics.security.events * 0.2),
                    lastOccurrence: new Date().toISOString(),
                  },
                ],
                riskScore: metrics.security.riskScore,
                blockedIPs: metrics.security.blockedIPs,
                suspiciousActivities: Math.floor(metrics.security.events * 0.3),
              }}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Export Status */}
      {isExporting && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Đang xuất dữ liệu...</span>
          </div>
        </div>
      )}
    </div>
  );
}
