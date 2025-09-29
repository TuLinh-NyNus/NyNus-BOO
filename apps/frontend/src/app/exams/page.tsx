/**
 * Exams Landing Page
 * Main exam listing page theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, BookOpen, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EXAM_ROUTES, EXAM_DYNAMIC_ROUTES } from '@/lib/exam-paths';
import { Exam, ExamFilters as ExamFiltersType, ExamStatus } from '@/types/exam';
import { QuestionDifficulty } from '@/types/question';
import { ExamService } from '@/services/grpc/exam.service';

// ===== TYPES =====

// Using centralized Exam interface from @/types/exam

/**
 * Local exam filters interface (extends centralized type)
 */
interface LocalExamFilters {
  search: string;
  difficulty: string;
  subject: string;
  status: string;
}

// ===== CONSTANTS =====

/**
 * Page configuration
 */
const _PAGE_CONFIG = {
  title: 'Danh sách đề thi',
  description: 'Quản lý và làm bài thi trực tuyến',
  defaultPageSize: 12,
  enableSearch: true,
  enableFilters: true,
} as const;

/**
 * Default filters
 */
const DEFAULT_FILTERS: LocalExamFilters = {
  search: '',
  difficulty: '',
  subject: '',
  status: '',
};

// ===== MAIN COMPONENT =====

/**
 * Exams Landing Page Component
 * Main page cho exam listing với search và filters
 * 
 * Features:
 * - Exam listing với pagination
 * - Search functionality
 * - Filter by difficulty, subject, status
 * - Create exam button (role-based)
 * - Responsive grid layout
 * - Loading states
 */
export default function ExamsPage() {
  const router = useRouter();
  
  // ===== STATE =====
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LocalExamFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // ===== EFFECTS =====

  useEffect(() => {
    const loadExams = async () => {
      setLoading(true);
      try {
        // Convert local filters to API filters
        const apiFilters: ExamFiltersType = {
          search: filters.search || undefined,
          subject: filters.subject ? [filters.subject] : undefined,
          status: filters.status ? [filters.status as ExamStatus] : undefined,
          difficulty: filters.difficulty ? [filters.difficulty as QuestionDifficulty] : undefined
        };

        // Call actual gRPC service
        const response = await ExamService.listExams(apiFilters);
        setExams(response.exams);

        // Mock data fallback (for development)
        /*
        const mockExams: Exam[] = [
          {
            id: '1',
            title: 'Kiểm tra Toán 12 - Chương 1',
            description: 'Đề kiểm tra chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
            duration_minutes: 45,
            total_questions: 20,
            difficulty: 'MEDIUM',
            subject: 'Toán',
            status: 'ACTIVE',
            created_by: 'teacher1',
            created_at: '2025-01-19T10:00:00Z',
            updated_at: '2025-01-19T10:00:00Z',
          },
          {
            id: '2',
            title: 'Bài tập Hình học không gian',
            description: 'Đề thi thử về hình học không gian và các phép toán vector',
            duration_minutes: 60,
            total_questions: 15,
            difficulty: 'HARD',
            subject: 'Toán',
            status: 'ACTIVE',
            created_by: 'teacher2',
            created_at: '2025-01-18T14:30:00Z',
            updated_at: '2025-01-18T14:30:00Z',
          },
        ];

        setExams(mockExams);
        */
      } catch (error) {
        console.error('Failed to load exams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, [filters]);

  // ===== HANDLERS =====

  const handleCreateExam = () => {
    router.push(EXAM_ROUTES.CREATE);
  };

  const handleExamClick = (examId: string) => {
    router.push(EXAM_DYNAMIC_ROUTES.DETAIL(examId));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: keyof LocalExamFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đề thi</h1>
          <p className="text-muted-foreground">
            Quản lý và làm bài thi trực tuyến
          </p>
        </div>
        
        <Button onClick={handleCreateExam} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo đề thi mới
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm đề thi..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Độ khó</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
                <option value="EXPERT">Chuyên gia</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Môn học</label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="Toán">Toán</option>
                <option value="Lý">Vật lý</option>
                <option value="Hóa">Hóa học</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Exams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              onClick={() => handleExamClick(exam.id)}
              className="rounded-lg border bg-card p-6 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {exam.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {exam.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {exam.durationMinutes} phút
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {exam.questionIds?.length || 0} câu
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exam.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                    exam.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    exam.difficulty === 'HARD' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {exam.difficulty === 'EASY' ? 'Dễ' :
                     exam.difficulty === 'MEDIUM' ? 'Trung bình' :
                     exam.difficulty === 'HARD' ? 'Khó' : 'Chuyên gia'}
                  </span>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exam.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    exam.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {exam.status === 'ACTIVE' ? 'Hoạt động' :
                     exam.status === 'PENDING' ? 'Chờ duyệt' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && exams.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có đề thi nào</h3>
          <p className="text-muted-foreground mb-4">
            Bắt đầu bằng cách tạo đề thi đầu tiên của bạn
          </p>
          <Button onClick={handleCreateExam} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo đề thi mới
          </Button>
        </div>
      )}
    </div>
  );
}
