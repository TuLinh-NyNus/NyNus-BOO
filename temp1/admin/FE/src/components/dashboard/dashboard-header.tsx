/**
 * Dashboard Header Component
 * Component header dashboard với refresh functionality
 */

"use client";

import React from "react";
import { Button } from "@/components/ui";
import { RefreshCw, Clock, Activity, AlertCircle } from "lucide-react";

/**
 * Dashboard header props
 * Props cho dashboard header
 */
interface DashboardHeaderProps {
  isLoading?: boolean;
  isRefreshing?: boolean;
  lastUpdated?: Date | null;
  refreshCount?: number;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Format time ago
 * Format thời gian trước đây
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} giây trước`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
}

/**
 * Format last updated time
 * Format thời gian cập nhật cuối
 */
function formatLastUpdated(date: Date): string {
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Get status indicator
 * Lấy indicator trạng thái
 */
function getStatusIndicator(isLoading: boolean, isRefreshing: boolean, error: string | null) {
  if (error) {
    return {
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      text: "Lỗi tải dữ liệu",
      color: "text-destructive",
    };
  }

  if (isLoading) {
    return {
      icon: <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />,
      text: "Đang tải...",
      color: "text-muted-foreground",
    };
  }

  if (isRefreshing) {
    return {
      icon: <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />,
      text: "Đang cập nhật...",
      color: "text-blue-600",
    };
  }

  return {
    icon: <Activity className="h-4 w-4 text-green-600" />,
    text: "Dữ liệu mới nhất",
    color: "text-green-600",
  };
}

/**
 * Dashboard Header Component
 * Component header dashboard
 */
export function DashboardHeader({
  isLoading = false,
  isRefreshing = false,
  lastUpdated = null,
  refreshCount = 0,
  error = null,
  onRefresh,
  className = "",
}: DashboardHeaderProps) {
  const statusIndicator = getStatusIndicator(isLoading, isRefreshing, error);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 ${className}`}
    >
      {/* Title and Description */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Quản Trị</h1>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <p>Tổng quan về hoạt động của hệ thống học tập</p>

          {/* Status Indicator */}
          <div className="flex items-center space-x-1">
            {statusIndicator.icon}
            <span className={statusIndicator.color}>{statusIndicator.text}</span>
          </div>
        </div>
      </div>

      {/* Actions and Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        {/* Last Updated Info */}
        {lastUpdated && !isLoading && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <div className="flex flex-col sm:flex-row sm:space-x-2">
              <span>Cập nhật lần cuối:</span>
              <div className="flex flex-col sm:flex-row sm:space-x-1">
                <span className="font-medium">{formatTimeAgo(lastUpdated)}</span>
                <span className="hidden sm:inline">•</span>
                <span title={formatLastUpdated(lastUpdated)}>
                  {lastUpdated.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Count */}
        {refreshCount > 0 && (
          <div className="text-xs text-muted-foreground">Đã cập nhật {refreshCount} lần</div>
        )}

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing || !onRefresh}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Đang tải..." : isRefreshing ? "Đang cập nhật..." : "Làm mới"}</span>
        </Button>
      </div>
    </div>
  );
}

/**
 * Dashboard Status Badge
 * Badge trạng thái dashboard
 */
interface DashboardStatusBadgeProps {
  status: "loading" | "refreshing" | "success" | "error" | "idle";
  className?: string;
}

export function DashboardStatusBadge({ status, className = "" }: DashboardStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "loading":
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin" />,
          text: "Đang tải",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "refreshing":
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin" />,
          text: "Đang cập nhật",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "success":
        return {
          icon: <Activity className="h-3 w-3" />,
          text: "Hoạt động",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "error":
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: "Lỗi",
          className: "bg-red-100 text-red-800 border-red-200",
        };
      case "idle":
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          text: "Chờ",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}

/**
 * Dashboard Auto Refresh Indicator
 * Indicator auto refresh dashboard
 */
interface DashboardAutoRefreshIndicatorProps {
  isEnabled: boolean;
  interval: number; // in milliseconds
  nextRefreshIn?: number; // in seconds
  className?: string;
}

export function DashboardAutoRefreshIndicator({
  isEnabled,
  interval,
  nextRefreshIn,
  className = "",
}: DashboardAutoRefreshIndicatorProps) {
  if (!isEnabled) return null;

  const intervalInMinutes = Math.floor(interval / 60000);
  const intervalInSeconds = Math.floor(interval / 1000);

  return (
    <div className={`flex items-center space-x-2 text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center space-x-1">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        <span>Tự động cập nhật</span>
      </div>
      <span>•</span>
      <span>
        Mỗi {intervalInMinutes > 0 ? `${intervalInMinutes} phút` : `${intervalInSeconds} giây`}
      </span>
      {nextRefreshIn && nextRefreshIn > 0 && (
        <>
          <span>•</span>
          <span>Tiếp theo trong {nextRefreshIn}s</span>
        </>
      )}
    </div>
  );
}
