/**
 * Hero Metrics Component
 * 3 metrics quan trọng nhất hiển thị lớn và nổi bật
 * 
 * @author NyNus Team
 * @created 2025-01-27
 */

'use client';

import React from 'react';
import { Users, UserCheck, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';
import { cn } from '@/lib/utils';
import { useAdminStats } from '@/contexts/admin-stats-context';
import { DASHBOARD_COLORS, getTrendColor } from '@/lib/constants/dashboard-colors';

interface HeroMetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  colorScheme: keyof typeof DASHBOARD_COLORS;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean | null;
  };
  isLive?: boolean;
}

/**
 * Hero Metric Card - Larger version for important metrics
 */
function HeroMetricCard({
  title,
  value,
  description,
  icon,
  colorScheme,
  trend,
  isLive = false
}: HeroMetricCardProps) {
  const scheme = DASHBOARD_COLORS[colorScheme];
  const trendColors = trend ? getTrendColor(trend.isPositive) : null;

  return (
    <Card className={cn(
      "group relative overflow-hidden border transition-all duration-500 h-full min-h-[280px]",
      "backdrop-blur-xl bg-card/40 shadow-xl hover:-translate-y-2 hover:scale-[1.02]",
      "cursor-pointer",
      scheme.bg,
      scheme.border,
      scheme.hoverGlow
    )}>
      {/* Glassmorphism Accent Glow */}
      <div className={scheme.accentGlow} />
      
      {/* Animated Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Floating Orb Effect */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8 pt-8 px-8 relative z-10">
        <div className="flex-1">
          <CardTitle className="text-sm font-bold text-foreground/90 tracking-wide uppercase mb-2">
            {title}
          </CardTitle>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/20 border-emerald-400/50 text-emerald-300 font-bold backdrop-blur-sm text-xs">
                LIVE
              </Badge>
            </div>
          )}
        </div>
        <div className={cn(
          "p-4 rounded-3xl transition-all duration-500",
          "group-hover:rotate-12 group-hover:scale-125",
          scheme.iconBg
        )}>
          <div className={cn(scheme.iconColor, "scale-125")}>
            {icon}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 px-8 pb-8">
        {/* Hero Value - Extra Large */}
        <div className={cn(
          "text-6xl font-black mb-6 transition-all duration-500",
          "group-hover:scale-110 group-hover:tracking-tight",
          scheme.valueGradient,
          "drop-shadow-lg"
        )}>
          {value.toLocaleString()}
        </div>

        {/* Description */}
        <p className="text-base font-medium text-muted-foreground/80 leading-relaxed mb-6 group-hover:text-muted-foreground/90 transition-colors duration-300">
          {description}
        </p>

        {/* Trend Indicator */}
        {trend && trendColors && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Badge className={cn(
              "flex items-center gap-2 transition-all duration-300 backdrop-blur-sm",
              "group-hover:scale-105 text-sm font-bold px-3 py-1.5",
              trendColors.bg,
              trendColors.text,
              trendColors.border
            )}>
              {trend.isPositive === null ? '—' : trend.isPositive ? '↗' : '↘'}
              <span>
                {trend.isPositive !== null && (trend.isPositive ? '+' : '')}{trend.value} {trend.label}
              </span>
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Hero Metrics Section
 * 3 metrics chính: Tổng Users, Active Users, Active Sessions
 */
export function HeroMetrics() {
  const { stats, loading } = useAdminStats();

  if (loading || !stats) {
    return (
      <div className="grid gap-8 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse min-h-[280px]">
            <CardHeader className="space-y-0 pb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header - Simplified */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Metrics Chính
        </h2>
        <p className="text-sm text-muted-foreground">
          Thống kê quan trọng nhất của hệ thống
        </p>
      </div>

      {/* Hero Metrics Grid - 3 columns */}
      <div className="grid gap-8 md:grid-cols-3">
        <HeroMetricCard
          title="Tổng Người Dùng"
          value={stats.total_users || 0}
          description="Tất cả tài khoản trong hệ thống"
          icon={<Users className="h-6 w-6" />}
          colorScheme="primary"
          trend={{
            value: 1.9,
            label: "so với tuần trước",
            isPositive: true
          }}
        />

        <HeroMetricCard
          title="Đang Hoạt Động"
          value={stats.active_users || 0}
          description="Người dùng online hiện tại"
          icon={<UserCheck className="h-6 w-6" />}
          colorScheme="success"
          isLive={true}
          trend={{
            value: 12,
            label: "trong 1 giờ qua",
            isPositive: true
          }}
        />

        <HeroMetricCard
          title="Phiên Học Active"
          value={stats.active_sessions || 0}
          description="Người dùng đang học"
          icon={<Activity className="h-6 w-6" />}
          colorScheme="primary"
          trend={stats.active_sessions === 0 ? {
            value: 0,
            label: "chưa có phiên học",
            isPositive: null
          } : undefined}
        />
      </div>
    </div>
  );
}
