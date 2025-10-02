"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import {
  Activity,
} from "lucide-react";

// Import dashboard components
import { useDashboardData } from "@/hooks/admin/use-dashboard-data";
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header";
import { RealtimeDashboardMetrics } from "@/components/admin/dashboard/realtime-dashboard-metrics";
import { DashboardStats } from "@/components/admin/dashboard/dashboard-stats";
import { ConnectedAdminDashboard } from "@/components/admin/dashboard/connected-dashboard";


/**
 * Simple Error Boundary Component
 * Component để handle errors trong admin dashboard
 */
interface AdminErrorBoundaryProps {
  children: React.ReactNode;
  level?: string;
  enableRetry?: boolean;
  showErrorDetails?: boolean;
}

function AdminErrorBoundary({
  children
}: AdminErrorBoundaryProps) {
  return <>{children}</>;
}

/**
 * Admin Dashboard Page - Client Component
 * Trang quản trị chính của hệ thống NyNus
 */
export default function AdminDashboardClient() {
  const {
    formattedMetrics,
    systemStatus,
    recentActivities,
    isLoading,
    error,
    lastUpdated,
    refreshData
  } = useDashboardData({
    autoRefresh: true,
    refreshInterval: 30000,
    enableCaching: true
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <DashboardHeader
        lastUpdated={lastUpdated}
        onRefresh={refreshData}
        isRefreshing={isLoading}
      />

      {/* Main Content */}
      <main className="flex-1 space-y-6 p-6">
        <AdminErrorBoundary level="page">
          {/* Realtime Metrics */}
          <section>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
              Thống kê thời gian thực
            </h2>
            <RealtimeDashboardMetrics />
          </section>

          {/* Dashboard Stats */}
          <section>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
              Tổng quan hệ thống
            </h2>
            <DashboardStats />
          </section>

          {/* Recent Activities */}
          <section>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
              Hoạt động gần đây
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Nhật ký hoạt động
                </CardTitle>
                <CardDescription>
                  Các hoạt động mới nhất trong hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                    ))}
                  </div>
                ) : recentActivities && recentActivities.length > 0 ? (
                  <div className="space-y-2">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {activity.timestamp.toLocaleString('vi-VN')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Chưa có hoạt động nào
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* User Management */}
          <section>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
              Quản lý người dùng
            </h2>
            <ConnectedAdminDashboard />
          </section>
        </AdminErrorBoundary>
      </main>
    </div>
  );
}

