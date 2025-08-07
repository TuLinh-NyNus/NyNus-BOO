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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    blue: 'text-blue-600 bg-blue-100/80 dark:bg-blue-500/20 dark:text-blue-400',
    green: 'text-green-600 bg-green-100/80 dark:bg-green-500/20 dark:text-green-400',
    yellow: 'text-yellow-600 bg-yellow-100/80 dark:bg-yellow-500/20 dark:text-yellow-400',
    red: 'text-red-600 bg-red-100/80 dark:bg-red-500/20 dark:text-red-400',
    purple: 'text-purple-600 bg-purple-100/80 dark:bg-purple-500/20 dark:text-purple-400'
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">
          {title}
        </CardTitle>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${colorClasses[color]} transition-colors duration-300`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
          {formatValue(value, format)}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
            {description}
          </p>
          <Badge variant="outline" className={`flex items-center gap-1 ${trend.color}`}>
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
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">
          Thống kê thời gian thực
        </h3>
        <Badge variant="outline" className="text-green-600 border-green-600">
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
