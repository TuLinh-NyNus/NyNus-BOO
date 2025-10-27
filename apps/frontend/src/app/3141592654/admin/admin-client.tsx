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
import { SimplifiedDashboard } from "@/components/admin/dashboard/simplified-dashboard";


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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
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
          
          {/* Simplified Dashboard - Modern UI/UX */}
          <section className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <SimplifiedDashboard />
          </section>

          {/* Recent Activities - Modern Card */}
          <section className="animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 mt-8">
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

