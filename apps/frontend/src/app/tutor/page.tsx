"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  BookOpen,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context-grpc";
import { UserRole } from "@/generated/common/common_pb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Disable static generation - requires client-side data
export const dynamic = 'force-dynamic';

/**
 * Tutor Dashboard Page
 * Trang dashboard chính cho gia sư
 * 
 * Features:
 * - Quản lý buổi học
 * - Theo dõi học sinh
 * - Tài liệu học tập
 * - Lịch dạy học
 */
export default function TutorDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Check if user is tutor or admin
  if (!user || (user.role !== UserRole.USER_ROLE_TUTOR && user.role !== UserRole.USER_ROLE_ADMIN)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Không có quyền truy cập
            </CardTitle>
            <CardDescription>
              Bạn cần có quyền gia sư để truy cập trang này.
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

  // Mock data - sẽ được thay thế bằng real data từ backend
  const stats = {
    totalStudents: 24,
    upcomingSessions: 5,
    completedSessions: 48,
    totalMaterials: 15,
  };

  const upcomingSessions = [
    { id: 1, student: "Nguyễn Văn A", subject: "Toán 12", time: "14:00 - 15:30", date: "Hôm nay", status: "upcoming" },
    { id: 2, student: "Trần Thị B", subject: "Vật lý 11", time: "16:00 - 17:30", date: "Hôm nay", status: "upcoming" },
    { id: 3, student: "Lê Văn C", subject: "Hóa học 10", time: "09:00 - 10:30", date: "Ngày mai", status: "scheduled" },
  ];

  const recentActivities = [
    { id: 1, type: "session", title: "Hoàn thành buổi học với Nguyễn Văn A", time: "2 giờ trước", status: "completed" },
    { id: 2, type: "material", title: "Tải lên tài liệu Đại số 12", time: "5 giờ trước", status: "uploaded" },
    { id: 3, type: "message", title: "Tin nhắn mới từ Trần Thị B", time: "1 ngày trước", status: "new" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-green-500/20 via-teal-500/10 to-blue-500/20 dark:from-green-500/10 dark:via-teal-500/5 dark:to-blue-500/10">
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
                  Chào mừng đến với bảng điều khiển gia sư
                </p>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                Gia sư {user.level && `- Cấp ${user.level}`}
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
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Buổi học sắp tới</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
                <p className="text-xs text-muted-foreground">Trong tuần này</p>
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
                <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedSessions}</div>
                <p className="text-xs text-muted-foreground">Buổi học trong tháng</p>
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
                <CardTitle className="text-sm font-medium">Tài liệu</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMaterials}</div>
                <p className="text-xs text-muted-foreground">Tài liệu đã tải lên</p>
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
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/tutor/sessions')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Quản lý buổi học
                </CardTitle>
                <CardDescription>Xem lịch và quản lý buổi học</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/tutor/students')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quản lý học sinh
                </CardTitle>
                <CardDescription>Theo dõi tiến độ học tập</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/tutor/materials')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Tài liệu
                </CardTitle>
                <CardDescription>Quản lý tài liệu học tập</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* Upcoming Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Buổi học sắp tới
              </CardTitle>
              <CardDescription>Lịch dạy trong tuần này</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{session.student} - {session.subject}</p>
                        <p className="text-sm text-muted-foreground">{session.date} • {session.time}</p>
                      </div>
                    </div>
                    <Badge variant={session.status === "upcoming" ? "default" : "secondary"}>
                      {session.status === "upcoming" ? "Sắp diễn ra" : "Đã lên lịch"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Hoạt động gần đây
              </CardTitle>
              <CardDescription>Các hoạt động mới nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {activity.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {activity.status === "uploaded" && <FileText className="h-5 w-5 text-blue-500" />}
                      {activity.status === "new" && <MessageSquare className="h-5 w-5 text-purple-500" />}
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                      {activity.status === "completed" && "Hoàn thành"}
                      {activity.status === "uploaded" && "Đã tải lên"}
                      {activity.status === "new" && "Mới"}
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

