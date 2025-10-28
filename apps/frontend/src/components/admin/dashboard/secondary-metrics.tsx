/**
 * Secondary Metrics Component
 * 4 metrics phụ trợ hiển thị compact hơn
 * 
 * @author NyNus Team
 * @created 2025-01-27
 */

'use client';

import React from 'react';
import { UserPlus, HelpCircle, BookOpen, GraduationCap, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdminStats } from '@/contexts/admin-stats-context';
import { DASHBOARD_COLORS } from '@/lib/constants/dashboard-colors';

interface SecondaryMetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  colorScheme: keyof typeof DASHBOARD_COLORS;
  isEmpty?: boolean;
  emptyStateConfig?: {
    message: string;
    ctaText: string;
    onCtaClick: () => void;
  };
}

/**
 * Secondary Metric Card - Compact version
 */
function SecondaryMetricCard({
  title,
  value,
  description,
  icon,
  colorScheme,
  isEmpty = false,
  emptyStateConfig
}: SecondaryMetricCardProps) {
  const scheme = DASHBOARD_COLORS[colorScheme];

  return (
    <Card className={cn(
      "group relative overflow-hidden border transition-all duration-300 h-full min-h-[180px]",
      "backdrop-blur-xl bg-card/40 shadow-md hover:-translate-y-1 hover:scale-[1.02]",
      "cursor-pointer",
      scheme.bg,
      scheme.border,
      scheme.hoverGlow
    )}>
      {/* Glassmorphism Accent Glow */}
      <div className={scheme.accentGlow} />
      
      {/* Animated Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6 relative z-10">
        <CardTitle className="text-xs font-bold text-foreground/90 tracking-wide uppercase">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2.5 rounded-xl transition-all duration-300",
          "group-hover:rotate-6 group-hover:scale-110",
          scheme.iconBg
        )}>
          <div className={cn(scheme.iconColor, "scale-100")}>
            {icon}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 px-6 pb-6">
        {/* Value */}
        <div className={cn(
          "text-4xl font-black mb-3 transition-all duration-300",
          "group-hover:scale-105",
          scheme.valueGradient,
          "drop-shadow-sm"
        )}>
          {value.toLocaleString()}
        </div>

        {/* Description */}
        <p className="text-sm font-medium text-muted-foreground/70 leading-relaxed mb-4 group-hover:text-muted-foreground/90 transition-colors duration-300">
          {description}
        </p>

        {/* Empty State CTA */}
        {isEmpty && emptyStateConfig && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-muted-foreground/60 mb-3">
              {emptyStateConfig.message}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={emptyStateConfig.onCtaClick}
              className={cn(
                "w-full text-xs font-semibold transition-all duration-300",
                "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30",
                "group-hover:scale-105"
              )}
            >
              <Plus className="h-3 w-3 mr-1.5" />
              {emptyStateConfig.ctaText}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Secondary Metrics Section
 * 4 metrics phụ: New Users, Questions, Courses, Completed Today
 */
export function SecondaryMetrics() {
  const { stats, loading } = useAdminStats();

  // Mock data for content metrics (TODO: Add to backend)
  const contentMetrics = {
    totalQuestions: 0, // TODO: Get from backend
    totalCourses: 0,   // TODO: Get from backend
    completedToday: 0, // TODO: Get from backend
    newUsersToday: 3   // TODO: Get from backend
  };

  if (loading || !stats) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse min-h-[180px]">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Handle empty state actions
  const handleCreateQuestion = () => {
    window.location.href = '/3141592654/admin/questions/create';
  };

  const handleCreateCourse = () => {
    window.location.href = '/3141592654/admin/courses/create';
  };

  return (
    <div className="space-y-6">
      {/* Section Header - Simplified */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">
          Thống Kê Bổ Sung
        </h3>
        <p className="text-sm text-muted-foreground">
          Metrics hỗ trợ và hoạt động hàng ngày
        </p>
      </div>

      {/* Secondary Metrics Grid - 4 columns */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SecondaryMetricCard
          title="Đăng Ký Mới"
          value={contentMetrics.newUsersToday}
          description="Tài khoản mới trong 24h"
          icon={<UserPlus className="h-4 w-4" />}
          colorScheme="success"
        />

        <SecondaryMetricCard
          title="Câu Hỏi"
          value={contentMetrics.totalQuestions}
          description="Ngân hàng câu hỏi"
          icon={<HelpCircle className="h-4 w-4" />}
          colorScheme="primary"
          isEmpty={contentMetrics.totalQuestions === 0}
          emptyStateConfig={{
            message: "Chưa có câu hỏi nào",
            ctaText: "Tạo Câu Hỏi",
            onCtaClick: handleCreateQuestion
          }}
        />

        <SecondaryMetricCard
          title="Khóa Học"
          value={contentMetrics.totalCourses}
          description="Tổng số khóa học"
          icon={<BookOpen className="h-4 w-4" />}
          colorScheme="primary"
          isEmpty={contentMetrics.totalCourses === 0}
          emptyStateConfig={{
            message: "Chưa có khóa học nào",
            ctaText: "Tạo Khóa Học",
            onCtaClick: handleCreateCourse
          }}
        />

        <SecondaryMetricCard
          title="Hoàn Thành"
          value={contentMetrics.completedToday}
          description="Khóa học hoàn thành hôm nay"
          icon={<GraduationCap className="h-4 w-4" />}
          colorScheme="success"
          isEmpty={contentMetrics.completedToday === 0}
          emptyStateConfig={{
            message: "Chưa có hoàn thành nào",
            ctaText: "Xem Chi Tiết",
            onCtaClick: () => console.log('View completion details')
          }}
        />
      </div>
    </div>
  );
}
