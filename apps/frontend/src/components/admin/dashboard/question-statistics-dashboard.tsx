'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Target,
  Clock,
  RefreshCw,
  Eye,
  ThumbsUp,
  AlertCircle,
  CheckCircle,
  PieChart,
  Activity
} from 'lucide-react';

// Types for statistics data
interface QuestionStatistics {
  totalQuestions: number;
  activeQuestions: number;
  pendingQuestions: number;
  draftQuestions: number;
  gradeDistribution: Record<string, number>;
  subjectDistribution: Record<string, number>;
  chapterDistribution: Record<string, number>;
  levelDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  totalUsage: number;
  averageUsageCount: number;
  averageFeedback: number;
  questionsWithFeedback: number; // Added missing property
  questionsCreatedToday: number;
  questionsCreatedThisWeek: number;
  questionsCreatedThisMonth: number;
  questionsWithErrors: number;
  questionsWithWarnings: number;
  parseErrorRate: number;
  questionsWithImages: number;
  totalImages: number;
  imageUploadSuccessRate: number;
  lastUpdated: string;
}

interface DashboardSummary {
  totalQuestions: number;
  activeQuestions: number;
  todayCreated: number;
  weeklyGrowth: number;
  averageQuality: number;
  errorRate: number;
  completionRate: number;
  totalUsage: number;
  averageUsage: number;
  popularityScore: number;
  topGrade: string;
  topSubject: string;
  topType: string;
  topDifficulty: string;
  lastUpdated: string;
}

interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  colorScheme?: 'primary' | 'success' | 'warning' | 'error';
}

// Stat Card Component
const StatCard: React.FC<StatCard> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  colorScheme = 'primary' 
}) => {
  const getColorClasses = () => {
    switch (colorScheme) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-900';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-900';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-900';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-900';
    }
  };

  return (
    <Card className={`${getColorClasses()}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium opacity-70">{title}</p>
            <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {description && (
              <p className="text-xs opacity-60">{description}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-3 w-3 ${trend.isPositive ? '' : 'rotate-180'}`} />
                <span>{trend.isPositive ? '+' : ''}{trend.value}% {trend.label}</span>
              </div>
            )}
          </div>
          <div className="opacity-70">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Distribution Chart Component (Placeholder)
const DistributionChart: React.FC<{ 
  title: string; 
  data: Record<string, number>; 
  type: 'bar' | 'pie' 
}> = ({ title, data, type }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'pie' ? <PieChart className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => {
            const percentage = total > 0 ? (value / total * 100).toFixed(1) : '0';
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">{key}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
export const QuestionStatisticsDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<QuestionStatistics | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSubject, ] = useState('all');

  // Mock data for development
  useEffect(() => {
    const loadMockData = () => {
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const mockStatistics: QuestionStatistics = {
          totalQuestions: 15847,
          activeQuestions: 12456,
          pendingQuestions: 2891,
          draftQuestions: 500,
          gradeDistribution: {
            '6': 2500,
            '7': 3200,
            '8': 3800,
            '9': 4200,
            '10': 2147
          },
          subjectDistribution: {
            'Toán': 5200,
            'Lý': 3800,
            'Hóa': 3200,
            'Sinh': 2400,
            'Văn': 1247
          },
          chapterDistribution: {
            '1': 3200,
            '2': 2800,
            '3': 2600,
            '4': 2400,
            '5': 2200,
            'Khác': 2647
          },
          levelDistribution: {
            'N': 6200,
            'T': 4800,
            'V': 3200,
            'K': 1647
          },
          typeDistribution: {
            'MC': 8500,
            'TF': 3200,
            'SA': 2800,
            'ES': 1347
          },
          difficultyDistribution: {
            'EASY': 5200,
            'MEDIUM': 6800,
            'HARD': 3847
          },
          statusDistribution: {
            'ACTIVE': 12456,
            'PENDING': 2891,
            'DRAFT': 500
          },
          totalUsage: 125000,
          averageUsageCount: 7.9,
          averageFeedback: 4.2,
          questionsWithFeedback: 8500, // Added missing property
          questionsCreatedToday: 45,
          questionsCreatedThisWeek: 312,
          questionsCreatedThisMonth: 1247,
          questionsWithErrors: 156,
          questionsWithWarnings: 423,
          parseErrorRate: 0.98,
          questionsWithImages: 3200,
          totalImages: 4800,
          imageUploadSuccessRate: 96.5,
          lastUpdated: new Date().toISOString()
        };

        const mockSummary: DashboardSummary = {
          totalQuestions: 15847,
          activeQuestions: 12456,
          todayCreated: 45,
          weeklyGrowth: 12.5,
          averageQuality: 4.2,
          errorRate: 0.98,
          completionRate: 78.6,
          totalUsage: 125000,
          averageUsage: 7.9,
          popularityScore: 7.9,
          topGrade: '9',
          topSubject: 'Toán',
          topType: 'MC',
          topDifficulty: 'MEDIUM',
          lastUpdated: new Date().toISOString()
        };

        setStatistics(mockStatistics);
        setSummary(mockSummary);
        setLoading(false);
      }, 1000);
    };

    loadMockData();
  }, [selectedTimeRange, selectedGrade, selectedSubject]);

  const handleRefresh = () => {
    setError(null);
    // Reload data
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Đang tải thống kê...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!statistics || !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Không có dữ liệu thống kê</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📊 Thống kê câu hỏi</h2>
          <p className="text-muted-foreground">
            Cập nhật lần cuối: {new Date(statistics.lastUpdated).toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngày</SelectItem>
              <SelectItem value="30d">30 ngày</SelectItem>
              <SelectItem value="90d">90 ngày</SelectItem>
              <SelectItem value="1y">1 năm</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Lớp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>
              <SelectItem value="6">Lớp 6</SelectItem>
              <SelectItem value="7">Lớp 7</SelectItem>
              <SelectItem value="8">Lớp 8</SelectItem>
              <SelectItem value="9">Lớp 9</SelectItem>
              <SelectItem value="10">Lớp 10</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng câu hỏi"
          value={summary.totalQuestions}
          description="Tất cả câu hỏi trong hệ thống"
          icon={<BookOpen className="h-6 w-6" />}
          trend={{
            value: summary.weeklyGrowth,
            isPositive: summary.weeklyGrowth > 0,
            label: "tuần này"
          }}
          colorScheme="primary"
        />
        <StatCard
          title="Câu hỏi hoạt động"
          value={summary.activeQuestions}
          description={`${summary.completionRate.toFixed(1)}% tổng số`}
          icon={<CheckCircle className="h-6 w-6" />}
          colorScheme="success"
        />
        <StatCard
          title="Tạo hôm nay"
          value={summary.todayCreated}
          description="Câu hỏi mới được tạo"
          icon={<TrendingUp className="h-6 w-6" />}
          colorScheme="primary"
        />
        <StatCard
          title="Chất lượng TB"
          value={`${summary.averageQuality.toFixed(1)}/5`}
          description={`Tỷ lệ lỗi: ${summary.errorRate.toFixed(2)}%`}
          icon={<Target className="h-6 w-6" />}
          colorScheme={summary.averageQuality >= 4 ? "success" : summary.averageQuality >= 3 ? "warning" : "error"}
        />
      </div>

      {/* Detailed statistics tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="distribution">Phân bố</TabsTrigger>
          <TabsTrigger value="usage">Sử dụng</TabsTrigger>
          <TabsTrigger value="quality">Chất lượng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Tổng lượt sử dụng"
              value={statistics.totalUsage}
              description={`TB: ${statistics.averageUsageCount.toFixed(1)} lượt/câu`}
              icon={<Activity className="h-6 w-6" />}
              colorScheme="primary"
            />
            <StatCard
              title="Có hình ảnh"
              value={statistics.questionsWithImages}
              description={`${statistics.totalImages} hình ảnh`}
              icon={<Eye className="h-6 w-6" />}
              colorScheme="primary"
            />
            <StatCard
              title="Đánh giá TB"
              value={`${statistics.averageFeedback.toFixed(1)}/5`}
              description={`${statistics.questionsWithFeedback} câu có đánh giá`}
              icon={<ThumbsUp className="h-6 w-6" />}
              colorScheme="success"
            />
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <DistributionChart 
              title="Phân bố theo lớp" 
              data={statistics.gradeDistribution} 
              type="bar" 
            />
            <DistributionChart 
              title="Phân bố theo môn học" 
              data={statistics.subjectDistribution} 
              type="pie" 
            />
            <DistributionChart 
              title="Phân bố theo loại câu hỏi" 
              data={statistics.typeDistribution} 
              type="bar" 
            />
            <DistributionChart 
              title="Phân bố theo độ khó" 
              data={statistics.difficultyDistribution} 
              type="pie" 
            />
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Tạo hôm nay"
              value={statistics.questionsCreatedToday}
              icon={<Clock className="h-6 w-6" />}
              colorScheme="primary"
            />
            <StatCard
              title="Tạo tuần này"
              value={statistics.questionsCreatedThisWeek}
              icon={<Clock className="h-6 w-6" />}
              colorScheme="primary"
            />
            <StatCard
              title="Tạo tháng này"
              value={statistics.questionsCreatedThisMonth}
              icon={<Clock className="h-6 w-6" />}
              colorScheme="primary"
            />
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Có lỗi"
              value={statistics.questionsWithErrors}
              description={`${statistics.parseErrorRate.toFixed(2)}% tổng số`}
              icon={<AlertCircle className="h-6 w-6" />}
              colorScheme="error"
            />
            <StatCard
              title="Có cảnh báo"
              value={statistics.questionsWithWarnings}
              icon={<AlertCircle className="h-6 w-6" />}
              colorScheme="warning"
            />
            <StatCard
              title="Upload ảnh thành công"
              value={`${statistics.imageUploadSuccessRate.toFixed(1)}%`}
              description={`${statistics.totalImages} ảnh`}
              icon={<CheckCircle className="h-6 w-6" />}
              colorScheme="success"
            />
            <StatCard
              title="Hoàn thiện"
              value={`${summary.completionRate.toFixed(1)}%`}
              description="Câu hỏi hoạt động"
              icon={<Target className="h-6 w-6" />}
              colorScheme="success"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionStatisticsDashboard;
