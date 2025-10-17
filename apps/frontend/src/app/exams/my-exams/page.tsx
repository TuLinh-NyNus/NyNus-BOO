/**
 * My Exams Page (Student)
 * Student's enrolled exams with progress tracking
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';

// UI Components
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

// Hooks
import { useAuth } from '@/contexts/auth-context-grpc';

// Types
import { Exam, ExamFilters, ExamStatus } from '@/types/exam';

// Services
import { ExamService } from '@/services/grpc/exam.service';

// Components
import { ExamCard } from '@/components/features/exams/shared/exam-card';

// Paths
import { EXAM_ROUTES, EXAM_DYNAMIC_ROUTES } from '@/lib/exam-paths';

// ===== TYPES =====

type ExamTab = 'in-progress' | 'completed' | 'upcoming';

interface MyExamsStats {
  totalEnrolled: number;
  inProgress: number;
  completed: number;
  averageScore: number;
}

// ===== CONSTANTS =====

const PAGE_CONFIG = {
  title: 'Đề thi của tôi',
  description: 'Quản lý và theo dõi tiến độ học tập',
  defaultPageSize: 12,
} as const;

const DEFAULT_STATS: MyExamsStats = {
  totalEnrolled: 0,
  inProgress: 0,
  completed: 0,
  averageScore: 0,
};

// ===== MAIN COMPONENT =====

/**
 * My Exams Page Component
 * Student's enrolled exams with progress tracking
 */
export default function MyExamsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // ===== STATE =====

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ExamTab>('in-progress');
  const [stats, setStats] = useState<MyExamsStats>(DEFAULT_STATS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ExamFilters>({
    page: 1,
    limit: PAGE_CONFIG.defaultPageSize,
  });

  // ===== EFFECTS =====

  useEffect(() => {
    const loadMyExams = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual API call for user's enrolled exams
        // For now, fetch all active exams as placeholder
        const response = await ExamService.listExams({
          ...filters,
          status: [ExamStatus.ACTIVE],
        });
        
        setExams(response.exams);
        
        // Calculate stats (mock data for now)
        setStats({
          totalEnrolled: response.exams.length,
          inProgress: Math.floor(response.exams.length * 0.6),
          completed: Math.floor(response.exams.length * 0.3),
          averageScore: 75,
        });
      } catch (err) {
        console.error('Failed to load my exams:', err);
        setError('Không thể tải danh sách đề thi của bạn');
      } finally {
        setLoading(false);
      }
    };

    loadMyExams();
  }, [filters]);

  // ===== HANDLERS =====

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as ExamTab);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((key: keyof ExamFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleExamView = useCallback((exam: Exam) => {
    router.push(EXAM_DYNAMIC_ROUTES.DETAIL(exam.id));
  }, [router]);

  const handleExamTake = useCallback((exam: Exam) => {
    router.push(EXAM_DYNAMIC_ROUTES.TAKE(exam.id));
  }, [router]);

  const handleBack = useCallback(() => {
    router.push(EXAM_ROUTES.LANDING);
  }, [router]);

  const handleBrowseExams = useCallback(() => {
    router.push(EXAM_ROUTES.BROWSE);
  }, [router]);

  // ===== FILTER EXAMS BY TAB =====

  const filteredExams = exams.filter(exam => {
    // TODO: Replace with actual enrollment status from backend
    // For now, mock filtering based on tab
    if (activeTab === 'in-progress') {
      return true; // Show all for demo
    }
    if (activeTab === 'completed') {
      return false; // No completed exams in demo
    }
    if (activeTab === 'upcoming') {
      return false; // No upcoming exams in demo
    }
    return true;
  });

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/20 via-red-500/10 to-pink-500/20">
      <div className="container mx-auto py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{PAGE_CONFIG.title}</h1>
              <p className="text-muted-foreground">{PAGE_CONFIG.description}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đề thi</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
              <p className="text-xs text-muted-foreground">Đã đăng ký</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang học</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Chưa hoàn thành</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Đã làm xong</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm TB</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">Trung bình</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs & Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList>
                  <TabsTrigger value="in-progress">Đang học ({stats.inProgress})</TabsTrigger>
                  <TabsTrigger value="completed">Hoàn thành ({stats.completed})</TabsTrigger>
                  <TabsTrigger value="upcoming">Sắp tới (0)</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Lọc
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm đề thi..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background"
              />
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 rounded-lg border bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Môn học</label>
                    <select
                      value={filters.subject?.[0] || ''}
                      onChange={(e) => handleFilterChange('subject', e.target.value ? [e.target.value] : undefined)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Tất cả</option>
                      <option value="Toán">Toán học</option>
                      <option value="Vật lý">Vật lý</option>
                      <option value="Hóa học">Hóa học</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Khối lớp</label>
                    <select
                      value={filters.grade?.[0] || ''}
                      onChange={(e) => handleFilterChange('grade', e.target.value ? [parseInt(e.target.value)] : undefined)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Tất cả</option>
                      {[10, 11, 12].map(grade => (
                        <option key={grade} value={grade}>Lớp {grade}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Exams Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-56 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === 'in-progress' && 'Chưa có đề thi đang học'}
                  {activeTab === 'completed' && 'Chưa hoàn thành đề thi nào'}
                  {activeTab === 'upcoming' && 'Chưa có đề thi sắp tới'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Khám phá và đăng ký đề thi mới để bắt đầu học tập
                </p>
                <Button onClick={handleBrowseExams}>
                  <Search className="h-4 w-4 mr-2" />
                  Khám phá đề thi
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    viewMode="card"
                    onView={handleExamView}
                    onTakeExam={handleExamTake}
                    showActions={true}
                    showProgress={true}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

