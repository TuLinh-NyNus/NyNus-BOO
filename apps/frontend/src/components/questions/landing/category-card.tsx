/**
 * Category Card Component
 * Enhanced category card với smooth animations và store integration
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

import { usePublicQuestionFiltersStore } from '@/lib/stores/public';
import { QUESTION_ROUTES } from '@/lib/question-paths';
import { CategoryData, getCategoryFilterValue } from '@/lib/constants/categories';

// ===== TYPES =====

/**
 * Category Card Props Interface
 * Props cho CategoryCard component
 */
export interface CategoryCardProps {
  category: CategoryData;
  variant?: 'default' | 'compact' | 'featured';
  showQuestionCount?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  onClick?: (categoryId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ===== MAIN COMPONENT =====

/**
 * Category Card Component
 * Enhanced category card với smooth animations và navigation
 * 
 * Features:
 * - Smooth hover animations với scale và shadow effects
 * - Lucide icons với rotation animations
 * - Store integration cho category filtering
 * - Navigation to browse page với filters applied
 * - Multiple variants (default, compact, featured)
 * - Responsive design với mobile-first approach
 */
export function CategoryCard({
  category,
  variant = 'default',
  showQuestionCount = true,
  showDescription = true,
  showIcon = true,
  onClick,
  className,
  style
}: CategoryCardProps) {
  // ===== HOOKS =====
  
  const router = useRouter();
  
  // Store actions
  const resetFilters = usePublicQuestionFiltersStore(state => state.resetFilters);
  const toggleCategory = usePublicQuestionFiltersStore(state => state.toggleCategory);
  
  // ===== HANDLERS =====
  
  /**
   * Handle category click
   * Apply category filter và navigate to browse page
   */
  const handleClick = () => {
    const filterValue = getCategoryFilterValue(category.id);
    
    if (filterValue) {
      // Reset filters trước khi apply new filter
      resetFilters();
      
      // Apply category filter
      toggleCategory(filterValue);
      
      // Call custom onClick if provided
      onClick?.(category.id);
      
      // Navigate to browse page
      router.push(QUESTION_ROUTES.BROWSE);
    }
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Get variant classes
   * Generate CSS classes based on variant
   */
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-4';
      case 'featured':
        return 'p-8 lg:p-10';
      default:
        return 'p-6';
    }
  };
  
  /**
   * Get icon size classes
   * Generate icon size based on variant
   */
  const getIconSizeClasses = () => {
    switch (variant) {
      case 'compact':
        return 'w-10 h-10';
      case 'featured':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };
  
  /**
   * Render category icon
   * Display category icon với animations
   */
  const renderIcon = () => {
    if (!showIcon) return null;
    
    const Icon = category.icon;
    const iconSizeClasses = getIconSizeClasses();
    
    return (
      <div className={cn(
        'category-icon rounded-lg flex items-center justify-center mb-4',
        'bg-gradient-to-br text-white',
        `${category.gradient}`,
        iconSizeClasses,
        'group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out',
        'shadow-lg group-hover:shadow-xl'
      )}>
        <Icon className={cn(
          'transition-transform duration-300',
          variant === 'compact' ? 'h-5 w-5' : variant === 'featured' ? 'h-8 w-8' : 'h-6 w-6'
        )} />
      </div>
    );
  };
  
  /**
   * Render category title
   * Display category title với hover effects
   */
  const renderTitle = () => {
    const titleClasses = cn(
      'category-title font-semibold text-foreground mb-2',
      'group-hover:text-primary transition-colors duration-300',
      variant === 'compact' ? 'text-lg' : variant === 'featured' ? 'text-2xl' : 'text-xl'
    );
    
    return (
      <h3 className={titleClasses}>
        {category.title}
      </h3>
    );
  };
  
  /**
   * Render category description
   * Display category description
   */
  const renderDescription = () => {
    if (!showDescription) return null;
    
    return (
      <p className={cn(
        'category-description text-muted-foreground mb-3',
        'transition-colors duration-300',
        variant === 'compact' ? 'text-xs' : 'text-sm'
      )}>
        {category.description}
      </p>
    );
  };
  
  /**
   * Render question count
   * Display question count với icon
   */
  const renderQuestionCount = () => {
    if (!showQuestionCount) return null;
    
    return (
      <div className="category-stats flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Users className="h-4 w-4" />
          <span className={variant === 'compact' ? 'text-xs' : 'text-sm'}>
            {category.questionCount.toLocaleString()} câu hỏi
          </span>
        </div>
        
        {/* Arrow Icon */}
        <ArrowRight className={cn(
          'h-4 w-4 text-muted-foreground',
          'group-hover:text-primary group-hover:translate-x-1',
          'transition-all duration-300'
        )} />
      </div>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <button
      onClick={handleClick}
      style={style}
      className={cn(
        // Base styles
        'category-card group w-full text-left',
        'bg-card rounded-xl border border-border',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',

        // Hover effects
        'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10',
        'hover:-translate-y-1 hover:scale-[1.02]',

        // Variant-specific styles
        getVariantClasses(),

        // Custom className
        className
      )}
      title={`Xem tất cả câu hỏi ${category.title}`}
    >
      {/* Category Icon */}
      {renderIcon()}
      
      {/* Category Content */}
      <div className="category-content">
        {/* Category Title */}
        {renderTitle()}
        
        {/* Category Description */}
        {renderDescription()}
        
        {/* Category Stats */}
        {renderQuestionCount()}
      </div>
      
      {/* Hover Overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0',
        'group-hover:opacity-5 transition-opacity duration-300',
        'rounded-xl pointer-events-none',
        category.gradient
      )} />
    </button>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Category Card
 * Compact version với minimal information
 */
export function CompactCategoryCard(props: Omit<CategoryCardProps, 'variant'>) {
  return (
    <CategoryCard
      {...props}
      variant="compact"
      showDescription={false}
      className={cn('compact-category-card', props.className)}
    />
  );
}

/**
 * Featured Category Card
 * Featured version với enhanced styling
 */
export function FeaturedCategoryCard(props: Omit<CategoryCardProps, 'variant'>) {
  return (
    <CategoryCard
      {...props}
      variant="featured"
      className={cn('featured-category-card', props.className)}
    />
  );
}

// ===== EXPORTS =====

export default CategoryCard;
