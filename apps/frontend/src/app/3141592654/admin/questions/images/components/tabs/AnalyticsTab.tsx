/**
 * Analytics Tab Component
 * Image analytics dashboard với charts, metrics và reporting
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/form/button';
import { Badge } from '@/components/ui/display/badge';
import { Progress } from '@/components/ui/display/progress';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  HardDrive,
  Zap,
  Users,
  FileImage,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  PieChart,
  Activity
} from 'lucide-react';

// ===== TYPES =====

interface AnalyticsTabProps {
  statistics?: {
    totalImages: number;
    uploadedToday: number;
    successRate: number;
    failedUploads: number;
  } | null;
  isLoading?: boolean;
  className?: string;
}

interface AnalyticsData {
  uploadTrends: {
    date: string;
    uploads: number;
    success: number;
    failed: number;
  }[];
  storageUsage: {
    used: number;
    total: number;
    breakdown: {
      questions: number;
      solutions: number;
      other: number;
    };
  };
  topQuestions: {
    questionCode: string;
    imageCount: number;
    totalSize: string;
    lastUpload: Date;
  }[];
  performanceMetrics: {
    averageUploadTime: number;
    averageFileSize: number;
    bandwidthUsage: number;
    cacheHitRate: number;
  };
  imageTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

// ===== MOCK ANALYTICS SERVICE =====

class AnalyticsService {
  static async fetchAnalytics(): Promise<AnalyticsData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Generate mock analytics data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        uploads: Math.floor(Math.random() * 50) + 10,
        success: Math.floor(Math.random() * 45) + 8,
        failed: Math.floor(Math.random() * 5),
      };
    });

    return {
      uploadTrends: last7Days,
      storageUsage: {
        used: 1200, // MB
        total: 5000, // MB
        breakdown: {
          questions: 720,
          solutions: 420,
          other: 60,
        },
      },
      topQuestions: [
        { questionCode: 'ANHVD1', imageCount: 24, totalSize: '12.4 MB', lastUpload: new Date() },
        { questionCode: 'BTHCT2', imageCount: 18, totalSize: '9.2 MB', lastUpload: new Date() },
        { questionCode: 'CVATM3', imageCount: 15, totalSize: '7.8 MB', lastUpload: new Date() },
        { questionCode: 'DHLTN4', imageCount: 12, totalSize: '6.1 MB', lastUpload: new Date() },
        { questionCode: 'EVHND5', imageCount: 10, totalSize: '5.3 MB', lastUpload: new Date() },
      ],
      performanceMetrics: {
        averageUploadTime: 2.3, // seconds
        averageFileSize: 0.8, // MB
        bandwidthUsage: 847, // MB this month
        cacheHitRate: 94.2, // percentage
      },
      imageTypes: [
        { type: 'Câu hỏi', count: 1523, percentage: 53.5 },
        { type: 'Lời giải', count: 1324, percentage: 46.5 },
      ],
    };
  }
}

// ===== CHART COMPONENTS =====

function TrendChart({ 
  data, 
  title 
}: { 
  data: { date: string; uploads: number; success: number; failed: number }[];
  title: string;
}) {
  const maxValue = Math.max(...data.map(d => d.uploads));
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-16 text-xs text-gray-600">
              {new Date(item.date).toLocaleDateString('vi-VN', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="flex-1 flex items-center gap-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                <div
                  className="absolute top-0 left-0 h-2 bg-green-500 rounded-full"
                  style={{ width: `${(item.success / maxValue) * 100}%` }}
                />
                <div
                  className="absolute top-0 bg-red-500 rounded-full h-2"
                  style={{ 
                    left: `${(item.success / maxValue) * 100}%`,
                    width: `${(item.failed / maxValue) * 100}%` 
                  }}
                />
              </div>
              <div className="text-xs text-gray-600 w-8">
                {item.uploads}
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 bg-green-500 rounded"></div>
            <span>Thành công</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 bg-red-500 rounded"></div>
            <span>Lỗi</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== METRIC CARDS =====

function MetricCard({
  title,
  value,
  unit,
  trend,
  icon,
  color = 'blue'
}: {
  title: string;
  value: number | string;
  unit?: string;
  trend?: { value: number; isPositive: boolean };
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
  };

  return (
    <div className={cn('p-4 rounded-lg border', colorClasses[color])}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-white rounded-lg">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            trend.isPositive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          )}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">
          {value}{unit && <span className="text-lg text-gray-600 ml-1">{unit}</span>}
        </p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
}

// ===== MAIN ANALYTICS TAB COMPONENT =====

export default function AnalyticsTab({
  className,
}: AnalyticsTabProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load analytics data
  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await AnalyticsService.fetchAnalytics();
      setAnalyticsData(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAnalytics();
  }, []);

  // Export analytics data
  const handleExportData = () => {
    console.log('Exporting analytics data...');
    // In real implementation, would generate and download CSV/Excel file
  };

  if (isLoading || !analyticsData) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Thống kê & Phân tích</h3>
          <p className="text-sm text-gray-600">
            Báo cáo chi tiết về upload, storage và performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Làm mới
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Thời gian upload TB"
          value={analyticsData.performanceMetrics.averageUploadTime}
          unit="s"
          trend={{ value: 15, isPositive: false }}
          icon={<Clock className="h-4 w-4" />}
          color="blue"
        />
        
        <MetricCard
          title="Kích thước file TB"
          value={analyticsData.performanceMetrics.averageFileSize}
          unit="MB"
          trend={{ value: 8, isPositive: true }}
          icon={<FileImage className="h-4 w-4" />}
          color="green"
        />
        
        <MetricCard
          title="Bandwidth sử dụng"
          value={analyticsData.performanceMetrics.bandwidthUsage}
          unit="MB"
          trend={{ value: 23, isPositive: true }}
          icon={<Activity className="h-4 w-4" />}
          color="purple"
        />
        
        <MetricCard
          title="Cache hit rate"
          value={analyticsData.performanceMetrics.cacheHitRate}
          unit="%"
          trend={{ value: 2, isPositive: true }}
          icon={<Zap className="h-4 w-4" />}
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Xu hướng upload (7 ngày qua)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart 
              data={analyticsData.uploadTrends}
              title=""
            />
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4" />
              Sử dụng storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Đã sử dụng</span>
                <span className="font-medium">
                  {analyticsData.storageUsage.used} MB / {analyticsData.storageUsage.total} MB
                </span>
              </div>
              <Progress 
                value={(analyticsData.storageUsage.used / analyticsData.storageUsage.total) * 100} 
                className="h-3"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Câu hỏi</span>
                </div>
                <span className="text-sm font-medium">{analyticsData.storageUsage.breakdown.questions} MB</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Lời giải</span>
                </div>
                <span className="text-sm font-medium">{analyticsData.storageUsage.breakdown.solutions} MB</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Khác</span>
                </div>
                <span className="text-sm font-medium">{analyticsData.storageUsage.breakdown.other} MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Questions & Image Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Questions by Image Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Top câu hỏi theo số lượng hình ảnh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topQuestions.map((question, index) => (
                <div key={question.questionCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{question.questionCode}</p>
                      <p className="text-xs text-gray-500">
                        {question.totalSize} • {question.lastUpload.toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {question.imageCount} ảnh
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Image Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-4 w-4" />
              Phân bố loại hình ảnh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.imageTypes.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{type.count}</span>
                      <Badge variant="outline">{type.percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={type.percentage} className="h-2" />
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <CheckCircle className="h-4 w-4" />
                <span>
                  Tổng cộng: {analyticsData.imageTypes.reduce((sum, type) => sum + type.count, 0)} hình ảnh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Tình trạng hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Upload Service</p>
                <p className="text-sm text-green-700">Hoạt động bình thường</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Cloudinary CDN</p>
                <p className="text-sm text-green-700">Kết nối ổn định</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Storage Usage</p>
                <p className="text-sm text-yellow-700">24% đã sử dụng</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
