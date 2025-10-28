"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Badge } from "@/components/ui/display/badge";
import {
  Activity,
} from "lucide-react";

// Import dashboard components
import { useDashboardData } from "@/hooks/admin/use-dashboard-data";
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header";
import { HeroMetrics } from "@/components/admin/dashboard/hero-metrics";
import { ActivityChart } from "@/components/admin/dashboard/activity-chart";
import { SecondaryMetrics } from "@/components/admin/dashboard/secondary-metrics";
// import { MetricsDebug } from "@/components/admin/dashboard/metrics-debug"; // Temporarily hidden


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
    formattedMetrics: _formattedMetrics,
    systemStatus: _systemStatus,
    recentActivities,
    isLoading,
    error: _error,
    lastUpdated,
    refreshData
  } = useDashboardData({
    autoRefresh: false, // ✅ FIX: Disabled to prevent conflict with AdminStatsContext cache (both 30s)
    refreshInterval: 30000,
    enableCaching: true
  });

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <DashboardHeader
        lastUpdated={lastUpdated}
        onRefresh={refreshData}
        isRefreshing={isLoading}
      />

      {/* Main Content - Modern Bento Layout */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <AdminErrorBoundary level="page">
          
          {/* Hero Section - Welcome Banner */}
          <section className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 p-8 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Dashboard Quản Trị
                    </h1>
                    <p className="text-sm text-muted-foreground/80 mt-1">Tổng quan thời gian thực về hệ thống</p>
                  </div>
                </div>
              </div>
              {/* Aurora overlay*/}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -right-10 w-[520px] h-[520px] bg-gradient-to-br from-primary/25 via-fuchsia-500/20 to-blue-500/25 opacity-60 blur-3xl rounded-full" />
                <div className="absolute -bottom-20 -left-10 w-[420px] h-[420px] bg-gradient-to-br from-cyan-500/20 via-emerald-400/20 to-blue-500/20 opacity-50 blur-3xl rounded-full" />
                <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[220px] bg-[radial-gradient(closest-side,rgba(255,255,255,0.15),transparent)] rotate-12" />
              </div>
            </div>
          </section>

          {/* New Simplified Layout */}
          <div className="space-y-8">
            {/* Hero Metrics - 3 Main KPIs */}
            <section className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <HeroMetrics />
            </section>

            {/* Activity Chart - Full Width Visualization */}
            <section className="animate-in fade-in-0 slide-in-from-bottom-6 duration-700">
              <ActivityChart />
            </section>

                {/* Secondary Metrics - 4 Supporting KPIs */}
                <section className="animate-in fade-in-0 slide-in-from-bottom-8 duration-900">
                  <SecondaryMetrics />
                </section>

                {/* Debug Info - Temporary for testing - HIDDEN */}
                {/* <section className="animate-in fade-in-0 slide-in-from-bottom-10 duration-1100">
                  <MetricsDebug />
                </section> */}

            {/* Recent Activities - Modern Card */}
            <section className="animate-in fade-in-0 slide-in-from-bottom-8 duration-1000">
              <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
                <CardHeader className="relative z-10 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">Hoạt động gần đây</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Nhật ký hoạt động mới nhất trong hệ thống
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 pt-6">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm" />
                      ))}
                    </div>
                  ) : recentActivities && recentActivities.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivities.map((activity, idx) => (
                        <div
                          key={activity.id}
                          className="group flex items-center justify-between rounded-xl border border-white/5 bg-gradient-to-r from-card/50 to-card/30 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-pulse" />
                            <div className="flex-1">
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{activity.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground/60 whitespace-nowrap ml-4">
                            {activity.timestamp.toLocaleString('vi-VN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 mb-4">
                        <Activity className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground">Chưa có hoạt động nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          </AdminErrorBoundary>
        </main>

        <style jsx global>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
  );
}

