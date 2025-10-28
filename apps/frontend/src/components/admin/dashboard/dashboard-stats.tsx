'use client';

import React from 'react';

import { Users, UserCheck, GraduationCap, BookOpen, HelpCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui";
import { StatCard } from './stat-card';
import { useAdminStats } from '@/contexts/admin-stats-context';

/**
 * Component hiển thị skeleton loading cho StatCard
 * Sử dụng khi đang tải dữ liệu thống kê
 */
function StatCardSkeleton() {
  return (
    <Card className="theme-bg theme-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px] mb-2" />
        <Skeleton className="h-3 w-[120px]" />
      </CardContent>
    </Card>
  );
}

/**
 * Component DashboardStats - Hiển thị các thống kê tổng quan của hệ thống
 * Bao gồm thống kê người dùng, phân bố vai trò và thống kê hệ thống
 *
 * ✅ FIX: Sử dụng AdminStatsContext để tránh duplicate API calls và rate limit errors
 */
export function DashboardStats() {
  // ✅ FIX: Use AdminStatsContext instead of direct API call
  const { stats, loading: isLoading, error } = useAdminStats();

  // Map stats to analytics data format
  const analyticsData = stats ? {
    overview: {
      totalUsers: stats.total_users || 0,
      activeUsers: stats.active_users || 0,
      newUsersToday: 0, // TODO: Add to backend
      totalSessions: stats.total_sessions || 0,
      totalCourses: 0, // TODO: Add to backend
      totalQuestions: 0, // TODO: Add to backend
      coursesCompletedToday: 0 // TODO: Add to backend
    }
  } : null;

  // Hiển thị skeleton loading khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Hiển thị thông báo lỗi nếu không thể tải dữ liệu
  if (error || !analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lỗi tải dữ liệu</CardTitle>
          <CardDescription>{error || 'Không thể tải thống kê'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Destructure dữ liệu từ mockAnalytics để sử dụng
  const { overview } = analyticsData;

  return (
    <div className="space-y-8">
      {/* Thống kê người dùng tổng quan */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Thống kê người dùng
          </h3>
          <p className="text-sm text-muted-foreground">
            Tổng quan về người dùng và hoạt động trong hệ thống
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Tổng người dùng"
            value={overview.totalUsers}
            description="Tất cả tài khoản trong hệ thống"
            icon={<Users className="h-4 w-4" />}
            colorScheme="primary"
            trend={{
              value: overview.newUsersToday,
              label: "hôm nay",
              isPositive: true,
            }}
          />
          <StatCard
            title="Đang hoạt động"
            value={overview.activeUsers}
            description="Người dùng đang online"
            icon={<UserCheck className="h-4 w-4" />}
            colorScheme="success"
          />
          <StatCard
            title="Đăng ký mới"
            value={overview.newUsersToday}
            description="Tài khoản mới hôm nay"
            icon={<Users className="h-4 w-4" />}
            colorScheme="accent"
          />
          <StatCard
            title="Phiên học"
            value={overview.totalSessions}
            description="Tổng số phiên học"
            icon={<GraduationCap className="h-4 w-4" />}
            colorScheme="education"
          />
        </div>
      </div>

      {/* Thống kê nội dung hệ thống */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Thống kê nội dung
          </h3>
          <p className="text-sm text-muted-foreground">
            Khóa học, câu hỏi và tài liệu học tập
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Khóa học"
            value={overview.totalCourses}
            description="Tổng số khóa học"
            icon={<BookOpen className="h-4 w-4" />}
            colorScheme="primary"
          />
          <StatCard
            title="Câu hỏi"
            value={overview.totalQuestions}
            description="Ngân hàng câu hỏi"
            icon={<HelpCircle className="h-4 w-4" />}
            colorScheme="accent"
          />
          <StatCard
            title="Hoàn thành"
            value={overview.coursesCompletedToday}
            description="Khóa học hoàn thành hôm nay"
            icon={<GraduationCap className="h-4 w-4" />}
            colorScheme="education"
          />
          <StatCard
            title="Tổng phiên học"
            value={overview.totalSessions}
            description="Phiên học tổng cộng"
            icon={<GraduationCap className="h-4 w-4" />}
            colorScheme="alert"
          />
        </div>
      </div>
    </div>
  );
}

