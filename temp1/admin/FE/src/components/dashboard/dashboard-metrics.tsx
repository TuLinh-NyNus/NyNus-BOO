/**
 * Dashboard Metrics Components
 * Components hiển thị metrics dashboard với real data
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  Users,
  Activity,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react";

/**
 * Dashboard metrics interface
 * Interface metrics dashboard
 */
interface DashboardMetrics {
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
}

/**
 * Dashboard metrics props
 * Props cho dashboard metrics
 */
interface DashboardMetricsProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
  className?: string;
}

/**
 * User Metrics Card
 * Card metrics người dùng
 */
function UserMetricsCard({
  metrics,
  isLoading,
}: { metrics?: DashboardMetrics["users"]; isLoading?: boolean }) {
  // Handle loading state
  if (isLoading || !metrics) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số người dùng</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <TrendingUp className="h-3 w-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">--</span>
            </div>
            <span>từ tháng trước</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            -- đang hoạt động • -- mới hôm nay
          </div>
        </CardContent>
      </Card>
    );
  }

  const isGrowthPositive = metrics.growth >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Tổng số người dùng</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metrics.totalFormatted}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            {isGrowthPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={isGrowthPositive ? "text-green-600" : "text-red-600"}>
              {metrics.growthFormatted}
            </span>
          </div>
          <span>từ tháng trước</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {metrics.activeFormatted} đang hoạt động • {metrics.newToday} mới hôm nay
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Session Metrics Card
 * Card metrics phiên làm việc
 */
function SessionMetricsCard({ metrics }: { metrics?: DashboardMetrics["sessions"] }) {
  // Handle loading state or missing data
  if (!metrics) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Phiên hoạt động</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <div className="text-xs text-muted-foreground">đang hoạt động</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="font-medium">--</div>
              <div className="text-muted-foreground">thời gian TB</div>
            </div>
            <div>
              <div className="font-medium">--</div>
              <div className="text-muted-foreground">tỷ lệ thoát</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Phiên hoạt động</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metrics.activeFormatted}</div>
        <div className="text-xs text-muted-foreground">đang hoạt động</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="font-medium">{metrics.durationFormatted}</div>
            <div className="text-muted-foreground">thời gian TB</div>
          </div>
          <div>
            <div className="font-medium">{metrics.bounceRateFormatted}</div>
            <div className="text-muted-foreground">tỷ lệ thoát</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Security Metrics Card
 * Card metrics bảo mật
 */
function SecurityMetricsCard({ metrics }: { metrics?: DashboardMetrics["security"] }) {
  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskIcon = (score: number) => {
    if (score >= 80) return <AlertTriangle className="h-3 w-3 text-red-500" />;
    if (score >= 60) return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    if (score >= 40) return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    return <CheckCircle className="h-3 w-3 text-green-500" />;
  };

  // Handle loading state or missing data
  if (!metrics) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bảo mật hệ thống</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <div className="text-xs text-muted-foreground">sự kiện bảo mật</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cảnh báo:</span>
              <span className="font-medium">--</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">IPs bị chặn:</span>
              <span className="font-medium">--</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground ml-1">Điểm rủi ro:</span>
              </div>
              <span className="font-medium text-muted-foreground">--</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Bảo mật hệ thống</CardTitle>
        <Shield className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metrics.eventsFormatted}</div>
        <div className="text-xs text-muted-foreground">sự kiện bảo mật</div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Cảnh báo:</span>
            <span className="font-medium">{metrics.alertsFormatted}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">IPs bị chặn:</span>
            <span className="font-medium">{metrics.blockedIPs}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              {getRiskIcon(metrics.riskScore)}
              <span className="text-muted-foreground ml-1">Điểm rủi ro:</span>
            </div>
            <span className={`font-medium ${getRiskColor(metrics.riskScore)}`}>
              {metrics.riskScoreFormatted}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * System Metrics Card
 * Card metrics hệ thống
 */
function SystemMetricsCard({ metrics }: { metrics?: DashboardMetrics["system"] }) {
  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 70) return "text-yellow-600";
    if (performance >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return "text-green-600";
    if (uptime >= 99.5) return "text-yellow-600";
    if (uptime >= 99.0) return "text-orange-600";
    return "text-red-600";
  };

  // Handle loading state or missing data
  if (!metrics) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hiệu suất hệ thống</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <div className="text-xs text-muted-foreground">thời gian phản hồi</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Uptime:</span>
              <span className="font-medium text-muted-foreground">--</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Tỷ lệ lỗi:</span>
              <span className="font-medium">--</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Hiệu suất:</span>
              <span className="font-medium text-muted-foreground">--</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Hiệu suất hệ thống</CardTitle>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metrics.responseTimeFormatted}</div>
        <div className="text-xs text-muted-foreground">thời gian phản hồi</div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Uptime:</span>
            <span className={`font-medium ${getUptimeColor(metrics.uptime * 100)}`}>
              {metrics.uptimeFormatted}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tỷ lệ lỗi:</span>
            <span className="font-medium">{metrics.errorRateFormatted}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Hiệu suất:</span>
            <span className={`font-medium ${getPerformanceColor(metrics.performance)}`}>
              {metrics.performanceFormatted}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Dashboard Metrics Component
 * Component chính hiển thị tất cả metrics
 */
export function DashboardMetrics({ metrics, isLoading, className = "" }: DashboardMetricsProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${className}`}>
      <UserMetricsCard metrics={metrics?.users} isLoading={isLoading} />
      <SessionMetricsCard metrics={metrics?.sessions} />
      <SecurityMetricsCard metrics={metrics?.security} />
      <SystemMetricsCard metrics={metrics?.system} />
    </div>
  );
}

/**
 * Dashboard Metrics Loading Skeleton
 * Skeleton loading cho dashboard metrics
 */
export function DashboardMetricsLoading({ className = "" }: { className?: string }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${className}`}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded mb-1" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Dashboard Metrics Error
 * Component hiển thị lỗi dashboard metrics
 */
export function DashboardMetricsError({
  error,
  onRetry,
  className = "",
}: {
  error: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-destructive/20">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground text-center mb-2">Không thể tải dữ liệu</p>
            {onRetry && (
              <button onClick={onRetry} className="text-xs text-primary hover:underline">
                Thử lại
              </button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
