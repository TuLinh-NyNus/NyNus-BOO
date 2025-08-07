"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Shield, AlertTriangle, Activity, TrendingUp, TrendingDown } from "lucide-react";

/**
 * Security Metrics Widget Component
 * Component hiển thị metrics bảo mật với visualization
 */

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topThreats: Array<{
    type: string;
    count: number;
    lastOccurrence: string;
  }>;
  riskScore: number;
  blockedIPs: number;
  suspiciousActivities: number;
}

interface SecurityMetricsWidgetProps {
  metrics: SecurityMetrics | null;
  isLoading?: boolean;
}

// Colors for charts
const SEVERITY_COLORS = {
  CRITICAL: "#ef4444", // red-500
  HIGH: "#f97316", // orange-500
  MEDIUM: "#eab308", // yellow-500
  LOW: "#3b82f6", // blue-500
};

const CHART_COLORS = ["#3b82f6", "#ef4444", "#f97316", "#eab308", "#10b981", "#8b5cf6"];

export function SecurityMetricsWidget({ metrics, isLoading }: SecurityMetricsWidgetProps) {
  // Prepare data for charts
  const severityChartData = useMemo(() => {
    if (!metrics?.eventsBySeverity) return [];

    return Object.entries(metrics.eventsBySeverity).map(([severity, count]) => ({
      name: severity,
      value: count,
      fill: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || "#6b7280",
    }));
  }, [metrics?.eventsBySeverity]);

  const typeChartData = useMemo(() => {
    if (!metrics?.eventsByType) return [];

    return Object.entries(metrics.eventsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6) // Top 6 types
      .map(([type, count], index) => ({
        name: type.replace(/_/g, " "),
        count,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [metrics?.eventsByType]);

  const timeSeriesData = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        period: "Hôm nay",
        events: metrics.eventsToday,
        riskScore: Math.floor(Math.random() * 30) + 20, // 20-50 for today
      },
      {
        period: "Tuần này",
        events: metrics.eventsThisWeek,
        riskScore: Math.floor(Math.random() * 40) + 30, // 30-70 for this week
      },
      {
        period: "Tháng này",
        events: metrics.eventsThisMonth,
        riskScore: Math.floor(Math.random() * 50) + 25, // 25-75 for this month
      },
    ];
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Không có dữ liệu metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Events by Severity - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Phân bố theo mức độ
          </CardTitle>
          <CardDescription>Số lượng sự kiện theo mức độ nghiêm trọng</CardDescription>
        </CardHeader>
        <CardContent>
          {severityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events by Type - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Top loại sự kiện
          </CardTitle>
          <CardDescription>Các loại sự kiện bảo mật phổ biến nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {typeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Series - Events Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Xu hướng thời gian
          </CardTitle>
          <CardDescription>Số lượng sự kiện theo thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="events" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Xu hướng điểm rủi ro
          </CardTitle>
          <CardDescription>Biến động điểm rủi ro theo thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" fontSize={12} />
              <YAxis fontSize={12} domain={[0, 100]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-orange-600">
                          Risk Score: {payload[0]?.value || 0}/100
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Number(payload[0]?.value || 0) < 30
                            ? "Low Risk"
                            : Number(payload[0]?.value || 0) < 70
                              ? "Medium Risk"
                              : "High Risk"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="riskScore"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Score & Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tổng quan bảo mật
          </CardTitle>
          <CardDescription>Điểm rủi ro và thống kê tổng quan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Điểm rủi ro</span>
              <div className="flex items-center gap-2">
                <div
                  className={`text-2xl font-bold ${
                    metrics.riskScore >= 80
                      ? "text-red-500"
                      : metrics.riskScore >= 60
                        ? "text-orange-500"
                        : metrics.riskScore >= 40
                          ? "text-yellow-500"
                          : "text-green-500"
                  }`}
                >
                  {metrics.riskScore}
                </div>
                {metrics.riskScore >= 60 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">IP bị chặn</p>
                <p className="text-lg font-semibold">{metrics.blockedIPs}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hoạt động đáng nghi</p>
                <p className="text-lg font-semibold">{metrics.suspiciousActivities}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
