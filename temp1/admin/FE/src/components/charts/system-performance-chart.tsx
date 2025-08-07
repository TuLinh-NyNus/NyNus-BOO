"use client";

import { useMemo } from "react";
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
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Zap, Clock, AlertTriangle, CheckCircle, Activity, Server, Gauge } from "lucide-react";

/**
 * System Performance Chart Component
 * Component hiển thị charts về hiệu suất hệ thống
 */

interface SystemPerformanceChartProps {
  systemMetrics?: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    performance: number;
  };
  timeRange?: "7d" | "30d" | "90d" | "custom";
  isLoading?: boolean;
}

// Mock data cho performance time series
const generatePerformanceTimeSeriesData = (days: number) => {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
      fullDate: date.toISOString().split("T")[0],
      responseTime: Math.floor(Math.random() * 100) + 80, // 80-180ms
      uptime: Math.random() * 2 + 98, // 98-100%
      errorRate: Math.random() * 3, // 0-3%
      performance: Math.floor(Math.random() * 20) + 80, // 80-100
      cpuUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
      memoryUsage: Math.floor(Math.random() * 30) + 50, // 50-80%
      diskUsage: Math.floor(Math.random() * 20) + 40, // 40-60%
    });
  }

  return data;
};

const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  danger: "#ef4444",
  warning: "#f97316",
  success: "#22c55e",
  muted: "#6b7280",
};

const PERFORMANCE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export function SystemPerformanceChart({
  systemMetrics,
  timeRange = "30d",
  isLoading = false,
}: SystemPerformanceChartProps) {
  // Handle loading state or missing data
  if (isLoading || !systemMetrics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Hiệu suất hệ thống
              </CardTitle>
              <CardDescription>Đang tải dữ liệu hiệu suất...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Generate time series data
  const timeSeriesData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    return generatePerformanceTimeSeriesData(days);
  }, [timeRange]);

  // Performance status
  const getPerformanceStatus = (score: number) => {
    if (score >= 90)
      return {
        label: "Excellent",
        color: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-950/20",
      };
    if (score >= 70)
      return {
        label: "Good",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      };
    return { label: "Poor", color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-950/20" };
  };

  const performanceStatus = getPerformanceStatus(systemMetrics?.performance || 0);

  // Uptime status
  const getUptimeStatus = (uptime: number) => {
    if (uptime >= 99.9) return { label: "Excellent", color: "text-green-500" };
    if (uptime >= 99.5) return { label: "Good", color: "text-yellow-500" };
    return { label: "Poor", color: "text-red-500" };
  };

  const uptimeStatus = getUptimeStatus(systemMetrics?.uptime || 0);

  // System health data for radial chart
  const systemHealthData = useMemo(
    () => [
      {
        name: "Uptime",
        value: systemMetrics?.uptime || 0,
        fill: CHART_COLORS.success,
      },
      {
        name: "Performance",
        value: systemMetrics?.performance || 0,
        fill: CHART_COLORS.primary,
      },
      {
        name: "Error Rate",
        value: Math.max(0, 100 - (systemMetrics?.errorRate || 0) * 10), // Invert error rate
        fill: CHART_COLORS.warning,
      },
    ],
    [systemMetrics]
  );

  // Resource usage data
  const resourceUsageData = useMemo(() => {
    const latest = timeSeriesData[timeSeriesData.length - 1];
    if (!latest) return [];

    return [
      { name: "CPU", value: latest.cpuUsage, fill: CHART_COLORS.primary },
      { name: "Memory", value: latest.memoryUsage, fill: CHART_COLORS.secondary },
      { name: "Disk", value: latest.diskUsage, fill: CHART_COLORS.accent },
    ];
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
      {/* Response Time Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Thời gian phản hồi
          </CardTitle>
          <CardDescription>Xu hướng thời gian phản hồi API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{systemMetrics?.responseTime || "--"}ms</span>
              <span className="text-sm text-muted-foreground">hiện tại</span>
            </div>
            <div
              className={`text-sm ${(systemMetrics?.responseTime || 0) < 200 ? "text-green-500" : (systemMetrics?.responseTime || 0) < 500 ? "text-yellow-500" : "text-red-500"}`}
            >
              {(systemMetrics?.responseTime || 0) < 200
                ? "Fast"
                : (systemMetrics?.responseTime || 0) < 500
                  ? "Normal"
                  : "Slow"}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 10", "dataMax + 10"]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-blue-600">
                          Response Time: {payload[0]?.value}ms
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Tổng quan sức khỏe hệ thống
          </CardTitle>
          <CardDescription>Các chỉ số sức khỏe chính</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg ${performanceStatus.bgColor}`}>
              <p className="text-sm text-muted-foreground">Performance</p>
              <p className={`text-xl font-bold ${performanceStatus.color}`}>
                {systemMetrics?.performance || "--"}/100
              </p>
              <p className={`text-xs ${performanceStatus.color}`}>{performanceStatus.label}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className={`text-xl font-bold ${uptimeStatus.color}`}>
                {systemMetrics?.uptime?.toFixed(1) || "--"}%
              </p>
              <p className={`text-xs ${uptimeStatus.color}`}>{uptimeStatus.label}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="80%"
              data={systemHealthData}
            >
              <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{payload[0]?.payload?.name}</p>
                        <p className="text-sm">
                          Value: {Number(payload[0]?.value || 0).toFixed(1)}
                          {payload[0]?.payload?.name === "Uptime"
                            ? "%"
                            : payload[0]?.payload?.name === "Performance"
                              ? "/100"
                              : "%"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Error Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Tỷ lệ lỗi
          </CardTitle>
          <CardDescription>Xu hướng tỷ lệ lỗi hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {systemMetrics?.errorRate?.toFixed(1) || "--"}%
              </span>
              <span className="text-sm text-muted-foreground">hiện tại</span>
            </div>
            <div
              className={`text-sm ${(systemMetrics?.errorRate || 0) < 1 ? "text-green-500" : (systemMetrics?.errorRate || 0) < 3 ? "text-yellow-500" : "text-red-500"}`}
            >
              {(systemMetrics?.errorRate || 0) < 1
                ? "Low"
                : (systemMetrics?.errorRate || 0) < 3
                  ? "Medium"
                  : "High"}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, "dataMax + 1"]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-red-600">
                          Error Rate: {Number(payload[0]?.value || 0).toFixed(1)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="errorRate"
                stroke={CHART_COLORS.danger}
                fill={CHART_COLORS.danger}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Sử dụng tài nguyên
          </CardTitle>
          <CardDescription>CPU, Memory và Disk usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-3">
            {resourceUsageData.map((resource, index) => (
              <div key={resource.name} className="flex items-center justify-between">
                <span className="text-sm font-medium">{resource.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${resource.value}%`,
                        backgroundColor: resource.fill,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{resource.value}%</span>
                </div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={resourceUsageData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {resourceUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{payload[0]?.name}</p>
                        <p className="text-sm">Usage: {payload[0]?.value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
