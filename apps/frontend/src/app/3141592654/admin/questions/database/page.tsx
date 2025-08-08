/**
 * Admin Questions Database Page
 * Trang kho câu hỏi trong admin panel
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/feedback/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import {
  ArrowLeft,
  Database,
  Search,
  Eye,
  Bookmark,
  RefreshCw,
  Filter,

  AlertCircle,
} from "lucide-react";

// Import types
import {
  EnhancedQuestion,
  QuestionFilters,
  QuestionType,
  QuestionDifficulty,
  QuestionStatus,
} from "@/types/question";

// Import mock service
import { mockQuestionsService, SavedQuestionsManager } from "@/lib/services/mock/questions";

// Import admin paths
import { ADMIN_PATHS } from "@/lib/admin-paths";

/**
 * Database Page Component
 */
export default function DatabasePage() {
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<EnhancedQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<EnhancedQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ACTIVE");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  /**
   * Load questions from database
   */
  const loadQuestions = async () => {
    try {
      setIsLoading(true);

      // Build filters
      const filters: QuestionFilters = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedType) filters.type = selectedType as QuestionType;
      if (selectedDifficulty) filters.difficulty = selectedDifficulty as QuestionDifficulty;
      if (selectedStatus) filters.status = selectedStatus as QuestionStatus;

      const response = await mockQuestionsService.listQuestions(filters, {
        page: currentPage,
        limit: pageSize
      });

      setQuestions(response.questions);
      setFilteredQuestions(response.questions);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải kho câu hỏi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle search
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredQuestions(questions);
      return;
    }

    const filtered = questions.filter(q =>
      q.content.toLowerCase().includes(query.toLowerCase()) ||
      q.questionCodeId.toLowerCase().includes(query.toLowerCase()) ||
      q.tag.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredQuestions(filtered);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = () => {
    setCurrentPage(1);
    loadQuestions();
  };

  /**
   * Handle add to saved
   */
  const handleAddToSaved = (question: EnhancedQuestion) => {
    try {
      SavedQuestionsManager.add(question, "Thêm từ kho câu hỏi");
      toast({
        title: "Thành công",
        description: "Đã thêm câu hỏi vào danh sách đã lưu",
        variant: "success"
      });
    } catch (error) {
      console.error("Error adding to saved:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm câu hỏi vào danh sách đã lưu",
        variant: "destructive"
      });
    }
  };

  /**
   * Handle view question details
   */
  const handleViewQuestion = (questionId: string) => {
    router.push(ADMIN_PATHS.QUESTIONS_VIEW(questionId));
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    router.push(ADMIN_PATHS.QUESTIONS);
  };

  // Load questions on mount and filter changes
  useEffect(() => {
    loadQuestions();
  }, [currentPage, selectedType, selectedDifficulty, selectedStatus]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, questions]);

  return (
    <div className="database-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Kho câu hỏi</h1>
            <p className="text-muted-foreground">
              Duyệt và tìm kiếm câu hỏi trong ngân hàng câu hỏi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
          <Button variant="outline" onClick={loadQuestions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm và lọc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo nội dung, mã câu hỏi, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại câu hỏi</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value={QuestionType.MC}>Trắc nghiệm</SelectItem>
                    <SelectItem value={QuestionType.TF}>Đúng/Sai</SelectItem>
                    <SelectItem value={QuestionType.SA}>Trả lời ngắn</SelectItem>
                    <SelectItem value={QuestionType.ES}>Tự luận</SelectItem>
                    <SelectItem value={QuestionType.MA}>Ghép đôi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Độ khó</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value={QuestionDifficulty.EASY}>Dễ</SelectItem>
                    <SelectItem value={QuestionDifficulty.MEDIUM}>Trung bình</SelectItem>
                    <SelectItem value={QuestionDifficulty.HARD}>Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value={QuestionStatus.ACTIVE}>Hoạt động</SelectItem>
                    <SelectItem value={QuestionStatus.PENDING}>Chờ duyệt</SelectItem>
                    <SelectItem value={QuestionStatus.INACTIVE}>Tạm ngưng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleFilterChange} className="w-full">
                  Áp dụng bộ lọc
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Danh sách câu hỏi
              </CardTitle>
              <CardDescription>
                {filteredQuestions.length} câu hỏi được tìm thấy
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy câu hỏi</h3>
              <p className="text-muted-foreground mb-4">
                Không có câu hỏi nào khớp với tiêu chí tìm kiếm hiện tại.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedType("");
                setSelectedDifficulty("");
                setSelectedStatus("ACTIVE");
                handleFilterChange();
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2 line-clamp-2">
                        {question.content}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>ID: {question.questionCodeId}</span>
                        <span>•</span>
                        <span>Sử dụng: {question.usageCount} lần</span>
                        <span>•</span>
                        <span>Đánh giá: {question.feedback}/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{question.type}</Badge>
                        <Badge
                          variant={
                            question.status === "ACTIVE"
                              ? "default"
                              : question.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {question.status}
                        </Badge>
                        <Badge variant="outline">{question.difficulty}</Badge>
                        {question.tag.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {question.tag.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{question.tag.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewQuestion(question.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToSaved(question)}
                      >
                        <Bookmark className="h-4 w-4 mr-1" />
                        Lưu
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredQuestions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filteredQuestions.length)} - {Math.min(currentPage * pageSize, filteredQuestions.length)} trong số {filteredQuestions.length} câu hỏi
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span className="text-sm">
              Trang {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={filteredQuestions.length < pageSize}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
