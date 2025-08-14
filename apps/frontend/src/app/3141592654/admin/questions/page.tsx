'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  FileText,
  Upload,
  Database,
  Bookmark,
  Map,
  Loader2,
  AlertTriangle
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
  TableRow,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
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
 * Admin Questions List Page
 * Trang danh sách câu hỏi với filters, pagination và bulk actions
 */
export default function AdminQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State management cho questions list
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalQuestions, setTotalQuestions] = useState(0);

  /**
   * Load questions data từ mock service
   */
  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await MockQuestionsService.listQuestions({
        page: currentPage,
        pageSize,
        ...filters
      });

      setQuestions(response.data);
      setTotalQuestions(response.pagination.total);
    } catch (error) {
      console.error('Lỗi khi tải danh sách câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách câu hỏi',
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
   * Handle selection changes
   */
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? questions.map(q => q.id) : []);
  };

  /**
   * Navigation handlers
   */
  const handleCreateQuestion = () => {
    router.push(ADMIN_PATHS.QUESTIONS_CREATE);
  };

  const handleEditQuestion = (id: string) => {
    router.push(`/3141592654/admin/questions/${id}/edit`);
  };

  const handleViewQuestion = (id: string) => {
    // Implement view logic
    console.log('View question:', id);
  };

  /**
   * Bulk actions handlers
   */
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      await MockQuestionsService.bulkDelete(selectedIds);
      toast({
        title: 'Thành công',
        description: `Đã xóa ${selectedIds.length} câu hỏi`,
        variant: 'success'
      });
      setSelectedIds([]);
      loadQuestions();
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa câu hỏi',
        variant: 'destructive'
      });
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedIds.length === 0) return;

    try {
      await MockQuestionsService.bulkUpdateStatus(selectedIds);
      toast({
        title: 'Thành công',
        description: `Đã cập nhật trạng thái ${selectedIds.length} câu hỏi`,
        variant: 'success'
      });
      setSelectedIds([]);
      loadQuestions();
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
        variant: 'destructive'
      });
    }
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

  /**
   * Render status badge
   */
  const renderStatusBadge = (status?: QuestionStatus) => {
    if (!status) return null;

    const statusLabels = {
      [QuestionStatus.ACTIVE]: 'Hoạt động',
      [QuestionStatus.PENDING]: 'Chờ duyệt',
      [QuestionStatus.INACTIVE]: 'Không hoạt động',
      [QuestionStatus.ARCHIVED]: 'Lưu trữ'
    };

    const statusColors = {
      [QuestionStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [QuestionStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [QuestionStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
      [QuestionStatus.ARCHIVED]: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý câu hỏi</h1>
            <p className="text-gray-600 mt-1">
              Tổng cộng {totalQuestions} câu hỏi
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCreateQuestion} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tạo mới
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS_INPUT_LATEX)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Nhập LaTeX
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS_INPUT_AUTO)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Nhập tự động
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS_DATABASE)}
            >
              <Database className="h-4 w-4 mr-2" />
              Kho câu hỏi
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS_SAVED)}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Đã lưu
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS_MAP_ID)}
            >
              <Map className="h-4 w-4 mr-2" />
              Map ID
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={filters.keyword || ''}
                  onChange={(e) => handleFilterChange({ keyword: e.target.value })}
                  className="pl-10"
                />
              </div>

              {/* Type filter */}
              <Select
                value={questionTypeAdapters.toString(filters.type)}
                onValueChange={(value) => handleFilterChange({ type: questionTypeAdapters.fromString(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Loại câu hỏi" />
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

              {/* Status filter */}
              <Select
                value={questionStatusAdapters.toString(filters.status)}
                onValueChange={(value) => handleFilterChange({ status: questionStatusAdapters.fromString(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value={QuestionStatus.ACTIVE}>Hoạt động</SelectItem>
                  <SelectItem value={QuestionStatus.PENDING}>Chờ duyệt</SelectItem>
                  <SelectItem value={QuestionStatus.INACTIVE}>Không hoạt động</SelectItem>
                  <SelectItem value={QuestionStatus.ARCHIVED}>Lưu trữ</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty filter */}
              <Select
                value={questionDifficultyAdapters.toString(filters.difficulty)}
                onValueChange={(value) => handleFilterChange({ difficulty: questionDifficultyAdapters.fromString(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả độ khó</SelectItem>
                  <SelectItem value={QuestionDifficulty.EASY}>Dễ</SelectItem>
                  <SelectItem value={QuestionDifficulty.MEDIUM}>Trung bình</SelectItem>
                  <SelectItem value={QuestionDifficulty.HARD}>Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  Đã chọn {selectedIds.length} câu hỏi
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkUpdateStatus()}
                  >
                    Kích hoạt
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkUpdateStatus()}
                  >
                    Vô hiệu hóa
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleBulkDelete}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions table */}
        <Card>
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
                <Button onClick={handleCreateQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo câu hỏi đầu tiên
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === questions.length}
                        onCheckedChange={handleToggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
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
                        <Checkbox
                          checked={selectedIds.includes(question.id)}
                          onCheckedChange={() => handleToggleSelect(question.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium text-gray-900 truncate">
                            {question.content}
                          </p>
                          {question.tag.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {question.tag.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {question.tag.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{question.tag.length - 3}
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
                        {renderStatusBadge(question.status)}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewQuestion(question.id)}>
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditQuestion(question.id)}>
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleBulkDelete()}
                            >
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!isLoading && questions.length > 0 && (
          <div className="flex items-center justify-between">
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
    </ErrorBoundary>
  );
}
