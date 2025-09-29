/**
 * Admin Exam Analytics Page
 * System-wide exam analytics and performance metrics
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText,
  Clock,
  Target,
  Award,
  Download
} from 'lucide-react';

// UI Components
import { 
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Paths
import { ADMIN_PATHS } from '@/lib/admin-paths';

// ===== TYPES =====

interface ExamAnalytics {
  totalExams: number;
  activeExams: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  popularSubjects: Array<{
    subject: string;
    examCount: number;
    attemptCount: number;
  }>;
  recentActivity: Array<{
    date: string;
    examsCreated: number;
    attemptsCompleted: number;
  }>;
}

// ===== CONSTANTS =====

const MOCK_ANALYTICS: ExamAnalytics = {
  totalExams: 156,
  activeExams: 89,
  totalAttempts: 2847,
  averageScore: 78.5,
  passRate: 82.3,
  popularSubjects: [
    { subject: 'Toán học', examCount: 45, attemptCount: 892 },
    { subject: 'Tiếng Anh', examCount: 38, attemptCount: 756 },
    { subject: 'Vật lý', examCount: 32, attemptCount: 634 },
    { subject: 'Hóa học', examCount: 28, attemptCount: 521 },
    { subject: 'Sinh học', examCount: 13, attemptCount: 244 },
  ],
  recentActivity: [
    { date: '2025-01-19', examsCreated: 5, attemptsCompleted: 89 },
    { date: '2025-01-18', examsCreated: 3, attemptsCompleted: 76 },
    { date: '2025-01-17', examsCreated: 7, attemptsCompleted: 92 },
    { date: '2025-01-16', examsCreated: 2, attemptsCompleted: 68 },
    { date: '2025-01-15', examsCreated: 4, attemptsCompleted: 84 },
  ],
};

// ===== MAIN COMPONENT =====

/**
 * Admin Exam Analytics Page Component
 * Comprehensive analytics dashboard for exam system
 */
export default function AdminExamAnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // ===== STATE =====

  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // ===== HANDLERS =====

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    
    try {
      // TODO: Replace with real API call
      // const data = await ExamService.getAnalytics();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalytics(MOCK_ANALYTICS);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu thống kê',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleBack = () => {
    router.push(ADMIN_PATHS.EXAMS);
  };

  const handleExport = () => {
    toast({
      title: 'Thông báo',
      description: 'Tính năng xuất báo cáo đang được phát triển',
      variant: 'default'
    });
  };

  // ===== EFFECTS =====

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // ===== RENDER =====

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Thống kê đề thi</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-muted-foreground">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Thống kê đề thi</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-muted-foreground">Không thể tải dữ liệu thống kê</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thống kê đề thi</h1>
            <p className="text-muted-foreground">
              Phân tích hiệu suất và xu hướng của hệ thống đề thi
            </p>
          </div>
        </div>

        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số đề thi</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalExams}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeExams} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt thi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAttempts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số lượt thi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Điểm số trung bình
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ đậu</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.passRate}%</div>
            <p className="text-xs text-muted-foreground">
              Tỷ lệ học sinh đậu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Môn học phổ biến</CardTitle>
            <CardDescription>
              Số lượng đề thi và lượt thi theo môn học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popularSubjects.map((subject, index) => (
                <div key={subject.subject} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{subject.subject}</div>
                      <div className="text-sm text-muted-foreground">
                        {subject.examCount} đề thi
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{subject.attemptCount}</div>
                    <div className="text-sm text-muted-foreground">lượt thi</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Đề thi được tạo và lượt thi hoàn thành trong 5 ngày qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity) => (
                <div key={activity.date} className="flex items-center justify-between">
                  <div className="font-medium">
                    {new Date(activity.date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-blue-600" />
                      <span>{activity.examsCreated} đề thi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-green-600" />
                      <span>{activity.attemptsCompleted} lượt thi</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết</CardTitle>
          <CardDescription>
            Phân tích hiệu suất và đề xuất cải thiện
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-green-900">Xu hướng tích cực</div>
              <div className="text-sm text-green-700 mt-1">
                Số lượng đề thi và lượt thi đang tăng đều
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-medium text-blue-900">Hiệu suất cao</div>
              <div className="text-sm text-blue-700 mt-1">
                Tỷ lệ đậu cao cho thấy chất lượng đề thi tốt
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-medium text-orange-900">Cần cải thiện</div>
              <div className="text-sm text-orange-700 mt-1">
                Một số môn học cần thêm đề thi
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
