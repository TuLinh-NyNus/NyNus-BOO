'use client';

import { 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Calendar,
  Users,
  BookOpen
} from 'lucide-react';
import React from 'react';

import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";

/**
 * Dashboard Charts Component
 * 
 * Component hiển thị các biểu đồ thống kê:
 * - Biểu đồ người dùng theo thời gian
 * - Biểu đồ phân bố khóa học
 * - Biểu đồ hoạt động hàng ngày
 * - Xu hướng đăng ký
 */

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

function MockBarChart({ data, title }: { data: ChartData[]; title: string }): JSX.Element {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs w-16 text-right">{item.label}</span>
            <div className="flex-1 bg-muted rounded-full h-2 relative">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs w-12 text-muted-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockPieChart({ data, title }: { data: ChartData[]; title: string }): JSX.Element {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
                />
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{percentage}%</span>
                <span className="text-xs text-muted-foreground ml-1">({item.value})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardCharts(): JSX.Element {
  // Mock data cho các biểu đồ
  const userGrowthData: ChartData[] = [
    { label: 'T1', value: 120 },
    { label: 'T2', value: 150 },
    { label: 'T3', value: 180 },
    { label: 'T4', value: 220 },
    { label: 'T5', value: 280 },
    { label: 'T6', value: 320 },
    { label: 'T7', value: 380 },
  ];

  const courseDistributionData: ChartData[] = [
    { label: 'Toán học', value: 25, color: '#3b82f6' },
    { label: 'Vật lý', value: 20, color: '#ef4444' },
    { label: 'Hóa học', value: 18, color: '#10b981' },
    { label: 'Sinh học', value: 15, color: '#f59e0b' },
    { label: 'Khác', value: 7, color: '#8b5cf6' },
  ];

  const dailyActivityData: ChartData[] = [
    { label: 'CN', value: 45 },
    { label: 'T2', value: 120 },
    { label: 'T3', value: 135 },
    { label: 'T4', value: 128 },
    { label: 'T5', value: 142 },
    { label: 'T6', value: 156 },
    { label: 'T7', value: 89 },
  ];

  const enrollmentTrendsData: ChartData[] = [
    { label: 'Tháng 1', value: 89 },
    { label: 'Tháng 2', value: 156 },
    { label: 'Tháng 3', value: 234 },
    { label: 'Tháng 4', value: 198 },
    { label: 'Tháng 5', value: 267 },
    { label: 'Tháng 6', value: 312 },
  ];

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tăng trưởng người dùng
            </CardTitle>
            <CardDescription>
              Số lượng người dùng mới theo tuần
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockBarChart data={userGrowthData} title="Người dùng mới (7 tuần qua)" />
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+23% so với tuần trước</span>
            </div>
          </CardContent>
        </Card>

        {/* Course Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Phân bố khóa học
            </CardTitle>
            <CardDescription>
              Tỷ lệ khóa học theo môn học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockPieChart data={courseDistributionData} title="Khóa học theo môn" />
            <div className="mt-4">
              <Badge variant="secondary">Tổng: 85 khóa học</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Hoạt động hàng ngày
            </CardTitle>
            <CardDescription>
              Số lượng đăng nhập theo ngày trong tuần
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockBarChart data={dailyActivityData} title="Đăng nhập theo ngày" />
            <div className="mt-4 text-sm text-muted-foreground">
              Cao điểm: Thứ 6 (156 đăng nhập)
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Xu hướng đăng ký
            </CardTitle>
            <CardDescription>
              Số lượng đăng ký khóa học theo tháng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockBarChart data={enrollmentTrendsData} title="Đăng ký theo tháng" />
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+17% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt hiệu suất</CardTitle>
          <CardDescription>
            Các chỉ số quan trọng trong tháng này
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">312</div>
              <div className="text-sm text-muted-foreground">Đăng ký mới</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <div className="text-sm text-muted-foreground">Đánh giá TB</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-muted-foreground">Người dùng hoạt động</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Default export for lazy loading
export default DashboardCharts;
