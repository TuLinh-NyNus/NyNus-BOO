/**
 * My Results Page (Student)
 * Student's exam results with table view, filters, stats cards
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Filter,
  ArrowLeft,
  Eye,
  BarChart3
} from 'lucide-react';

// UI Components
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';

// Hooks
import { useAuth } from '@/contexts/auth-context-grpc';

// Types
import { ExamResult, ExamAttempt } from '@/types/exam';

// Services
import { ExamService } from '@/services/grpc/exam.service';

// Utils
import { formatDate, formatDateTime } from '@/lib/utils';

// Paths
import { EXAM_ROUTES, EXAM_DYNAMIC_ROUTES } from '@/lib/exam-paths';

// ===== TYPES =====

interface MyResultsStats {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  totalTimeSpent: number;
}

interface ResultsFilters {
  examId?: string;
  passed?: boolean | null;
  dateFrom?: string;
  dateTo?: string;
}

// ===== CONSTANTS =====

const PAGE_CONFIG = {
  title: 'Kết quả của tôi',
  description: 'Xem lại kết quả các bài thi đã làm',
  defaultPageSize: 10,
} as const;

const DEFAULT_STATS: MyResultsStats = {
  totalAttempts: 0,
  averageScore: 0,
  passRate: 0,
  totalTimeSpent: 0,
};

// ===== UTILITY FUNCTIONS =====

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} phút`;
}

function getScoreBadgeColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

function getPassBadge(passed: boolean) {
  return passed ? (
    <Badge className="bg-green-100 text-green-800 border-green-200">
      <CheckCircle className="h-3 w-3 mr-1" />
      Đạt
    </Badge>
  ) : (
    <Badge className="bg-red-100 text-red-800 border-red-200">
      <XCircle className="h-3 w-3 mr-1" />
      Chưa đạt
    </Badge>
  );
}

// ===== MAIN COMPONENT =====

/**
 * My Results Page Component
 * Student's exam results with table view, filters, stats cards
 */
export default function MyResultsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // ===== STATE =====

  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MyResultsStats>(DEFAULT_STATS);
  const [filters, setFilters] = useState<ResultsFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(PAGE_CONFIG.defaultPageSize);

  // ===== EFFECTS =====

  useEffect(() => {
    const loadMyResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual API call for user's exam results
        // For now, use mock data
        const mockResults: ExamResult[] = [];
        
        setResults(mockResults);
        
        // Calculate stats
        if (mockResults.length > 0) {
          const totalScore = mockResults.reduce((sum, r) => sum + r.percentage, 0);
          const passedCount = mockResults.filter(r => r.passed).length;
          const totalTime = mockResults.reduce((sum, r) => sum + r.timeSpentSeconds, 0);
          
          setStats({
            totalAttempts: mockResults.length,
            averageScore: totalScore / mockResults.length,
            passRate: (passedCount / mockResults.length) * 100,
            totalTimeSpent: totalTime,
          });
        }
      } catch (err) {
        console.error('Failed to load my results:', err);
        setError('Không thể tải kết quả thi của bạn');
      } finally {
        setLoading(false);
      }
    };

    loadMyResults();
  }, [filters]);

  // ===== HANDLERS =====

  const handleFilterChange = useCallback((key: keyof ResultsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleViewResult = useCallback((result: ExamResult) => {
    router.push(`/exams/${result.examId}/results/${result.attemptId}`);
  }, [router]);

  const handleBack = useCallback(() => {
    router.push(EXAM_ROUTES.LANDING);
  }, [router]);

  const handleTakeExam = useCallback(() => {
    router.push(EXAM_ROUTES.BROWSE);
  }, [router]);

  // ===== FILTERED & PAGINATED RESULTS =====

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      if (filters.examId && result.examId !== filters.examId) return false;
      if (filters.passed !== null && filters.passed !== undefined && result.passed !== filters.passed) return false;
      if (filters.dateFrom && result.gradedAt < filters.dateFrom) return false;
      if (filters.dateTo && result.gradedAt > filters.dateTo) return false;
      return true;
    });
  }, [results, filters]);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredResults.slice(startIndex, endIndex);
  }, [filteredResults, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredResults.length / pageSize);

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-blue-500/20">
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
              <CardTitle className="text-sm font-medium">Tổng lượt thi</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
              <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm TB</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Trung bình</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ đạt</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.passRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Đạt yêu cầu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng thời gian</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats.totalTimeSpent)}</div>
              <p className="text-xs text-muted-foreground">Đã làm bài</p>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lịch sử thi ({filteredResults.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Lọc
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 rounded-lg border bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Trạng thái</label>
                    <select
                      value={filters.passed === null || filters.passed === undefined ? '' : filters.passed ? 'passed' : 'failed'}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFilterChange('passed', value === '' ? null : value === 'passed');
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Tất cả</option>
                      <option value="passed">Đạt</option>
                      <option value="failed">Chưa đạt</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Từ ngày</label>
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Đến ngày</label>
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({});
                      setCurrentPage(1);
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-4">Đang tải...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
              </div>
            ) : paginatedResults.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có kết quả thi nào</h3>
                <p className="text-muted-foreground mb-4">
                  Bắt đầu làm bài thi để xem kết quả tại đây
                </p>
                <Button onClick={handleTakeExam}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Làm bài thi
                </Button>
              </div>
            ) : (
              <>
                {/* Table - Will be completed */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Đề thi</TableHead>
                        <TableHead>Ngày thi</TableHead>
                        <TableHead>Điểm số</TableHead>
                        <TableHead>Kết quả</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">
                            {result.exam?.title || 'Đề thi không xác định'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(result.gradedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={getScoreBadgeColor(result.percentage)}>
                                {result.score}/{result.totalPoints}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                ({result.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPassBadge(result.passed)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDuration(result.timeSpentSeconds)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewResult(result)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredResults.length)} trong tổng số {filteredResults.length} kết quả
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-9 h-9 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

