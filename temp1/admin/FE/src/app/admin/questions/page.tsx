/**
 * Admin Questions List Page
 * Main page cho question management trong admin panel
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
} from "@/components/ui";
import {
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
} from "lucide-react";

// Import admin-specific question components
import { QuestionListAdmin } from "@/components/questions/question-list-admin";
import { QuestionFiltersAdmin } from "@/components/questions/question-filters-admin";
import { QuestionBulkActions } from "@/components/questions/question-bulk-actions";

// Import hooks và utilities
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { toSecretPath } from "@/lib/admin-paths";

/**
 * Question List Page Component
 * Main component cho admin question management
 */
function AdminQuestionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, hasRole } = useAdminAuth();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    archived: 0,
  });

  // URL state management cho filters và pagination
  const currentPage = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("limit") || "20");
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const typeFilter = searchParams.get("type") || "";
  const creatorFilter = searchParams.get("creator") || "";

  // Permission checks
  const canManageAllQuestions = hasRole("ADMIN");
  const canCreateQuestions = hasRole("ADMIN") || hasRole("TEACHER");

  /**
   * Load questions data từ API
   */
  const loadQuestions = async () => {
    try {
      setIsLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", pageSize.toString());

      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (creatorFilter) params.set("creator", creatorFilter);

      // For non-admin users, only show their own questions
      if (!canManageAllQuestions && user?.id) {
        params.set("creator", user.id);
      }

      // TODO: Replace với actual API call
      const response = await fetch(`/api/admin/questions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load questions");
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Không thể tải danh sách câu hỏi");
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
    router.push(`${toSecretPath("/admin/questions")}?${params.toString()}`);
  };

  /**
   * Handle pagination changes
   */
  const handlePaginationChange = (page: number, limit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    router.push(`${toSecretPath("/admin/questions")}?${params.toString()}`);
  };

  /**
   * Handle bulk operations
   */
  const handleBulkOperation = async (operation: string, questionIds: string[]) => {
    try {
      // TODO: Implement actual bulk operations
      console.log(`Bulk ${operation} for questions:`, questionIds);

      switch (operation) {
        case "delete":
          // Implement bulk delete
          toast.success(`Đã xóa ${questionIds.length} câu hỏi`);
          break;
        case "export":
          // Implement bulk export
          toast.success(`Đã xuất ${questionIds.length} câu hỏi`);
          break;
        case "activate":
          // Implement bulk status change
          toast.success(`Đã kích hoạt ${questionIds.length} câu hỏi`);
          break;
        default:
          toast.error("Thao tác không được hỗ trợ");
      }

      // Clear selection và reload data
      setSelectedQuestions([]);
      await loadQuestions();
    } catch (error) {
      console.error("Bulk operation error:", error);
      toast.error("Có lỗi xảy ra khi thực hiện thao tác");
    }
  };

  /**
   * Handle question actions
   */
  const handleQuestionEdit = (questionId: string) => {
    router.push(toSecretPath(`/admin/questions/${questionId}/edit`));
  };

  const handleQuestionDelete = async (questionId: string) => {
    try {
      // TODO: Implement delete confirmation và API call
      console.log("Delete question:", questionId);
      toast.success("Đã xóa câu hỏi");
      await loadQuestions();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Không thể xóa câu hỏi");
    }
  };

  // Load data on mount và when URL params change
  useEffect(() => {
    if (isAuthenticated) {
      loadQuestions();
    }
  }, [isAuthenticated, searchParams]);

  // Show loading state
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    );
  }

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

      {/* Filters và Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách câu hỏi</CardTitle>
              <CardDescription>Quản lý và tìm kiếm câu hỏi trong hệ thống</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
              <Button variant="outline" size="sm" onClick={loadQuestions} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Component */}
          {showFilters && (
            <QuestionFiltersAdmin
              onFilterChange={handleFilterChange}
              initialFilters={{
                search: searchQuery,
                status: statusFilter,
                type: typeFilter,
                creator: creatorFilter,
              }}
            />
          )}

          {/* Bulk Actions */}
          {selectedQuestions.length > 0 && (
            <QuestionBulkActions
              selectedCount={selectedQuestions.length}
              onBulkOperation={handleBulkOperation}
              selectedQuestions={selectedQuestions}
              canDelete={canManageAllQuestions}
              canExport={true}
              canChangeStatus={canManageAllQuestions}
            />
          )}

          {/* Questions List */}
          <QuestionListAdmin
            questions={questions}
            loading={isLoading}
            selectedQuestions={selectedQuestions}
            onSelectionChange={setSelectedQuestions}
            onQuestionEdit={handleQuestionEdit}
            onQuestionDelete={handleQuestionDelete}
            userRole={user?.role || "GUEST"}
            pagination={{
              page: currentPage,
              pageSize: pageSize,
              total: stats.total,
            }}
            onPaginationChange={handlePaginationChange}
            showBulkActions={canManageAllQuestions}
          />
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
