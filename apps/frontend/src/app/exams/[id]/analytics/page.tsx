/**
 * Exam Analytics Page
 * Page hiển thị phân tích chi tiết đề thi cho Teacher/Admin
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, TrendingUp, Clock, Download,
  CheckCircle, Target, AlertCircle, ArrowLeft,
  Trophy
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/auth-context-grpc';
import { UserRole } from '@/types/user';
import { Exam, ExamStatistics, ExamStatus, ExamType } from '@/types/exam';
import { QuestionDifficulty } from '@/types/question';

// ===== TYPES =====

interface ExamAnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface QuestionStatistics {
  questionId: string;
  correctAnswers: number;
  totalAnswers: number;
  correctRate: number;
  averageTimeSpent: number;
}

interface AnalyticsState {
  exam: Exam | null;
  statistics: ExamStatistics | null;
  questionStats: QuestionStatistics[];
  loading: boolean;
  error: string | null;
}

interface DateFilter {
  from: Date | null;
  to: Date | null;
}

// ===== CONSTANTS =====

const STATS_CONFIG = [
  { key: 'totalAttempts', label: 'Tổng lượt thi', icon: Users, color: 'text-blue-600' },
  { key: 'averageScore', label: 'Điểm trung bình', icon: TrendingUp, color: 'text-green-600' },
  { key: 'passRate', label: 'Tỷ lệ đạt', icon: CheckCircle, color: 'text-emerald-600' },
  { key: 'completionRate', label: 'Tỷ lệ hoàn thành', icon: Target, color: 'text-purple-600' },
  { key: 'averageTime', label: 'Thời gian TB', icon: Clock, color: 'text-orange-600' }
] as const;

// ===== MAIN COMPONENT =====

/**
 * Exam Analytics Page Component
 * Server component wrapper cho exam analytics page
 */
export default function ExamAnalyticsPage({ params }: ExamAnalyticsPageProps) {
  const [examId, setExamId] = React.useState<string>('');
  
  React.useEffect(() => {
    params.then(p => setExamId(p.id));
  }, [params]);
  
  if (!examId) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  return <ExamAnalyticsClient examId={examId} />;
}

// ===== CLIENT COMPONENT =====

/**
 * Exam Analytics Client Component
 * Client component với role-based access control
 */
function ExamAnalyticsClient({ examId }: { examId: string }) {
  const { user } = useAuth();
  const router = useRouter();

  // State Management
  const [state, setState] = useState<AnalyticsState>({
    exam: null,
    statistics: null,
    questionStats: [],
    loading: true,
    error: null
  });
  const [_dateFilter, _setDateFilter] = useState<DateFilter>({ from: null, to: null });
  const [activeTab, setActiveTab] = useState('overview');

  // Data Loading (MUST BE BEFORE EARLY RETURN)
  const loadAnalytics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // TODO: Replace with actual gRPC calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockExam: Exam = {
        id: examId,
        title: 'Kiểm tra Toán 12 - Chương 1',
        description: 'Đề kiểm tra chương 1: Ứng dụng đạo hàm',
        instructions: 'Làm bài trong thời gian quy định. Không sử dụng tài liệu.',
        subject: 'Toán',
        grade: 12,
        durationMinutes: 45,
        totalPoints: 100,
        passPercentage: 60,
        examType: ExamType.GENERATED,
        status: ExamStatus.ACTIVE,
        difficulty: QuestionDifficulty.MEDIUM,
        tags: ['toán-12', 'đạo-hàm', 'chương-1'],
        shuffleQuestions: true,
        showResults: true,
        maxAttempts: 3,
        version: 1,
        questionIds: [],
        createdBy: 'teacher-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const mockStatistics: ExamStatistics = {
        examId,
        totalAttempts: 156,
        completedAttempts: 142,
        averageScore: 75.5,
        passRate: 82.4,
        averageTimeSpent: 2580, // seconds
        difficultyDistribution: {
          [QuestionDifficulty.EASY]: 5,
          [QuestionDifficulty.MEDIUM]: 10,
          [QuestionDifficulty.HARD]: 8,
          [QuestionDifficulty.EXPERT]: 2
        },
        scoreDistribution: [
          { range: '0-20', count: 3 },
          { range: '21-40', count: 8 },
          { range: '41-60', count: 25 },
          { range: '61-80', count: 58 },
          { range: '81-100', count: 48 }
        ]
      };
      
      const mockQuestionStats: QuestionStatistics[] = [
        {
          questionId: '1',
          totalAnswers: 142,
          correctAnswers: 128,
          correctRate: 90.1,
          averageTimeSpent: 120
        },
        {
          questionId: '2',
          totalAnswers: 142,
          correctAnswers: 95,
          correctRate: 66.9,
          averageTimeSpent: 180
        },
        {
          questionId: '3',
          totalAnswers: 142,
          correctAnswers: 78,
          correctRate: 54.9,
          averageTimeSpent: 240
        }
      ];
      
      setState({
        exam: mockExam,
        statistics: mockStatistics,
        questionStats: mockQuestionStats,
        loading: false,
        error: null
      });
    } catch (_err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Không thể tải dữ liệu phân tích'
      }));
    }
  }, [examId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Export Handlers
  const handleExportCSV = async () => {
    // TODO: Implement CSV export
    console.log('Export CSV');
  };

  const handleExportPDF = async () => {
    // TODO: Implement PDF export
    console.log('Export PDF');
  };

  // Role Check - Teacher/Admin only (AFTER ALL HOOKS)
  if (!user || (user.role !== UserRole.USER_ROLE_TEACHER && user.role !== UserRole.USER_ROLE_ADMIN)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Không có quyền truy cập
            </CardTitle>
            <CardDescription>
              Bạn cần có quyền giáo viên hoặc quản trị viên để xem phân tích đề thi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Về Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Functions
  const renderStatsCards = () => {
    if (!state.statistics) return null;
    
    const stats = state.statistics;
    const completionRate = (stats.completedAttempts / stats.totalAttempts) * 100;
    
    const values = {
      totalAttempts: stats.totalAttempts,
      averageScore: stats.averageScore.toFixed(1),
      passRate: stats.passRate.toFixed(1),
      completionRate: completionRate.toFixed(1),
      averageTime: Math.floor(stats.averageTimeSpent / 60)
    };
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        {STATS_CONFIG.map((config) => {
          const Icon = config.icon;
          const value = values[config.key as keyof typeof values];
          
          return (
            <Card key={config.key} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {value}
                  {config.key === 'averageScore' || config.key === 'passRate' || config.key === 'completionRate' ? '%' : ''}
                  {config.key === 'averageTime' ? ' phút' : ''}
                </div>
                <p className="text-xs text-muted-foreground">
                  {config.key === 'totalAttempts' && 'Tổng số lượt thi'}
                  {config.key === 'averageScore' && 'Điểm trung bình'}
                  {config.key === 'passRate' && 'Học sinh đạt yêu cầu'}
                  {config.key === 'completionRate' && 'Hoàn thành bài thi'}
                  {config.key === 'averageTime' && 'Thời gian làm bài'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  // Loading State
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500/20 via-green-500/10 to-blue-500/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div>
                <p className="font-medium">Đang tải dữ liệu phân tích...</p>
                <p className="text-sm text-muted-foreground">Vui lòng đợi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error State
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500/20 via-green-500/10 to-blue-500/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Lỗi tải dữ liệu
            </CardTitle>
            <CardDescription>{state.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={loadAnalytics} className="flex-1">
                Thử lại
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500/20 via-green-500/10 to-blue-500/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Phân tích đề thi</h1>
            </div>
            <p className="text-muted-foreground ml-12">{state.exam?.title}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Xuất CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Xuất PDF
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        {renderStatsCards()}
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Hiệu suất
            </TabsTrigger>
            <TabsTrigger value="questions">
              <Target className="h-4 w-4 mr-2" />
              Câu hỏi
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              Học sinh
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Phân bố điểm số
                  </CardTitle>
                  <CardDescription>Phân bố điểm của học sinh</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.statistics?.scoreDistribution.map((item) => {
                      const total = state.statistics?.totalAttempts || 1;
                      const percentage = (item.count / total) * 100;

                      return (
                        <div key={item.range} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.range} điểm</span>
                            <span className="text-muted-foreground">
                              {item.count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Difficulty Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Phân bố độ khó
                  </CardTitle>
                  <CardDescription>Số lượng câu hỏi theo độ khó</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(state.statistics?.difficultyDistribution || {}).map(([difficulty, count]) => {
                      const total = Object.values(state.statistics?.difficultyDistribution || {}).reduce((a, b) => a + b, 0);
                      const percentage = (count / total) * 100;

                      const difficultyLabels: Record<string, string> = {
                        [QuestionDifficulty.EASY]: 'Dễ',
                        [QuestionDifficulty.MEDIUM]: 'Trung bình',
                        [QuestionDifficulty.HARD]: 'Khó',
                        [QuestionDifficulty.EXPERT]: 'Rất khó'
                      };

                      const difficultyColors: Record<string, string> = {
                        [QuestionDifficulty.EASY]: 'text-green-600',
                        [QuestionDifficulty.MEDIUM]: 'text-yellow-600',
                        [QuestionDifficulty.HARD]: 'text-orange-600',
                        [QuestionDifficulty.EXPERT]: 'text-red-600'
                      };

                      return (
                        <div key={difficulty} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className={`font-medium ${difficultyColors[difficulty]}`}>
                              {difficultyLabels[difficulty]}
                            </span>
                            <span className="text-muted-foreground">
                              {count} câu ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Nhận xét hiệu suất
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Positive Insight */}
                  {state.statistics && state.statistics.passRate >= 70 && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="font-medium text-green-900">Tỷ lệ đạt cao</div>
                      <div className="text-sm text-green-700 mt-1">
                        {state.statistics.passRate.toFixed(1)}% học sinh đạt yêu cầu
                      </div>
                    </div>
                  )}

                  {/* Average Score Insight */}
                  {state.statistics && state.statistics.averageScore >= 70 && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-medium text-blue-900">Điểm trung bình tốt</div>
                      <div className="text-sm text-blue-700 mt-1">
                        Điểm TB: {state.statistics.averageScore.toFixed(1)}/100
                      </div>
                    </div>
                  )}

                  {/* Completion Rate Insight */}
                  {state.statistics && (state.statistics.completedAttempts / state.statistics.totalAttempts) >= 0.9 && (
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="font-medium text-purple-900">Tỷ lệ hoàn thành cao</div>
                      <div className="text-sm text-purple-700 mt-1">
                        {((state.statistics.completedAttempts / state.statistics.totalAttempts) * 100).toFixed(1)}% hoàn thành
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Phân tích hiệu suất</CardTitle>
                <CardDescription>Hiệu suất theo độ khó và loại câu hỏi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Biểu đồ hiệu suất</p>
                  <p className="text-sm mt-2">
                    Biểu đồ phân tích hiệu suất theo độ khó và loại câu hỏi sẽ được hiển thị ở đây
                  </p>
                  <p className="text-xs mt-4 text-muted-foreground/70">
                    (Cần cài đặt chart library như Recharts hoặc Chart.js)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Phân tích câu hỏi
                </CardTitle>
                <CardDescription>Câu hỏi khó nhất và dễ nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.questionStats
                    .sort((a, b) => a.correctRate - b.correctRate)
                    .slice(0, 5)
                    .map((stat, index) => (
                      <div key={stat.questionId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            stat.correctRate < 50 ? 'bg-red-100 text-red-600' :
                            stat.correctRate < 70 ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">Câu hỏi #{stat.questionId}</div>
                            <div className="text-sm text-muted-foreground">
                              {stat.totalAnswers} lượt trả lời • {stat.correctAnswers} đúng
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {stat.correctRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Tỷ lệ đúng
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Phân tích học sinh
                </CardTitle>
                <CardDescription>Top học sinh và phân bố hiệu suất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Dữ liệu học sinh</p>
                  <p className="text-sm mt-2">
                    Danh sách top học sinh và phân tích hiệu suất chi tiết sẽ được hiển thị ở đây
                  </p>
                  <p className="text-xs mt-4 text-muted-foreground/70">
                    (Cần API endpoint để lấy dữ liệu học sinh)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

