"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Users, TrendingUp, TrendingDown, UserPlus, Activity } from "lucide-react";

/**
 * User Growth Chart Component
 * Component hiển thị charts về tăng trưởng user
 */

interface UserGrowthChartProps {
  userMetrics?: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  sessionMetrics?: {
    total: number;
    active: number;
    averageDuration: number;
    bounceRate: number;
  };
  timeRange?: "7d" | "30d" | "90d" | "custom";
  isLoading?: boolean;
}

// Mock data cho charts - trong thực tế sẽ fetch từ API
const generateMockTimeSeriesData = (days: number) => {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
      fullDate: date.toISOString().split("T")[0],
      newUsers: Math.floor(Math.random() * 50) + 10,
      activeUsers: Math.floor(Math.random() * 200) + 100,
      sessions: Math.floor(Math.random() * 300) + 150,
      avgDuration: Math.floor(Math.random() * 20) + 5, // minutes
    });
  }

  return data;
};

const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  danger: "#ef4444",
  muted: "#6b7280",
};

export function UserGrowthChart({
  userMetrics,
  sessionMetrics,
  timeRange = "30d",
  isLoading = false,
}: UserGrowthChartProps) {
  // Handle loading state or missing data
  if (isLoading || !userMetrics || !sessionMetrics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tăng trưởng người dùng
            </CardTitle>
            <CardDescription>Theo dõi sự tăng trưởng và hoạt động của người dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">--</span>
                <span className="text-sm text-muted-foreground">đang hoạt động</span>
              </div>
              <div className="text-sm text-muted-foreground">-- sessions</div>
            </div>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate time series data based on time range
  const timeSeriesData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    return generateMockTimeSeriesData(days);
  }, [timeRange]);

  // Calculate growth trend
  const isGrowthPositive = (userMetrics?.growth || 0) > 0;
  const growthIcon = isGrowthPositive ? TrendingUp : TrendingDown;
  const growthColor = isGrowthPositive ? "text-green-500" : "text-red-500";

  // User registration trend data
  const registrationData = useMemo(() => {
    return timeSeriesData.map((item) => ({
      date: item.date,
      newUsers: item.newUsers,
      cumulative: timeSeriesData
        .slice(0, timeSeriesData.indexOf(item) + 1)
        .reduce((sum, d) => sum + d.newUsers, 0),
    }));
  }, [timeSeriesData]);

  // Active users trend data
  const activeUsersData = useMemo(() => {
    return timeSeriesData.map((item) => ({
      date: item.date,
      activeUsers: item.activeUsers,
      sessions: item.sessions,
    }));
  }, [timeSeriesData]);

  // Session metrics data
  const sessionData = useMemo(() => {
    return timeSeriesData.map((item) => ({
      date: item.date,
      sessions: item.sessions,
      avgDuration: item.avgDuration,
      bounceRate: Math.max(0, 100 - item.avgDuration * 2), // Mock bounce rate calculation
    }));
  }, [timeSeriesData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Registration Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Xu hướng đăng ký người dùng
          </CardTitle>
          <CardDescription>Số lượng người dùng mới đăng ký theo thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{userMetrics?.newToday || "--"}</span>
              <span className="text-sm text-muted-foreground">hôm nay</span>
            </div>
            <div className={`flex items-center gap-1 text-sm ${growthColor}`}>
              {React.createElement(growthIcon, { className: "h-4 w-4" })}
              {Math.abs(userMetrics?.growth || 0)}%
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-blue-600">Người dùng mới: {payload[0]?.value}</p>
                        <p className="text-sm text-green-600">Tổng cộng: {payload[1]?.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="newUsers"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke={CHART_COLORS.secondary}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Users Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Người dùng hoạt động
          </CardTitle>
          <CardDescription>Số lượng người dùng hoạt động và sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {userMetrics?.active?.toLocaleString() || "--"}
              </span>
              <span className="text-sm text-muted-foreground">đang hoạt động</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {sessionMetrics?.active || "--"} sessions
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activeUsersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-blue-600">
                          Người dùng hoạt động: {payload[0]?.value}
                        </p>
                        <p className="text-sm text-green-600">Sessions: {payload[1]?.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                name="Người dùng hoạt động"
                dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke={CHART_COLORS.secondary}
                strokeWidth={2}
                name="Sessions"
                dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Session Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Phân tích Sessions
          </CardTitle>
          <CardDescription>Thời lượng session và bounce rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-2xl font-bold">{sessionMetrics?.averageDuration || "--"}m</span>
              <p className="text-sm text-muted-foreground">Thời lượng TB</p>
            </div>
            <div>
              <span className="text-2xl font-bold">{sessionMetrics?.bounceRate || "--"}%</span>
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-blue-600">Thời lượng TB: {payload[0]?.value}m</p>
                        <p className="text-sm text-orange-600">Bounce Rate: {payload[1]?.value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="avgDuration"
                fill={CHART_COLORS.primary}
                name="Thời lượng TB (phút)"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="bounceRate"
                fill={CHART_COLORS.accent}
                name="Bounce Rate (%)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Growth Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tóm tắt tăng trưởng
          </CardTitle>
          <CardDescription>Các chỉ số tăng trưởng chính</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Tổng người dùng</p>
                <p className="text-sm text-muted-foreground">Tất cả người dùng đã đăng ký</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{userMetrics?.total?.toLocaleString() || "--"}</p>
                <div className={`flex items-center gap-1 text-sm ${growthColor}`}>
                  {React.createElement(growthIcon, { className: "h-3 w-3" })}
                  {Math.abs(userMetrics?.growth || 0)}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Sessions hôm nay</p>
                <p className="text-sm text-muted-foreground">Tổng sessions trong ngày</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {sessionMetrics?.total?.toLocaleString() || "--"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {sessionMetrics?.active || "--"} đang hoạt động
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{userMetrics?.newToday || "--"}</p>
                <p className="text-xs text-blue-600/80">Người dùng mới</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-lg font-bold text-green-600">
                  {sessionMetrics?.averageDuration || "--"}m
                </p>
                <p className="text-xs text-green-600/80">Thời lượng TB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
