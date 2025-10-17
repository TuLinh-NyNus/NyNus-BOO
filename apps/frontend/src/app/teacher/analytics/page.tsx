"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/types/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form/select";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  Calendar,
  Target,
  Award,
  Clock
} from "lucide-react";

// Real backend hooks
import { useTeacherDashboard, useInvalidateTeacherAnalytics } from "@/hooks/teacher/use-teacher-analytics";

/**
 * Teacher Analytics Page
 * Trang thống kê và phân tích cho giáo viên
 */
export default function TeacherAnalyticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Real backend data
  const { data: dashboardData, isLoading: dashboardLoading, error, refetch } = useTeacherDashboard(
    user?.id || '',
    timeRange,
    { enabled: !!user?.id }
  );

  const { invalidateDashboard } = useInvalidateTeacherAnalytics();

  // Handle refresh
  const handleRefresh = async () => {
    await refetch();
    invalidateDashboard(user?.id || '', timeRange);
  };

  // Handle export
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting analytics as ${format}`);
    // TODO: Implement export functionality
  };

  // Calculate trends from real data
  const trends = useMemo(() => {
    if (!dashboardData?.trends || dashboardData.trends.length < 2) {
      return { score: 0, passRate: 0 };
    }
    const latest = dashboardData.trends[dashboardData.trends.length - 1];
    const previous = dashboardData.trends[dashboardData.trends.length - 2];
    return {
      score: ((latest.averageScore - previous.averageScore) / previous.averageScore) * 100,
      passRate: latest.passRate - previous.passRate
    };
  }, [dashboardData?.trends]);

  // Loading state
  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Check authorization
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Lỗi tải dữ liệu
            </CardTitle>
            <CardDescription>
              {error.message || 'Không thể tải dữ liệu analytics. Vui lòng thử lại sau.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleRefresh()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              Thống kê & Phân tích
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Theo dõi hiệu suất học tập và tiến độ của học sinh
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(value: typeof timeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 ngày</SelectItem>
                <SelectItem value="30d">30 ngày</SelectItem>
                <SelectItem value="90d">90 ngày</SelectItem>
                <SelectItem value="1y">1 năm</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng số học sinh</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.activeStudents} đang hoạt động
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.averageScore.toFixed(1)}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {trends.score > 0 ? '+' : ''}{trends.score.toFixed(1)}% so với kỳ trước
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ đạt</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.passRate.toFixed(1)}%</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-4" />
                  {trends.passRate > 0 ? '+' : ''}{trends.passRate.toFixed(1)}% so với kỳ trước
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng số bài thi</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalExams}</div>
                <p className="text-xs text-muted-foreground">Đã tạo trong kỳ này</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Học sinh hoàn thành bài thi</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.5 }}>
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Khoảng thời gian</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : timeRange === '90d' ? '90' : '365'} ngày</div>
                <p className="text-xs text-muted-foreground">Dữ liệu thống kê</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Chart Placeholder */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Biểu đồ hiệu suất theo thời gian</CardTitle>
            <CardDescription>
              Theo dõi điểm trung bình và tỷ lệ đạt trong {timeRange === '7d' ? '7 ngày' : timeRange === '30d' ? '30 ngày' : timeRange === '90d' ? '90 ngày' : '1 năm'} qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Biểu đồ hiệu suất sẽ được hiển thị ở đây</p>
                <p className="text-sm text-gray-500 mt-2">(Cần cài đặt chart library như Recharts)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

