/**
 * Content Analytics Dashboard Component
 * Dashboard phân tích hiệu suất và chất lượng nội dung lý thuyết
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge as _Badge } from "@/components/ui/display/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface ContentMetrics {
  totalViews: number;
  avgEngagement: number;
  avgCompletionRate: number;
  avgRenderTime: number;
  totalContent: number;
  qualityScore: number;
  errorRate: number;
  mobileOptimization: number;
}

export interface PerformanceData {
  date: string;
  views: number;
  engagement: number;
  renderTime: number;
  errors: number;
}

export interface ContentAnalyticsDashboardProps {
  /** Time range cho analytics */
  timeRange?: 'day' | 'week' | 'month' | 'year';
  
  /** Show performance metrics */
  showPerformanceMetrics?: boolean;
  
  /** Show content metrics */
  showContentMetrics?: boolean;
  
  /** Show quality metrics */
  showQualityMetrics?: boolean;
  
  /** Enable export functionality */
  enableExport?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const MOCK_METRICS: ContentMetrics = {
  totalViews: 15420,
  avgEngagement: 78.5,
  avgCompletionRate: 82.3,
  avgRenderTime: 145,
  totalContent: 156,
  qualityScore: 85.2,
  errorRate: 2.1,
  mobileOptimization: 91.5
};

const MOCK_PERFORMANCE_DATA: PerformanceData[] = [
  { date: '2025-08-10', views: 1200, engagement: 75, renderTime: 140, errors: 3 },
  { date: '2025-08-11', views: 1350, engagement: 78, renderTime: 135, errors: 2 },
  { date: '2025-08-12', views: 1180, engagement: 72, renderTime: 150, errors: 4 },
  { date: '2025-08-13', views: 1420, engagement: 80, renderTime: 130, errors: 1 },
  { date: '2025-08-14', views: 1580, engagement: 82, renderTime: 125, errors: 2 },
  { date: '2025-08-15', views: 1650, engagement: 85, renderTime: 120, errors: 1 },
  { date: '2025-08-16', views: 1720, engagement: 87, renderTime: 115, errors: 0 }
];

// ===== MAIN COMPONENT =====

export function ContentAnalyticsDashboard({
  timeRange = 'week',
  showPerformanceMetrics = true,
  showContentMetrics: _showContentMetrics = true,
  showQualityMetrics = true,
  enableExport = true,
  className
}: ContentAnalyticsDashboardProps) {
  
  // ===== STATE =====
  
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [isLoading, setIsLoading] = useState(false);

  // ===== COMPUTED VALUES =====
  
  const metrics = useMemo(() => MOCK_METRICS, []);
  const performanceData = useMemo(() => MOCK_PERFORMANCE_DATA, []);

  const trends = useMemo(() => {
    if (performanceData.length < 2) return {};

    const latest = performanceData[performanceData.length - 1];
    const previous = performanceData[performanceData.length - 2];

    return {
      views: ((latest.views - previous.views) / previous.views) * 100,
      engagement: ((latest.engagement - previous.engagement) / previous.engagement) * 100,
      renderTime: ((latest.renderTime - previous.renderTime) / previous.renderTime) * 100,
      errors: latest.errors - previous.errors
    };
  }, [performanceData]);

  // ===== HANDLERS =====

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleExport = () => {
    // Simulate export functionality
    console.log('Exporting analytics data...');
  };

  // ===== RENDER HELPERS =====

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderOverviewMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Tổng lượt xem</div>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
          {trends.views !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2 text-sm", getTrendColor(trends.views))}>
              {getTrendIcon(trends.views)}
              <span>{Math.abs(trends.views).toFixed(1)}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{metrics.avgEngagement.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Tương tác TB</div>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
          {trends.engagement !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2 text-sm", getTrendColor(trends.engagement))}>
              {getTrendIcon(trends.engagement)}
              <span>{Math.abs(trends.engagement).toFixed(1)}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{metrics.avgRenderTime}ms</div>
              <div className="text-sm text-muted-foreground">Thời gian render</div>
            </div>
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
          {trends.renderTime !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2 text-sm", getTrendColor(-trends.renderTime))}>
              {getTrendIcon(-trends.renderTime)}
              <span>{Math.abs(trends.renderTime).toFixed(1)}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Tỷ lệ lỗi</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          {trends.errors !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2 text-sm", getTrendColor(-trends.errors))}>
              {getTrendIcon(-trends.errors)}
              <span>{Math.abs(trends.errors)} lỗi</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderQualityMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Điểm chất lượng tổng thể</div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className={cn("text-3xl font-bold", getScoreColor(metrics.qualityScore))}>
            {metrics.qualityScore.toFixed(1)}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div 
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${metrics.qualityScore}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Tỷ lệ hoàn thành</div>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className={cn("text-3xl font-bold", getScoreColor(metrics.avgCompletionRate))}>
            {metrics.avgCompletionRate.toFixed(1)}%
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${metrics.avgCompletionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Tối ưu mobile</div>
            <Zap className="h-5 w-5 text-purple-500" />
          </div>
          <div className={cn("text-3xl font-bold", getScoreColor(metrics.mobileOptimization))}>
            {metrics.mobileOptimization.toFixed(1)}%
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${metrics.mobileOptimization}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Biểu đồ hiệu suất theo thời gian</CardTitle>
        <CardDescription>
          Theo dõi các chỉ số hiệu suất quan trọng trong {selectedTimeRange === 'week' ? '7 ngày' : '30 ngày'} qua
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Biểu đồ hiệu suất sẽ được implement với chart library
        </div>
      </CardContent>
    </Card>
  );

  // ===== MAIN RENDER =====

  return (
    <div className={cn("content-analytics-dashboard", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Dashboard phân tích nội dung
              </CardTitle>
              <CardDescription>
                Theo dõi hiệu suất và chất lượng nội dung lý thuyết
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as typeof selectedTimeRange)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Hôm nay</SelectItem>
                  <SelectItem value="week">7 ngày</SelectItem>
                  <SelectItem value="month">30 ngày</SelectItem>
                  <SelectItem value="year">1 năm</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
              
              {enableExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Xuất báo cáo
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
              <TabsTrigger value="quality">Chất lượng</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {renderOverviewMetrics()}
              {showQualityMetrics && renderQualityMetrics()}
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-6">
              {showPerformanceMetrics && renderPerformanceChart()}
            </TabsContent>
            
            <TabsContent value="quality" className="space-y-6">
              {showQualityMetrics && renderQualityMetrics()}
              
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết chất lượng nội dung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Detailed quality analysis sẽ được implement trong version tiếp theo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
