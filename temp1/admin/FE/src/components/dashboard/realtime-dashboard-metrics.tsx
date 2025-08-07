/**
 * Real-time Dashboard Metrics Component
 * Component dashboard metrics với real-time WebSocket integration
 */

"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import {
  Users,
  Activity,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";

import { useRealtimeDashboard } from "../../hooks/use-realtime-dashboard";
import { useWebSocket } from "../websocket/websocket-provider";
import {
  DashboardMetrics,
  DashboardMetricsLoading,
  DashboardMetricsError,
} from "./dashboard-metrics";

/**
 * Real-time Dashboard Metrics Props
 * Props cho real-time dashboard metrics
 */
interface RealtimeDashboardMetricsProps {
  className?: string;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Real-time Dashboard Metrics Component
 * Component chính cho real-time dashboard metrics
 */
export function RealtimeDashboardMetrics({
  className = "",
  enableAutoRefresh = true,
  refreshInterval = 30000,
}: RealtimeDashboardMetricsProps) {
  // Real-time dashboard hook
  const {
    metrics,
    isLoading,
    error,
    lastUpdated,
    isRealTimeEnabled,
    pendingUpdates,
    updateRate,
    refreshMetrics,
    enableRealTime,
    disableRealTime,
    clearError,
  } = useRealtimeDashboard({
    enableRealTimeUpdates: enableAutoRefresh,
    updateInterval: refreshInterval,
    enableSmoothing: true,
    enableConflictResolution: true,
  });

  // WebSocket connection status
  const { isConnected, connectionStatus } = useWebSocket();

  /**
   * Handle refresh button click
   * Xử lý click refresh button
   */
  const handleRefresh = async () => {
    await refreshMetrics();
  };

  /**
   * Toggle real-time updates
   * Toggle real-time updates
   */
  const toggleRealTime = () => {
    if (isRealTimeEnabled) {
      disableRealTime();
    } else {
      enableRealTime();
    }
  };

  // Show loading state
  if (isLoading && !metrics) {
    return (
      <div className={className}>
        <RealtimeDashboardHeader
          isConnected={isConnected}
          isRealTimeEnabled={isRealTimeEnabled}
          updateRate={updateRate}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          onToggleRealTime={toggleRealTime}
          isLoading={true}
        />
        <DashboardMetricsLoading />
      </div>
    );
  }

  // Show error state
  if (error && !metrics) {
    return (
      <div className={className}>
        <RealtimeDashboardHeader
          isConnected={isConnected}
          isRealTimeEnabled={isRealTimeEnabled}
          updateRate={updateRate}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          onToggleRealTime={toggleRealTime}
          error={error}
        />
        <DashboardMetricsError
          error={error}
          onRetry={() => {
            clearError();
            refreshMetrics();
          }}
        />
      </div>
    );
  }

  // Show metrics
  return (
    <div className={className}>
      <RealtimeDashboardHeader
        isConnected={isConnected}
        isRealTimeEnabled={isRealTimeEnabled}
        updateRate={updateRate}
        lastUpdated={lastUpdated}
        pendingUpdates={pendingUpdates}
        onRefresh={handleRefresh}
        onToggleRealTime={toggleRealTime}
        error={error}
      />

      {metrics && <DashboardMetrics metrics={metrics} isLoading={isLoading} className="mt-4" />}
    </div>
  );
}

/**
 * Real-time Dashboard Header Props
 * Props cho real-time dashboard header
 */
interface RealtimeDashboardHeaderProps {
  isConnected: boolean;
  isRealTimeEnabled: boolean;
  updateRate: number;
  lastUpdated: Date | null;
  pendingUpdates?: number;
  onRefresh: () => void;
  onToggleRealTime: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Real-time Dashboard Header Component
 * Header component cho real-time dashboard
 */
function RealtimeDashboardHeader({
  isConnected,
  isRealTimeEnabled,
  updateRate,
  lastUpdated,
  pendingUpdates = 0,
  onRefresh,
  onToggleRealTime,
  isLoading = false,
  error = null,
}: RealtimeDashboardHeaderProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Dashboard Metrics</CardTitle>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            {/* Real-time Status */}
            {isConnected && (
              <div className="flex items-center gap-2">
                <Activity
                  className={`h-4 w-4 ${isRealTimeEnabled ? "text-green-500" : "text-gray-400"}`}
                />
                <Badge variant={isRealTimeEnabled ? "default" : "outline"} className="text-xs">
                  {isRealTimeEnabled ? "Real-time" : "Manual"}
                </Badge>
              </div>
            )}

            {/* Update Rate */}
            {isRealTimeEnabled && updateRate > 0 && (
              <Badge variant="outline" className="text-xs">
                {updateRate} updates/min
              </Badge>
            )}

            {/* Pending Updates */}
            {pendingUpdates > 0 && (
              <Badge variant="secondary" className="text-xs">
                {pendingUpdates} pending
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Real-time Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleRealTime}
              disabled={!isConnected}
              className="text-xs"
            >
              {isRealTimeEnabled ? (
                <>
                  <Activity className="h-3 w-3 mr-1" />
                  Disable Real-time
                </>
              ) : (
                <>
                  <Activity className="h-3 w-3 mr-1" />
                  Enable Real-time
                </>
              )}
            </Button>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Information */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {/* Last Updated */}
            {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString("vi-VN")}</span>}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs">{error}</span>
              </div>
            )}
          </div>

          {/* Connection Info */}
          <div className="flex items-center gap-2 text-xs">
            {isConnected ? (
              <span className="text-green-600">WebSocket connected</span>
            ) : (
              <span className="text-red-600">WebSocket disconnected</span>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

/**
 * Metric Trend Indicator Component
 * Component hiển thị trend indicator cho metrics
 */
interface MetricTrendProps {
  trend: "up" | "down" | "stable";
  value?: string;
  className?: string;
}

export function MetricTrend({ trend, value, className = "" }: MetricTrendProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {getTrendIcon()}
      {value && <span className={`text-xs ${getTrendColor()}`}>{value}</span>}
    </div>
  );
}

/**
 * Real-time Metric Card Component
 * Component card metric với real-time updates
 */
interface RealtimeMetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  isUpdating?: boolean;
  lastUpdated?: Date;
  className?: string;
}

export function RealtimeMetricCard({
  title,
  value,
  icon,
  trend = "stable",
  trendValue,
  isUpdating = false,
  lastUpdated,
  className = "",
}: RealtimeMetricCardProps) {
  return (
    <Card className={`${className} ${isUpdating ? "ring-2 ring-blue-200 ring-opacity-50" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {icon}
          {isUpdating && <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-2">
          <MetricTrend trend={trend} value={trendValue} />
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              {lastUpdated.toLocaleTimeString("vi-VN")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
