/**
 * Realtime Dashboard Metrics Component
 * Component hiển thị metrics real-time cho admin dashboard
 *
 * ✅ FIX: Sử dụng AdminStatsContext để tránh duplicate API calls
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { DashboardMetrics } from '@/lib/mockdata/admin';
import { cn } from "@/lib/utils";
import { useAdminStats } from '@/contexts/admin-stats-context';

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
  sparklineData?: number[]; // Optional tiny sparkline
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
  colorScheme = 'primary',
  sparklineData
}: MetricCardProps) {
  const trend = getTrendIndicator(value, previousValue);
  
  // MODERN GLASSMORPHISM COLOR SYSTEM - matching StatCard
  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10 dark:from-blue-500/20 dark:via-cyan-500/15 dark:to-blue-600/20',
      border: 'border-white/10 dark:border-white/20',
      iconBg: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-2xl shadow-blue-500/50',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-2xl hover:shadow-blue-500/30 hover:border-blue-400/30',
      accentGlow: 'absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent pointer-events-none'
    },
    success: {
      bg: 'bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:via-green-500/15 dark:to-teal-500/20',
      border: 'border-white/10 dark:border-white/20',
      iconBg: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 shadow-2xl shadow-emerald-500/50',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-400/30',
      accentGlow: 'absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-transparent pointer-events-none'
    },
    education: {
      bg: 'bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 dark:from-amber-500/20 dark:via-yellow-500/15 dark:to-orange-500/20',
      border: 'border-white/10 dark:border-white/20',
      iconBg: 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 shadow-2xl shadow-amber-500/50',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-2xl hover:shadow-amber-500/30 hover:border-amber-400/30',
      accentGlow: 'absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-transparent pointer-events-none'
    },
    accent: {
      bg: 'bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 dark:from-purple-500/20 dark:via-fuchsia-500/15 dark:to-pink-500/20',
      border: 'border-white/10 dark:border-white/20',
      iconBg: 'bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 shadow-2xl shadow-purple-500/50',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-400/30',
      accentGlow: 'absolute inset-0 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-transparent pointer-events-none'
    },
    alert: {
      bg: 'bg-gradient-to-br from-rose-500/10 via-red-500/10 to-pink-500/10 dark:from-rose-500/20 dark:via-red-500/15 dark:to-pink-500/20',
      border: 'border-white/10 dark:border-white/20',
      iconBg: 'bg-gradient-to-br from-rose-500 via-red-500 to-pink-500 shadow-2xl shadow-rose-500/50',
      iconColor: 'text-white',
      valueGradient: 'bg-gradient-to-r from-rose-600 via-red-500 to-pink-500 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-2xl hover:shadow-rose-500/30 hover:border-rose-400/30',
      accentGlow: 'absolute inset-0 bg-gradient-to-br from-rose-500/5 via-red-500/5 to-transparent pointer-events-none'
    }
  };

  const scheme = colorClasses[colorScheme];

  return (
    <Card className={cn(
      "group relative overflow-hidden border transition-all duration-500 h-full min-h-[200px]",
      "backdrop-blur-xl bg-card/40 shadow-lg hover:-translate-y-1",
      "cursor-pointer hover:scale-[1.03]",
      scheme.bg,
      scheme.border,
      scheme.hoverGlow
    )}>
      {/* Glassmorphism Accent Glow */}
      <div className={scheme.accentGlow} />
      
      {/* Animated Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Floating Orb Effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-6 px-6 relative z-10">
        <CardTitle className="text-sm font-bold text-foreground/90 tracking-wide uppercase">
          {title}
        </CardTitle>
        <div className={cn(
          "p-3 rounded-2xl transition-all duration-500",
          "group-hover:rotate-12 group-hover:scale-125",
          scheme.iconBg
        )}>
          <div className={cn(scheme.iconColor, "scale-110")}>
            {icon}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 px-6 pb-6">
        {/* Value with mega emphasis */}
        <div className={cn(
          "text-5xl font-black mb-4 transition-all duration-500",
          "group-hover:scale-110 group-hover:tracking-tight",
          scheme.valueGradient,
          "drop-shadow-sm"
        )}>
          {formatValue(value, format)}
        </div>

        {/* Optional micro sparkline */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="mb-4 -ml-1 -mr-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 100 24" className="w-full h-6">
              <defs>
                <linearGradient id={`grad-${title.replace(/\s+/g,'-')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                </linearGradient>
              </defs>
              <line x1="0" y1="22" x2="100" y2="22" stroke="currentColor" className="text-white/10" strokeWidth="0.5" />
              {
                (() => {
                  const max = Math.max(...sparklineData!);
                  const min = Math.min(...sparklineData!);
                  const range = Math.max(1, max - min);
                  const step = 100 / (sparklineData!.length - 1);
                  const points = sparklineData!.map((v, i) => {
                    const x = i * step;
                    const y = 22 - ((v - min) / range) * 18;
                    return `${x},${y}`;
                  }).join(' ');
                  return <polyline points={points} fill="none" stroke={`url(#grad-${title.replace(/\s+/g,'-')})`} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />;
                })()
              }
            </svg>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground/70 leading-relaxed group-hover:text-muted-foreground/90 transition-colors duration-300 flex-1">
            {description}
          </p>
          <Badge variant="outline" className={cn(
            "flex items-center gap-1 transition-all duration-300 backdrop-blur-sm shrink-0",
            "group-hover:scale-105",
            trend.color === 'text-green-600' 
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30"
              : trend.color === 'text-red-600'
              ? "bg-rose-500/20 text-rose-400 border-rose-400/30"
              : "bg-blue-500/20 text-blue-400 border-blue-400/30"
          )}>
            {trend.icon}
            <span className="text-xs font-bold">{trend.text}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Realtime Dashboard Metrics Component
 * Component chính hiển thị real-time metrics
 *
 * ✅ FIX: Sử dụng AdminStatsContext thay vì fetch trực tiếp
 */
export function RealtimeDashboardMetrics({
  enableAutoRefresh: _enableAutoRefresh = true,
  refreshInterval: _refreshInterval = 30000
}: RealtimeDashboardMetricsProps) {
  // ✅ FIX: Use AdminStatsContext instead of direct API call
  const { stats, loading: isLoading, metricsHistory } = useAdminStats();

  const [previousMetrics, setPreviousMetrics] = useState<DashboardMetrics | null>(null);
  const metricsRef = useRef<DashboardMetrics | null>(null);

  // Map stats to DashboardMetrics format - wrapped in useMemo to prevent re-creation
  const metrics: DashboardMetrics | null = useMemo(() => stats ? {
    users: {
      total: stats.total_users || 0,
      active: stats.active_users || 0,
      newToday: 0, // TODO: Add to backend
      growth: 0 // TODO: Calculate from historical data
    },
    sessions: {
      total: stats.total_sessions || 0,
      active: stats.active_sessions || 0,
      averageDuration: 0, // TODO: Add to backend
      bounceRate: 0 // TODO: Add to backend
    },
    security: {
      events: 0, // TODO: Add to backend
      alerts: stats.suspicious_activities || 0,
      blockedIPs: 0, // TODO: Add to backend
      riskScore: stats.suspicious_activities || 0
    },
    system: {
      uptime: 99.8, // TODO: Add to backend
      responseTime: 145, // TODO: Add to backend
      errorRate: 0.02, // TODO: Add to backend
      performance: 94.5 // TODO: Add to backend
    }
  } : null, [stats]);

  // Update previous metrics when metrics change
  useEffect(() => {
    if (metrics && metricsRef.current) {
      setPreviousMetrics(metricsRef.current);
    }
    metricsRef.current = metrics;
  }, [metrics]);

  if (isLoading || !metrics) {
    return (
      <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Section Header with Glassmorphism */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50 animate-pulse">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Thống kê Real-time
            </h3>
            <p className="text-sm text-muted-foreground/80 mt-1 font-medium">Dữ liệu cập nhật liên tục từ hệ thống</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <Badge variant="outline" className="bg-emerald-500/20 border-emerald-400/50 text-emerald-300 font-bold backdrop-blur-sm">
            <Activity className="h-3 w-3 mr-1.5" />
            LIVE
          </Badge>
        </div>
      </div>

      {/* Modern Bento Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Tổng người dùng"
          value={metrics.users.total}
          previousValue={previousMetrics?.users.total}
          icon={<Users className="h-4 w-4" />}
          description="Tất cả tài khoản"
          colorScheme="primary"
          sparklineData={metricsHistory?.map(p => p.total_users)}
        />

        <MetricCard
          title="Đang hoạt động"
          value={metrics.users.active}
          previousValue={previousMetrics?.users.active}
          icon={<UserCheck className="h-4 w-4" />}
          description="Người dùng online"
          colorScheme="success"
          sparklineData={metricsHistory?.map(p => p.active_users)}
        />

        <MetricCard
          title="Phiên hoạt động"
          value={metrics.sessions.active}
          previousValue={previousMetrics?.sessions.active}
          icon={<Activity className="h-4 w-4" />}
          description="Người dùng đang kết nối"
          colorScheme="accent"
          sparklineData={metricsHistory?.map(p => p.active_sessions)}
        />

        <MetricCard
          title="Điểm bảo mật"
          value={metrics.security.riskScore}
          previousValue={previousMetrics?.security.riskScore}
          icon={<Shield className="h-4 w-4" />}
          description="Mức độ rủi ro"
          format="number"
          colorScheme={metrics.security.riskScore > 5 ? 'alert' : metrics.security.riskScore > 3 ? 'education' : 'success'}
          sparklineData={metricsHistory?.map(p => p.suspicious_activities)}
        />
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default RealtimeDashboardMetrics;
