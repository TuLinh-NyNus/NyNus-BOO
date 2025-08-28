/**
 * Quick Filter Buttons Component
 * Quick filter buttons cho hero section với store integration
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { useRouter } from 'next/navigation';
import { Filter, BookOpen, Zap, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

import { usePublicQuestionFiltersStore } from '@/lib/stores/public';
import { QUESTION_ROUTES } from '@/lib/question-paths';
import { QuestionDifficulty } from '@/lib/types/public';
import { QUESTION_CATEGORIES, CATEGORY_MAPPING } from '@/lib/constants/categories';

// ===== TYPES =====

/**
 * Quick Filter Buttons Props Interface
 * Props cho QuickFilterButtons component
 */
export interface QuickFilterButtonsProps {
  onFilterSelect?: (filterType: string, value: string) => void;
  showCategories?: boolean;
  showDifficulties?: boolean;
  maxButtons?: number;
  layout?: 'horizontal' | 'grid';
  className?: string;
}

/**
 * Filter Button Interface
 * Interface cho individual filter button
 */
interface FilterButton {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

// ===== CONSTANTS =====

/**
 * Category Filter Buttons
 * Generated từ shared category constants
 */
const CATEGORY_FILTERS: FilterButton[] = QUESTION_CATEGORIES.map(category => ({
  id: category.id,
  label: category.title,
  value: CATEGORY_MAPPING[category.id],
  icon: category.icon,
  color: `${category.color} hover:${category.color.replace('bg-', 'bg-').replace('-500', '-600')} text-white`,
  description: category.description
}));

/**
 * Difficulty Filter Buttons
 * Predefined difficulty filters
 */
const DIFFICULTY_FILTERS: FilterButton[] = [
  {
    id: 'easy',
    label: 'Dễ',
    value: QuestionDifficulty.EASY,
    icon: Zap,
    color: 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300',
    description: 'Câu hỏi cơ bản'
  },
  {
    id: 'medium',
    label: 'Trung bình',
    value: QuestionDifficulty.MEDIUM,
    icon: Target,
    color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300',
    description: 'Câu hỏi vừa phải'
  },
  {
    id: 'hard',
    label: 'Khó',
    value: QuestionDifficulty.HARD,
    icon: TrendingUp,
    color: 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300',
    description: 'Câu hỏi nâng cao'
  }
];

// ===== MAIN COMPONENT =====

/**
 * Quick Filter Buttons Component
 * Display quick filter buttons cho categories và difficulties
 * 
 * Features:
 * - Category filter buttons (Đại số, Hình học, Giải tích, Xác suất)
 * - Difficulty filter buttons (Dễ, Trung bình, Khó)
 * - Integration với PublicQuestionFiltersStore
 * - Navigation to browse page với filters applied
 * - Responsive grid layout
 * - Hover effects và animations
 */
export function QuickFilterButtons({
  onFilterSelect,
  showCategories = true,
  showDifficulties = true,
  maxButtons = 8,
  layout = 'grid',
  className
}: QuickFilterButtonsProps) {
  // ===== HOOKS =====
  
  const router = useRouter();
  
  // Store actions
  const toggleCategory = usePublicQuestionFiltersStore(state => state.toggleCategory);
  const toggleDifficulty = usePublicQuestionFiltersStore(state => state.toggleDifficulty);
  const resetFilters = usePublicQuestionFiltersStore(state => state.resetFilters);
  
  // ===== HANDLERS =====
  
  /**
   * Handle category filter click
   * Apply category filter và navigate to browse page
   */
  const handleCategoryClick = (category: string) => {
    // Reset filters trước khi apply new filter
    resetFilters();
    
    // Apply category filter
    toggleCategory(category);
    
    // Call callback if provided
    onFilterSelect?.('category', category);
    
    // Navigate to browse page
    router.push(QUESTION_ROUTES.BROWSE);
  };
  
  /**
   * Handle difficulty filter click
   * Apply difficulty filter và navigate to browse page
   */
  const handleDifficultyClick = (difficulty: QuestionDifficulty) => {
    // Reset filters trước khi apply new filter
    resetFilters();
    
    // Apply difficulty filter
    toggleDifficulty(difficulty);
    
    // Call callback if provided
    onFilterSelect?.('difficulty', difficulty);
    
    // Navigate to browse page
    router.push(QUESTION_ROUTES.BROWSE);
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Render category filter buttons
   * Display category filter buttons
   */
  const renderCategoryButtons = () => {
    if (!showCategories) return null;
    
    return CATEGORY_FILTERS.map((filter) => {
      const Icon = filter.icon;
      
      return (
        <button
          key={filter.id}
          onClick={() => handleCategoryClick(filter.value)}
          className={cn(
            'group relative p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg',
            filter.color,
            'flex flex-col items-center gap-2 min-h-[100px]'
          )}
          title={filter.description}
        >
          {/* Icon */}
          <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
          
          {/* Label */}
          <span className="text-sm font-medium text-center">
            {filter.label}
          </span>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      );
    });
  };
  
  /**
   * Render difficulty filter buttons
   * Display difficulty filter buttons
   */
  const renderDifficultyButtons = () => {
    if (!showDifficulties) return null;
    
    return DIFFICULTY_FILTERS.map((filter) => {
      const Icon = filter.icon;
      
      return (
        <button
          key={filter.id}
          onClick={() => handleDifficultyClick(filter.value as QuestionDifficulty)}
          className={cn(
            'group relative p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg',
            filter.color,
            'flex flex-col items-center gap-2 min-h-[100px]'
          )}
          title={filter.description}
        >
          {/* Icon */}
          <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
          
          {/* Label */}
          <span className="text-sm font-medium text-center">
            {filter.label}
          </span>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-black/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      );
    });
  };
  
  /**
   * Get layout classes
   * Generate CSS classes cho layout
   */
  const getLayoutClasses = () => {
    if (layout === 'horizontal') {
      return 'flex flex-wrap gap-3 justify-center';
    }
    
    // Grid layout (default)
    return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3';
  };
  
  // ===== MAIN RENDER =====
  
  // Combine all buttons
  const allButtons = [
    ...(showCategories ? CATEGORY_FILTERS : []),
    ...(showDifficulties ? DIFFICULTY_FILTERS : [])
  ].slice(0, maxButtons);
  
  if (allButtons.length === 0) return null;
  
  return (
    <div className={cn('quick-filter-buttons w-full', className)}>
      {/* Section Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
          <Filter className="h-5 w-5" />
          Lọc nhanh theo chủ đề
        </h3>
        <p className="text-sm text-muted-foreground">
          Chọn chủ đề hoặc độ khó để tìm câu hỏi phù hợp
        </p>
      </div>
      
      {/* Filter Buttons */}
      <div className={getLayoutClasses()}>
        {renderCategoryButtons()}
        {renderDifficultyButtons()}
      </div>
      
      {/* Browse All Button */}
      <div className="text-center mt-6">
        <button
          onClick={() => router.push(QUESTION_ROUTES.BROWSE)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
        >
          <BookOpen className="h-4 w-4" />
          Duyệt tất cả câu hỏi
        </button>
      </div>
    </div>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Quick Filter Buttons
 * Compact version với fewer buttons
 */
export function CompactQuickFilterButtons(props: Omit<QuickFilterButtonsProps, 'maxButtons' | 'layout'>) {
  return (
    <QuickFilterButtons
      {...props}
      maxButtons={4}
      layout="horizontal"
      className={cn('compact-quick-filter-buttons', props.className)}
    />
  );
}

/**
 * Category Only Quick Filter Buttons
 * Only show category filters
 */
export function CategoryQuickFilterButtons(props: Omit<QuickFilterButtonsProps, 'showDifficulties'>) {
  return (
    <QuickFilterButtons
      {...props}
      showDifficulties={false}
      className={cn('category-quick-filter-buttons', props.className)}
    />
  );
}

/**
 * Difficulty Only Quick Filter Buttons
 * Only show difficulty filters
 */
export function DifficultyQuickFilterButtons(props: Omit<QuickFilterButtonsProps, 'showCategories'>) {
  return (
    <QuickFilterButtons
      {...props}
      showCategories={false}
      className={cn('difficulty-quick-filter-buttons', props.className)}
    />
  );
}

// ===== EXPORTS =====

export default QuickFilterButtons;
