"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapCodeClient } from "@/lib/grpc/mapcode-client";

interface MapCodeMetrics {
  totalTranslations: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  avgTranslationTimeMs: number;
  translationErrors: number;
  activeVersionId?: string;
  lastVersionSwitch?: string;
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MapCodeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Call real gRPC API
      const metricsData = await MapCodeClient.getMetrics();
      
      // Convert to component format
      const mappedMetrics: MapCodeMetrics = {
        totalTranslations: metricsData.totalTranslations,
        cacheHits: metricsData.cacheHits,
        cacheMisses: metricsData.cacheMisses,
        cacheHitRate: metricsData.cacheHitRate,
        avgTranslationTimeMs: metricsData.avgTranslationTimeMs,
        translationErrors: metricsData.translationErrors,
        activeVersionId: metricsData.activeVersionId,
        lastVersionSwitch: metricsData.lastVersionSwitch?.toISOString(),
      };
      
      setMetrics(mappedMetrics);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
      // Show error message but keep UI functional
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Đang tải metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Không thể tải metrics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MapCode Performance Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Cập nhật lần cuối: {lastRefresh.toLocaleTimeString("vi-VN")}
          </p>
        </div>
        <Button onClick={fetchMetrics} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Translations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số dịch</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalTranslations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng số lần dịch mã câu hỏi
            </p>
          </CardContent>
        </Card>

        {/* Cache Hit Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tỉ lệ cache hit</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(metrics.cacheHitRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.cacheHits.toLocaleString()} hits / {metrics.cacheMisses.toLocaleString()} misses
            </p>
          </CardContent>
        </Card>

        {/* Avg Translation Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thời gian trung bình</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.avgTranslationTimeMs.toFixed(2)}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.avgTranslationTimeMs < 5 ? "Rất tốt" : metrics.avgTranslationTimeMs < 10 ? "Tốt" : "Cần cải thiện"}
            </p>
          </CardContent>
        </Card>

        {/* Errors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lỗi dịch</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.translationErrors > 50 ? "text-red-600" : "text-gray-600"}`}>
              {metrics.translationErrors}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.translationErrors === 0 ? "Không có lỗi" : "Cần kiểm tra"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin phiên bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Phiên bản đang dùng:</span>
            <span className="font-mono text-sm font-semibold">{metrics.activeVersionId || "N/A"}</span>
          </div>
          {metrics.lastVersionSwitch && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Chuyển version lần cuối:</span>
              <span className="text-sm">
                {new Date(metrics.lastVersionSwitch).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Đánh giá hiệu suất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Cache Hit Rate Assessment */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                metrics.cacheHitRate >= 0.9 ? "bg-green-500" : 
                metrics.cacheHitRate >= 0.8 ? "bg-yellow-500" : "bg-red-500"
              }`} />
              <span className="text-sm">
                Cache Hit Rate: {metrics.cacheHitRate >= 0.9 ? "Xuất sắc" : metrics.cacheHitRate >= 0.8 ? "Tốt" : "Cần cải thiện"}
              </span>
            </div>

            {/* Translation Speed Assessment */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                metrics.avgTranslationTimeMs < 5 ? "bg-green-500" : 
                metrics.avgTranslationTimeMs < 10 ? "bg-yellow-500" : "bg-red-500"
              }`} />
              <span className="text-sm">
                Tốc độ dịch: {metrics.avgTranslationTimeMs < 5 ? "Rất nhanh" : metrics.avgTranslationTimeMs < 10 ? "Bình thường" : "Chậm"}
              </span>
            </div>

            {/* Error Rate Assessment */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                metrics.translationErrors === 0 ? "bg-green-500" : 
                metrics.translationErrors < 50 ? "bg-yellow-500" : "bg-red-500"
              }`} />
              <span className="text-sm">
                Tỉ lệ lỗi: {metrics.translationErrors === 0 ? "Không có lỗi" : 
                metrics.translationErrors < 50 ? "Chấp nhận được" : "Cao"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


