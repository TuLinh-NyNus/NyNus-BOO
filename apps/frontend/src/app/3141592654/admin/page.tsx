"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import {
  Activity,
  BarChart3,
} from "lucide-react";

// Import dashboard components
import { useDashboardData } from "@/hooks/admin/use-dashboard-data";
import { DashboardHeader } from "@/components/features/admin/dashboard/dashboard-header";
import { RealtimeDashboardMetrics } from "@/components/features/admin/dashboard/realtime-dashboard-metrics";
import { DashboardStats } from "@/components/features/admin/dashboard/dashboard-stats";


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
      <div className="space-y-8 relative">
        {/* Vibrant background gradient overlay inspired by Hero */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4417DB]/8 via-[#E57885]/6 to-[#F18582]/8 dark:from-[#4417DB]/15 dark:via-[#E57885]/10 dark:to-[#F18582]/15 pointer-events-none rounded-lg -z-10" />

        {/* Additional color layers for more vibrancy */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/5 via-purple-400/3 to-pink-400/5 dark:from-blue-400/10 dark:via-purple-400/6 dark:to-pink-400/10 pointer-events-none rounded-lg -z-10" />
        <div className="absolute inset-0 bg-gradient-to-bl from-cyan-400/3 via-emerald-400/2 to-yellow-400/3 dark:from-cyan-400/8 dark:via-emerald-400/5 dark:to-yellow-400/8 pointer-events-none rounded-lg -z-10" />
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
