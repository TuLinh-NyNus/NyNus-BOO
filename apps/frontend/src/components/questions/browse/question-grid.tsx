/**
 * Public Question Grid Component
 * Main grid component với responsive design và virtual scrolling support
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";

// Import components
import { PublicVirtualQuestionGrid } from "./public-virtual-question-grid";
import { PublicQuestionCard } from "@/components/questions/shared";
import { PublicQuestionListLoading } from "@/components/questions/shared/question-loading-skeletons";
import { PublicQuestionErrorBoundary } from "@/components/questions/shared/question-error-boundary";

// Import types
import { PublicQuestion } from "@/lib/types/public";

// Import utilities
import { shouldEnableVirtualScrolling } from "@/lib/utils/question-list-performance";

// ===== CONSTANTS =====

const DEFAULT_CONTAINER_HEIGHT = 600;
const DEFAULT_VIRTUAL_THRESHOLD = 100;
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

// ===== TYPES =====

export type QuestionGridViewMode = 'grid' | 'list' | 'virtual';
export type QuestionGridLayout = 'desktop' | 'tablet' | 'mobile';
export type QuestionGridColumns = 1 | 2 | 3 | 4;

export interface PublicQuestionGridProps {
  /** Array of public questions to display */
  questions: PublicQuestion[];
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: string | null;
  
  /** View mode */
  viewMode?: QuestionGridViewMode;
  
  /** Number of columns cho grid layout */
  columns?: QuestionGridColumns;
  
  /** Enable virtual scrolling */
  enableVirtualScrolling?: boolean;
  
  /** Virtual scrolling threshold */
  virtualScrollingThreshold?: number;
  
  /** Container height cho virtual scrolling */
  containerHeight?: number;
  
  /** Question view handler */
  onQuestionView?: (questionId: string) => void;
  
  /** Question share handler */
  onQuestionShare?: (questionId: string) => void;
  
  /** Question bookmark handler */
  onQuestionBookmark?: (questionId: string) => void;
  
  /** Show rating on cards */
  showRating?: boolean;
  
  /** Show views count on cards */
  showViews?: boolean;
  
  /** Show action buttons on cards */
  showActions?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Detect current layout dựa trên window width
 */
const detectLayout = (): QuestionGridLayout => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < MOBILE_BREAKPOINT) return 'mobile';
  if (width < TABLET_BREAKPOINT) return 'tablet';
  return 'desktop';
};

/**
 * Determine optimal view mode dựa trên số lượng questions và layout
 */
const determineOptimalViewMode = (
  questionCount: number,
  layout: QuestionGridLayout,
  enableVirtualScrolling: boolean,
  threshold: number
): QuestionGridViewMode => {
  // Mobile luôn dùng grid
  if (layout === 'mobile') return 'grid';
  
  // Nếu có nhiều items và virtual scrolling enabled
  if (enableVirtualScrolling && questionCount > threshold) {
    return 'virtual';
  }
  
  // Default grid cho desktop/tablet
  return 'grid';
};

/**
 * Get responsive grid classes
 */
const getGridClasses = (columns: QuestionGridColumns, layout: QuestionGridLayout): string => {
  // Mobile luôn 1 column
  if (layout === 'mobile') return 'grid-cols-1';
  
  // Responsive classes based on columns
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };
  
  return gridClasses[columns] || gridClasses[3];
};

// ===== MAIN COMPONENT =====

export const PublicQuestionGrid: React.FC<PublicQuestionGridProps> = ({
  questions,
  loading = false,
  error = null,
  viewMode: propViewMode,
  columns = 3,
  enableVirtualScrolling = true,
  virtualScrollingThreshold = DEFAULT_VIRTUAL_THRESHOLD,
  containerHeight = DEFAULT_CONTAINER_HEIGHT,
  onQuestionView,
  onQuestionShare,
  onQuestionBookmark,
  showRating = true,
  showViews = true,
  showActions = true,
  className = '',
}) => {
  // ===== STATE =====
  
  const [currentLayout, setCurrentLayout] = useState<QuestionGridLayout>(() => detectLayout());
  
  // ===== EFFECTS =====
  
  // Detect layout changes
  useEffect(() => {
    const handleResize = () => {
      setCurrentLayout(detectLayout());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // ===== COMPUTED VALUES =====
  
  // Determine optimal view mode
  const optimalViewMode = useMemo(() => 
    determineOptimalViewMode(
      questions.length, 
      currentLayout, 
      enableVirtualScrolling, 
      virtualScrollingThreshold
    ),
    [questions.length, currentLayout, enableVirtualScrolling, virtualScrollingThreshold]
  );
  
  // Current view mode (prop có priority cao hơn optimal)
  const currentViewMode = propViewMode || optimalViewMode;
  
  // Should use virtual scrolling
  const shouldUseVirtual = useMemo(() => 
    shouldEnableVirtualScrolling(
      questions.length,
      currentLayout,
      enableVirtualScrolling
    ),
    [questions.length, currentLayout, enableVirtualScrolling]
  );
  
  // Grid classes
  const gridClasses = useMemo(() => 
    getGridClasses(columns, currentLayout),
    [columns, currentLayout]
  );
  
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
  
  // ===== LOADING STATE =====
  
  if (loading) {
    return (
      <div className={cn("public-question-grid-loading", className)}>
        <PublicQuestionListLoading
          layout="grid"
          itemCount={12}
          columns={columns}
          showSearch={false}
          showFilters={false}
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
        className={cn("public-question-grid-error", className)}
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">Đã xảy ra lỗi khi tải câu hỏi</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </PublicQuestionErrorBoundary>
    );
  }
  
  // ===== EMPTY STATE =====
  
  if (!questions || questions.length === 0) {
    return (
      <div className={cn("public-question-grid-empty text-center py-12", className)}>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Không tìm thấy câu hỏi nào
          </h3>
          <p className="text-muted-foreground">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm câu hỏi
          </p>
        </div>
      </div>
    );
  }
  
  // ===== VIRTUAL SCROLLING MODE =====
  
  if (currentViewMode === 'virtual' || shouldUseVirtual) {
    return (
      <PublicQuestionErrorBoundary
        enableRetry={true}
        maxRetries={3}
        className={cn("public-question-grid-virtual", className)}
      >
        <PublicVirtualQuestionGrid
          questions={questions}
          containerHeight={containerHeight}
          onQuestionView={handleQuestionView}
          onQuestionShare={handleQuestionShare}
          onQuestionBookmark={handleQuestionBookmark}
          loading={loading}
          error={error}
          showRating={showRating}
          showViews={showViews}
          showActions={showActions}
        />
      </PublicQuestionErrorBoundary>
    );
  }
  
  // ===== GRID/LIST MODE =====
  
  return (
    <PublicQuestionErrorBoundary
      enableRetry={true}
      maxRetries={3}
      className={cn("public-question-grid", className)}
    >
      <div className={cn(
        "grid gap-6",
        currentViewMode === 'list' ? 'grid-cols-1' : gridClasses,
        "transition-all duration-300"
      )}>
        {questions.map((question) => (
          <PublicQuestionCard
            key={question.id}
            question={question}
            variant={currentViewMode === 'list' ? 'default' : 'compact'}
            onView={handleQuestionView}
            onShare={handleQuestionShare}
            onBookmark={handleQuestionBookmark}
            showRating={showRating}
            showViews={showViews}
            showActions={showActions}
            className="transition-all duration-200 hover:shadow-lg"
          />
        ))}
      </div>
    </PublicQuestionErrorBoundary>
  );
};

// ===== DEFAULT EXPORT =====

export default PublicQuestionGrid;
