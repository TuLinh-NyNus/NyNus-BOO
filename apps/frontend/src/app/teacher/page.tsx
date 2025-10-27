"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context-grpc";
import { UserRole } from "@/generated/common/common_pb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Real backend hooks
import { useTeacherDashboard } from "@/hooks/teacher/use-teacher-analytics";

// Disable static generation - requires client-side data
export const dynamic = 'force-dynamic';

/**
 * Teacher Dashboard Page
 * Trang dashboard chính cho giáo viên
 * 
 * Features:
 * - Quản lý khóa học
 * - Theo dõi học sinh
 * - Thống kê và báo cáo
 * - Tạo và quản lý bài thi
 */
export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Real backend data - fetch teacher dashboard stats
  const { data: dashboardData, isLoading: dashboardLoading } = useTeacherDashboard(
    user?.id || '',
    '30d',
    { enabled: !!user?.id }
  );

  // Loading state
  if (isLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Check if user is teacher or admin
  if (!user || (user.role !== UserRole.USER_ROLE_TEACHER && user.role !== UserRole.USER_ROLE_ADMIN)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Không có quyền truy cập
            </CardTitle>
            <CardDescription>
              Bạn cần có quyền giáo viên để truy cập trang này.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Về Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Real data from backend - AnalyticsService.getTeacherDashboard()
  const stats = {
    totalCourses: 0, // TODO: Add course count to analytics service
    totalStudents: dashboardData?.totalStudents || 0,
    activeExams: dashboardData?.totalExams || 0,
    pendingGrading: 0, // TODO: Add pending grading count to analytics service
  };

  const recentActivities = [
    { id: 1, type: "course", title: "Đại số 12 - Chương 1", time: "2 giờ trước", status: "updated" },
    { id: 2, type: "exam", title: "Kiểm tra giữa kỳ", time: "5 giờ trước", status: "created" },
    { id: 3, type: "student", title: "Nguyễn Văn A đã hoàn thành bài thi", time: "1 ngày trước", status: "completed" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 dark:from-blue-500/10 dark:via-purple-500/5 dark:to-pink-500/10">
        <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-black/10" />
        <div className="relative container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                  Xin chào, {user.firstName} {user.lastName}!
                </h1>
                <p className="text-muted-foreground text-lg">
                  Chào mừng đến với bảng điều khiển giáo viên
                </p>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                Giáo viên {user.level && `- Cấp ${user.level}`}
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Khóa học</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">Tổng số khóa học đang quản lý</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Học sinh</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Học sinh đang theo học</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bài thi</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeExams}</div>
                <p className="text-xs text-muted-foreground">Bài thi đang hoạt động</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ chấm</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingGrading}</div>
                <p className="text-xs text-muted-foreground">Bài thi cần chấm điểm</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/teacher/courses')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Quản lý khóa học
                </CardTitle>
                <CardDescription>Tạo và quản lý nội dung khóa học</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/teacher/students')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quản lý học sinh
                </CardTitle>
                <CardDescription>Theo dõi tiến độ và kết quả học tập</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/teacher/analytics')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Thống kê
                </CardTitle>
                <CardDescription>Xem báo cáo và phân tích chi tiết</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Hoạt động gần đây
              </CardTitle>
              <CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {activity.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {activity.status === "updated" && <TrendingUp className="h-5 w-5 text-blue-500" />}
                      {activity.status === "created" && <Award className="h-5 w-5 text-purple-500" />}
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                      {activity.status === "completed" && "Hoàn thành"}
                      {activity.status === "updated" && "Cập nhật"}
                      {activity.status === "created" && "Tạo mới"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

