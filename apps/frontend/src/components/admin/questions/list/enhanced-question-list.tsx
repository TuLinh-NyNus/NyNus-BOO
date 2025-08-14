/**
 * Enhanced Question List Component
 * Unified component kết hợp table display và virtual scrolling
 * Tự động chuyển đổi giữa normal table và virtual scrolling dựa trên số lượng items
 * 
 * @author NyNus Team
 * @version 2.0.0
 */

"use client";

import React, { useMemo, useState, useCallback } from "react";
// import { useRouter } from "next/navigation"; // TODO: Use for navigation
import {
  Card,
  CardContent,
  Button,
  Badge,
  // Skeleton,
  Alert,
  AlertDescription,
} from "@/components/ui";
import { 
  AlertTriangle, 
  RefreshCw, 
  List, 
  Grid,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";

// Import existing components
// import { QuestionListTable } from "./questionListTable";
import { QuestionListPagination } from "./questionListPagination";
import { VirtualQuestionList } from "@/components/performance/virtual-scrolling/VirtualQuestionList";
import { QuestionListSkeleton } from "./question-list-skeleton";
import { QuestionListErrorBoundary } from "./question-list-error-boundary";
import { ResponsiveQuestionTable, QuestionMobileCard } from "./responsive";
import { useQuestionListOptimizations } from "@/lib/utils/question-list-optimizations";
import { useQuestionListAccessibility } from "@/lib/utils/question-list-accessibility";

// Import types
import {
  Question,
  QuestionPagination
} from "@/lib/types/question";

// ===== CONSTANTS =====

const VIRTUAL_SCROLLING_THRESHOLD = 100; // Số items để bật virtual scrolling
const DEFAULT_CONTAINER_HEIGHT = 600; // Height cho virtual scrolling
const MOBILE_BREAKPOINT = 768; // Mobile breakpoint
const TABLET_BREAKPOINT = 1024; // Tablet breakpoint

// ===== TYPES =====

export type QuestionListViewMode = 'table' | 'cards' | 'virtual';
export type QuestionListLayout = 'desktop' | 'tablet' | 'mobile';

export interface EnhancedQuestionListProps {
  // Data props
  questions: Question[];
  loading?: boolean;
  error?: string | null;
  
  // Selection props
  selectedQuestions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  
  // Action props
  onQuestionEdit: (questionId: string) => void;
  onQuestionDelete: (questionId: string) => void;
  onQuestionView?: (questionId: string) => void;
  onQuestionDuplicate?: (questionId: string) => void;
  
  // Pagination props
  pagination: QuestionPagination;
  onPaginationChange: (page: number, pageSize: number) => void;
  
  // Display props
  userRole: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  showBulkActions?: boolean;
  showActions?: boolean;
  showPreview?: boolean;
  
  // Layout props
  viewMode?: QuestionListViewMode;
  onViewModeChange?: (mode: QuestionListViewMode) => void;
  containerHeight?: number;
  
  // Performance props
  enableVirtualScrolling?: boolean;
  virtualScrollingThreshold?: number;
  
  // Responsive props
  layout?: QuestionListLayout;
  onLayoutChange?: (layout: QuestionListLayout) => void;
  
  // Additional props
  className?: string;
  onRefresh?: () => void;
}

// ===== HELPER FUNCTIONS =====

/**
 * Detect current layout dựa trên window width
 */
const detectLayout = (): QuestionListLayout => {
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
  layout: QuestionListLayout,
  enableVirtualScrolling: boolean,
  threshold: number
): QuestionListViewMode => {
  // Mobile luôn dùng cards
  if (layout === 'mobile') return 'cards';
  
  // Nếu có nhiều items và virtual scrolling enabled
  if (enableVirtualScrolling && questionCount > threshold) {
    return 'virtual';
  }
  
  // Default table cho desktop/tablet
  return 'table';
};

/**
 * Calculate performance metrics
 */
const calculatePerformanceMetrics = (questionCount: number) => {
  const estimatedRenderTime = questionCount * 0.1; // ms per item
  const estimatedMemoryUsage = questionCount * 0.5; // KB per item
  
  return {
    renderTime: estimatedRenderTime,
    memoryUsage: estimatedMemoryUsage,
    recommendation: questionCount > 1000 
      ? 'Nên sử dụng virtual scrolling' 
      : 'Có thể render trực tiếp',
    shouldUseVirtualScrolling: questionCount > 100
  };
};

// ===== MAIN COMPONENT =====

export function EnhancedQuestionList({
  // Data props
  questions,
  loading = false,
  error = null,
  
  // Selection props
  selectedQuestions,
  onSelectionChange,
  
  // Action props
  onQuestionEdit,
  onQuestionDelete,
  onQuestionView,
  onQuestionDuplicate,
  
  // Pagination props
  pagination,
  onPaginationChange,
  
  // Display props
  userRole,
  showBulkActions = true,
  showActions = true,
  showPreview = true,
  
  // Layout props
  viewMode: propViewMode,
  onViewModeChange,
  containerHeight = DEFAULT_CONTAINER_HEIGHT,
  
  // Performance props
  enableVirtualScrolling = true,
  virtualScrollingThreshold = VIRTUAL_SCROLLING_THRESHOLD,
  
  // Responsive props
  layout: propLayout,
  onLayoutChange,
  
  // Additional props
  className = "",
  onRefresh,
}: EnhancedQuestionListProps) {
  // const router = useRouter(); // TODO: Use for navigation
  
  // ===== STATE =====
  
  // Detect layout nếu không được provide
  const [detectedLayout, setDetectedLayout] = useState<QuestionListLayout>(() => 
    propLayout || detectLayout()
  );
  
  // Current layout (prop có priority cao hơn detected)
  const currentLayout = propLayout || detectedLayout;
  
  // Determine view mode
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
  
  // ===== OPTIMIZATIONS & ACCESSIBILITY =====

  // Performance optimizations
  const {
    optimizedQuestions,
    performanceMetrics: optimizationMetrics,
    startMeasure: _startMeasure,
    endMeasure: _endMeasure
  } = useQuestionListOptimizations(questions, {
    enableMemoization: true,
    enableVirtualization: enableVirtualScrolling,
    enableLazyLoading: true,
    enableDebouncing: true
  });

  // Accessibility features
  const {
    announce: _announce,
    LiveRegion,
    containerRef: accessibilityContainerRef,
    prefersReducedMotion,
    isHighContrast
  } = useQuestionListAccessibility(optimizedQuestions);

  // Performance metrics với enhanced calculation
  const performanceMetrics = useMemo(() => {
    const baseMetrics = calculatePerformanceMetrics(questions.length);
    return {
      ...baseMetrics,
      ...optimizationMetrics
    };
  }, [questions.length, optimizationMetrics]);
  
  // ===== EFFECTS =====
  
  // Listen for window resize để update layout
  React.useEffect(() => {
    if (propLayout) return; // Không auto-detect nếu layout được set manually
    
    const handleResize = () => {
      const newLayout = detectLayout();
      if (newLayout !== detectedLayout) {
        setDetectedLayout(newLayout);
        onLayoutChange?.(newLayout);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [detectedLayout, propLayout, onLayoutChange]);
  
  // ===== CALLBACKS =====
  
  /**
   * Handle view mode change
   */
  const handleViewModeChange = useCallback((mode: QuestionListViewMode) => {
    onViewModeChange?.(mode);
  }, [onViewModeChange]);
  
  /**
   * Handle question actions cho table mode
   */
  // const handleQuestionView = useCallback((questionId: string) => {
  //   onQuestionView?.(questionId);
  // }, [onQuestionView]);

  // const handleQuestionEdit = useCallback((questionId: string) => {
  //   onQuestionEdit(questionId);
  // }, [onQuestionEdit]);

  // const handleQuestionDelete = useCallback((questionId: string) => {
  //   onQuestionDelete(questionId);
  // }, [onQuestionDelete]);

  // const handleQuestionDuplicate = useCallback((questionId: string) => {
  //   onQuestionDuplicate?.(questionId);
  // }, [onQuestionDuplicate]);

  /**
   * Handle question actions cho VirtualQuestionList (expects Question object)
   */
  const handleVirtualQuestionView = useCallback((question: Question) => {
    onQuestionView?.(question.id);
  }, [onQuestionView]);

  const handleVirtualQuestionEdit = useCallback((question: Question) => {
    onQuestionEdit(question.id);
  }, [onQuestionEdit]);

  const handleVirtualQuestionDelete = useCallback((question: Question) => {
    onQuestionDelete(question.id);
  }, [onQuestionDelete]);

  const handleVirtualQuestionDuplicate = useCallback((question: Question) => {
    onQuestionDuplicate?.(question.id);
  }, [onQuestionDuplicate]);
  
  // ===== RENDER HELPERS =====

  /**
   * Render error state
   */
  const renderError = () => (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Thử lại
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <Card className="my-4">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <List className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Không có câu hỏi nào</h3>
        <p className="text-muted-foreground text-center mb-4">
          {currentLayout === 'mobile'
            ? 'Chưa có câu hỏi nào được tạo'
            : 'Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại'
          }
        </p>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        )}
      </CardContent>
    </Card>
  );

  /**
   * Render loading state với enhanced skeleton
   */
  const renderLoading = () => (
    <QuestionListSkeleton
      viewMode={currentViewMode}
      layout={currentLayout}
      itemCount={pagination.pageSize || 20}
      showHeader={currentViewMode === 'table'}
    />
  );

  /**
   * Render view mode selector
   */
  const renderViewModeSelector = () => {
    if (!onViewModeChange || currentLayout === 'mobile') return null;

    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Chế độ xem:</span>
        <div className="flex items-center gap-1">
          <Button
            variant={currentViewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('table')}
            disabled={loading}
          >
            <List className="h-4 w-4 mr-1" />
            Bảng
          </Button>
          <Button
            variant={currentViewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('cards')}
            disabled={loading}
          >
            <Grid className="h-4 w-4 mr-1" />
            Thẻ
          </Button>
          {enableVirtualScrolling && questions.length > virtualScrollingThreshold && (
            <Button
              variant={currentViewMode === 'virtual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('virtual')}
              disabled={loading}
            >
              <Monitor className="h-4 w-4 mr-1" />
              Virtual
            </Button>
          )}
        </div>

        {/* Performance indicator */}
        {questions.length > 50 && (
          <Badge variant="secondary" className="ml-2">
            {questions.length} items
            {performanceMetrics.shouldUseVirtualScrolling && (
              <span className="ml-1 text-xs">• Virtual recommended</span>
            )}
          </Badge>
        )}
      </div>
    );
  };

  /**
   * Render layout indicator
   */
  const renderLayoutIndicator = () => {
    if (currentLayout === 'desktop') return null;

    const layoutIcons = {
      mobile: <Smartphone className="h-4 w-4" />,
      tablet: <Tablet className="h-4 w-4" />,
      desktop: <Monitor className="h-4 w-4" />
    };

    return (
      <div className="flex items-center gap-2 mb-2">
        {layoutIcons[currentLayout]}
        <span className="text-sm text-muted-foreground capitalize">
          {currentLayout} layout
        </span>
      </div>
    );
  };

  /**
   * Render main content dựa trên view mode
   */
  const renderContent = () => {
    if (loading) return renderLoading();
    if (error) return renderError();
    if (questions.length === 0) return renderEmpty();

    switch (currentViewMode) {
      case 'virtual':
        return (
          <div className="virtual-list-container">
            <VirtualQuestionList
              questions={questions}
              containerHeight={containerHeight}
              onQuestionView={handleVirtualQuestionView}
              onQuestionEdit={handleVirtualQuestionEdit}
              onQuestionDelete={handleVirtualQuestionDelete}
              onQuestionDuplicate={handleVirtualQuestionDuplicate}
              selectedQuestionIds={selectedQuestions}
              onQuestionSelect={(questionId, selected) => {
                if (selected) {
                  onSelectionChange([...selectedQuestions, questionId]);
                } else {
                  onSelectionChange(selectedQuestions.filter(id => id !== questionId));
                }
              }}
              showActions={showActions}
              showPreview={showPreview}
              className="border rounded-lg"
            />
          </div>
        );

      case 'cards':
        // Use mobile cards for card layout
        return (
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionMobileCard
                key={question.id}
                question={question}
                isSelected={selectedQuestions.includes(question.id)}
                onSelectionChange={(questionId, selected) => {
                  if (selected) {
                    onSelectionChange([...selectedQuestions, questionId]);
                  } else {
                    onSelectionChange(selectedQuestions.filter(id => id !== questionId));
                  }
                }}
                onView={(questionId) => handleVirtualQuestionView({ id: questionId } as Question)}
                onEdit={(questionId) => handleVirtualQuestionEdit({ id: questionId } as Question)}
                onDelete={(questionId) => handleVirtualQuestionDelete({ id: questionId } as Question)}
                onDuplicate={(questionId) => handleVirtualQuestionDuplicate({ id: questionId } as Question)}
                showActions={showActions}
                showSelection={showBulkActions}
                userRole={userRole}
              />
            ))}
          </div>
        );

      case 'table':
      default:
        return (
          <ResponsiveQuestionTable
            questions={questions}
            selectedQuestions={selectedQuestions}
            onSelectionChange={onSelectionChange}
            onQuestionView={(questionId) => handleVirtualQuestionView({ id: questionId } as Question)}
            onQuestionEdit={(questionId) => handleVirtualQuestionEdit({ id: questionId } as Question)}
            onQuestionDelete={(questionId) => handleVirtualQuestionDelete({ id: questionId } as Question)}
            onQuestionDuplicate={(questionId) => handleVirtualQuestionDuplicate({ id: questionId } as Question)}
            layout={currentLayout}
            showActions={showActions}
            showSelection={showBulkActions}
            userRole={userRole}
          />
        );
    }
  };

  // ===== MAIN RENDER =====

  return (
    <QuestionListErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Enhanced Question List Error:', error, errorInfo);
      }}
      onRetry={onRefresh}
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
      <div
        ref={accessibilityContainerRef as React.RefObject<HTMLDivElement>}
        className={`enhanced-question-list space-y-4 ${className} ${
          isHighContrast ? 'high-contrast' : ''
        } ${
          prefersReducedMotion ? 'reduced-motion' : ''
        }`}
        role="region"
        aria-label="Danh sách câu hỏi"
      >
        {/* Screen reader live region */}
        <LiveRegion />
      {/* Layout indicator cho mobile/tablet */}
      {renderLayoutIndicator()}

      {/* View mode selector */}
      {renderViewModeSelector()}

      {/* Main content */}
      {renderContent()}

      {/* Pagination - chỉ hiển thị cho table và cards mode */}
      {currentViewMode !== 'virtual' && questions.length > 0 && !loading && (
        <QuestionListPagination
          pagination={pagination}
          onPaginationChange={onPaginationChange}
        />
      )}

      {/* Performance info cho development */}
      {process.env.NODE_ENV === 'development' && questions.length > 0 && (
        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
          <strong>Performance:</strong> {questions.length} items,
          {performanceMetrics.renderTime.toFixed(1)}ms estimated render,
          {performanceMetrics.memoryUsage.toFixed(1)}KB memory
          {performanceMetrics.shouldUseVirtualScrolling &&
            ' • Virtual scrolling recommended'
          }
        </div>
      )}
    </div>
    </QuestionListErrorBoundary>
  );
}
