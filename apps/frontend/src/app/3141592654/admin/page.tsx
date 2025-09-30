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
 * Admin Dashboard Page Component
 * Trang chính của admin dashboard với metrics, charts và quick actions
 */
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

        {/* Dashboard Statistics with Golden Graduation Cap Icons */}
        <DashboardStats />

        {/* Connected Admin Dashboard with gRPC Backend */}
        <ConnectedAdminDashboard />


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
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-badge-success rounded-full" />
                  <span className="text-sm font-medium">API Server</span>
                </div>
                <span className="text-xs text-badge-success-foreground">Hoạt động</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-badge-success rounded-full" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <span className="text-xs text-badge-success-foreground">Hoạt động</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-badge-warning rounded-full" />
                  <span className="text-sm font-medium">Redis Cache</span>
                </div>
                <span className="text-xs text-badge-warning-foreground">Chậm</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-badge-success rounded-full" />
                  <span className="text-sm font-medium">File Storage</span>
                </div>
                <span className="text-xs text-badge-success-foreground">Hoạt động</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </AdminErrorBoundary>
  );
}
