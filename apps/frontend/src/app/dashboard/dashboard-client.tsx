'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context-grpc';
import { UserRole } from '@/generated/common/common_pb';

// Type alias for UserRole enum
type UserRoleType = typeof UserRole[keyof typeof UserRole];
import { ProtectedRoute } from '@/components/features/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  Clock,
  Award,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Calendar
} from 'lucide-react';

/**
 * User Dashboard Client Component
 * Dashboard chính cho người dùng (STUDENT, TEACHER, TUTOR)
 */
export default function DashboardClient() {
  return (
    <ProtectedRoute
      requireAuth={true}
      fallback={<DashboardSkeleton />}
    >
      <DashboardContent />
    </ProtectedRoute>
  );
}

/**
 * Dashboard Content Component
 * Actual dashboard content after authentication check
 */
function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  // Redirect ADMIN users to admin dashboard
  useEffect(() => {
    if (user?.role === UserRole.USER_ROLE_ADMIN && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/3141592654/admin');
    }
  }, [user, router, isRedirecting]);

  // Loading state for admin redirect
  if (isRedirecting || user?.role === UserRole.USER_ROLE_ADMIN) {
    return <DashboardSkeleton />;
  }

  // This should not happen due to ProtectedRoute, but safety check
  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Xin chào, {user.firstName} {user.lastName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Chào mừng bạn quay trở lại với NyNus Exam Bank
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              {user.level && (
                <Badge variant="outline">
                  Cấp độ {user.level}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Stats */}
          <StatsCard
            title="Khóa học của tôi"
            value="0"
            icon={<BookOpen className="h-5 w-5" />}
            description="Khóa học đang theo dõi"
            colorScheme="blue"
          />
          <StatsCard
            title="Bài thi đã làm"
            value="0"
            icon={<GraduationCap className="h-5 w-5" />}
            description="Tổng số bài thi hoàn thành"
            colorScheme="green"
          />
          <StatsCard
            title="Điểm trung bình"
            value="0"
            icon={<TrendingUp className="h-5 w-5" />}
            description="Điểm trung bình các bài thi"
            colorScheme="purple"
          />
        </div>

        {/* Role-specific Content */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hoạt động gần đây
              </CardTitle>
              <CardDescription>
                Các hoạt động học tập của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Chưa có hoạt động nào</p>
                <p className="text-sm mt-1">Bắt đầu học ngay để theo dõi tiến độ</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Hành động nhanh
              </CardTitle>
              <CardDescription>
                Các tính năng thường dùng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.role === UserRole.USER_ROLE_TEACHER && (
                <>
                  <QuickActionButton
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Quản lý khóa học"
                    onClick={() => router.push('/teacher/courses')}
                  />
                  <QuickActionButton
                    icon={<Users className="h-4 w-4" />}
                    label="Quản lý học sinh"
                    onClick={() => router.push('/teacher/students')}
                  />
                  <QuickActionButton
                    icon={<BarChart3 className="h-4 w-4" />}
                    label="Thống kê"
                    onClick={() => router.push('/teacher/analytics')}
                  />
                </>
              )}
              {user.role === UserRole.USER_ROLE_TUTOR && (
                <>
                  <QuickActionButton
                    icon={<Users className="h-4 w-4" />}
                    label="Học sinh của tôi"
                    onClick={() => router.push('/tutor/students')}
                  />
                  <QuickActionButton
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Tài liệu hướng dẫn"
                    onClick={() => router.push('/tutor/materials')}
                  />
                </>
              )}
              {user.role === UserRole.USER_ROLE_STUDENT && (
                <>
                  <QuickActionButton
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Khám phá khóa học"
                    onClick={() => router.push('/courses')}
                  />
                  <QuickActionButton
                    icon={<GraduationCap className="h-4 w-4" />}
                    label="Làm bài thi"
                    onClick={() => router.push('/exams')}
                  />
                </>
              )}
              <QuickActionButton
                icon={<Settings className="h-4 w-4" />}
                label="Cài đặt tài khoản"
                onClick={() => router.push('/profile')}
              />
              <QuickActionButton
                icon={<LogOut className="h-4 w-4" />}
                label="Đăng xuất"
                onClick={logout}
                variant="destructive"
              />
            </CardContent>
          </Card>
        </div>

        {/* Role-specific Information */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>
                Chi tiết về tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vai trò</p>
                  <p className="font-medium">{getRoleLabel(user.role)}</p>
                </div>
                {user.level && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cấp độ</p>
                    <p className="font-medium">Level {user.level}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge variant="outline" className="text-green-600">
                    Đang hoạt động
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Stats Card Component
 */
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  colorScheme: 'blue' | 'green' | 'purple';
}

function StatsCard({ title, value, icon, description, colorScheme }: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[colorScheme]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Quick Action Button Component
 */
interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

function QuickActionButton({ icon, label, onClick, variant = 'default' }: QuickActionButtonProps) {
  return (
    <Button
      variant={variant === 'destructive' ? 'destructive' : 'outline'}
      className="w-full justify-start"
      onClick={onClick}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  );
}

/**
 * Dashboard Skeleton Loading
 */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper Functions
 */
function getRoleLabel(role: UserRoleType): string {
  const labels: Record<number, string> = {
    [UserRole.USER_ROLE_ADMIN]: 'Quản trị viên',
    [UserRole.USER_ROLE_TEACHER]: 'Giáo viên',
    [UserRole.USER_ROLE_TUTOR]: 'Gia sư',
    [UserRole.USER_ROLE_STUDENT]: 'Học sinh',
    [UserRole.USER_ROLE_GUEST]: 'Khách',
    [UserRole.USER_ROLE_UNSPECIFIED]: 'Không xác định'
  };
  return labels[role] || 'Không xác định';
}

function getRoleBadgeVariant(role: UserRoleType): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<number, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    [UserRole.USER_ROLE_ADMIN]: 'destructive',
    [UserRole.USER_ROLE_TEACHER]: 'default',
    [UserRole.USER_ROLE_TUTOR]: 'secondary',
    [UserRole.USER_ROLE_STUDENT]: 'outline',
    [UserRole.USER_ROLE_GUEST]: 'outline',
    [UserRole.USER_ROLE_UNSPECIFIED]: 'outline'
  };
  return variants[role] || 'outline';
}

