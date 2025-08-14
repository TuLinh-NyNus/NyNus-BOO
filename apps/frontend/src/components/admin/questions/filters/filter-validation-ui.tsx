/**
 * Filter Validation UI Component
 * Displays validation errors, warnings, và no results states
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Alert, AlertDescription, Badge, Button } from '@/components/ui';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import validation utilities
import { 
  validateQuestionFilters, 
  detectFilterConflicts,
  getFilterValidationSummary,
  type FilterValidationResult,
  type FilterConflict
} from '@/lib/utils/filter-validation';

// Import store
import { useQuestionFiltersStore } from '@/lib/stores/question-filters';

// ===== INTERFACES =====

interface FilterValidationUIProps {
  className?: string;
  resultCount?: number;
  isLoading?: boolean;
  onRetry?: () => void;
}

interface NoResultsStateProps {
  activeFilterCount: number;
  onClearFilters: () => void;
  onRetry: () => void;
}

interface ValidationSummaryProps {
  validation: FilterValidationResult;
  conflicts: FilterConflict[];
}

// ===== SUB-COMPONENTS =====

/**
 * No Results State Component
 */
function NoResultsState({ activeFilterCount, onClearFilters, onRetry }: NoResultsStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        
        <h3 className="text-lg font-semibold mb-2">
          Không tìm thấy câu hỏi nào
        </h3>
        
        <p className="text-muted-foreground mb-6">
          {activeFilterCount > 0 
            ? `Không có câu hỏi nào phù hợp với ${activeFilterCount} bộ lọc đang áp dụng.`
            : 'Không có câu hỏi nào trong hệ thống.'
          }
        </p>

        <div className="space-y-3">
          {activeFilterCount > 0 && (
            <>
              <Button onClick={onClearFilters} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Xóa tất cả bộ lọc
              </Button>
              
              <Button variant="outline" onClick={onRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </>
          )}
          
          {activeFilterCount === 0 && (
            <Button variant="outline" onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          )}
        </div>

        {/* Suggestions */}
        <div className="mt-8 p-4 bg-muted rounded-lg text-left">
          <h4 className="font-medium mb-2">💡 Gợi ý:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Thử giảm số lượng bộ lọc</li>
            <li>• Kiểm tra lại các điều kiện tìm kiếm</li>
            <li>• Sử dụng từ khóa tổng quát hơn</li>
            <li>• Xóa các bộ lọc loại trừ (hasAnswers: false, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Validation Summary Component
 */
function ValidationSummary({ validation, conflicts }: ValidationSummaryProps) {
  const hasIssues = !validation.isValid || validation.warnings.length > 0 || conflicts.length > 0;
  
  if (!hasIssues) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Bộ lọc hợp lệ:</strong> Tất cả điều kiện đều chính xác
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {/* Validation Summary */}
      <Alert variant={validation.isValid ? "default" : "destructive"}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Trạng thái bộ lọc:</strong> {getFilterValidationSummary(validation)}
        </AlertDescription>
      </Alert>

      {/* Validation Errors */}
      {validation.errors.map((error, index) => (
        <Alert key={`error-${index}`} variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{error.field}:</strong> {error.message}
            <Badge variant="destructive" className="ml-2 text-xs">
              {error.code}
            </Badge>
          </AlertDescription>
        </Alert>
      ))}

      {/* Validation Warnings */}
      {validation.warnings.map((warning, index) => (
        <Alert key={`warning-${index}`} variant="default" className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>{warning.field}:</strong> {warning.message}
            <Badge variant="outline" className="ml-2 text-xs border-yellow-300">
              {warning.code}
            </Badge>
          </AlertDescription>
        </Alert>
      ))}

      {/* Filter Conflicts */}
      {conflicts.map((conflict, index) => (
        <Alert key={`conflict-${index}`} variant="default" className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Xung đột:</strong> {conflict.description}
            <div className="mt-1 text-xs opacity-75">
              Các trường: {conflict.conflictingFields.join(', ')}
            </div>
            {conflict.suggestions.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium">Gợi ý:</div>
                {conflict.suggestions.map((suggestion, suggestionIndex) => (
                  <div key={suggestionIndex} className="text-xs mt-1">
                    • {suggestion.message}
                  </div>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Filter Validation UI Component
 */
export function FilterValidationUI({ 
  className, 
  resultCount = 0, 
  isLoading = false,
  onRetry 
}: FilterValidationUIProps) {
  const { filters, resetFilters } = useQuestionFiltersStore();
  
  // Calculate active filter count
  const activeFilterCount = React.useMemo(() => {
    const {
      grade, subject, chapter, level, lesson, form, format,
      type, status, difficulty, creator,
      source, tags, subcount, hasAnswers, hasSolution, hasImages,
      usageCount, feedback, dateRange,
      keyword, solutionKeyword, latexKeyword, globalSearch
    } = filters;

    let count = 0;
    
    // Count all active filters
    if (grade?.length) count++;
    if (subject?.length) count++;
    if (chapter?.length) count++;
    if (level?.length) count++;
    if (lesson?.length) count++;
    if (form?.length) count++;
    if (format?.length) count++;
    if (type?.length) count++;
    if (status?.length) count++;
    if (difficulty?.length) count++;
    if (creator?.length) count++;
    if (source?.length) count++;
    if (tags?.length) count++;
    if (subcount) count++;
    if (hasAnswers !== undefined) count++;
    if (hasSolution !== undefined) count++;
    if (hasImages !== undefined) count++;
    if (usageCount) count++;
    if (feedback) count++;
    if (dateRange) count++;
    if (keyword) count++;
    if (solutionKeyword) count++;
    if (latexKeyword) count++;
    if (globalSearch) count++;
    
    return count;
  }, [filters]);

  // Validate filters
  const validation = React.useMemo(() => validateQuestionFilters(filters), [filters]);
  const conflicts = React.useMemo(() => detectFilterConflicts(filters), [filters]);

  // Handle retry
  const handleRetry = () => {
    onRetry?.();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Validation Summary */}
      <ValidationSummary validation={validation} conflicts={conflicts} />

      {/* No Results State */}
      {!isLoading && resultCount === 0 && (
        <NoResultsState
          activeFilterCount={activeFilterCount}
          onClearFilters={resetFilters}
          onRetry={handleRetry}
        />
      )}

      {/* Filter Limit Warning */}
      {activeFilterCount > 10 && (
        <Alert variant="default" className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Quá nhiều bộ lọc:</strong> Bạn đang sử dụng {activeFilterCount} bộ lọc. 
            Điều này có thể làm chậm hiệu suất tìm kiếm.
          </AlertDescription>
        </Alert>
      )}

      {/* Performance Warning */}
      {resultCount > 1000 && (
        <Alert variant="default" className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Kết quả lớn:</strong> Tìm thấy {resultCount.toLocaleString()} câu hỏi. 
            Thêm bộ lọc để thu hẹp kết quả.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default FilterValidationUI;
