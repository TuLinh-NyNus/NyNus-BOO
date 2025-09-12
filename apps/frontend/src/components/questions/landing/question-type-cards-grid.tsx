/**
 * Question Type Cards Grid Component
 * Grid layout cho question type cards với stagger animations
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import { useState, useEffect } from 'react';
import { Filter, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { QUESTION_TYPES, QuestionTypeData, getTotalQuestionCountByType } from '@/lib/constants/question-types';
import { QUESTION_ROUTES } from '@/lib/question-paths';

// ===== TYPES =====

/**
 * Question Type Cards Grid Props Interface
 * Props cho QuestionTypeCardsGrid component
 */
export interface QuestionTypeCardsGridProps {
  questionTypes?: QuestionTypeData[];
  variant?: 'default' | 'compact' | 'featured';
  columns?: 1 | 2 | 3 | 4;
  showHeader?: boolean;
  showStats?: boolean;
  staggerAnimation?: boolean;
  onTypeClick?: (typeId: string) => void;
  className?: string;
}

// ===== MAIN COMPONENT =====

/**
 * Question Type Cards Grid Component
 * Grid layout với responsive design và stagger animations
 * 
 * Features:
 * - Responsive grid layout (1-4 columns)
 * - Stagger animations cho smooth loading
 * - Section header với statistics
 * - Multiple variants support
 * - Custom type filtering
 * - Performance optimized với proper keys
 */
export function QuestionTypeCardsGrid({
  questionTypes = QUESTION_TYPES,
  variant: _variant = 'default', // variant không sử dụng hiện tại nhưng giữ cho future compatibility
  columns = 4,
  showHeader = true,
  showStats = true,
  staggerAnimation = true,
  onTypeClick,
  className
}: QuestionTypeCardsGridProps) {
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
  
  // ===== COMPUTED VALUES =====
  
  const totalQuestions = getTotalQuestionCountByType();
  const typeCount = questionTypes.length;
  
  // ===== RENDER HELPERS =====
  
  /**
   * Get grid classes
   * Generate responsive grid classes based on columns
   */
  const getGridClasses = () => {
    const baseClasses = 'grid gap-6';
    
    switch (columns) {
      case 1:
        return `${baseClasses} grid-cols-1`;
      case 2:
        return `${baseClasses} grid-cols-1 md:grid-cols-2`;
      case 3:
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
      case 4:
      default:
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-4`;
    }
  };
  
  /**
   * Get stagger delay
   * Calculate stagger delay cho each card
   */
  const getStaggerDelay = (index: number) => {
    if (!staggerAnimation) return 0;
    return index * 100; // 100ms delay between each card
  };
  
  /**
   * Render section header
   * Display section title và description
   */
  const renderHeader = () => {
    if (!showHeader) return null;
    
    return (
      <div className="question-type-grid-header text-center mb-12">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
          <Filter className="h-8 w-8 text-primary" />
          Loại câu hỏi
        </h2>
        
        {/* Section Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Khám phá các loại câu hỏi từ trắc nghiệm đến tự luận
        </p>
        
        {/* Statistics */}
        {showStats && (
          <div className="question-type-stats flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{totalQuestions.toLocaleString()} câu hỏi</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>{typeCount} loại câu hỏi</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Render question type card
   * Display individual type card với animation
   */
  const renderTypeCard = (type: QuestionTypeData, index: number) => {
    const Icon = type.icon;
    
    const handleClick = () => {
      if (onTypeClick) {
        onTypeClick(type.id);
      }
    };
    
    return (
      <Link
        key={type.id}
        href={`${QUESTION_ROUTES.BROWSE}?type=${type.id}`}
        onClick={handleClick}
        className={cn(
          'question-type-card group',
          'relative overflow-hidden',
          'bg-card hover:bg-accent/10',
          'border border-border hover:border-primary/50',
          'rounded-xl transition-all duration-300',
          'hover:shadow-lg hover:scale-[1.02]',
          'cursor-pointer',
          // Stagger animation
          staggerAnimation && !isVisible && 'opacity-0 translate-y-4',
          staggerAnimation && isVisible && 'opacity-100 translate-y-0',
          'transition-all duration-500 ease-out'
        )}
        style={staggerAnimation ? {
          transitionDelay: `${getStaggerDelay(index)}ms`
        } : undefined}
      >
        {/* Background Decoration */}
        
        {/* Card Content */}
        <div className="relative p-6">
          {/* Icon and Emoji */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <Icon className="h-8 w-8" />
            </div>
            <span className="text-2xl">{type.emoji}</span>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {type.title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            {type.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {type.questionCount.toLocaleString()} câu hỏi
            </span>
            <span
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: type.accentVar || 'var(--color-primary)' }}
            >
              Xem thêm →
            </span>
          </div>
        </div>
      </Link>
    );
  };
  
  /**
   * Render type cards
   * Display grid of type cards với stagger animation
   */
  const renderCards = () => {
    return questionTypes.map((type, index) => renderTypeCard(type, index));
  };
  
  // ===== MAIN RENDER =====
  
  if (questionTypes.length === 0) {
    return (
      <div className="question-type-cards-grid-empty text-center py-12">
        <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Không có loại câu hỏi nào
        </h3>
        <p className="text-muted-foreground">
          Hiện tại chưa có loại câu hỏi nào được tạo.
        </p>
      </div>
    );
  }
  
  return (
    <section className={cn('question-type-cards-grid', className)}>
      {/* Section Header */}
      {renderHeader()}
      
      {/* Question Types Grid */}
      <div className={getGridClasses()}>
        {renderCards()}
      </div>
    </section>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Question Type Cards Grid
 * Compact version với minimal spacing
 */
export function CompactQuestionTypeCardsGrid(props: Omit<QuestionTypeCardsGridProps, 'variant' | 'showHeader'>) {
  return (
    <QuestionTypeCardsGrid
      {...props}
      variant="compact"
      showHeader={false}
      className={cn('compact-question-type-cards-grid', props.className)}
    />
  );
}

/**
 * Featured Question Type Cards Grid
 * Featured version với enhanced styling
 */
export function FeaturedQuestionTypeCardsGrid(props: Omit<QuestionTypeCardsGridProps, 'variant'>) {
  return (
    <QuestionTypeCardsGrid
      {...props}
      variant="featured"
      columns={2}
      className={cn('featured-question-type-cards-grid', props.className)}
    />
  );
}

/**
 * Simple Question Type Cards Grid
 * Simple version without header và stats
 */
export function SimpleQuestionTypeCardsGrid(props: Omit<QuestionTypeCardsGridProps, 'showHeader' | 'showStats'>) {
  return (
    <QuestionTypeCardsGrid
      {...props}
      showHeader={false}
      showStats={false}
      className={cn('simple-question-type-cards-grid', props.className)}
    />
  );
}

// ===== EXPORTS =====

export default QuestionTypeCardsGrid;