"use client";

import React from "react";
import { DraggableWidget } from "./draggable-widget";
import { ResizableWidget } from "./resizable-widget";
import { WidgetConfig, WidgetSize, WidgetPosition } from "../../types/dashboard-customization";

/**
 * Widget Wrapper Component
 * Component wrapper tổng hợp cho widgets với drag-and-drop và resize
 */

interface WidgetWrapperProps {
  config: WidgetConfig;
  children: React.ReactNode;
  isEditing?: boolean;
  onConfigChange?: (config: Partial<WidgetConfig>) => void;
  onRemove?: () => void;
  onResize?: (size: WidgetSize) => void;
  onMove?: (position: WidgetPosition) => void;
  className?: string;
}

export function WidgetWrapper({
  config,
  children,
  isEditing = false,
  onConfigChange,
  onRemove,
  onResize,
  onMove,
  className = "",
}: WidgetWrapperProps) {
  // Handle widget visibility toggle
  const handleToggleVisibility = () => {
    if (onConfigChange) {
      onConfigChange({ isVisible: !config.isVisible });
    }
  };

  // Handle resize
  const handleResize = (size: WidgetSize) => {
    if (onResize) {
      onResize(size);
    }
    if (onConfigChange) {
      onConfigChange({ size });
    }
  };

  return (
    <DraggableWidget
      config={config}
      isEditing={isEditing}
      onConfigChange={onConfigChange}
      onRemove={onRemove}
      onToggleVisibility={handleToggleVisibility}
      className={className}
    >
      <ResizableWidget config={config} isEditing={isEditing} onResize={handleResize}>
        {children}
      </ResizableWidget>
    </DraggableWidget>
  );
}

/**
 * Widget Factory Component
 * Component factory để render widget dựa trên type
 */

import { UserGrowthChart } from "../charts/user-growth-chart";
import { SystemPerformanceChart } from "../charts/system-performance-chart";
import { SecurityMetricsWidget } from "../admin/security-monitoring/SecurityMetricsWidget";
import { DashboardMetrics } from "../dashboard/dashboard-metrics";
import {
  DatabasePerformanceWidget,
  APIPerformanceWidget,
  SystemResourceWidget,
  PerformanceAlertsWidget,
} from "../performance";

interface WidgetFactoryProps {
  config: WidgetConfig;
  data?: any;
  isLoading?: boolean;
  isEditing?: boolean;
  onConfigChange?: (config: Partial<WidgetConfig>) => void;
  onRemove?: () => void;
  onResize?: (size: WidgetSize) => void;
  onMove?: (position: WidgetPosition) => void;
  className?: string;
}

export function WidgetFactory({
  config,
  data,
  isLoading = false,
  isEditing = false,
  onConfigChange,
  onRemove,
  onResize,
  onMove,
  className = "",
}: WidgetFactoryProps) {
  // Render widget content based on type
  const renderWidgetContent = () => {
    switch (config.type) {
      case "user-growth-chart":
        return (
          <UserGrowthChart
            userMetrics={data?.users || {}}
            sessionMetrics={data?.sessions || {}}
            timeRange={config.settings.timeRange || "30d"}
            isLoading={isLoading}
          />
        );

      case "system-performance-chart":
        return (
          <SystemPerformanceChart
            systemMetrics={data?.system || {}}
            timeRange={config.settings.timeRange || "30d"}
            isLoading={isLoading}
          />
        );

      case "security-analytics":
        return <SecurityMetricsWidget metrics={data?.security || {}} isLoading={isLoading} />;

      case "user-metrics":
      case "session-metrics":
      case "security-metrics":
      case "system-metrics":
        return <DashboardMetrics metrics={data || {}} isLoading={isLoading} />;

      case "analytics-overview":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{config.title}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{data?.users?.total || 0}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">{data?.sessions?.active || 0}</p>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">System Performance</p>
                <p className="text-xl font-semibold">{data?.system?.performance || 0}%</p>
              </div>
            </div>
          </div>
        );

      case "database-performance":
        return (
          <DatabasePerformanceWidget
            metrics={data?.database}
            isLoading={isLoading}
            compactMode={config.settings.displayMode === "compact"}
          />
        );

      case "api-performance":
        return (
          <APIPerformanceWidget
            metrics={data?.api}
            isLoading={isLoading}
            compactMode={config.settings.displayMode === "compact"}
          />
        );

      case "system-resource":
        return (
          <SystemResourceWidget
            metrics={data?.system}
            isLoading={isLoading}
            compactMode={config.settings.displayMode === "compact"}
          />
        );

      case "performance-alerts":
        return (
          <PerformanceAlertsWidget
            alerts={data?.alerts}
            isLoading={isLoading}
            compactMode={config.settings.displayMode === "compact"}
          />
        );

      default:
        return (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Unknown widget type: {config.type}</p>
          </div>
        );
    }
  };

  return (
    <WidgetWrapper
      config={config}
      isEditing={isEditing}
      onConfigChange={onConfigChange}
      onRemove={onRemove}
      onResize={onResize}
      onMove={onMove}
      className={className}
    >
      {renderWidgetContent()}
    </WidgetWrapper>
  );
}

/**
 * Widget Grid Item Component
 * Component item trong grid layout
 */
interface WidgetGridItemProps {
  config: WidgetConfig;
  data?: any;
  isLoading?: boolean;
  isEditing?: boolean;
  gridColumns: number;
  gridGap: number;
  onConfigChange?: (config: Partial<WidgetConfig>) => void;
  onRemove?: () => void;
  onResize?: (size: WidgetSize) => void;
  onMove?: (position: WidgetPosition) => void;
}

export function WidgetGridItem({
  config,
  data,
  isLoading = false,
  isEditing = false,
  gridColumns,
  gridGap,
  onConfigChange,
  onRemove,
  onResize,
  onMove,
}: WidgetGridItemProps) {
  // Calculate grid position
  const gridColumnSpan = Math.min(Math.ceil(config.size.width / (100 + gridGap)), gridColumns);

  const gridRowSpan = Math.ceil(config.size.height / (100 + gridGap));

  return (
    <div
      className="widget-grid-item"
      style={{
        gridColumn: `span ${gridColumnSpan}`,
        gridRow: `span ${gridRowSpan}`,
        minWidth: config.size.minWidth || 200,
        minHeight: config.size.minHeight || 150,
      }}
    >
      <WidgetFactory
        config={config}
        data={data}
        isLoading={isLoading}
        isEditing={isEditing}
        onConfigChange={onConfigChange}
        onRemove={onRemove}
        onResize={onResize}
        onMove={onMove}
        className="h-full"
      />
    </div>
  );
}
