/**
 * Exams Browse Page
 * Browse interface cho public exam browsing theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, List, Search, Filter, ArrowLeft } from 'lucide-react';

import { EXAM_ROUTES, EXAM_DYNAMIC_ROUTES } from '@/lib/exam-paths';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Import exam components
import { ExamGrid } from '@/components/features/exams/management/exam-grid';
import { ExamCard } from '@/components/features/exams/shared/exam-card';

// Import types
import { Exam, ExamFilters, ExamStatus } from '@/types/exam';
import { QuestionDifficulty } from '@/types/question';

// Import services
import { ExamService } from '@/services/grpc/exam.service';

// ===== CONSTANTS =====

/**
 * Page configuration
 */
const PAGE_CONFIG = {
  title: 'Duyệt đề thi',
  description: 'Duyệt và tìm kiếm đề thi theo môn học, độ khó và loại đề thi',
  defaultColumns: 3,
  defaultPageSize: 12,
} as const;

/**
 * Default filters
 */
const DEFAULT_FILTERS: ExamFilters = {
  search: '',
  page: 1,
  limit: PAGE_CONFIG.defaultPageSize,
};

// ===== MAIN COMPONENT =====

/**
 * Exams Browse Page Component
 * Browse interface với ExamGrid integration
 */
export default function ExamsBrowsePage() {
  // ===== STATE =====

  const router = useRouter();
  const [filters, setFilters] = useState<ExamFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // ===== DATA FETCHING =====

  useEffect(() => {
    const loadExams = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await ExamService.listExams(filters);
        setExams(response.exams);
        setTotalItems(response.total);
      } catch (err) {
        console.error('Failed to load exams:', err);
        setError('Không thể tải danh sách đề thi');
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, [filters]);

  // ===== EVENT HANDLERS =====

  const handleExamView = useCallback((exam: Exam) => {
    router.push(EXAM_DYNAMIC_ROUTES.DETAIL(exam.id));
  }, [router]);

  const handleExamTake = useCallback((exam: Exam) => {
    router.push(EXAM_DYNAMIC_ROUTES.TAKE(exam.id));
  }, [router]);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<ExamFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    handleFilterChange({ search: query });
  }, [handleFilterChange]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    handleFilterChange({ search: '' });
  }, [handleFilterChange]);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handleBack = useCallback(() => {
    router.push(EXAM_ROUTES.LANDING);
  }, [router]);

  // ===== RENDER =====

  return (
    <div className="exams-browse-page min-h-screen bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20">
      {/* Page Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{PAGE_CONFIG.title}</h1>
                <p className="text-muted-foreground">{PAGE_CONFIG.description}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section py-6 border-b bg-background/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đề thi..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 pr-20"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSearchClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Xóa
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content py-8">
        <div className="container mx-auto px-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {totalItems} đề thi
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="rounded-lg border bg-card p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Subject Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Môn học</label>
                  <select
                    value={filters.subject?.[0] || ''}
                    onChange={(e) => handleFilterChange({ subject: e.target.value ? [e.target.value] : undefined })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Tất cả</option>
                    <option value="Toán">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                  </select>
                </div>

                {/* Grade Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Khối lớp</label>
                  <select
                    value={filters.grade?.[0] || ''}
                    onChange={(e) => handleFilterChange({ grade: e.target.value ? [parseInt(e.target.value)] : undefined })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Tất cả</option>
                    {[10, 11, 12].map(grade => (
                      <option key={grade} value={grade}>Lớp {grade}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Độ khó</label>
                  <select
                    value={filters.difficulty?.[0] || ''}
                    onChange={(e) => handleFilterChange({ difficulty: e.target.value ? [e.target.value as QuestionDifficulty] : undefined })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Tất cả</option>
                    <option value="EASY">Dễ</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HARD">Khó</option>
                    <option value="EXPERT">Chuyên gia</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Trạng thái</label>
                  <select
                    value={filters.status?.[0] || ''}
                    onChange={(e) => handleFilterChange({ status: e.target.value ? [e.target.value as ExamStatus] : undefined })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Tất cả</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="ARCHIVED">Đã lưu trữ</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Exams Grid */}
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {loading ? (
              Array.from({ length: PAGE_CONFIG.defaultPageSize }).map((_, index) => (
                <div key={index} className="h-56 bg-muted animate-pulse rounded-lg" />
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-destructive">{error}</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Không tìm thấy đề thi nào</p>
              </div>
            ) : (
              exams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  viewMode={viewMode === 'list' ? 'compact' : 'card'}
                  onView={handleExamView}
                  onTakeExam={handleExamTake}
                  showActions={true}
                  showProgress={true}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalItems > PAGE_CONFIG.defaultPageSize && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                >
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {filters.page} / {Math.ceil(totalItems / PAGE_CONFIG.defaultPageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === Math.ceil(totalItems / PAGE_CONFIG.defaultPageSize)}
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

