"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Monitor, Activity, Cpu, HardDrive, MemoryStick, Wifi } from "lucide-react";
import { SystemResourceMetrics } from "../../types/performance-monitoring";
import { usePerformanceMonitoring } from "../../hooks/use-performance-monitoring";

/**
 * System Resource Widget Component
 * Component widget hiển thị system resource usage
 */

interface SystemResourceWidgetProps {
  metrics?: SystemResourceMetrics;
  isLoading?: boolean;
  className?: string;
  compactMode?: boolean;
}

export function SystemResourceWidget({
  metrics: externalMetrics,
  isLoading: externalLoading = false,
  className = "",
  compactMode = false,
}: SystemResourceWidgetProps) {
  const { systemMetrics, isLoading: hookLoading, loadSystemMetrics } = usePerformanceMonitoring();

  // Use external metrics if provided, otherwise use hook metrics
  const metrics = externalMetrics || systemMetrics;
  const isLoading = externalLoading || hookLoading;

  // Handle refresh
  const handleRefresh = () => {
    if (!externalMetrics) {
      loadSystemMetrics();
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            System Resources
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
            <Monitor className="h-4 w-4" />
            System Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">No system metrics available</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate status colors
  const getUsageColor = (percentage: number) => {
    if (percentage < 60) return "text-green-600";
    if (percentage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage < 60) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Format bytes to readable format
  const formatBytes = (bytes: number, unit: "MB" | "GB" = "MB") => {
    if (unit === "GB") {
      return `${bytes.toFixed(1)} GB`;
    }
    return `${Math.round(bytes)} MB`;
  };

  // Format network speed
  const formatNetworkSpeed = (speed: number) => {
    return `${speed.toFixed(1)} MB/s`;
  };

  if (compactMode) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Monitor className="h-3 w-3" />
            System
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div>
              <p className="text-muted-foreground">CPU</p>
              <p className={`font-semibold ${getUsageColor(metrics.cpu.usage)}`}>
                {metrics.cpu.usage}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">RAM</p>
              <p className={`font-semibold ${getUsageColor(metrics.memory.percentage)}`}>
                {metrics.memory.percentage}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Disk</p>
              <p className={`font-semibold ${getUsageColor(metrics.disk.percentage)}`}>
                {metrics.disk.percentage}%
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
            <Monitor className="h-4 w-4" />
            System Resources
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
        {/* CPU Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-3 w-3" />
              CPU Usage
            </h4>
            <span className={`text-sm font-semibold ${getUsageColor(metrics.cpu.usage)}`}>
              {metrics.cpu.usage}%
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(metrics.cpu.usage)}`}
              style={{ width: `${Math.min(metrics.cpu.usage, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>Cores: {metrics.cpu.cores}</div>
            <div>Processes: {metrics.cpu.processes}</div>
            <div>Load: {metrics.cpu.loadAverage[0].toFixed(2)}</div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <MemoryStick className="h-3 w-3" />
              Memory Usage
            </h4>
            <span className={`text-sm font-semibold ${getUsageColor(metrics.memory.percentage)}`}>
              {metrics.memory.percentage}%
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(metrics.memory.percentage)}`}
              style={{ width: `${Math.min(metrics.memory.percentage, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>Used: {formatBytes(metrics.memory.used)}</div>
            <div>Available: {formatBytes(metrics.memory.available)}</div>
            <div>Cached: {formatBytes(metrics.memory.cached)}</div>
          </div>

          <div className="text-xs text-muted-foreground">
            Total: {formatBytes(metrics.memory.total)}
          </div>
        </div>

        {/* Disk Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-3 w-3" />
              Disk Usage
            </h4>
            <span className={`text-sm font-semibold ${getUsageColor(metrics.disk.percentage)}`}>
              {metrics.disk.percentage}%
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(metrics.disk.percentage)}`}
              style={{ width: `${Math.min(metrics.disk.percentage, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>Used: {formatBytes(metrics.disk.used, "GB")}</div>
            <div>Available: {formatBytes(metrics.disk.available, "GB")}</div>
            <div>IOPS: {metrics.disk.iops}</div>
          </div>

          <div className="text-xs text-muted-foreground">
            Total: {formatBytes(metrics.disk.total, "GB")}
          </div>
        </div>

        {/* Network Activity */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Wifi className="h-3 w-3" />
            Network Activity
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Inbound</p>
              <p className="text-sm font-semibold text-blue-600">
                {formatNetworkSpeed(metrics.network.inbound)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Outbound</p>
              <p className="text-sm font-semibold text-green-600">
                {formatNetworkSpeed(metrics.network.outbound)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>Connections: {metrics.network.connections}</div>
            <div>Bandwidth: {formatNetworkSpeed(metrics.network.bandwidth)}</div>
          </div>
        </div>

        {/* System Status Summary */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall Status</span>
            <span
              className={`font-semibold ${
                Math.max(metrics.cpu.usage, metrics.memory.percentage, metrics.disk.percentage) < 60
                  ? "text-green-600"
                  : Math.max(
                        metrics.cpu.usage,
                        metrics.memory.percentage,
                        metrics.disk.percentage
                      ) < 80
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {Math.max(metrics.cpu.usage, metrics.memory.percentage, metrics.disk.percentage) < 60
                ? "GOOD"
                : Math.max(metrics.cpu.usage, metrics.memory.percentage, metrics.disk.percentage) <
                    80
                  ? "WARNING"
                  : "CRITICAL"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
