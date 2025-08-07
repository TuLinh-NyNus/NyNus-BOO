"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Database, Activity, Clock, AlertTriangle, TrendingUp, Server } from "lucide-react";
import { DatabasePerformanceMetrics } from "../../types/performance-monitoring";
import { usePerformanceMonitoring } from "../../hooks/use-performance-monitoring";

/**
 * Database Performance Widget Component
 * Component widget hiển thị performance database
 */

interface DatabasePerformanceWidgetProps {
  metrics?: DatabasePerformanceMetrics;
  isLoading?: boolean;
  className?: string;
  compactMode?: boolean;
}

export function DatabasePerformanceWidget({
  metrics: externalMetrics,
  isLoading: externalLoading = false,
  className = "",
  compactMode = false,
}: DatabasePerformanceWidgetProps) {
  const {
    databaseMetrics,
    isLoading: hookLoading,
    loadDatabaseMetrics,
  } = usePerformanceMonitoring();

  // Use external metrics if provided, otherwise use hook metrics
  const metrics = externalMetrics || databaseMetrics;
  const isLoading = externalLoading || hookLoading;

  // Handle refresh
  const handleRefresh = () => {
    if (!externalMetrics) {
      loadDatabaseMetrics();
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Performance
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
            <Database className="h-4 w-4" />
            Database Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No database metrics available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate status colors
  const getStatusColor = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return "text-green-600";
    if (value < threshold) return "text-yellow-600";
    return "text-red-600";
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return "bg-green-500";
    if (percentage < 85) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (compactMode) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-3 w-3" />
            Database
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Avg Query</p>
              <p
                className={`font-semibold ${getStatusColor(metrics.queryPerformance.averageQueryTime, 100)}`}
              >
                {metrics.queryPerformance.averageQueryTime}ms
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Pool Usage</p>
              <p className={`font-semibold ${getStatusColor(metrics.connectionPool.usage, 80)}`}>
                {metrics.connectionPool.usage}%
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
            <Database className="h-4 w-4" />
            Database Performance
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
        {/* Connection Pool Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Server className="h-3 w-3" />
              Connection Pool
            </h4>
            <span
              className={`text-xs font-semibold ${getStatusColor(metrics.connectionPool.usage, 80)}`}
            >
              {metrics.connectionPool.usage}%
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(metrics.connectionPool.usage)}`}
              style={{ width: `${Math.min(metrics.connectionPool.usage, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>Active: {metrics.connectionPool.active}</div>
            <div>Idle: {metrics.connectionPool.idle}</div>
            <div>Total: {metrics.connectionPool.total}</div>
          </div>
        </div>

        {/* Query Performance */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Query Performance
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Average Query Time</p>
              <p
                className={`text-lg font-semibold ${getStatusColor(metrics.queryPerformance.averageQueryTime, 100)}`}
              >
                {metrics.queryPerformance.averageQueryTime}ms
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Queries/Second</p>
              <p className="text-lg font-semibold">{metrics.queryPerformance.queriesPerSecond}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Total Queries</p>
              <p className="font-medium">
                {metrics.queryPerformance.totalQueries.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Slow Queries</p>
              <p
                className={`font-medium ${metrics.queryPerformance.slowQueries > 0 ? "text-yellow-600" : ""}`}
              >
                {metrics.queryPerformance.slowQueries}
              </p>
            </div>
          </div>
        </div>

        {/* Slow Queries Alert */}
        {metrics.slowQueries.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-3 w-3" />
              Slow Queries ({metrics.slowQueries.length})
            </h4>

            <div className="space-y-1 max-h-24 overflow-y-auto">
              {metrics.slowQueries.slice(0, 3).map((query, index) => (
                <div key={index} className="text-xs bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                  <p className="font-mono text-yellow-800 dark:text-yellow-200 truncate">
                    {query.query}
                  </p>
                  <p className="text-yellow-600 dark:text-yellow-400">
                    {query.duration}ms • {query.frequency}x
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Index Usage */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Index Performance
          </h4>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Hit Ratio</p>
              <p
                className={`font-semibold ${metrics.indexUsage.indexHitRatio > 0.9 ? "text-green-600" : "text-yellow-600"}`}
              >
                {(metrics.indexUsage.indexHitRatio * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Unused Indexes</p>
              <p
                className={`font-semibold ${metrics.indexUsage.unusedIndexes > 0 ? "text-yellow-600" : "text-green-600"}`}
              >
                {metrics.indexUsage.unusedIndexes}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
