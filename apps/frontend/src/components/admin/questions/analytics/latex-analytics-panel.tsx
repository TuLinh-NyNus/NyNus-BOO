/**
 * LaTeX Analytics Panel
 * ====================
 * Component hiển thị thống kê và phân tích hiệu suất LaTeX parsing
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Trash2,
} from "lucide-react";

import { latexAnalytics, type LatexAnalytics } from "@/lib/analytics/latex-analytics";

export interface LatexAnalyticsPanelProps {
  className?: string;
}

export function LatexAnalyticsPanel({ className = "" }: LatexAnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<LatexAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(24); // 24 hours default

  const refreshAnalytics = useCallback(() => {
    const data = selectedPeriod === 0 
      ? latexAnalytics.getAnalytics() 
      : latexAnalytics.getAnalyticsForPeriod(selectedPeriod);
    setAnalytics(data);
  }, [selectedPeriod]);

  useEffect(() => {
    refreshAnalytics();
  }, [selectedPeriod, refreshAnalytics]);

  const handleExportData = () => {
    const data = latexAnalytics.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `latex-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu analytics?')) {
      latexAnalytics.clearAnalytics();
      refreshAnalytics();
    }
  };

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const successRate = analytics.totalParses > 0 
    ? Math.round((analytics.successfulParses / analytics.totalParses) * 100) 
    : 0;

  const periods = [
    { value: 1, label: "1 giờ qua" },
    { value: 24, label: "24 giờ qua" },
    { value: 168, label: "7 ngày qua" },
    { value: 0, label: "Tất cả" }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              LaTeX Analytics
            </CardTitle>
            <CardDescription>
              Thống kê hiệu suất phân tích LaTeX
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshAnalytics}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Làm mới
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-1" />
              Xuất
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearData}>
              <Trash2 className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Khoảng thời gian:</span>
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{analytics.totalParses}</div>
            <div className="text-sm text-muted-foreground">Tổng số lần phân tích</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.successfulParses}</div>
            <div className="text-sm text-muted-foreground">Thành công</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{analytics.failedParses}</div>
            <div className="text-sm text-muted-foreground">Thất bại</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{successRate}%</div>
            <div className="text-sm text-muted-foreground">Tỷ lệ thành công</div>
          </div>
        </div>

        <Separator />

        {/* Performance Metrics */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hiệu suất
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{analytics.averageParseTime}ms</div>
              <div className="text-xs text-muted-foreground">Trung bình</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{analytics.performanceMetrics.p50}ms</div>
              <div className="text-xs text-muted-foreground">P50</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{analytics.performanceMetrics.p95}ms</div>
              <div className="text-xs text-muted-foreground">P95</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{analytics.performanceMetrics.p99}ms</div>
              <div className="text-xs text-muted-foreground">P99</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Stats */}
        <div>
          <h3 className="font-semibold mb-3">Thống kê nội dung</h3>
          <div className="text-center">
            <div className="text-lg font-semibold">{analytics.averageContentLength}</div>
            <div className="text-xs text-muted-foreground">Độ dài trung bình (ký tự)</div>
          </div>
        </div>

        {/* Common Errors */}
        {Object.keys(analytics.commonErrors).length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Lỗi phổ biến
              </h3>
              <div className="space-y-2">
                {Object.entries(analytics.commonErrors)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([error, count]) => (
                    <div key={error} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate flex-1 mr-2">{error}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Status Indicator */}
        <Alert>
          <div className="flex items-center gap-2">
            {successRate >= 95 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : successRate >= 80 ? (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              {successRate >= 95 
                ? "Hệ thống hoạt động tốt" 
                : successRate >= 80 
                  ? "Hệ thống hoạt động ổn định với một số vấn đề nhỏ"
                  : "Hệ thống gặp nhiều vấn đề, cần kiểm tra"}
            </AlertDescription>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}






