/**
 * Category Cards Grid Component
 * Grid layout cho category cards với stagger animations
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { useState, useEffect } from 'react';
import { Filter, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

import { CategoryCard, CategoryCardProps } from './category-card';
import { QUESTION_CATEGORIES, CategoryData, getTotalQuestionCount } from '@/lib/constants/categories';

// ===== TYPES =====

/**
 * Category Cards Grid Props Interface
 * Props cho CategoryCardsGrid component
 */
export interface CategoryCardsGridProps {
  categories?: CategoryData[];
  variant?: 'default' | 'compact' | 'featured';
  columns?: 1 | 2 | 3 | 4;
  showHeader?: boolean;
  showStats?: boolean;
  staggerAnimation?: boolean;
  onCategoryClick?: (categoryId: string) => void;
  className?: string;
}

// ===== MAIN COMPONENT =====

/**
 * Category Cards Grid Component
 * Grid layout với responsive design và stagger animations
 * 
 * Features:
 * - Responsive grid layout (1-4 columns)
 * - Stagger animations cho smooth loading
 * - Section header với statistics
 * - Multiple variants support
 * - Custom category filtering
 * - Performance optimized với proper keys
 */
export function CategoryCardsGrid({
  categories = QUESTION_CATEGORIES,
  variant = 'default',
  columns = 4,
  showHeader = true,
  showStats = true,
  staggerAnimation = true,
  onCategoryClick,
  className
}: CategoryCardsGridProps) {
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
  
  const totalQuestions = getTotalQuestionCount();
  const categoryCount = categories.length;
  
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
      <div className="category-grid-header text-center mb-12">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
          <Filter className="h-8 w-8 text-primary" />
          Chủ đề câu hỏi
        </h2>
        
        {/* Section Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Khám phá các chủ đề toán học từ cơ bản đến nâng cao
        </p>
        
        {/* Statistics */}
        {showStats && (
          <div className="category-stats flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{totalQuestions.toLocaleString()} câu hỏi</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>{categoryCount} chủ đề</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Render category cards
   * Display grid of category cards với stagger animation
   */
  const renderCards = () => {
    return categories.map((category, index) => {
      const cardProps: CategoryCardProps = {
        category,
        variant,
        onClick: onCategoryClick,
        className: cn(
          // Stagger animation
          staggerAnimation && !isVisible && 'opacity-0 translate-y-4',
          staggerAnimation && isVisible && 'opacity-100 translate-y-0',
          'transition-all duration-500 ease-out'
        ),
        style: staggerAnimation ? {
          transitionDelay: `${getStaggerDelay(index)}ms`
        } : undefined
      };
      
      return (
        <CategoryCard
          key={category.id}
          {...cardProps}
        />
      );
    });
  };
  
  // ===== MAIN RENDER =====
  
  if (categories.length === 0) {
    return (
      <div className="category-cards-grid-empty text-center py-12">
        <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Không có chủ đề nào
        </h3>
        <p className="text-muted-foreground">
          Hiện tại chưa có chủ đề câu hỏi nào được tạo.
        </p>
      </div>
    );
  }
  
  return (
    <section className={cn('category-cards-grid', className)}>
      {/* Section Header */}
      {renderHeader()}
      
      {/* Categories Grid */}
      <div className={getGridClasses()}>
        {renderCards()}
      </div>
    </section>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Category Cards Grid
 * Compact version với minimal spacing
 */
export function CompactCategoryCardsGrid(props: Omit<CategoryCardsGridProps, 'variant' | 'showHeader'>) {
  return (
    <CategoryCardsGrid
      {...props}
      variant="compact"
      showHeader={false}
      className={cn('compact-category-cards-grid', props.className)}
    />
  );
}

/**
 * Featured Category Cards Grid
 * Featured version với enhanced styling
 */
export function FeaturedCategoryCardsGrid(props: Omit<CategoryCardsGridProps, 'variant'>) {
  return (
    <CategoryCardsGrid
      {...props}
      variant="featured"
      columns={2}
      className={cn('featured-category-cards-grid', props.className)}
    />
  );
}

/**
 * Simple Category Cards Grid
 * Simple version without header và stats
 */
export function SimpleCategoryCardsGrid(props: Omit<CategoryCardsGridProps, 'showHeader' | 'showStats'>) {
  return (
    <CategoryCardsGrid
      {...props}
      showHeader={false}
      showStats={false}
      className={cn('simple-category-cards-grid', props.className)}
    />
  );
}

// ===== EXPORTS =====

export default CategoryCardsGrid;
