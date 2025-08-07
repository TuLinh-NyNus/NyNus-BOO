'use client';

import { Users, UserCheck, UserX, GraduationCap, BookOpen, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Skeleton } from "@/components/ui/display/skeleton";
import { adminStatsService, SystemStatsResponse } from '@/lib/api/admin-users.service';

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1">
            <Badge 
              variant={trend.isPositive ? "default" : "secondary"}
              className="text-xs"
            >
              {trend.isPositive ? '+' : ''}{trend.value} {trend.label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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

export function DashboardStats() {
  const [stats, setStats] = useState<SystemStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminStatsService.getSystemStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Không thể tải thống kê');
      
      // Mock data for development
      setStats({
        users: {
          totalUsers: 150,
          activeUsers: 140,
          inactiveUsers: 10,
          usersByRole: {
            ADMIN: 3,
            INSTRUCTOR: 12,
            STUDENT: 135,
            GUEST: 0,
          },
          recentRegistrations: {
            today: 5,
            thisWeek: 25,
            thisMonth: 80,
          },
          userGrowth: [],
        },
        courses: {
          total: 45,
          published: 38,
          draft: 7,
        },
        enrollments: {
          total: 320,
          active: 280,
          completed: 40,
        },
        questions: {
          total: 1250,
          published: 1100,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lỗi tải dữ liệu</CardTitle>
          <CardDescription>{error || 'Không thể tải thống kê'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê người dùng</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng người dùng"
            value={stats.users.totalUsers}
            description="Tất cả tài khoản trong hệ thống"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            trend={{
              value: stats.users.recentRegistrations.thisWeek,
              label: "tuần này",
              isPositive: true,
            }}
          />
          <StatCard
            title="Đang hoạt động"
            value={stats.users.activeUsers}
            description="Tài khoản đang kích hoạt"
            icon={<UserCheck className="h-4 w-4 text-green-600" />}
          />
          <StatCard
            title="Vô hiệu hóa"
            value={stats.users.inactiveUsers}
            description="Tài khoản bị khóa"
            icon={<UserX className="h-4 w-4 text-red-600" />}
          />
          <StatCard
            title="Đăng ký hôm nay"
            value={stats.users.recentRegistrations.today}
            description="Tài khoản mới trong ngày"
            icon={<Users className="h-4 w-4 text-blue-600" />}
          />
        </div>
      </div>

      {/* Role Distribution */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Phân bố vai trò</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Quản trị viên"
            value={stats.users.usersByRole.ADMIN}
            description="Admin accounts"
            icon={<Users className="h-4 w-4 text-red-600" />}
          />
          <StatCard
            title="Giảng viên"
            value={stats.users.usersByRole.INSTRUCTOR}
            description="Instructor accounts"
            icon={<GraduationCap className="h-4 w-4 text-blue-600" />}
          />
          <StatCard
            title="Học sinh"
            value={stats.users.usersByRole.STUDENT}
            description="Student accounts"
            icon={<Users className="h-4 w-4 text-green-600" />}
          />
          <StatCard
            title="Khách"
            value={stats.users.usersByRole.GUEST}
            description="Guest accounts"
            icon={<Users className="h-4 w-4 text-gray-600" />}
          />
        </div>
      </div>

      {/* System Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Thống kê hệ thống</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Khóa học"
            value={stats.courses.total}
            description={`${stats.courses.published} đã xuất bản`}
            icon={<BookOpen className="h-4 w-4 text-blue-600" />}
          />
          <StatCard
            title="Đăng ký học"
            value={stats.enrollments.total}
            description={`${stats.enrollments.active} đang học`}
            icon={<GraduationCap className="h-4 w-4 text-green-600" />}
          />
          <StatCard
            title="Câu hỏi"
            value={stats.questions.total}
            description={`${stats.questions.published} đã duyệt`}
            icon={<HelpCircle className="h-4 w-4 text-purple-600" />}
          />
          <StatCard
            title="Hoàn thành"
            value={stats.enrollments.completed}
            description="Khóa học đã hoàn thành"
            icon={<GraduationCap className="h-4 w-4 text-orange-600" />}
          />
        </div>
      </div>
    </div>
  );
}
