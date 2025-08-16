/**
 * Analytics Dashboard Component
 * Advanced analytics dashboard với tab system và 3:1 layout
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  GraduationCap,
  Activity,
  Target,
  Clock,
  Download,
  Eye,
  Star,
  DollarSign
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';
import { Button } from '@/components/ui/form/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { StatCard } from '../dashboard/stat-card';
import { mockAnalytics } from '@/lib/mockdata/analytics';

/**
 * Analytics Dashboard Props
 */
export interface AnalyticsDashboardProps {
  className?: string;
}

/**
 * Tab Types for Analytics Dashboard
 */
type AnalyticsTab = 'user-growth' | 'activity-access' | 'course-stats';

/**
 * Analytics Dashboard Component
 * Advanced analytics dashboard với tab system và 3:1 layout
 */
export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [analyticsData] = useState(mockAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('user-growth');

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { performance, engagement } = analyticsData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header với period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            📊 Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Comprehensive analytics với customizable widgets
          </p>
        </div>

        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === '7d' ? '7 ngày' : period === '30d' ? '30 ngày' : '90 ngày'}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Layout: Full Width Charts Dashboard */}
      <div className="w-full">
        {/* Charts Dashboard */}
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AnalyticsTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="user-growth">Tăng trưởng người dùng</TabsTrigger>
              <TabsTrigger value="activity-access">Hoạt động truy cập</TabsTrigger>
              <TabsTrigger value="course-stats">Thống kê khóa học</TabsTrigger>
            </TabsList>

            {/* Tab 1: Tăng trưởng người dùng */}
            <TabsContent value="user-growth" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Thống kê truy cập
                  </CardTitle>
                  <CardDescription>Số lượng người dùng hoạt động trong 7 ngày qua</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">[Biểu đồ sẽ được thêm vào sau]</p>
                      <Badge variant="outline">Line Chart - User Growth</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>


            </TabsContent>

            {/* Tab 2: Hoạt động truy cập */}
            <TabsContent value="activity-access" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Truy cập câu hỏi */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Truy cập câu hỏi
                    </CardTitle>
                    <CardDescription>Thống kê làm bài và câu hỏi phổ biến</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Biểu đồ truy cập câu hỏi</p>
                        <Badge variant="outline" className="mt-2">Bar Chart</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Truy cập lý thuyết */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Truy cập lý thuyết
                    </CardTitle>
                    <CardDescription>Số lượt xem và thời gian đọc</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Biểu đồ truy cập lý thuyết</p>
                        <Badge variant="outline" className="mt-2">Line Chart</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tải tài liệu */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Tải tài liệu
                  </CardTitle>
                  <CardDescription>Số lượt download và tài liệu hot</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Biểu đồ tải tài liệu</p>
                      <Badge variant="outline" className="mt-2">Pie Chart</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Metrics */}
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Câu hỏi được làm"
                  value={engagement.questionsAnswered}
                  description="Tổng lượt làm bài"
                  icon={<Target className="h-4 w-4" />}
                  colorScheme="accent"
                />
                <StatCard
                  title="Thời gian đọc TB"
                  value={engagement.averageStudyTime}
                  description="Phút/session"
                  icon={<Clock className="h-4 w-4" />}
                  colorScheme="primary"
                />
                <StatCard
                  title="Tỷ lệ đúng"
                  value={engagement.correctAnswerRate}
                  description="Câu trả lời đúng"
                  icon={<Activity className="h-4 w-4" />}
                  colorScheme="success"
                  format="percentage"
                />
              </div>
            </TabsContent>

            {/* Tab 3: Thống kê khóa học */}
            <TabsContent value="course-stats" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Enrollment vs Completion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Enrollment vs Completion
                    </CardTitle>
                    <CardDescription>Tỷ lệ đăng ký và hoàn thành khóa học</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Biểu đồ Enrollment vs Completion</p>
                        <Badge variant="outline" className="mt-2">Bar Chart</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top khóa học */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Top khóa học
                    </CardTitle>
                    <CardDescription>Khóa học được yêu thích nhất</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Top khóa học yêu thích</p>
                        <Badge variant="outline" className="mt-2">Ranking List</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Doanh thu theo khóa học */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Doanh thu theo khóa học
                  </CardTitle>
                  <CardDescription>Thống kê doanh thu từng khóa học</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Biểu đồ doanh thu khóa học</p>
                      <Badge variant="outline" className="mt-2">Revenue Chart</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Stats Metrics */}
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Tổng doanh thu"
                  value={performance.totalRevenue}
                  description="Doanh thu tích lũy"
                  icon={<DollarSign className="h-4 w-4" />}
                  colorScheme="success"
                  format="currency"
                  trend={{
                    value: performance.revenueGrowth,
                    label: "so với tháng trước",
                    isPositive: performance.revenueGrowth > 0,
                  }}
                />
                <StatCard
                  title="Khóa học hoàn thành"
                  value={performance.coursesCompleted}
                  description="Khóa học đã hoàn thành"
                  icon={<GraduationCap className="h-4 w-4" />}
                  colorScheme="education"
                />
                <StatCard
                  title="Tỷ lệ hoàn thành"
                  value={performance.completionRate}
                  description="Completion rate"
                  icon={<Target className="h-4 w-4" />}
                  colorScheme="accent"
                  format="percentage"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>


      </div>
    </div>
  );
}

/**
 * Default export
 */
export default AnalyticsDashboard;
