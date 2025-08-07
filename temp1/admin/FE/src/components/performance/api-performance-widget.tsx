"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Globe, Activity, Clock, AlertCircle, TrendingUp, Zap } from "lucide-react";
import { APIPerformanceMetrics } from "../../types/performance-monitoring";
import { usePerformanceMonitoring } from "../../hooks/use-performance-monitoring";

/**
 * API Performance Widget Component
 * Component widget hiển thị performance API
 */

interface APIPerformanceWidgetProps {
  metrics?: APIPerformanceMetrics;
  isLoading?: boolean;
  className?: string;
  compactMode?: boolean;
}

export function APIPerformanceWidget({
  metrics: externalMetrics,
  isLoading: externalLoading = false,
  className = "",
  compactMode = false,
}: APIPerformanceWidgetProps) {
  const { apiMetrics, isLoading: hookLoading, loadAPIMetrics } = usePerformanceMonitoring();

  // Use external metrics if provided, otherwise use hook metrics
  const metrics = externalMetrics || apiMetrics;
  const isLoading = externalLoading || hookLoading;

  // Handle refresh
  const handleRefresh = () => {
    if (!externalMetrics) {
      loadAPIMetrics();
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            API Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            API Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">No API metrics available</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate status colors
  const getResponseTimeColor = (time: number) => {
    if (time < 100) return "text-green-600";
    if (time < 200) return "text-yellow-600";
    return "text-red-600";
  };

  const getErrorRateColor = (rate: number) => {
    if (rate < 1) return "text-green-600";
    if (rate < 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getEndpointStatusColor = (status: string) => {
    switch (status) {
      case "GOOD":
        return "text-green-600";
      case "WARNING":
        return "text-yellow-600";
      case "CRITICAL":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  if (compactMode) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Globe className="h-3 w-3" />
            API
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Avg Response</p>
              <p className={`font-semibold ${getResponseTimeColor(metrics.responseTime.average)}`}>
                {metrics.responseTime.average}ms
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Error Rate</p>
              <p className={`font-semibold ${getErrorRateColor(metrics.errorRate.percentage)}`}>
                {metrics.errorRate.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            API Performance
          </div>
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-muted rounded"
            title="Refresh metrics"
          >
            <Activity className="h-3 w-3" />
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Response Time Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Response Time
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Average</p>
              <p
                className={`text-lg font-semibold ${getResponseTimeColor(metrics.responseTime.average)}`}
              >
                {metrics.responseTime.average}ms
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">P95</p>
              <p
                className={`text-lg font-semibold ${getResponseTimeColor(metrics.responseTime.p95)}`}
              >
                {metrics.responseTime.p95}ms
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">P50 (Median)</p>
              <p className="font-medium">{metrics.responseTime.p50}ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">P99</p>
              <p className="font-medium">{metrics.responseTime.p99}ms</p>
            </div>
          </div>
        </div>

        {/* Throughput Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Throughput
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Requests/Second</p>
              <p className="text-lg font-semibold">{metrics.throughput.requestsPerSecond}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Requests</p>
              <p className="text-lg font-semibold">
                {metrics.throughput.totalRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Error Rate */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            Error Rate
          </h4>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Overall</p>
              <p
                className={`text-lg font-semibold ${getErrorRateColor(metrics.errorRate.percentage)}`}
              >
                {metrics.errorRate.percentage.toFixed(1)}%
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">4xx Errors</p>
              <p className="text-sm font-medium text-yellow-600">{metrics.errorRate.by4xx}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">5xx Errors</p>
              <p className="text-sm font-medium text-red-600">{metrics.errorRate.by5xx}</p>
            </div>
          </div>
        </div>

        {/* Endpoint Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Top Endpoints
          </h4>

          <div className="space-y-1 max-h-32 overflow-y-auto">
            {metrics.endpointBreakdown.slice(0, 5).map((endpoint, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono truncate">
                    <span className="text-blue-600 font-semibold">{endpoint.method}</span>{" "}
                    {endpoint.endpoint}
                  </p>
                  <p className="text-muted-foreground">
                    {endpoint.requestCount} requests • {endpoint.errorRate.toFixed(1)}% errors
                  </p>
                </div>
                <div className="text-right ml-2">
                  <p
                    className={`font-semibold ${getResponseTimeColor(endpoint.averageResponseTime)}`}
                  >
                    {endpoint.averageResponseTime}ms
                  </p>
                  <p className={`text-xs ${getEndpointStatusColor(endpoint.status)}`}>
                    {endpoint.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall Status</span>
            <span
              className={`font-semibold ${
                metrics.responseTime.average < 200 && metrics.errorRate.percentage < 1
                  ? "text-green-600"
                  : metrics.responseTime.average < 500 && metrics.errorRate.percentage < 5
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {metrics.responseTime.average < 200 && metrics.errorRate.percentage < 1
                ? "GOOD"
                : metrics.responseTime.average < 500 && metrics.errorRate.percentage < 5
                  ? "WARNING"
                  : "CRITICAL"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
