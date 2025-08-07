/**
 * Notification Statistics Component
 * Component hiển thị thống kê notifications
 *
 * Features:
 * - Real-time notification metrics
 * - Charts và graphs
 * - Trend analysis
 * - Performance indicators
 * - Export functionality
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/layout/card";
import { Button } from "../../ui/forms/button";
import { Badge } from "../../ui/data-display/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/forms/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
} from "lucide-react";

/**
 * Mock statistics data (sẽ được thay thế bằng API call)
 */
const mockStatistics = {
  period: "week",
  totalNotifications: 1234,
  unreadNotifications: 156,
  readRate: "87.4",
  notificationsByType: [
    { type: "SECURITY_ALERT", count: 23 },
    { type: "COURSE_UPDATE", count: 456 },
    { type: "SYSTEM_MESSAGE", count: 89 },
    { type: "ACHIEVEMENT", count: 234 },
    { type: "SOCIAL", count: 123 },
    { type: "PAYMENT", count: 309 },
  ],
  trends: {
    totalChange: "+12%",
    readRateChange: "+3%",
    securityAlertsChange: "+5",
  },
  hourlyDistribution: [
    { hour: "00", count: 12 },
    { hour: "01", count: 8 },
    { hour: "02", count: 5 },
    { hour: "03", count: 3 },
    { hour: "04", count: 2 },
    { hour: "05", count: 4 },
    { hour: "06", count: 15 },
    { hour: "07", count: 28 },
    { hour: "08", count: 45 },
    { hour: "09", count: 67 },
    { hour: "10", count: 89 },
    { hour: "11", count: 78 },
    { hour: "12", count: 56 },
    { hour: "13", count: 67 },
    { hour: "14", count: 89 },
    { hour: "15", count: 76 },
    { hour: "16", count: 65 },
    { hour: "17", count: 54 },
    { hour: "18", count: 43 },
    { hour: "19", count: 32 },
    { hour: "20", count: 25 },
    { hour: "21", count: 18 },
    { hour: "22", count: 15 },
    { hour: "23", count: 10 },
  ],
};

/**
 * Type colors for charts
 */
const TYPE_COLORS = {
  SECURITY_ALERT: "#ef4444",
  COURSE_UPDATE: "#3b82f6",
  SYSTEM_MESSAGE: "#6b7280",
  ACHIEVEMENT: "#eab308",
  SOCIAL: "#22c55e",
  PAYMENT: "#8b5cf6",
};

/**
 * Type labels
 */
const TYPE_LABELS = {
  SECURITY_ALERT: "Bảo mật",
  COURSE_UPDATE: "Khóa học",
  SYSTEM_MESSAGE: "Hệ thống",
  ACHIEVEMENT: "Thành tích",
  SOCIAL: "Xã hội",
  PAYMENT: "Thanh toán",
};

/**
 * Notification Statistics Component
 */
export function NotificationStatistics() {
  const [statistics, setStatistics] = useState(mockStatistics);
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(false);

  /**
   * Load statistics data
   */
  const loadStatistics = async (selectedPeriod: string) => {
    setLoading(true);
    // TODO: Implement API call
    setTimeout(() => {
      setStatistics({ ...mockStatistics, period: selectedPeriod });
      setLoading(false);
    }, 1000);
  };

  /**
   * Handle period change
   */
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    loadStatistics(newPeriod);
  };

  /**
   * Export statistics
   */
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting statistics...");
  };

  /**
   * Get trend indicator
   */
  const getTrendIndicator = (change: string) => {
    const isPositive = change.startsWith("+");
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? "text-green-600" : "text-red-600";

    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">{change}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">24 giờ qua</SelectItem>
              <SelectItem value="week">7 ngày qua</SelectItem>
              <SelectItem value="month">30 ngày qua</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => loadStatistics(period)}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>

        <Button variant="outline" onClick={handleExport} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Xuất báo cáo</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thông báo</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.totalNotifications.toLocaleString()}
            </div>
            {getTrendIndicator(statistics.trends.totalChange)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa đọc</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.unreadNotifications.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((statistics.unreadNotifications / statistics.totalNotifications) * 100).toFixed(1)}%
              tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ đọc</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.readRate}%</div>
            {getTrendIndicator(statistics.trends.readRateChange)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo bảo mật</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics.notificationsByType.find((t) => t.type === "SECURITY_ALERT")?.count || 0}
            </div>
            {getTrendIndicator(statistics.trends.securityAlertsChange)}
          </CardContent>
        </Card>
      </div>

      {/* Notifications by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Phân bố theo loại</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics.notificationsByType.map((item) => {
              const percentage = ((item.count / statistics.totalNotifications) * 100).toFixed(1);
              return (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: TYPE_COLORS[item.type as keyof typeof TYPE_COLORS],
                        }}
                      />
                      <span className="font-medium">
                        {TYPE_LABELS[item.type as keyof typeof TYPE_LABELS]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                      <Badge variant="outline">{item.count.toLocaleString()}</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: TYPE_COLORS[item.type as keyof typeof TYPE_COLORS],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Phân bố theo giờ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:59</span>
            </div>
            <div className="flex items-end space-x-1 h-32">
              {statistics.hourlyDistribution.map((item) => {
                const maxCount = Math.max(...statistics.hourlyDistribution.map((h) => h.count));
                const height = (item.count / maxCount) * 100;
                return (
                  <div
                    key={item.hour}
                    className="flex-1 bg-blue-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                    style={{ height: `${height}%` }}
                    title={`${item.hour}:00 - ${item.count} thông báo`}
                  />
                );
              })}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Số lượng thông báo theo giờ trong ngày
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <div className="font-medium text-blue-900">Peak Hours</div>
                <div className="text-sm text-blue-700">
                  Thông báo cao nhất vào 9-11h và 14-16h. Cân nhắc tối ưu hóa timing.
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div>
                <div className="font-medium text-green-900">Read Rate</div>
                <div className="text-sm text-green-700">
                  Tỷ lệ đọc {statistics.readRate}% cao hơn trung bình ngành (75%).
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
              <div>
                <div className="font-medium text-orange-900">Security Alerts</div>
                <div className="text-sm text-orange-700">
                  Cảnh báo bảo mật tăng {statistics.trends.securityAlertsChange} so với kỳ trước.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
