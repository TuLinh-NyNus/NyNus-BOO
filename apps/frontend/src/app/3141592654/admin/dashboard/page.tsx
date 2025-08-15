"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import {
  Activity,
  BarChart3,
} from "lucide-react";

// Import dashboard components
import { useDashboardData } from "@/hooks/admin/use-dashboard-data";
import { DashboardHeader } from "@/components/features/admin/dashboard/dashboard-header";
import { RealtimeDashboardMetrics } from "@/components/features/admin/dashboard/realtime-dashboard-metrics";
import { AdminErrorBoundary } from "@/components/admin/providers/admin-error-boundary";

export default function AdminDashboardPage() {

  // Dashboard data hook
  const {
    isLoading,
    isRefreshing,
    lastUpdated,
    error,
    refreshCount,
    refreshData,
  } = useDashboardData({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    enableCaching: true,
  });



  return (
    <AdminErrorBoundary level="page" enableRetry={true} showErrorDetails={true}>
      <div className="space-y-8">
        {/* Dashboard Header */}
        <DashboardHeader
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          refreshCount={refreshCount}
          error={error}
          onRefresh={refreshData}
        />

        {/* Real-time Key Metrics */}
        <RealtimeDashboardMetrics enableAutoRefresh={true} refreshInterval={30000} />

        {/* Charts and Analytics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 theme-bg theme-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Thống kê truy cập
              </CardTitle>
              <CardDescription>Số lượng người dùng hoạt động trong 7 ngày qua</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                [Biểu đồ sẽ được thêm vào sau]
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 theme-bg theme-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Hoạt động gần đây
              </CardTitle>
              <CardDescription>Các sự kiện quan trọng trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Khóa học mới được tạo</p>
                    <p className="text-xs text-muted-foreground">
                      &quot;Advanced React Patterns&quot; - 5 phút trước
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Người dùng mới đăng ký</p>
                    <p className="text-xs text-muted-foreground">25 người dùng mới - 1 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Cập nhật hệ thống</p>
                    <p className="text-xs text-muted-foreground">Version 2.1.0 - 2 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Cảnh báo hiệu suất</p>
                    <p className="text-xs text-muted-foreground">
                      Database response time cao - 3 giờ trước
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* System Status */}
        <Card className="theme-bg theme-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Trạng thái hệ thống
            </CardTitle>
            <CardDescription>Tình trạng hoạt động của các dịch vụ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">API Server</span>
                </div>
                <span className="text-xs text-green-600">Hoạt động</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <span className="text-xs text-green-600">Hoạt động</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm font-medium">Redis Cache</span>
                </div>
                <span className="text-xs text-yellow-600">Chậm</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">File Storage</span>
                </div>
                <span className="text-xs text-green-600">Hoạt động</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </AdminErrorBoundary>
  );
}

