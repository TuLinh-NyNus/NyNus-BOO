'use client';

/**
 * Simplified Admin Dashboard - Modern UI/UX Design
 * 
 * Key improvements:
 * - 3-column hero metrics (instead of 4)
 * - Consolidated metrics (no duplicates)
 * - Semantic color system (4 colors)
 * - Activity chart for trends
 * - Empty states with CTAs
 * - Better typography hierarchy
 * 
 * @author NyNus Team
 * @created 2025-10-27
 */

import React, { useMemo } from 'react';
import {
  Users,
  UserCheck,
  Activity,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Plus,
  FileText,
  GraduationCap
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAdminStats } from '@/contexts/admin-stats-context';

/**
 * Semantic Color System - 4 colors only
 */
const semanticColors = {
  // Blue - Neutral, informational
  blue: {
    bg: 'bg-gradient-to-br from-blue-500/15 via-blue-400/10 to-cyan-500/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    text: 'text-blue-600 dark:text-blue-400',
    glow: 'shadow-blue-500/20'
  },
  // Green - Success, active, growth
  green: {
    bg: 'bg-gradient-to-br from-emerald-500/15 via-green-400/10 to-teal-500/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-emerald-500/20'
  },
  // Amber - Warning, needs attention
  amber: {
    bg: 'bg-gradient-to-br from-amber-500/15 via-yellow-400/10 to-orange-500/10',
    border: 'border-amber-500/20',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-amber-500/20'
  },
  // Gray - Neutral, empty states
  gray: {
    bg: 'bg-gradient-to-br from-gray-500/10 via-gray-400/5 to-gray-500/10',
    border: 'border-gray-500/20',
    iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
    text: 'text-gray-600 dark:text-gray-400',
    glow: 'shadow-gray-500/20'
  }
};

type ColorScheme = keyof typeof semanticColors;

/**
 * Hero Metric Card Props
 */
interface HeroMetricProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  colorScheme: ColorScheme;
  trend?: {
    value: number;
    label: string;
  };
  isLive?: boolean;
}

/**
 * Hero Metric Card - Large, prominent metrics
 */
function HeroMetricCard({
  title,
  value,
  subtitle,
  icon,
  colorScheme,
  trend,
  isLive
}: HeroMetricProps) {
  const colors = semanticColors[colorScheme];

  return (
    <Card className={cn(
      "group relative overflow-hidden border-2 transition-all duration-500",
      "hover:scale-[1.02] hover:-translate-y-1",
      colors.bg,
      colors.border,
      `hover:${colors.glow} hover:shadow-2xl`
    )}>
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={cn(
          "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl",
          colors.iconBg,
          "opacity-30"
        )} />
      </div>

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </CardTitle>
            {isLive && (
              <Badge variant="outline" className={cn(
                "text-xs font-bold",
                colors.text,
                colors.border
              )}>
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5" />
                LIVE
              </Badge>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl transition-all duration-500",
            "group-hover:scale-110 group-hover:rotate-12",
            colors.iconBg,
            colors.glow,
            "shadow-lg"
          )}>
            <div className="text-white scale-110">
              {icon}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {/* Main Value */}
        <div className={cn(
          "text-5xl lg:text-6xl font-black mb-2 transition-all duration-500",
          "group-hover:scale-105",
          colors.text
        )}>
          {value.toLocaleString()}
        </div>

        {/* Subtitle */}
        <p className="text-sm font-medium text-muted-foreground mb-3">
          {subtitle}
        </p>

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-2 pt-3 border-t border-current/10">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-600">
              {trend.value > 0 ? '+' : ''}{trend.value} {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Secondary Metric Props
 */
interface SecondaryMetricProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  onCTA?: () => void;
  ctaLabel?: string;
}

/**
 * Secondary Metric Card - Smaller, supporting metrics
 */
function SecondaryMetricCard({
  title,
  value,
  subtitle,
  icon,
  isEmpty,
  emptyMessage,
  onCTA,
  ctaLabel
}: SecondaryMetricProps) {
  const colors = isEmpty ? semanticColors.gray : semanticColors.blue;

  return (
    <Card className={cn(
      "group relative overflow-hidden border transition-all duration-300",
      "hover:shadow-lg hover:-translate-y-0.5",
      colors.bg,
      colors.border
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            colors.iconBg,
            "shadow-md"
          )}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>

        {isEmpty ? (
          // Empty State
          <div className="space-y-3">
            <div className="text-3xl font-bold text-gray-400">0</div>
            <p className="text-xs text-muted-foreground">{emptyMessage || subtitle}</p>
            {onCTA && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={onCTA}
              >
                <Plus className="h-3 w-3 mr-1.5" />
                {ctaLabel || 'Tạo mới'}
              </Button>
            )}
          </div>
        ) : (
          // Normal State
          <>
            <div className={cn("text-3xl font-bold mb-1", colors.text)}>
              {value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Activity Chart Component (Simple SVG Line Chart)
 */
interface ActivityChartProps {
  data: number[];
  labels: string[];
}

function ActivityChart({ data, labels }: ActivityChartProps) {
  const max = Math.max(...data, 1);
  const points = useMemo(() => {
    const width = 100;
    const height = 60;
    const step = width / (data.length - 1);
    
    return data.map((value, index) => {
      const x = index * step;
      const y = height - (value / max) * (height - 10);
      return `${x},${y}`;
    }).join(' ');
  }, [data, max]);

  return (
    <div className="w-full h-40 relative">
      <svg
        viewBox="0 0 100 60"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={`M 0,60 L ${points} L 100,60 Z`}
          fill="url(#chartGradient)"
          opacity="0.5"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 60 - (value / max) * 50;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="#3b82f6"
              className="hover:r-3 transition-all"
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2 px-2">
        {labels.map((label, index) => (
          <span key={index} className="text-xs text-muted-foreground">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Quick Actions Panel
 */
function QuickActionsPanel() {
  const actions = [
    { icon: <Plus className="h-4 w-4" />, label: 'Tạo Câu Hỏi', onClick: () => {} },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Thêm Khóa Học', onClick: () => {} },
    { icon: <Users className="h-4 w-4" />, label: 'Quản Lý User', onClick: () => {} },
    { icon: <FileText className="h-4 w-4" />, label: 'Xem Báo Cáo', onClick: () => {} },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="hover:scale-105 transition-transform"
        >
          {action.icon}
          <span className="ml-2">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}

/**
 * Main Simplified Dashboard Component
 */
export function SimplifiedDashboard() {
  const { stats, loading, error } = useAdminStats();

  // Mock activity data (7 days) - Replace with real data
  const activityData = useMemo(() => {
    return stats ? [
      stats.total_users * 0.7,
      stats.total_users * 0.75,
      stats.total_users * 0.8,
      stats.total_users * 0.85,
      stats.total_users * 0.9,
      stats.total_users * 0.95,
      stats.total_users
    ] : [0, 0, 0, 0, 0, 0, 0];
  }, [stats]);

  const activityLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-2 border-red-500/20 bg-red-500/5">
        <CardHeader>
          <CardTitle className="text-red-600">Lỗi tải dữ liệu</CardTitle>
          <CardDescription>{error || 'Không thể tải thống kê'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-foreground mb-1">
            Dashboard Quản Trị
          </h2>
          <p className="text-sm text-muted-foreground">
            Cập nhật {new Date().toLocaleString('vi-VN')}
          </p>
        </div>
        <QuickActionsPanel />
      </div>

      {/* Hero Metrics - 3 columns */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <HeroMetricCard
            title="Người Dùng"
            value={stats.total_users || 0}
            subtitle="Tất cả tài khoản trong hệ thống"
            icon={<Users className="h-6 w-6" />}
            colorScheme="blue"
            trend={{
              value: 3, // TODO: Calculate from history
              label: 'hôm nay'
            }}
          />

          <HeroMetricCard
            title="Đang Hoạt Động"
            value={stats.active_users || 0}
            subtitle="Người dùng online hiện tại"
            icon={<UserCheck className="h-6 w-6" />}
            colorScheme="green"
            isLive
          />

          <HeroMetricCard
            title="Phiên Học"
            value={stats.active_sessions || 0}
            subtitle="Người dùng đang học"
            icon={<Activity className="h-6 w-6" />}
            colorScheme={stats.active_sessions > 0 ? 'green' : 'gray'}
          />
        </div>
      </section>

      {/* Activity Chart */}
      <section>
        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Hoạt Động Người Dùng (7 ngày)
            </CardTitle>
            <CardDescription>
              Biểu đồ thống kê người dùng active theo ngày
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={activityData} labels={activityLabels} />
          </CardContent>
        </Card>
      </section>

      {/* Secondary Metrics - 4 columns */}
      <section>
        <h3 className="text-xl font-bold mb-4 text-foreground">
          Thống Kê Nội Dung
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SecondaryMetricCard
            title="Đăng Ký Mới"
            value={3}
            subtitle="Tài khoản mới trong 24h"
            icon={<Users className="h-4 w-4" />}
          />

          <SecondaryMetricCard
            title="Câu Hỏi"
            value={0}
            subtitle="Tổng câu hỏi trong ngân hàng"
            icon={<HelpCircle className="h-4 w-4" />}
            isEmpty={true}
            emptyMessage="Chưa có câu hỏi nào"
            ctaLabel="Tạo câu hỏi đầu tiên"
            onCTA={() => {}}
          />

          <SecondaryMetricCard
            title="Khóa Học"
            value={0}
            subtitle="Tổng khóa học"
            icon={<BookOpen className="h-4 w-4" />}
            isEmpty={true}
            emptyMessage="Chưa có khóa học nào"
            ctaLabel="Tạo khóa học"
            onCTA={() => {}}
          />

          <SecondaryMetricCard
            title="Hoàn Thành"
            value={0}
            subtitle="Khóa học hoàn thành hôm nay"
            icon={<GraduationCap className="h-4 w-4" />}
            isEmpty={true}
            emptyMessage="Chưa có hoàn thành nào"
          />
        </div>
      </section>
    </div>
  );
}

export default SimplifiedDashboard;

