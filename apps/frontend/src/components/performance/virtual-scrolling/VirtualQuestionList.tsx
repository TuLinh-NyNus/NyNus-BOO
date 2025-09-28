/**
 * Virtual Question List Component
 * Specialized virtual scrolling component cho question lists
 * Optimized cho Question data structure với preview và actions
 */

import React, { useMemo, useCallback } from 'react';
import { VirtualScrollList, VirtualScrollItem } from './VirtualScrollList';
import { Question, QuestionType, QuestionDifficulty } from '@/lib/types/question';
import { Badge, Button, Card, CardContent } from '@/components/ui';
import { Eye, Edit, Trash2, Copy } from 'lucide-react';

// ===== TYPES =====

export interface QuestionVirtualScrollProps {
  questions: Question[];
  containerHeight: number;
  onQuestionView?: (question: Question) => void;
  onQuestionEdit?: (question: Question) => void;
  onQuestionDelete?: (question: Question) => void;
  onQuestionDuplicate?: (question: Question) => void;
  selectedQuestionIds?: string[];
  onQuestionSelect?: (questionId: string, selected: boolean) => void;
  showActions?: boolean;
  showPreview?: boolean;
  itemHeight?: number;
  className?: string;
}

export interface QuestionListItem extends VirtualScrollItem {
  data: Question;
}

// ===== CONSTANTS =====

const DEFAULT_QUESTION_ITEM_HEIGHT = 120;
const COMPACT_QUESTION_ITEM_HEIGHT = 80;

// ===== UTILITY FUNCTIONS =====

/**
 * Get question type label in Vietnamese
 */
const getQuestionTypeLabel = (type: QuestionType): string => {
  const labels = {
    [QuestionType.MC]: 'Trắc nghiệm',
    [QuestionType.TF]: 'Đúng/Sai',
    [QuestionType.SA]: 'Trả lời ngắn',
    [QuestionType.ES]: 'Tự luận',
    [QuestionType.MA]: 'Nhiều đáp án',
  };
  return labels[type] || type;
};

/**
 * Get difficulty color
 */
const getDifficultyColor = (difficulty: QuestionDifficulty): string => {
  const colors = {
    [QuestionDifficulty.EASY]: 'bg-green-100 text-green-800',
    [QuestionDifficulty.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [QuestionDifficulty.HARD]: 'bg-red-100 text-red-800',
    [QuestionDifficulty.EXPERT]: 'bg-purple-100 text-purple-800',
  };
  return colors[difficulty] || 'bg-gray-100 text-gray-800';
};

/**
 * Truncate text for preview
 */
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ===== QUESTION ITEM COMPONENT =====

interface QuestionItemProps {
  question: Question;
  index: number;
  style: React.CSSProperties;
  isSelected?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onSelect?: (selected: boolean) => void;
  showActions?: boolean;
  showPreview?: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  style,
  isSelected = false,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onSelect,
  showActions = true,
  showPreview = true,
}) => {
  return (
    <div style={style} className="px-4 py-2">
      <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Question Info */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                {onSelect && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                )}
                
                <Badge variant="outline" className="text-xs">
                  {getQuestionTypeLabel(question.type)}
                </Badge>
                
                {question.difficulty && (
                  <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </Badge>
                )}
              </div>

              {/* Content Preview */}
              {showPreview && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {truncateText(question.content, 80)}
                  </p>

                  {question.source && (
                    <p className="text-xs text-gray-500">
                      Nguồn: {question.source}
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              {question.tag && question.tag.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {question.tag.slice(0, 3).map((tag: string, tagIndex: number) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
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

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>ID: {question.id}</span>
                {question.createdAt && (
                  <span>
                    Tạo: {new Date(question.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
                {question.status && (
                  <Badge variant="outline" className="text-xs">
                    {question.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-1">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onView}
                    className="h-8 w-8 p-0"
                    title="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="h-8 w-8 p-0"
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                
                {onDuplicate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDuplicate}
                    className="h-8 w-8 p-0"
                    title="Sao chép"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const VirtualQuestionList: React.FC<QuestionVirtualScrollProps> = ({
  questions,
  containerHeight,
  onQuestionView,
  onQuestionEdit,
  onQuestionDelete,
  onQuestionDuplicate,
  selectedQuestionIds = [],
  onQuestionSelect,
  showActions = true,
  showPreview = true,
  itemHeight,
  className = '',
}) => {
  // ===== MEMOIZED DATA =====

  /**
   * Convert questions to virtual scroll items
   */
  const virtualItems = useMemo((): QuestionListItem[] => {
    return questions.map((question) => ({
      id: question.id,
      data: question,
      height: itemHeight,
    }));
  }, [questions, itemHeight]);

  /**
   * Calculate dynamic item height based on content
   */
  const calculateItemHeight = useCallback((index: number, item: VirtualScrollItem): number => {
    if (itemHeight) return itemHeight;

    const question = (item as QuestionListItem).data;
    let height = COMPACT_QUESTION_ITEM_HEIGHT;
    
    // Add height for content preview
    if (showPreview) {
      height += 20; // Content line
      if (question.source) height += 16; // Source line
    }

    // Add height for tags
    if (question.tag && question.tag.length > 0) {
      height += 24; // Tags row
    }
    
    // Add height for metadata
    height += 20; // Metadata row
    
    return Math.max(height, DEFAULT_QUESTION_ITEM_HEIGHT);
  }, [itemHeight, showPreview]);

  // ===== EVENT HANDLERS =====

  const handleQuestionView = useCallback((question: Question) => {
    onQuestionView?.(question);
  }, [onQuestionView]);

  const handleQuestionEdit = useCallback((question: Question) => {
    onQuestionEdit?.(question);
  }, [onQuestionEdit]);

  const handleQuestionDelete = useCallback((question: Question) => {
    onQuestionDelete?.(question);
  }, [onQuestionDelete]);

  const handleQuestionDuplicate = useCallback((question: Question) => {
    onQuestionDuplicate?.(question);
  }, [onQuestionDuplicate]);

  const handleQuestionSelect = useCallback((questionId: string, selected: boolean) => {
    onQuestionSelect?.(questionId, selected);
  }, [onQuestionSelect]);

  // ===== RENDER ITEM =====

  const renderQuestionItem = useCallback((
    item: VirtualScrollItem,
    index: number,
    style: React.CSSProperties
  ) => {
    const question = (item as QuestionListItem).data;
    const isSelected = selectedQuestionIds.includes(question.id);

    return (
      <QuestionItem
        key={question.id}
        question={question}
        index={index}
        style={style}
        isSelected={isSelected}
        onView={() => handleQuestionView(question)}
        onEdit={() => handleQuestionEdit(question)}
        onDelete={() => handleQuestionDelete(question)}
        onDuplicate={() => handleQuestionDuplicate(question)}
        onSelect={(selected) => handleQuestionSelect(question.id, selected)}
        showActions={showActions}
        showPreview={showPreview}
      />
    );
  }, [
    selectedQuestionIds,
    handleQuestionView,
    handleQuestionEdit,
    handleQuestionDelete,
    handleQuestionDuplicate,
    handleQuestionSelect,
    showActions,
    showPreview,
  ]);

  // ===== RENDER =====

  if (questions.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Không có câu hỏi nào</p>
          <p className="text-sm">Thêm câu hỏi mới để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <VirtualScrollList
      items={virtualItems}
      itemHeight={calculateItemHeight}
      containerHeight={containerHeight}
      renderItem={renderQuestionItem}
      overscanCount={3}
      className={`virtual-question-list ${className}`}
      estimatedItemSize={DEFAULT_QUESTION_ITEM_HEIGHT}
      getItemKey={(index, item) => (item as QuestionListItem).data.id}
    />
  );
};

// ===== PERFORMANCE UTILITIES =====

/**
 * Calculate optimal container height for question list
 */
export const calculateOptimalQuestionListHeight = (
  availableHeight: number,
  questionCount: number,
  showHeader: boolean = true
): number => {
  const headerHeight = showHeader ? 60 : 0;
  const footerHeight = 40; // Pagination
  const padding = 20;
  
  return Math.max(
    300, // Minimum height
    availableHeight - headerHeight - footerHeight - padding
  );
};

/**
 * Estimate question list performance
 */
export const estimateQuestionListPerformance = (questionCount: number) => {
  const estimatedRenderTime = questionCount * 0.1; // ms per item
  const estimatedMemoryUsage = questionCount * 0.5; // KB per item
  
  return {
    renderTime: estimatedRenderTime,
    memoryUsage: estimatedMemoryUsage,
    recommendation: questionCount > 1000 
      ? 'Sử dụng virtual scrolling' 
      : 'Có thể render trực tiếp',
  };
};
