/**
 * Image Management Dashboard
 * Main dashboard component với statistics, tabs, và comprehensive image management
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/form/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Badge } from '@/components/ui/display/badge';
import { cn } from '@/lib/utils';
import {
  Images,
  Upload,
  BarChart3,
  Settings,
  RefreshCw,
  Database,
  Cloud,
  Activity,
  TrendingUp,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader2
} from 'lucide-react';

// Import tab components
import GalleryTab from './tabs/GalleryTab';
import UploadTab from './tabs/UploadTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import SettingsTab from './tabs/SettingsTab';

// ===== TYPES =====

interface ImageStatistics {
  totalImages: number;
  totalSize: string;
  uploadedToday: number;
  successRate: number;
  storageUsed: string;
  bandwidthUsed: string;
  pendingUploads: number;
  failedUploads: number;
  lastUpdated: Date;
}

interface ImageManagementDashboardProps {
  initialTab?: 'gallery' | 'upload' | 'analytics' | 'settings';
  questionId?: string;
  questionCode?: string;
  className?: string;
}

// ===== MOCK DATA SERVICE =====

class ImageStatisticsService {
  static async fetchStatistics(): Promise<ImageStatistics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate realistic mock data
    return {
      totalImages: 2847,
      totalSize: '1.2 GB',
      uploadedToday: 23,
      successRate: 94.7,
      storageUsed: '1.2 GB / 5 GB',
      bandwidthUsed: '847 MB / 10 GB',
      pendingUploads: 5,
      failedUploads: 12,
      lastUpdated: new Date(),
    };
  }
}

// ===== STATISTICS CARDS COMPONENT =====

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  isLoading?: boolean;
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  status = 'info',
  isLoading = false 
}: StatCardProps) {
  const statusColors = {
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
  };

  const iconColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', statusColors[status])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('p-2 rounded-lg bg-white/50', iconColors[status])}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
              </div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : value}
              </p>
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
            </div>
          </div>

          {trend && !isLoading && (
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              trend.isPositive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            )}>
              <TrendingUp className={cn(
                'h-3 w-3',
                !trend.isPositive && 'rotate-180'
              )} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ===== MAIN DASHBOARD COMPONENT =====

export default function ImageManagementDashboard({
  initialTab = 'gallery',
  questionId,
  questionCode,
  className,
}: ImageManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [statistics, setStatistics] = useState<ImageStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load statistics
  const loadStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await ImageStatisticsService.fetchStatistics();
      setStatistics(stats);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadStatistics();
  }, []);

  // Auto refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadStatistics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng số hình ảnh"
          value={statistics?.totalImages || 0}
          description="Trên toàn hệ thống"
          icon={<Images className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
          status="info"
          isLoading={isLoadingStats}
        />
        
        <StatCard
          title="Dung lượng lưu trữ"
          value={statistics?.storageUsed || '0 MB'}
          description="Cloudinary CDN"
          icon={<HardDrive className="h-4 w-4" />}
          status="success"
          isLoading={isLoadingStats}
        />
        
        <StatCard
          title="Upload hôm nay"
          value={statistics?.uploadedToday || 0}
          description={`Tỷ lệ thành công: ${statistics?.successRate || 0}%`}
          icon={<Upload className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
          status="success"
          isLoading={isLoadingStats}
        />
        
        <StatCard
          title="Trạng thái hệ thống"
          value={statistics?.failedUploads ? `${statistics.failedUploads} lỗi` : 'Ổn định'}
          description={`${statistics?.pendingUploads || 0} đang xử lý`}
          icon={statistics?.failedUploads ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          status={statistics?.failedUploads ? 'warning' : 'success'}
          isLoading={isLoadingStats}
        />
      </div>

      {/* Quick Actions & Last Updated */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStatistics}
            disabled={isLoadingStats}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoadingStats && 'animate-spin')} />
            Làm mới
          </Button>
          
          {statistics && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Cập nhật lúc: {lastRefresh.toLocaleTimeString('vi-VN')}
            </div>
          )}
        </div>

        {/* Context Info */}
        {(questionId || questionCode) && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {questionCode ? `Câu hỏi: ${questionCode}` : `ID: ${questionId}`}
            </Badge>
          </div>
        )}
      </div>

      {/* Main Tabs Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Quản lý hình ảnh
          </CardTitle>
          <CardDescription>
            Tổng quan và quản lý hình ảnh câu hỏi với Cloudinary CDN
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Images className="h-4 w-4" />
                <span className="hidden sm:inline">Thư viện</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Thống kê</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Cài đặt</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="space-y-4">
              <GalleryTab 
                questionId={questionId}
                questionCode={questionCode}
                statistics={statistics}
              />
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <UploadTab 
                questionId={questionId}
                questionCode={questionCode}
                onUploadComplete={loadStatistics}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <AnalyticsTab 
                statistics={statistics}
                isLoading={isLoadingStats}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
