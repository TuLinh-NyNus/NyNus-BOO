/**
 * Question Filters Demo Page
 * Demo page để test comprehensive question filtering system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';
import { Button } from '@/components/ui/form/button';
// import { Separator } from '@/components/ui/display/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/display/table';
import { 
  Filter, 
  Database, 
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';

// Import comprehensive filters
import { ComprehensiveQuestionFilters } from '@/components/admin/questions/filters';

// Import services và types
import { Question, QuestionFilters } from '@/lib/types/question';
import { getQuestionCodeLabel } from '@/lib/utils/question-code';
import { useToast } from '@/components/ui/feedback/use-toast';

// Import enhanced hook
import { useQuestionFilters } from '@/hooks/useQuestionFilters';

// ===== INTERFACES =====

interface _QuestionListResponse {
  data: Question[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ===== COMPONENT =====

/**
 * Question Filters Demo Page
 * Comprehensive demo cho advanced filtering system
 */
export default function QuestionFiltersDemoPage() {
  const { toast } = useToast();

  // Use enhanced question filters hook
  const {
    questions,
    pagination,
    isLoading,
    isSearching,
    refetch,
    setPage,
    hasActiveFilters,
    activeFilterCount,
    lastFetchTime,
    fetchCount
  } = useQuestionFilters({
    autoFetch: true,
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách câu hỏi",
        variant: "destructive"
      });
    }
  });

  /**
   * Handle filter changes (now handled automatically by hook)
   */
  const handleFiltersChange = (_newFilters: QuestionFilters) => {
    // Filters are now automatically applied via the hook
    // This function is kept for backward compatibility
  };

  /**
   * Refresh data
   */
  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Đã làm mới",
      description: "Dữ liệu đã được cập nhật",
      variant: "success"
    });
  };

  /**
   * Get question type badge color
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MC': return 'bg-blue-100 text-blue-800';
      case 'TF': return 'bg-green-100 text-green-800';
      case 'SA': return 'bg-yellow-100 text-yellow-800';
      case 'ES': return 'bg-purple-100 text-purple-800';
      case 'MA': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Filters Demo</h1>
          <p className="text-muted-foreground">
            Demo comprehensive filtering system cho Question Management UI
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading || isSearching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isSearching) ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* Performance indicator */}
          <div className="text-xs text-muted-foreground">
            {lastFetchTime.toFixed(1)}ms | #{fetchCount}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <ComprehensiveQuestionFilters
            onFiltersChange={handleFiltersChange}
            resultCount={pagination.total}
            isLoading={isLoading || isSearching}
          />

          {/* Filter Status */}
          {hasActiveFilters && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">Filter Status</div>
              <div className="text-xs text-muted-foreground">
                {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
              </div>
              {isSearching && (
                <div className="text-xs text-orange-600 mt-1">
                  🔍 Searching...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Results Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Kết quả tìm kiếm
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {pagination.total.toLocaleString()} câu hỏi
                  </Badge>
                  <Badge variant="outline">
                    Trang {pagination.page}/{pagination.totalPages}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Đang tải...</span>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Không tìm thấy câu hỏi nào với bộ lọc hiện tại</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Questions Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã câu hỏi</TableHead>
                        <TableHead>Nội dung</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Độ khó</TableHead>
                        <TableHead>Sử dụng</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell className="font-mono text-sm">
                            <div>
                              <div className="font-medium">{question.questionCodeId}</div>
                              <div className="text-xs text-muted-foreground">
                                {getQuestionCodeLabel(question.questionCodeId)}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={question.content}>
                              {question.content}
                            </div>
                            {question.subcount && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {question.subcount}
                              </Badge>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <Badge className={`text-xs ${getTypeColor(question.type)}`}>
                              {question.type}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <Badge className={`text-xs ${getStatusColor(question.status || 'ACTIVE')}`}>
                              {question.status || 'ACTIVE'}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {question.difficulty || 'MEDIUM'}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="text-center">
                            {question.usageCount || 0}
                          </TableCell>
                          
                          <TableCell className="text-center">
                            {question.feedback ? question.feedback.toFixed(1) : 'N/A'}
                          </TableCell>
                          
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Hiển thị {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} trong {pagination.total} câu hỏi
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page <= 1 || isLoading}
                          onClick={() => setPage(pagination.page - 1)}
                        >
                          Trước
                        </Button>

                        <span className="text-sm">
                          {pagination.page} / {pagination.totalPages}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page >= pagination.totalPages || isLoading}
                          onClick={() => setPage(pagination.page + 1)}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
