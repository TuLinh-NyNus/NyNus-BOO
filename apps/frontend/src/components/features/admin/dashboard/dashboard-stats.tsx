'use client';

import React from 'react';

import { Users, UserCheck, GraduationCap, BookOpen, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui";
import { StatCard } from './stat-card';
import { mockAnalytics } from '@/lib/mockdata/analytics';

/**
 * Component hiển thị skeleton loading cho StatCard
 * Sử dụng khi đang tải dữ liệu thống kê
 */
function StatCardSkeleton() {
  return (
    <Card>
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
 */
export function DashboardStats() {
  // State quản lý dữ liệu thống kê từ mockdata
  const [analyticsData, setAnalyticsData] = useState(mockAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect để simulate việc fetch data từ API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sử dụng mockdata từ analytics.ts
        setAnalyticsData(mockAnalytics);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Không thể tải dữ liệu thống kê');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Hiển thị skeleton loading khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    <div className="space-y-6">
      {/* Thống kê người dùng tổng quan */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê người dùng</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng người dùng"
            value={overview.totalUsers}
            description="Tất cả tài khoản trong hệ thống"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
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
            icon={<UserCheck className="h-4 w-4 text-green-600" />}
          />
          <StatCard
            title="Đăng ký mới"
            value={overview.newUsersToday}
            description="Tài khoản mới hôm nay"
            icon={<Users className="h-4 w-4 text-blue-600" />}
          />
          <StatCard
            title="Phiên học"
            value={overview.totalSessions}
            description="Tổng số phiên học"
            icon={<GraduationCap className="h-4 w-4 text-purple-600" />}
          />
        </div>
      </div>

      {/* Thống kê nội dung hệ thống */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê nội dung</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Khóa học"
            value={overview.totalCourses}
            description="Tổng số khóa học"
            icon={<BookOpen className="h-4 w-4 text-blue-600" />}
          />
          <StatCard
            title="Câu hỏi"
            value={overview.totalQuestions}
            description="Ngân hàng câu hỏi"
            icon={<HelpCircle className="h-4 w-4 text-purple-600" />}
            trend={{
              value: overview.questionsAddedToday,
              label: "hôm nay",
              isPositive: true,
            }}
          />
          <StatCard
            title="Hoàn thành"
            value={overview.coursesCompletedToday}
            description="Khóa học hoàn thành hôm nay"
            icon={<GraduationCap className="h-4 w-4 text-green-600" />}
          />
          <StatCard
            title="Tổng phiên"
            value={overview.totalSessions}
            description="Phiên học tổng cộng"
            icon={<Users className="h-4 w-4 text-orange-600" />}
          />
        </div>
      </div>
    </div>
  );
}

