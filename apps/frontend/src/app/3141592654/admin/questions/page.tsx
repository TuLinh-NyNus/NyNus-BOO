/**
 * Admin Questions List Page
 * Trang danh sách câu hỏi trong admin panel
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/feedback/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  RefreshCw,
  Filter,
  Plus,
  FileText,
  Upload,
  Database,
  Bookmark,
  Map,
} from "lucide-react";

// Import types
import {
  EnhancedQuestion,
  QuestionFilters,
  QuestionStats,
  PaginationParams,
} from "@/types/question";

// Import mock service
import { mockQuestionsService } from "@/lib/services/mock/questions";

// Import admin paths
import { ADMIN_PATHS } from "@/lib/admin-paths";

/**
 * Question List Page Content Component
 */
function AdminQuestionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<EnhancedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<QuestionStats>({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    archived: 0,
    byType: {
      MC: 0,
      TF: 0,
      SA: 0,
      ES: 0,
      MA: 0,
    },
    byDifficulty: {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
    },
  });

  // URL state management cho filters và pagination
  const currentPage = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("limit") || "20");
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const typeFilter = searchParams.get("type") || "";
  const difficultyFilter = searchParams.get("difficulty") || "";

  /**
   * Load questions data từ mock service
   */
  const loadQuestions = async () => {
    try {
      setIsLoading(true);

      // Build filters object
      const filters: QuestionFilters = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter) filters.status = statusFilter as QuestionFilters['status'];
      if (typeFilter) filters.type = typeFilter as QuestionFilters['type'];
      if (difficultyFilter) filters.difficulty = difficultyFilter as QuestionFilters['difficulty'];

      // Build pagination params
      const pagination: PaginationParams = {
        page: currentPage,
        limit: pageSize,
      };

      // Load questions và stats
      const [questionsResponse, statsResponse] = await Promise.all([
        mockQuestionsService.listQuestions(filters, pagination),
        mockQuestionsService.getStats(),
      ]);

      setQuestions(questionsResponse.questions);
      setStats(statsResponse);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách câu hỏi",
        variant: "destructive"
      });
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (filters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);

    // Update URL parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to first page when filters change
    params.set("page", "1");

    // Navigate với new parameters
    router.push(`${ADMIN_PATHS.QUESTIONS}?${params.toString()}`);
  };

  /**
   * Handle navigation to other pages
   */
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Load data on mount và when URL params change
  useEffect(() => {
    loadQuestions();
  }, [searchParams]);

  return (
    <div className="admin-questions-page space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tạm ngưng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lưu trữ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Button
          onClick={() => handleNavigate(ADMIN_PATHS.QUESTIONS_CREATE)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tạo mới
        </Button>
        <Button
          variant="outline"
          onClick={() => handleNavigate(ADMIN_PATHS.QUESTIONS_INPUT_LATEX)}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Nhập LaTeX
        </Button>
        <Button
          variant="outline"
          onClick={() => handleNavigate(ADMIN_PATHS.QUESTIONS_INPUT_AUTO)}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Nhập tự động
        </Button>
        <Button
          variant="outline"
          onClick={() => handleNavigate(ADMIN_PATHS.QUESTIONS_DATABASE)}
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          Kho câu hỏi
        </Button>
        <Button
          variant="outline"
          onClick={() => handleNavigate(ADMIN_PATHS.QUESTIONS_SAVED)}
          className="flex items-center gap-2"
        >
          <Bookmark className="h-4 w-4" />
          Đã lưu
        </Button>
        <Button
          variant="outline"
          onClick={() => handleNavigate(ADMIN_PATHS.QUESTIONS_MAP_ID)}
          className="flex items-center gap-2"
        >
          <Map className="h-4 w-4" />
          Map ID
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách câu hỏi</CardTitle>
              <CardDescription>
                Quản lý và tìm kiếm câu hỏi trong hệ thống
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadQuestions}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simple Questions List */}
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
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có câu hỏi nào</h3>
              <p className="text-muted-foreground mb-4">
                Chưa có câu hỏi nào trong hệ thống hoặc không khớp với bộ lọc hiện tại.
              </p>
              <Button onClick={() => handleNavigate(ADMIN_PATHS.QUESTIONS_CREATE)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo câu hỏi đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
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
                        <span>Tạo: {question.createdAt.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Sử dụng: {question.usageCount} lần</span>
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
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleNavigate(ADMIN_PATHS.QUESTIONS_EDIT(question.id))
                        }
                      >
                        Sửa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main Questions Page với Suspense wrapper
 */
export default function AdminQuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <AdminQuestionsPageContent />
    </Suspense>
  );
}
