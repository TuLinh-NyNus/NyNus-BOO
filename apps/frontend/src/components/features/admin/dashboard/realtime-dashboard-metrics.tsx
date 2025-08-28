/**
 * Realtime Dashboard Metrics Component
 * Component hiển thị metrics real-time cho admin dashboard
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Minus
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';
import { adminDashboardMockService, DashboardMetrics } from '@/lib/mockdata/admin';
import { cn } from "@/lib/utils";

/**
 * Realtime Dashboard Metrics Props
 * Props cho RealtimeDashboardMetrics component
 */
export interface RealtimeDashboardMetricsProps {
  enableAutoRefresh?: boolean; // Bật auto refresh
  refreshInterval?: number; // Interval refresh (ms)
}

/**
 * Metric Card Props
 * Props cho MetricCard component
 */
interface MetricCardProps {
  title: string; // Tiêu đề metric
  value: number; // Giá trị hiện tại
  previousValue?: number; // Giá trị trước đó để tính trend
  icon: React.ReactNode; // Icon hiển thị
  description: string; // Mô tả metric
  format?: 'number' | 'percentage' | 'duration'; // Format hiển thị
  colorScheme?: 'primary' | 'success' | 'education' | 'accent' | 'alert'; // Unified color scheme
}

/**
 * Format value based on type
 * Format giá trị theo loại
 */
function formatValue(value: number, format: MetricCardProps['format'] = 'number'): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'duration':
      if (value < 60) {
        return `${value}s`;
      } else if (value < 3600) {
        return `${Math.floor(value / 60)}m ${value % 60}s`;
      } else {
        return `${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m`;
      }
    case 'number':
    default:
      return value.toLocaleString();
  }
}

/**
 * Get trend indicator
 * Lấy trend indicator dựa trên giá trị hiện tại và trước đó
 */
function getTrendIndicator(current: number, previous?: number) {
  if (!previous || previous === 0) {
    return { icon: <Minus className="h-3 w-3" />, color: 'text-gray-500', text: 'N/A' };
  }

  const change = ((current - previous) / previous) * 100;
  
  if (Math.abs(change) < 0.1) {
    return { 
      icon: <Minus className="h-3 w-3" />, 
      color: 'text-gray-500', 
      text: 'Không đổi' 
    };
  }

  if (change > 0) {
    return { 
      icon: <TrendingUp className="h-3 w-3" />, 
      color: 'text-green-600', 
      text: `+${change.toFixed(1)}%` 
    };
  }

  return { 
    icon: <TrendingDown className="h-3 w-3" />, 
    color: 'text-red-600', 
    text: `${change.toFixed(1)}%` 
  };
}

/**
 * Metric Card Component
 * Component hiển thị một metric card
 */
function MetricCard({
  title,
  value,
  previousValue,
  icon,
  description,
  format = 'number',
  colorScheme = 'primary'
}: MetricCardProps) {
  const trend = getTrendIndicator(value, previousValue);
  
  // UNIFIED COLOR SYSTEM - Full parity with StatCard rich styling
  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-[#5B88B9]/15 via-[#5B88B9]/10 to-[#4A6B8A]/15 dark:from-[#5B88B9]/25 dark:via-[#5B88B9]/15 dark:to-[#4A6B8A]/25',
      border: 'border-[#5B88B9]/30 dark:border-[#5B88B9]/40',
      iconBg: 'bg-gradient-to-br from-[#5B88B9] to-[#4A6B8A] shadow-lg shadow-[#5B88B9]/25',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-[#5B88B9] to-[#4A6B8A] bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-xl hover:shadow-[#5B88B9]/30 dark:hover:shadow-[#5B88B9]/30'
    },
    success: {
      bg: 'bg-gradient-to-br from-[#48BB78]/15 via-[#48BB78]/10 to-[#38A169]/15 dark:from-[#48BB78]/25 dark:via-[#48BB78]/15 dark:to-[#38A169]/25',
      border: 'border-[#48BB78]/30 dark:border-[#48BB78]/40',
      iconBg: 'bg-gradient-to-br from-[#48BB78] to-[#38A169] shadow-lg shadow-[#48BB78]/25',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-[#48BB78] to-[#38A169] bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-xl hover:shadow-[#48BB78]/30 dark:hover:shadow-[#48BB78]/30'
    },
    education: {
      bg: 'bg-gradient-to-br from-[#FDAD00]/15 via-[#FDAD00]/10 to-[#E09900]/15 dark:from-[#FDAD00]/25 dark:via-[#FDAD00]/15 dark:to-[#E09900]/25',
      border: 'border-[#FDAD00]/30 dark:border-[#FDAD00]/40',
      iconBg: 'bg-gradient-to-br from-[#FDAD00] to-[#E09900] shadow-lg shadow-[#FDAD00]/25',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-[#FDAD00] to-[#E09900] bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-xl hover:shadow-[#FDAD00]/30 dark:hover:shadow-[#FDAD00]/30'
    },
    accent: {
      bg: 'bg-gradient-to-br from-[#A259FF]/15 via-[#A259FF]/10 to-[#32197D]/15 dark:from-[#A259FF]/25 dark:via-[#A259FF]/15 dark:to-[#32197D]/25',
      border: 'border-[#A259FF]/30 dark:border-[#A259FF]/40',
      iconBg: 'bg-gradient-to-br from-[#A259FF] to-[#32197D] shadow-lg shadow-[#A259FF]/25',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-[#A259FF] to-[#32197D] bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-xl hover:shadow-[#A259FF]/30 dark:hover:shadow-[#A259FF]/30'
    },
    alert: {
      bg: 'bg-gradient-to-br from-[#FD5653]/15 via-[#FD5653]/10 to-[#E53E3E]/15 dark:from-[#FD5653]/25 dark:via-[#FD5653]/15 dark:to-[#E53E3E]/25',
      border: 'border-[#FD5653]/30 dark:border-[#FD5653]/40',
      iconBg: 'bg-gradient-to-br from-[#FD5653] to-[#E53E3E] shadow-lg shadow-[#FD5653]/25',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-[#FD5653] to-[#E53E3E] bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-xl hover:shadow-[#FD5653]/30 dark:hover:shadow-[#FD5653]/30'
    }
  };

  const scheme = colorClasses[colorScheme];

  return (
    <Card className={cn(
      "relative overflow-hidden border transition-all duration-300 backdrop-blur-sm cursor-pointer group",
      scheme.bg,
      scheme.border,
      scheme.hoverGlow
    )}>
      {/* Subtle gradient overlay - consistent với StatCard */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-foreground/90">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg transition-all duration-300", scheme.iconBg)}>
          <div className={scheme.iconColor}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {/* Enhanced typography với rich gradients - full parity với StatCard */}
        <div className={cn(
          "text-3xl font-extrabold mb-2 transition-all duration-300 group-hover:scale-105",
          scheme.valueGradient
        )}>
          {formatValue(value, format)}
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-medium text-muted-foreground/90 leading-relaxed">
            {description}
          </p>
          <Badge variant="outline" className={cn(
            "flex items-center gap-1 transition-all duration-300",
            trend.color,
            "border-muted-foreground/30"
          )}>
            {trend.icon}
            <span className="text-xs">{trend.text}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Realtime Dashboard Metrics Component
 * Component chính hiển thị real-time metrics
 */
export function RealtimeDashboardMetrics({
  enableAutoRefresh = true,
  refreshInterval = 30000
}: RealtimeDashboardMetricsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [previousMetrics, setPreviousMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch metrics data
   * Fetch dữ liệu metrics
   */
  const fetchMetrics = useCallback(async () => {
    try {
      const data = await adminDashboardMockService.getDashboardMetrics();
      
      // Store previous metrics for trend calculation
      if (metrics) {
        setPreviousMetrics(metrics);
      }
      
      setMetrics(data);
    } catch (error) {
      console.error('[RealtimeDashboardMetrics] Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [metrics]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto refresh setup
  useEffect(() => {
    if (enableAutoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [enableAutoRefresh, refreshInterval, fetchMetrics]);

  if (isLoading || !metrics) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
          ⚡ Thống kê thời gian thực
        </h3>
        <Badge variant="outline" className="text-emerald-300 border-emerald-300 bg-emerald-500/10 backdrop-blur-sm">
          <Activity className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard
          title="Tổng người dùng"
          value={metrics.users.total}
          previousValue={previousMetrics?.users.total}
          icon={<Users className="h-4 w-4" />}
          description="Tất cả tài khoản"
          colorScheme="primary"
        />

        <MetricCard
          title="Đang hoạt động"
          value={metrics.users.active}
          previousValue={previousMetrics?.users.active}
          icon={<UserCheck className="h-4 w-4" />}
          description="Người dùng online"
          colorScheme="success"
        />

        <MetricCard
          title="Phiên hoạt động"
          value={metrics.sessions.active}
          previousValue={previousMetrics?.sessions.active}
          icon={<Activity className="h-4 w-4" />}
          description="Người dùng đang kết nối"
          colorScheme="accent"
        />

        <MetricCard
          title="Điểm bảo mật"
          value={metrics.security.riskScore}
          previousValue={previousMetrics?.security.riskScore}
          icon={<Shield className="h-4 w-4" />}
          description="Mức độ rủi ro"
          format="number"
          colorScheme={metrics.security.riskScore > 5 ? 'alert' : metrics.security.riskScore > 3 ? 'education' : 'success'}
        />
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default RealtimeDashboardMetrics;
