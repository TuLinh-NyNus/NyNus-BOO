"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context-grpc";
import { UserRole } from "@/generated/common/common_pb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExamStatus, ExamType } from "@/types/exam";
import { QuestionDifficulty } from "@/types/question";

// Real backend hooks
import { useTeacherExams, useInvalidateTeacherAnalytics } from "@/hooks/teacher/use-teacher-analytics";

// Disable static generation
export const dynamic = 'force-dynamic';

/**
 * Teacher Exams Page
 * Trang quản lý đề thi cho giáo viên
 * 
 * Features:
 * - Quản lý đề thi (CRUD)
 * - Thống kê đề thi
 * - Bộ lọc nâng cao
 * - Grid/List view
 * - Publish/Archive workflow
 */

// Mock Exam Interface
interface MockExam {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: number;
  difficulty: QuestionDifficulty;
  examType: ExamType;
  status: ExamStatus;
  durationMinutes: number;
  totalPoints: number;
  passPercentage: number;
  questionCount: number;
  attemptCount: number;
  averageScore: number;
  createdAt: Date;
  publishedAt?: Date;
}

// Filters Interface
interface ExamFilters {
  search: string;
  status: string;
  type: string;
  subject: string;
  difficulty: string;
  viewMode: 'grid' | 'list';
}

// Mock Data
const mockExams: MockExam[] = [
  {
    id: '1',
    title: 'Kiểm tra giữa kỳ - Toán 10',
    description: 'Đề thi giữa kỳ môn Toán lớp 10 học kỳ 1',
    subject: 'Toán',
    grade: 10,
    difficulty: QuestionDifficulty.MEDIUM,
    examType: ExamType.GENERATED,
    status: ExamStatus.ACTIVE,
    durationMinutes: 90,
    totalPoints: 100,
    passPercentage: 50,
    questionCount: 30,
    attemptCount: 45,
    averageScore: 72.5,
    createdAt: new Date('2025-01-15'),
    publishedAt: new Date('2025-01-16')
  },
  {
    id: '2',
    title: 'Kiểm tra 15 phút - Vật lý 11',
    description: 'Bài kiểm tra 15 phút chương Dao động cơ',
    subject: 'Vật lý',
    grade: 11,
    difficulty: QuestionDifficulty.EASY,
    examType: ExamType.GENERATED,
    status: ExamStatus.ACTIVE,
    durationMinutes: 15,
    totalPoints: 20,
    passPercentage: 60,
    questionCount: 10,
    attemptCount: 32,
    averageScore: 15.8,
    createdAt: new Date('2025-01-10'),
    publishedAt: new Date('2025-01-11')
  },
  {
    id: '3',
    title: 'Đề thi thử THPT Quốc gia - Hóa học',
    description: 'Đề thi thử THPT Quốc gia môn Hóa học năm 2025',
    subject: 'Hóa học',
    grade: 12,
    difficulty: QuestionDifficulty.HARD,
    examType: ExamType.OFFICIAL,
    status: ExamStatus.PENDING,
    durationMinutes: 50,
    totalPoints: 40,
    passPercentage: 50,
    questionCount: 40,
    attemptCount: 0,
    averageScore: 0,
    createdAt: new Date('2025-01-18'),
  },
];

export default function TeacherExamsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // State
  const [filters, setFilters] = useState<ExamFilters>({
    search: '',
    status: 'all',
    type: 'all',
    subject: 'all',
    difficulty: 'all',
    viewMode: 'grid',
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Real backend data
  const { data: examsData, isLoading: examsLoading, error, refetch } = useTeacherExams(
    user?.id || '',
    filters.status,
    page,
    pageSize,
    { enabled: !!user?.id }
  );

  const { invalidateExams } = useInvalidateTeacherAnalytics();

  // Loading state
  if (authLoading || examsLoading) {
    return (
      <div className="min-h-screen bg-[#FDF2F8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4417DB] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Authorization check
  if (!user || (user.role !== UserRole.USER_ROLE_TEACHER && user.role !== UserRole.USER_ROLE_ADMIN)) {
    return (
      <div className="min-h-screen bg-[#FDF2F8] flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Không có quyền truy cập
            </CardTitle>
            <CardDescription>
              Bạn cần có quyền giáo viên để truy cập trang này.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Về Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF2F8] flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Lỗi tải dữ liệu
            </CardTitle>
            <CardDescription>
              {error.message || 'Không thể tải danh sách đề thi. Vui lòng thử lại sau.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!examsData) {
    return null;
  }

  // Real exams data from backend
  const exams = examsData.exams;

  // Statistics from real data
  const stats = useMemo(() => ({
    totalExams: examsData.total,
    activeExams: exams.filter(e => e.status === 'active').length,
    pendingExams: exams.filter(e => e.status === 'pending').length,
    totalAttempts: exams.reduce((sum, e) => sum + e.attemptCount, 0),
  }), [exams, examsData.total]);

  // Filtered exams (client-side filtering)
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch =
        exam.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        exam.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === 'all' || exam.status === filters.status;
      const matchesType = filters.type === 'all' || exam.examType === filters.type;
      const matchesSubject = filters.subject === 'all' || exam.subject === filters.subject;
      const matchesDifficulty = filters.difficulty === 'all' || exam.difficulty === filters.difficulty;

      return matchesSearch && matchesStatus && matchesType && matchesSubject && matchesDifficulty;
    });
  }, [exams, filters]);

  // Handlers
  const handleFilterChange = useCallback((key: keyof ExamFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleViewExam = useCallback((examId: string) => {
    console.log('View exam:', examId);
    // TODO: Navigate to exam detail page
  }, []);

  const handleEditExam = useCallback((examId: string) => {
    console.log('Edit exam:', examId);
    // TODO: Navigate to exam edit page
  }, []);

  const handleDeleteExam = useCallback((examId: string) => {
    console.log('Delete exam:', examId);
    // TODO: Implement delete with confirmation
  }, []);

  const handlePublishExam = useCallback((examId: string) => {
    console.log('Publish exam:', examId);
    // TODO: Implement publish
  }, []);

  const handleArchiveExam = useCallback((examId: string) => {
    console.log('Archive exam:', examId);
    // TODO: Implement archive
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('Refresh exams');
    // TODO: Reload exams from backend
  }, []);

  const handleCreateExam = useCallback(() => {
    console.log('Create new exam');
    // TODO: Navigate to exam creation page
  }, []);

  // Helper functions
  const getStatusBadge = (status: ExamStatus) => {
    const config = {
      [ExamStatus.ACTIVE]: { label: 'Đang hoạt động', className: 'bg-green-100 text-green-800' },
      [ExamStatus.PENDING]: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      [ExamStatus.INACTIVE]: { label: 'Tạm ngưng', className: 'bg-gray-100 text-gray-800' },
      [ExamStatus.ARCHIVED]: { label: 'Đã lưu trữ', className: 'bg-red-100 text-red-800' },
    };
    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const getDifficultyBadge = (difficulty: QuestionDifficulty) => {
    const config = {
      [QuestionDifficulty.EASY]: { label: 'Dễ', className: 'bg-blue-100 text-blue-800' },
      [QuestionDifficulty.MEDIUM]: { label: 'Trung bình', className: 'bg-purple-100 text-purple-800' },
      [QuestionDifficulty.HARD]: { label: 'Khó', className: 'bg-orange-100 text-orange-800' },
      [QuestionDifficulty.EXPERT]: { label: 'Rất khó', className: 'bg-red-100 text-red-800' },
    };
    const { label, className } = config[difficulty];
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#FDF2F8]">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#4417DB]">Quản lý đề thi</h1>
              <p className="text-sm text-muted-foreground">Tạo và quản lý đề thi cho học sinh</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              <Button size="sm" onClick={handleCreateExam}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo đề thi
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Statistics Dashboard */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng số đề thi</p>
                    <p className="text-2xl font-bold">{stats.totalExams}</p>
                  </div>
                  <FileText className="h-8 w-8 text-[#4417DB]/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                    <p className="text-2xl font-bold">{stats.activeExams}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                    <p className="text-2xl font-bold">{stats.pendingExams}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lượt làm bài</p>
                    <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-6">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm đề thi..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value={ExamStatus.ACTIVE}>Đang hoạt động</SelectItem>
                  <SelectItem value={ExamStatus.PENDING}>Chờ duyệt</SelectItem>
                  <SelectItem value={ExamStatus.INACTIVE}>Tạm ngưng</SelectItem>
                  <SelectItem value={ExamStatus.ARCHIVED}>Đã lưu trữ</SelectItem>
                </SelectContent>
              </Select>

              {/* Subject Filter */}
              <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn học</SelectItem>
                  <SelectItem value="Toán">Toán</SelectItem>
                  <SelectItem value="Vật lý">Vật lý</SelectItem>
                  <SelectItem value="Hóa học">Hóa học</SelectItem>
                  <SelectItem value="Sinh học">Sinh học</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả độ khó</SelectItem>
                  <SelectItem value={QuestionDifficulty.EASY}>Dễ</SelectItem>
                  <SelectItem value={QuestionDifficulty.MEDIUM}>Trung bình</SelectItem>
                  <SelectItem value={QuestionDifficulty.HARD}>Khó</SelectItem>
                  <SelectItem value={QuestionDifficulty.EXPERT}>Rất khó</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('viewMode', 'grid')}
                  className="flex-1"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={filters.viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('viewMode', 'list')}
                  className="flex-1"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exams Display */}
        {filteredExams.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy đề thi</h3>
              <p className="text-muted-foreground mb-4">Thử thay đổi bộ lọc hoặc tạo đề thi mới</p>
              <Button onClick={handleCreateExam}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo đề thi đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : filters.viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{exam.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{exam.description}</CardDescription>
                      </div>
                      {getStatusBadge(exam.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.subject} - Lớp {exam.grade}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.durationMinutes} phút</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.questionCount} câu hỏi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.attemptCount} lượt làm</span>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div>
                      {getDifficultyBadge(exam.difficulty)}
                    </div>

                    {/* Stats */}
                    {exam.attemptCount > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Điểm TB:</span>
                          <span className="font-semibold">{exam.averageScore.toFixed(1)}/{exam.totalPoints}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewExam(exam.id)} className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditExam(exam.id)} className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Sửa
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewExam(exam.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditExam(exam.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {exam.status === ExamStatus.PENDING && (
                            <DropdownMenuItem onClick={() => handlePublishExam(exam.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Xuất bản
                            </DropdownMenuItem>
                          )}
                          {exam.status === ExamStatus.ACTIVE && (
                            <DropdownMenuItem onClick={() => handleArchiveExam(exam.id)}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Lưu trữ
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteExam(exam.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-[#4417DB]/10 text-[#4417DB]">
                          <FileText className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{exam.title}</h3>
                          {getStatusBadge(exam.status)}
                          {getDifficultyBadge(exam.difficulty)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{exam.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{exam.subject} - Lớp {exam.grade}</span>
                          <span>•</span>
                          <span>{exam.durationMinutes} phút</span>
                          <span>•</span>
                          <span>{exam.questionCount} câu hỏi</span>
                          <span>•</span>
                          <span>{exam.attemptCount} lượt làm</span>
                          {exam.attemptCount > 0 && (
                            <>
                              <span>•</span>
                              <span>Điểm TB: {exam.averageScore.toFixed(1)}/{exam.totalPoints}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleViewExam(exam.id)} className="hidden sm:flex">
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditExam(exam.id)} className="hidden sm:flex">
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewExam(exam.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditExam(exam.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {exam.status === ExamStatus.PENDING && (
                              <DropdownMenuItem onClick={() => handlePublishExam(exam.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Xuất bản
                              </DropdownMenuItem>
                            )}
                            {exam.status === ExamStatus.ACTIVE && (
                              <DropdownMenuItem onClick={() => handleArchiveExam(exam.id)}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Lưu trữ
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteExam(exam.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

