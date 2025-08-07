'use client';

import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import React from 'react';

import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";

/**
 * Dashboard Stats Component
 * 
 * Component hiển thị thống kê tổng quan của hệ thống:
 * - Số lượng người dùng
 * - Khóa học và đăng ký
 * - Câu hỏi và bài thi
 * - Xu hướng tăng trưởng
 */

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-xs ml-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              +{trend.value} {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardStats(): JSX.Element {
  // Mock data - trong thực tế sẽ fetch từ API
  const stats = {
    users: {
      total: 1250,
      active: 1180,
      newThisWeek: 45,
    },
    courses: {
      total: 85,
      published: 78,
      newThisMonth: 12,
    },
    enrollments: {
      total: 3420,
      active: 2890,
      completed: 530,
    },
    questions: {
      total: 5680,
      published: 5200,
      pending: 480,
    },
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng người dùng"
          value={stats.users.total.toLocaleString()}
          description={`${stats.users.active} đang hoạt động`}
          icon={<Users className="h-4 w-4 text-blue-600" />}
          trend={{
            value: stats.users.newThisWeek,
            label: "tuần này",
            isPositive: true,
          }}
        />
        
        <StatCard
          title="Khóa học"
          value={stats.courses.total}
          description={`${stats.courses.published} đã xuất bản`}
          icon={<BookOpen className="h-4 w-4 text-green-600" />}
          trend={{
            value: stats.courses.newThisMonth,
            label: "tháng này",
            isPositive: true,
          }}
        />
        
        <StatCard
          title="Đăng ký học"
          value={stats.enrollments.total.toLocaleString()}
          description={`${stats.enrollments.completed} đã hoàn thành`}
          icon={<GraduationCap className="h-4 w-4 text-purple-600" />}
          trend={{
            value: 156,
            label: "tuần này",
            isPositive: true,
          }}
        />
        
        <StatCard
          title="Câu hỏi"
          value={stats.questions.total.toLocaleString()}
          description={`${stats.questions.pending} chờ duyệt`}
          icon={<HelpCircle className="h-4 w-4 text-orange-600" />}
          trend={{
            value: 89,
            label: "tuần này",
            isPositive: true,
          }}
        />
      </div>

      {/* Activity Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hoạt động gần đây
            </CardTitle>
            <CardDescription>
              Tổng quan hoạt động trong 24 giờ qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Đăng nhập mới</span>
                <Badge variant="secondary">+234</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bài thi hoàn thành</span>
                <Badge variant="secondary">+89</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Câu hỏi mới</span>
                <Badge variant="secondary">+45</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Khóa học đăng ký</span>
                <Badge variant="secondary">+67</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất hệ thống</CardTitle>
            <CardDescription>
              Các chỉ số quan trọng của hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tỷ lệ hoàn thành khóa học</span>
                <Badge variant="default">78%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Điểm trung bình bài thi</span>
                <Badge variant="default">8.2/10</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Thời gian phản hồi API</span>
                <Badge variant="default">120ms</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime hệ thống</span>
                <Badge variant="default">99.9%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Default export for lazy loading
export default DashboardStats;
