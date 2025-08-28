/**
 * Featured Questions Section Component
 * Enhanced featured questions section với PublicQuestionCard integration
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, BookOpen, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useFeaturedQuestionsLanding } from '@/hooks/public';
import { PublicQuestionCardFeatured } from '@/components/questions/shared';
import { QUESTION_ROUTES, QUESTION_DYNAMIC_ROUTES } from '@/lib/question-paths';

// ===== TYPES =====

/**
 * Featured Questions Section Props Interface
 * Props cho FeaturedQuestionsSection component
 */
export interface FeaturedQuestionsSectionProps {
  limit?: number;
  showHeader?: boolean;
  showViewAllButton?: boolean;
  variant?: 'default' | 'compact' | 'enhanced';
  staggerAnimation?: boolean;
  onQuestionView?: (questionId: string) => void;
  className?: string;
}

// ===== MAIN COMPONENT =====

/**
 * Featured Questions Section Component
 * Enhanced section với PublicQuestionCard integration và animations
 * 
 * Features:
 * - Integration với useFeaturedQuestionsLanding hook
 * - Stagger animations cho smooth loading
 * - Enhanced error handling và loading states
 * - Responsive grid layout (1-3 columns)
 * - Consistent styling với CategoryCardsGrid
 * - Navigation integration với question detail pages
 */
export function FeaturedQuestionsSection({
  limit = 5,
  showHeader = true,
  showViewAllButton = true,
  variant = 'default',
  staggerAnimation = true,
  onQuestionView,
  className
}: FeaturedQuestionsSectionProps) {
  // ===== HOOKS =====
  
  const router = useRouter();
  const { data: questions, isLoading, isError, error, refetch } = useFeaturedQuestionsLanding();
  
  // ===== STATE =====
  
  const [isVisible, setIsVisible] = useState(!staggerAnimation);
  
  // ===== EFFECTS =====
  
  /**
   * Stagger animation effect
   * Trigger stagger animation khi component mount
   */
  useEffect(() => {
    if (staggerAnimation) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [staggerAnimation]);
  
  // ===== HANDLERS =====
  
  /**
   * Handle question view
   * Navigate to question detail page
   */
  const handleQuestionView = (questionId: string) => {
    onQuestionView?.(questionId);
    router.push(QUESTION_DYNAMIC_ROUTES.DETAIL(questionId));
  };
  
  /**
   * Handle view all questions
   * Navigate to browse page
   */
  const handleViewAll = () => {
    router.push(QUESTION_ROUTES.BROWSE);
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Get stagger delay
   * Calculate stagger delay cho each question card
   */
  const getStaggerDelay = (index: number) => {
    if (!staggerAnimation) return 0;
    return index * 150; // 150ms delay between each card
  };
  
  /**
   * Get grid classes
   * Generate responsive grid classes
   */
  const getGridClasses = () => {
    const baseClasses = 'grid gap-6';
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} grid-cols-1 md:grid-cols-2`;
      case 'enhanced':
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
      default:
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
    }
  };
  
  /**
   * Render section header
   * Display section title và description
   */
  const renderHeader = () => {
    if (!showHeader) return null;
    
    return (
      <div className="featured-questions-header text-center mb-12">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
          <Star className="h-8 w-8 text-yellow-500 fill-yellow-400" />
          Câu hỏi nổi bật
        </h2>
        
        {/* Section Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Những câu hỏi được yêu thích và đánh giá cao nhất từ cộng đồng
        </p>
        
        {/* Statistics */}
        {questions && questions.length > 0 && (
          <div className="featured-stats flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{questions.length} câu hỏi nổi bật</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Được cập nhật thường xuyên</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Render loading state
   * Display loading skeleton
   */
  const renderLoading = () => {
    return (
      <div className="featured-questions-loading">
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang tải câu hỏi nổi bật...</span>
        </div>
        
        <div className={getGridClasses()}>
          {Array.from({ length: limit }).map((_, index) => (
            <div
              key={index}
              className="featured-question-skeleton bg-muted/30 rounded-xl p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-lg" />
                <div className="w-20 h-4 bg-muted rounded" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-muted rounded" />
                <div className="w-3/4 h-4 bg-muted rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="w-16 h-4 bg-muted rounded" />
                <div className="w-12 h-4 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  /**
   * Render error state
   * Display error message với retry option
   */
  const renderError = () => {
    return (
      <div className="featured-questions-error text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Không thể tải câu hỏi nổi bật
        </h3>
        <p className="text-muted-foreground mb-4">
          {error?.message || 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          Thử lại
        </button>
      </div>
    );
  };
  
  /**
   * Render featured questions
   * Display grid of featured question cards
   */
  const renderQuestions = () => {
    if (!questions || questions.length === 0) {
      return (
        <div className="featured-questions-empty text-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Chưa có câu hỏi nổi bật
          </h3>
          <p className="text-muted-foreground">
            Hiện tại chưa có câu hỏi nào được đánh dấu là nổi bật.
          </p>
        </div>
      );
    }
    
    const displayQuestions = questions.slice(0, limit);
    
    return (
      <div className={getGridClasses()}>
        {displayQuestions.map((question, index) => (
          <div
            key={question.id}
            className={cn(
              // Stagger animation
              staggerAnimation && !isVisible && 'opacity-0 translate-y-4',
              staggerAnimation && isVisible && 'opacity-100 translate-y-0',
              'transition-all duration-500 ease-out'
            )}
            style={staggerAnimation ? {
              transitionDelay: `${getStaggerDelay(index)}ms`
            } : undefined}
          >
            <PublicQuestionCardFeatured
              question={question}
              onView={handleQuestionView}
              showRating={true}
              showViews={true}
              showActions={false}
            />
          </div>
        ))}
      </div>
    );
  };
  
  /**
   * Render view all button
   * Display button to navigate to browse page
   */
  const renderViewAllButton = () => {
    if (!showViewAllButton || !questions || questions.length === 0) return null;
    
    return (
      <div className="featured-questions-cta text-center mt-8">
        <button
          onClick={handleViewAll}
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
        >
          <BookOpen className="h-4 w-4" />
          Xem tất cả câu hỏi
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <section className={cn('featured-questions-section', className)}>
      {/* Section Header */}
      {renderHeader()}
      
      {/* Content */}
      {isLoading && renderLoading()}
      {isError && renderError()}
      {!isLoading && !isError && renderQuestions()}
      
      {/* View All Button */}
      {!isLoading && !isError && renderViewAllButton()}
    </section>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Featured Questions Section
 * Compact version với fewer questions
 */
export function CompactFeaturedQuestionsSection(props: Omit<FeaturedQuestionsSectionProps, 'variant' | 'limit'>) {
  return (
    <FeaturedQuestionsSection
      {...props}
      variant="compact"
      limit={3}
      className={cn('compact-featured-questions-section', props.className)}
    />
  );
}

/**
 * Enhanced Featured Questions Section
 * Enhanced version với more questions và better layout
 */
export function EnhancedFeaturedQuestionsSection(props: Omit<FeaturedQuestionsSectionProps, 'variant'>) {
  return (
    <FeaturedQuestionsSection
      {...props}
      variant="enhanced"
      className={cn('enhanced-featured-questions-section', props.className)}
    />
  );
}

// ===== EXPORTS =====

export default FeaturedQuestionsSection;
