'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Database, 
  Search, 
  Filter, 
  Eye,
  Download,
  Loader2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/ui/feedback/error-boundary';

import {
  Question,
  QuestionFilters,
  QuestionType,
  QuestionStatus,
  QuestionDifficulty
} from '@/lib/types/question';
import { questionTypeAdapters, questionStatusAdapters, questionDifficultyAdapters } from '@/lib/utils/filter-type-adapters';
import { MockQuestionsService } from '@/lib/services/mock/questions';
import { ADMIN_PATHS } from '@/lib/admin-paths';

/**
 * Questions Database Page
 * Trang xem kho câu hỏi với chức năng duyệt và preview
 */
export default function QuestionsDatabasePage() {
  const router = useRouter();
  const { toast } = useToast();

  // State management cho database view
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  /**
   * Load questions data từ mock service
   */
  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await MockQuestionsService.listQuestions({
        page: currentPage,
        pageSize,
        ...filters,
        // Database view chỉ hiển thị questions đã được duyệt
        status: QuestionStatus.ACTIVE
      });

      setQuestions(response.data);
      setTotalQuestions(response.pagination.total);
    } catch (error) {
      console.error('Lỗi khi tải kho câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải kho câu hỏi',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, filters, toast]);

  // Load questions khi component mount hoặc filters thay đổi
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters: Partial<QuestionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset về trang đầu khi filter
  };

  /**
   * Handle view question detail
   */
  const handleViewQuestion = async (questionId: string) => {
    try {
      const response = await MockQuestionsService.getQuestion(questionId);
      if (response.data) {
        setSelectedQuestion(response.data);
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải chi tiết câu hỏi',
          variant: 'destructive'
        });
      }
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải chi tiết câu hỏi',
        variant: 'destructive'
      });
    }
  };

  /**
   * Handle export questions
   */
  const handleExportQuestions = () => {
    // Mock export functionality
    toast({
      title: 'Đang xuất dữ liệu',
      description: 'File sẽ được tải xuống trong giây lát',
      variant: 'success'
    });
  };

  /**
   * Render question type badge
   */
  const renderQuestionTypeBadge = (type: QuestionType) => {
    const typeLabels = {
      [QuestionType.MC]: 'Trắc nghiệm',
      [QuestionType.TF]: 'Đúng/Sai',
      [QuestionType.SA]: 'Tự luận ngắn',
      [QuestionType.ES]: 'Tự luận',
      [QuestionType.MA]: 'Ghép đôi'
    };

    const typeColors = {
      [QuestionType.MC]: 'bg-blue-100 text-blue-800',
      [QuestionType.TF]: 'bg-green-100 text-green-800',
      [QuestionType.SA]: 'bg-yellow-100 text-yellow-800',
      [QuestionType.ES]: 'bg-purple-100 text-purple-800',
      [QuestionType.MA]: 'bg-pink-100 text-pink-800'
    };

    return (
      <Badge className={typeColors[type]}>
        {typeLabels[type]}
      </Badge>
    );
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kho câu hỏi</h1>
              <p className="text-gray-600 mt-1">
                Duyệt và xem trước {totalQuestions} câu hỏi trong kho
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleExportQuestions}
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất dữ liệu
            </Button>
            <Button 
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS)}
            >
              Quản lý câu hỏi
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Bộ lọc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm câu hỏi..."
                      value={filters.keyword || ''}
                      onChange={(e) => handleFilterChange({ keyword: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Type filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Loại câu hỏi</label>
                  <Select
                    value={questionTypeAdapters.toString(filters.type)}
                    onValueChange={(value) => handleFilterChange({ type: questionTypeAdapters.fromString(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại</SelectItem>
                      <SelectItem value={QuestionType.MC}>Trắc nghiệm</SelectItem>
                      <SelectItem value={QuestionType.TF}>Đúng/Sai</SelectItem>
                      <SelectItem value={QuestionType.SA}>Tự luận ngắn</SelectItem>
                      <SelectItem value={QuestionType.ES}>Tự luận</SelectItem>
                      <SelectItem value={QuestionType.MA}>Ghép đôi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Độ khó</label>
                  <Select
                    value={questionDifficultyAdapters.toString(filters.difficulty)}
                    onValueChange={(value) => handleFilterChange({ difficulty: questionDifficultyAdapters.fromString(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả độ khó" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả độ khó</SelectItem>
                      <SelectItem value={QuestionDifficulty.EASY}>Dễ</SelectItem>
                      <SelectItem value={QuestionDifficulty.MEDIUM}>Trung bình</SelectItem>
                      <SelectItem value={QuestionDifficulty.HARD}>Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Code prefix filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Mã câu hỏi</label>
                  <Input
                    placeholder="Ví dụ: 0P1V"
                    value={filters.codePrefix || ''}
                    onChange={(e) => handleFilterChange({ codePrefix: e.target.value })}
                  />
                </div>

                {/* Sort options */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sắp xếp theo</label>
                  <Select 
                    value={filters.sortBy || 'createdAt'} 
                    onValueChange={(value) => handleFilterChange({ sortBy: value as 'createdAt' | 'updatedAt' | 'usageCount' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Ngày tạo</SelectItem>
                      <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
                      <SelectItem value="usageCount">Lượt sử dụng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng câu hỏi:</span>
                    <span className="font-medium">{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Trắc nghiệm:</span>
                    <span className="font-medium">
                      {questions.filter(q => q.type === QuestionType.MC).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tự luận:</span>
                    <span className="font-medium">
                      {questions.filter(q => q.type === QuestionType.ES).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Độ khó cao:</span>
                    <span className="font-medium">
                      {questions.filter(q => q.difficulty === QuestionDifficulty.HARD).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions list */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Danh sách câu hỏi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Đang tải...</span>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không có câu hỏi nào
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Không tìm thấy câu hỏi phù hợp với bộ lọc hiện tại
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nội dung</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Độ khó</TableHead>
                          <TableHead>Mã câu hỏi</TableHead>
                          <TableHead>Lượt sử dụng</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {questions.map((question) => (
                          <TableRow key={question.id}>
                            <TableCell>
                              <div className="max-w-md">
                                <p className="font-medium text-gray-900 truncate">
                                  {question.content}
                                </p>
                                {question.tag.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {question.tag.slice(0, 2).map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {question.tag.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{question.tag.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {renderQuestionTypeBadge(question.type)}
                            </TableCell>
                            <TableCell>
                              {question.difficulty && (
                                <Badge variant="outline">
                                  {question.difficulty === QuestionDifficulty.EASY && 'Dễ'}
                                  {question.difficulty === QuestionDifficulty.MEDIUM && 'TB'}
                                  {question.difficulty === QuestionDifficulty.HARD && 'Khó'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {question.questionCodeId}
                              </code>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {question.usageCount || 0}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewQuestion(question.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {!isLoading && questions.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalQuestions)} 
                  trong tổng số {totalQuestions} câu hỏi
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Trước
                  </Button>
                  <span className="text-sm">
                    Trang {currentPage} / {Math.ceil(totalQuestions / pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= Math.ceil(totalQuestions / pageSize)}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Question detail modal */}
        {selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Chi tiết câu hỏi</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedQuestion(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Nội dung:</h3>
                    <p className="text-gray-700">{selectedQuestion.content}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Loại:</h4>
                      {renderQuestionTypeBadge(selectedQuestion.type)}
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Độ khó:</h4>
                      {selectedQuestion.difficulty && (
                        <Badge variant="outline">
                          {selectedQuestion.difficulty === QuestionDifficulty.EASY && 'Dễ'}
                          {selectedQuestion.difficulty === QuestionDifficulty.MEDIUM && 'Trung bình'}
                          {selectedQuestion.difficulty === QuestionDifficulty.HARD && 'Khó'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {selectedQuestion.solution && (
                    <div>
                      <h4 className="font-medium mb-2">Lời giải:</h4>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-blue-800">{selectedQuestion.solution}</p>
                      </div>
                    </div>
                  )}

                  {selectedQuestion.tag.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags:</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedQuestion.tag.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
