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
import { adminDashboardMockService, DashboardMetrics } from '@/lib/mockdata/admin-dashboard';

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
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'; // Màu sắc
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
  color = 'blue' 
}: MetricCardProps) {
  const trend = getTrendIndicator(value, previousValue);
  
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-400/15 via-blue-500/10 to-blue-600/15 dark:from-blue-400/25 dark:via-blue-500/15 dark:to-blue-600/25',
      border: 'border-blue-400/30 dark:border-blue-400/40',
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/25',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-400/15 via-emerald-500/10 to-emerald-600/15 dark:from-emerald-400/25 dark:via-emerald-500/15 dark:to-emerald-600/25',
      border: 'border-emerald-400/30 dark:border-emerald-400/40',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-400/15 via-orange-500/10 to-orange-600/15 dark:from-yellow-400/25 dark:via-orange-500/15 dark:to-orange-600/25',
      border: 'border-orange-400/30 dark:border-orange-400/40',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-600 shadow-lg shadow-orange-500/25',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent'
    },
    red: {
      bg: 'bg-gradient-to-br from-rose-400/15 via-red-500/10 to-red-600/15 dark:from-rose-400/25 dark:via-red-500/15 dark:to-red-600/25',
      border: 'border-rose-400/30 dark:border-rose-400/40',
      iconBg: 'bg-gradient-to-br from-rose-400 to-red-600 shadow-lg shadow-red-500/25',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-rose-400 to-red-600 bg-clip-text text-transparent'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-400/15 via-purple-500/10 to-purple-600/15 dark:from-purple-400/25 dark:via-purple-500/15 dark:to-purple-600/25',
      border: 'border-purple-400/30 dark:border-purple-400/40',
      iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/25',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent'
    }
  };

  const scheme = colorClasses[color];

  return (
    <Card className={`relative overflow-hidden border transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm ${scheme.bg} ${scheme.border}`}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-white dark:text-white drop-shadow-sm">
          {title}
        </CardTitle>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 ${scheme.iconBg}`}>
          <div className={scheme.iconColor}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className={`text-2xl font-bold mb-1 ${scheme.valueGradient} drop-shadow-sm`}>
          {formatValue(value, format)}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-200 dark:text-gray-200 drop-shadow-sm">
            {description}
          </p>
          <Badge variant="outline" className={`flex items-center gap-1 ${trend.color} backdrop-blur-sm border-white/30 text-white`}>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <h3 className="text-lg font-semibold text-white dark:text-white transition-colors duration-300 drop-shadow-sm">
          Thống kê thời gian thực
        </h3>
        <Badge variant="outline" className="text-emerald-300 border-emerald-300 bg-emerald-500/10 backdrop-blur-sm">
          <Activity className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tổng người dùng"
          value={metrics.users.total}
          previousValue={previousMetrics?.users.total}
          icon={<Users className="h-4 w-4" />}
          description="Tất cả tài khoản"
          color="blue"
        />

        <MetricCard
          title="Đang hoạt động"
          value={metrics.users.active}
          previousValue={previousMetrics?.users.active}
          icon={<UserCheck className="h-4 w-4" />}
          description="Người dùng online"
          color="green"
        />

        <MetricCard
          title="Phiên hoạt động"
          value={metrics.sessions.active}
          previousValue={previousMetrics?.sessions.active}
          icon={<Activity className="h-4 w-4" />}
          description="Phiên đang kết nối"
          color="purple"
        />

        <MetricCard
          title="Điểm bảo mật"
          value={metrics.security.riskScore}
          previousValue={previousMetrics?.security.riskScore}
          icon={<Shield className="h-4 w-4" />}
          description="Mức độ rủi ro"
          format="number"
          color={metrics.security.riskScore > 5 ? 'red' : metrics.security.riskScore > 3 ? 'yellow' : 'green'}
        />
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default RealtimeDashboardMetrics;
