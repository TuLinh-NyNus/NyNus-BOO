"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { AlertTriangle, Activity, Clock, CheckCircle, XCircle, Bell, BellOff } from "lucide-react";
import { PerformanceAlertInstance } from "../../types/performance-monitoring";
import { usePerformanceMonitoring } from "../../hooks/use-performance-monitoring";

/**
 * Performance Alerts Widget Component
 * Component widget hiển thị performance alerts
 */

interface PerformanceAlertsWidgetProps {
  alerts?: PerformanceAlertInstance[];
  isLoading?: boolean;
  className?: string;
  compactMode?: boolean;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
}

export function PerformanceAlertsWidget({
  alerts: externalAlerts,
  isLoading: externalLoading = false,
  className = "",
  compactMode = false,
  onAcknowledge: externalOnAcknowledge,
  onResolve: externalOnResolve,
}: PerformanceAlertsWidgetProps) {
  const {
    activeAlerts,
    isLoading: hookLoading,
    acknowledgeAlert,
    resolveAlert,
    loadMetrics,
  } = usePerformanceMonitoring();

  // Use external alerts if provided, otherwise use hook alerts
  const alerts = externalAlerts || activeAlerts;
  const isLoading = externalLoading || hookLoading;

  // Handle acknowledge
  const handleAcknowledge = (alertId: string) => {
    if (externalOnAcknowledge) {
      externalOnAcknowledge(alertId);
    } else {
      acknowledgeAlert(alertId);
    }
  };

  // Handle resolve
  const handleResolve = (alertId: string) => {
    if (externalOnResolve) {
      externalOnResolve(alertId);
    } else {
      resolveAlert(alertId);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (!externalAlerts) {
      loadMetrics();
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      case "HIGH":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20";
      case "LOW":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-red-600";
      case "ACKNOWLEDGED":
        return "text-yellow-600";
      case "RESOLVED":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <AlertTriangle className="h-3 w-3" />;
      case "ACKNOWLEDGED":
        return <Bell className="h-3 w-3" />;
      case "RESOLVED":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <XCircle className="h-3 w-3" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Performance Alerts
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

  const activeAlertsCount = alerts.filter((alert) => alert.status === "ACTIVE").length;
  const acknowledgedAlertsCount = alerts.filter((alert) => alert.status === "ACKNOWLEDGED").length;

  if (compactMode) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-3 w-3" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Active</p>
              <p
                className={`font-semibold ${activeAlertsCount > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {activeAlertsCount}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Acknowledged</p>
              <p
                className={`font-semibold ${acknowledgedAlertsCount > 0 ? "text-yellow-600" : "text-muted-foreground"}`}
              >
                {acknowledgedAlertsCount}
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
            <AlertTriangle className="h-4 w-4" />
            Performance Alerts
            {activeAlertsCount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeAlertsCount}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-muted rounded"
            title="Refresh alerts"
          >
            <Activity className="h-3 w-3" />
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alert Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Active</p>
            <p
              className={`text-lg font-semibold ${activeAlertsCount > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {activeAlertsCount}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Acknowledged</p>
            <p
              className={`text-lg font-semibold ${acknowledgedAlertsCount > 0 ? "text-yellow-600" : "text-muted-foreground"}`}
            >
              {acknowledgedAlertsCount}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">{alerts.length}</p>
          </div>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-sm font-medium text-green-600 mb-2">All Clear!</h3>
            <p className="text-xs text-muted-foreground">No performance alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts
              .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
              .map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={getStatusColor(alert.status)}>
                          {getStatusIcon(alert.status)}
                        </span>
                        <h4 className="text-sm font-medium truncate">{alert.alertName}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(alert.severity)}`}
                        >
                          {alert.severity}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(alert.triggeredAt)}
                        </span>
                        <span>
                          {alert.currentValue} / {alert.threshold}
                        </span>
                      </div>
                    </div>

                    {/* Alert Actions */}
                    {alert.status === "ACTIVE" && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(alert.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <BellOff className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(alert.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Quick Actions */}
        {activeAlertsCount > 0 && (
          <div className="pt-2 border-t">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  alerts
                    .filter((alert) => alert.status === "ACTIVE")
                    .forEach((alert) => handleAcknowledge(alert.id));
                }}
                className="flex-1 text-xs"
              >
                Acknowledge All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  alerts
                    .filter((alert) => alert.status === "ACTIVE")
                    .forEach((alert) => handleResolve(alert.id));
                }}
                className="flex-1 text-xs"
              >
                Resolve All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
