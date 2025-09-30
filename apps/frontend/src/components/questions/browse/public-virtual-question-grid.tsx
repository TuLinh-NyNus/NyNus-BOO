/**
 * Public Virtual Question Grid Component
 * Adapted từ VirtualQuestionList cho public interface theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React, { useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";

// Import virtual scrolling components
import { VirtualScrollList, VirtualScrollItem } from "@/components/common/performance/virtual-scrolling/VirtualScrollList";

// Import public question components
import { PublicQuestionCard } from "@/components/questions/shared";
import { PublicQuestionLoading } from "@/components/questions/shared/question-loading-skeletons";
import { PublicQuestionErrorBoundary } from "@/components/questions/shared/question-error-boundary";

// Import types
import { PublicQuestion } from "@/types/public";

// ===== CONSTANTS =====

const DEFAULT_QUESTION_ITEM_HEIGHT = 280; // Height cho PublicQuestionCard
const DEFAULT_CONTAINER_HEIGHT = 600; // Default container height
const VIRTUAL_SCROLLING_THRESHOLD = 100; // Threshold để enable virtual scrolling

// ===== TYPES =====

export interface PublicVirtualQuestionGridProps {
  /** Array of public questions to display */
  questions: PublicQuestion[];
  
  /** Container height cho virtual scrolling */
  containerHeight?: number;
  
  /** Question view handler */
  onQuestionView?: (questionId: string) => void;
  
  /** Question share handler */
  onQuestionShare?: (questionId: string) => void;
  
  /** Question bookmark handler */
  onQuestionBookmark?: (questionId: string) => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: string | null;
  
  /** Custom item height */
  itemHeight?: number;
  
  /** Show rating on cards */
  showRating?: boolean;
  
  /** Show views count on cards */
  showViews?: boolean;
  
  /** Show action buttons on cards */
  showActions?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export interface PublicQuestionListItem extends VirtualScrollItem {
  data: PublicQuestion;
}

// ===== HELPER FUNCTIONS =====

/**
 * Convert PublicQuestion array to VirtualScrollItem array
 */
const convertToVirtualItems = (
  questions: PublicQuestion[],
  itemHeight?: number
): PublicQuestionListItem[] => {
  return questions.map((question) => ({
    id: question.id,
    data: question,
    height: itemHeight,
  }));
};

/**
 * Calculate dynamic item height based on content
 */
const calculateItemHeight = (index: number, item: VirtualScrollItem): number => {
  const question = (item as PublicQuestionListItem).data;
  
  // Base height
  let height = DEFAULT_QUESTION_ITEM_HEIGHT;
  
  // Adjust based on content length
  if (question.content && question.content.length > 200) {
    height += 40; // Extra height cho longer content
  }
  
  // Adjust based on question type
  if (question.type === 'MC' && question.answers && question.answers.length > 4) {
    height += 20; // Extra height cho more answer options
  }
  
  return height;
};

// ===== MAIN COMPONENT =====

export const PublicVirtualQuestionGrid: React.FC<PublicVirtualQuestionGridProps> = ({
  questions,
  containerHeight = DEFAULT_CONTAINER_HEIGHT,
  onQuestionView,
  onQuestionShare,
  onQuestionBookmark,
  loading = false,
  error = null,
  itemHeight,
  showRating = true,
  showViews = true,
  showActions = true,
  className = '',
}) => {
  // ===== MEMOIZED DATA =====

  /**
   * Convert questions to virtual scroll items
   */
  const virtualItems = useMemo((): PublicQuestionListItem[] => {
    return convertToVirtualItems(questions, itemHeight);
  }, [questions, itemHeight]);

  /**
   * Calculate item height function
   */
  const getItemHeight = useCallback((index: number, item: VirtualScrollItem): number => {
    if (itemHeight) {
      return itemHeight;
    }
    return calculateItemHeight(index, item);
  }, [itemHeight]);

  // ===== EVENT HANDLERS =====

  const handleQuestionView = useCallback((questionId: string) => {
    onQuestionView?.(questionId);
  }, [onQuestionView]);

  const handleQuestionShare = useCallback((questionId: string) => {
    onQuestionShare?.(questionId);
  }, [onQuestionShare]);

  const handleQuestionBookmark = useCallback((questionId: string) => {
    onQuestionBookmark?.(questionId);
  }, [onQuestionBookmark]);

  // ===== RENDER FUNCTIONS =====

  /**
   * Render individual question item
   */
  const renderQuestionItem = useCallback((
    item: VirtualScrollItem,
    index: number,
    style: React.CSSProperties
  ) => {
    const question = (item as PublicQuestionListItem).data;

    return (
      <div style={style} className="px-4 py-2">
        <PublicQuestionCard
          question={question}
          variant="default"
          onView={handleQuestionView}
          onShare={handleQuestionShare}
          onBookmark={handleQuestionBookmark}
          showRating={showRating}
          showViews={showViews}
          showActions={showActions}
          className="h-full"
        />
      </div>
    );
  }, [
    handleQuestionView,
    handleQuestionShare,
    handleQuestionBookmark,
    showRating,
    showViews,
    showActions
  ]);

  // ===== LOADING STATE =====

  if (loading) {
    return (
      <div className={cn("public-virtual-question-grid-loading", className)}>
        <PublicQuestionLoading
          variant="default"
          count={Math.min(10, Math.ceil(containerHeight / DEFAULT_QUESTION_ITEM_HEIGHT))}
          showActions={showActions}
          showRating={showRating}
          showViews={showViews}
        />
      </div>
    );
  }

  // ===== ERROR STATE =====

  if (error) {
    return (
      <PublicQuestionErrorBoundary
        enableRetry={true}
        maxRetries={3}
        showErrorDetails={process.env.NODE_ENV === 'development'}
        className={cn("public-virtual-question-grid-error", className)}
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">Đã xảy ra lỗi khi tải câu hỏi</p>
        </div>
      </PublicQuestionErrorBoundary>
    );
  }

  // ===== EMPTY STATE =====

  if (!questions || questions.length === 0) {
    return (
      <div className={cn("public-virtual-question-grid-empty text-center py-8", className)}>
        <p className="text-muted-foreground">Không tìm thấy câu hỏi nào</p>
      </div>
    );
  }

  // ===== MAIN RENDER =====

  return (
    <PublicQuestionErrorBoundary
      enableRetry={true}
      maxRetries={3}
      showErrorDetails={process.env.NODE_ENV === 'development'}
      className={cn("public-virtual-question-grid", className)}
    >
      <VirtualScrollList
        items={virtualItems}
        itemHeight={getItemHeight}
        containerHeight={containerHeight}
        renderItem={renderQuestionItem}
        overscanCount={3}
        className="virtual-question-grid"
        estimatedItemSize={DEFAULT_QUESTION_ITEM_HEIGHT}
        getItemKey={(index, item) => (item as PublicQuestionListItem).data.id}
      />
    </PublicQuestionErrorBoundary>
  );
};

// ===== PERFORMANCE UTILITIES =====

/**
 * Estimate virtual scrolling performance
 */
export const estimatePublicQuestionGridPerformance = (questionCount: number) => {
  const estimatedRenderTime = questionCount * 0.15; // ms per item (slightly higher than admin)
  const estimatedMemoryUsage = questionCount * 0.6; // KB per item (higher due to LaTeX)
  
  return {
    renderTime: estimatedRenderTime,
    memoryUsage: estimatedMemoryUsage,
    recommendation: questionCount > VIRTUAL_SCROLLING_THRESHOLD 
      ? 'Nên sử dụng virtual scrolling cho hiệu suất tốt' 
      : 'Có thể render trực tiếp',
    shouldUseVirtualScrolling: questionCount > VIRTUAL_SCROLLING_THRESHOLD,
  };
};

// ===== DEFAULT EXPORT =====

export default PublicVirtualQuestionGrid;
