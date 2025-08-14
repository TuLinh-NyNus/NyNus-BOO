/**
 * Real-time Question Filters Demo Page
 * Enhanced demo với real-time filter application và validation
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Separator,
  Progress
} from '@/components/ui';
import {
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  TrendingUp
} from 'lucide-react';

// Import components và hooks
import { ComprehensiveQuestionFilters } from '@/components/admin/questions/filters';
import { useQuestionFilters } from '@/hooks/useQuestionFilters';
import { useToast } from '@/components/ui/feedback/use-toast';

// Import validation utilities
import { 
  validateQuestionFilters, 
  detectFilterConflicts,
  getFilterValidationSummary,
  type FilterValidationResult,
  type FilterConflict
} from '@/lib/utils/filter-validation';

// Import types và utilities
import { getQuestionCodeLabel } from '@/lib/utils/question-code';

// ===== COMPONENT =====

/**
 * Real-time Question Filters Demo Page
 * Comprehensive demo với advanced filtering, validation, và real-time updates
 */
export default function RealTimeQuestionFiltersPage() {
  const { toast } = useToast();
  
  // State cho validation
  const [validationResult, setValidationResult] = useState<FilterValidationResult | null>(null);
  const [filterConflicts, setFilterConflicts] = useState<FilterConflict[]>([]);
  
  // Use enhanced question filters hook
  const {
    questions,
    pagination,
    isLoading,
    isSearching,
    filters,
    refetch,
    setPage,
    hasActiveFilters,
    activeFilterCount,
    lastFetchTime,
    fetchCount
  } = useQuestionFilters({
    autoFetch: true,
    searchDebounceDelay: 300,
    filterDebounceDelay: 100,
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách câu hỏi",
        variant: "destructive"
      });
    },
    onSuccess: (_response) => {
      // Validate filters khi có response mới
      const validation = validateQuestionFilters(filters);
      const conflicts = detectFilterConflicts(filters);

      setValidationResult(validation);
      setFilterConflicts(conflicts);

      // Show validation warnings nếu có
      if (validation.warnings.length > 0) {
        toast({
          title: "Cảnh báo Filter",
          description: `${validation.warnings.length} cảnh báo về filter combination`,
          variant: "default"
        });
      }
    }
  });

  /**
   * Handle manual refresh
   */
  const handleRefresh = useCallback(async () => {
    await refetch();
    toast({
      title: "Đã làm mới",
      description: "Dữ liệu đã được cập nhật",
      variant: "success"
    });
  }, [refetch, toast]);

  /**
   * Handle export (mock)
   */
  const handleExport = useCallback(() => {
    toast({
      title: "Export",
      description: `Đang export ${pagination.total} câu hỏi...`,
      variant: "info"
    });
  }, [pagination.total, toast]);

  /**
   * Format performance metrics
   */
  const formatPerformanceMetrics = () => {
    return {
      fetchTime: `${lastFetchTime.toFixed(1)}ms`,
      fetchCount: fetchCount,
      avgFetchTime: fetchCount > 0 ? `${(lastFetchTime / fetchCount).toFixed(1)}ms` : '0ms'
    };
  };

  const performanceMetrics = formatPerformanceMetrics();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Question Filters</h1>
          <p className="text-muted-foreground">
            Enhanced filtering với real-time updates, validation và performance monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance & Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filter Status */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Active Filters</div>
                <div className="text-2xl font-bold">{activeFilterCount}</div>
              </div>
            </div>
            
            {/* Search Status */}
            <div className="flex items-center gap-2">
              <Search className={`h-4 w-4 ${isSearching ? 'text-orange-500 animate-pulse' : 'text-green-500'}`} />
              <div>
                <div className="text-sm font-medium">Search Status</div>
                <div className="text-sm">{isSearching ? 'Searching...' : 'Ready'}</div>
              </div>
            </div>
            
            {/* Performance */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Last Fetch</div>
                <div className="text-sm">{performanceMetrics.fetchTime}</div>
              </div>
            </div>
            
            {/* Results */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">Results</div>
                <div className="text-2xl font-bold">{pagination.total}</div>
              </div>
            </div>
          </div>
          
          {/* Loading Progress */}
          {(isLoading || isSearching) && (
            <div className="mt-4">
              <Progress value={undefined} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {isSearching ? 'Đang tìm kiếm...' : 'Đang tải dữ liệu...'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Alerts */}
      {validationResult && (
        <div className="space-y-2">
          {/* Validation Summary */}
          <Alert variant={validationResult.isValid ? "default" : "destructive"}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Filter Validation:</strong> {getFilterValidationSummary(validationResult)}
            </AlertDescription>
          </Alert>
          
          {/* Validation Errors */}
          {validationResult.errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{error.field}:</strong> {error.message}
              </AlertDescription>
            </Alert>
          ))}
          
          {/* Validation Warnings */}
          {validationResult.warnings.map((warning, index) => (
            <Alert key={index} variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{warning.field}:</strong> {warning.message}
              </AlertDescription>
            </Alert>
          ))}

          {/* Filter Conflicts */}
          {filterConflicts.map((conflict, index) => (
            <Alert key={index} variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Conflict:</strong> {conflict.description}
                <div className="mt-1 text-xs">
                  Fields: {conflict.conflictingFields.join(', ')}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <ComprehensiveQuestionFilters
            resultCount={pagination.total}
            isLoading={isLoading || isSearching}
          />
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Kết quả tìm kiếm
                  {hasActiveFilters && (
                    <Badge variant="secondary">
                      {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Fetch #{fetchCount}</span>
                  <span>•</span>
                  <span>{performanceMetrics.fetchTime}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Results Summary */}
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    Hiển thị {questions.length} / {pagination.total} câu hỏi
                  </span>
                  <span>
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                </div>
              </div>

              {/* Questions List */}
              {isLoading && questions.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Đang tải câu hỏi...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Không tìm thấy câu hỏi nào với filter hiện tại
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((question) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {getQuestionCodeLabel(question.questionCodeId)}
                            </Badge>
                            <Badge variant={
                              question.type === 'MC' ? 'default' :
                              question.type === 'TF' ? 'secondary' :
                              question.type === 'SA' ? 'outline' : 'destructive'
                            }>
                              {question.type}
                            </Badge>
                            {question.difficulty && (
                              <Badge variant={
                                question.difficulty === 'EASY' ? 'secondary' :
                                question.difficulty === 'MEDIUM' ? 'outline' : 'destructive'
                              }>
                                {question.difficulty}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm line-clamp-2 mb-2">
                            {question.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>ID: {question.id}</span>
                            {question.usageCount !== undefined && (
                              <span>Sử dụng: {question.usageCount}</span>
                            )}
                            {question.feedback !== undefined && (
                              <span>Đánh giá: {question.feedback}/5</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Tổng {pagination.total} câu hỏi
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
                      
                      <span className="text-sm px-2">
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
