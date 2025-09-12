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
import { Filter, BookOpen, GraduationCap, Calculator, Triangle, BarChart, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

import { usePublicQuestionFiltersStore } from '@/lib/stores/public';
import { QUESTION_ROUTES } from '@/lib/question-paths';

// ===== TYPES =====

/**
 * Quick Filter Buttons Props Interface
 * Props cho QuickFilterButtons component
 */
export interface QuickFilterButtonsProps {
  onFilterSelect?: (filterType: string, value: string) => void;
  showGrades?: boolean;
  showSubjects?: boolean;
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
 * Grade Filter Buttons
 * Lớp học với CSS variables - tự động responsive cho dark/light mode
 */
const GRADE_FILTERS: FilterButton[] = [
  {
    id: 'grade-6',
    label: 'Lớp 6',
    value: 'grade-6',
    icon: GraduationCap,
    color: 'filter-grade-1',
    description: 'Câu hỏi dành cho học sinh lớp 6'
  },
  {
    id: 'grade-7',
    label: 'Lớp 7',
    value: 'grade-7',
    icon: GraduationCap,
    color: 'filter-grade-2',
    description: 'Câu hỏi dành cho học sinh lớp 7'
  },
  {
    id: 'grade-8',
    label: 'Lớp 8',
    value: 'grade-8',
    icon: GraduationCap,
    color: 'filter-grade-3',
    description: 'Câu hỏi dành cho học sinh lớp 8'
  },
  {
    id: 'grade-9',
    label: 'Lớp 9',
    value: 'grade-9',
    icon: GraduationCap,
    color: 'filter-grade-4',
    description: 'Câu hỏi dành cho học sinh lớp 9'
  },
  {
    id: 'grade-10',
    label: 'Lớp 10',
    value: 'grade-10',
    icon: GraduationCap,
    color: 'filter-grade-5',
    description: 'Câu hỏi dành cho học sinh lớp 10'
  },
  {
    id: 'grade-11',
    label: 'Lớp 11',
    value: 'grade-11',
    icon: GraduationCap,
    color: 'filter-grade-6',
    description: 'Câu hỏi dành cho học sinh lớp 11'
  },
  {
    id: 'grade-12',
    label: 'Lớp 12',
    value: 'grade-12',
    icon: GraduationCap,
    color: 'filter-grade-7',
    description: 'Câu hỏi dành cho học sinh lớp 12'
  }
];

/**
 * Subject Filter Buttons
 * Chủ đề môn học với CSS variables - tự động responsive cho dark/light mode
 */
const SUBJECT_FILTERS: FilterButton[] = [
  {
    id: 'algebra-analysis',
    label: 'Đại số & Giải tích',
    value: 'algebra-analysis',
    icon: Calculator,
    color: 'filter-subject-algebra',
    description: 'Đại số, hàm số, giới hạn, đạo hàm, tích phân'
  },
  {
    id: 'geometry',
    label: 'Hình học',
    value: 'geometry',
    icon: Triangle,
    color: 'filter-subject-geometry',
    description: 'Hình học phẳng, hình học không gian, lượng giác'
  },
  {
    id: 'probability-statistics',
    label: 'Xác suất và thống kê',
    value: 'probability-statistics',
    icon: BarChart,
    color: 'filter-subject-statistics',
    description: 'Xác suất, thống kê, tổ hợp'
  },
  {
    id: 'gifted-students',
    label: 'Học sinh giỏi',
    value: 'gifted-students',
    icon: Trophy,
    color: 'filter-subject-gifted',
    description: 'Câu hỏi nâng cao, olympic toán'
  }
];

// ===== MAIN COMPONENT =====

/**
 * Quick Filter Buttons Component
 * Display quick filter buttons cho grades và subjects
 * 
 * Features:
 * - Grade filter buttons (Lớp 6-12)
 * - Subject filter buttons (Đại số & Giải tích, Hình học, Xác suất và thống kê, Học sinh giỏi)
 * - Integration với PublicQuestionFiltersStore
 * - Navigation to browse page với filters applied
 * - Responsive grid layout với 2 sections
 * - Dark/Light mode support với optimized colors
 * - Hover effects và animations
 */
export function QuickFilterButtons({
  onFilterSelect,
  showGrades = true,
  showSubjects = true,
  maxButtons: _maxButtons = 11,
  layout: _layout = 'grid',
  className
}: QuickFilterButtonsProps) {
  // ===== HOOKS =====
  
  const router = useRouter();
  
  // Store actions
  const resetFilters = usePublicQuestionFiltersStore(state => state.resetFilters);
  
  // ===== HANDLERS =====
  
  /**
   * Handle grade filter click
   * Apply grade filter và navigate to browse page
   */
  const handleGradeClick = (grade: string) => {
    // Reset filters trước khi apply new filter
    resetFilters();
    
    // Call callback if provided
    onFilterSelect?.('grade', grade);
    
    // Navigate to browse page with grade filter
    router.push(`${QUESTION_ROUTES.BROWSE}?grade=${grade}`);
  };
  
  /**
   * Handle subject filter click
   * Apply subject filter và navigate to browse page
   */
  const handleSubjectClick = (subject: string) => {
    // Reset filters trước khi apply new filter
    resetFilters();
    
    // Call callback if provided
    onFilterSelect?.('subject', subject);
    
    // Navigate to browse page with subject filter
    router.push(`${QUESTION_ROUTES.BROWSE}?subject=${subject}`);
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Render grade filter buttons
   * Display grade filter buttons (Lớp 6-12)
   */
  const renderGradeButtons = () => {
    if (!showGrades) return null;
    
    return GRADE_FILTERS.map((filter) => {
      const Icon = filter.icon;
      
      return (
        <button
          key={filter.id}
          onClick={() => handleGradeClick(filter.value)}
          className={cn(
            'group relative p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg',
            'flex flex-col items-center gap-2 min-h-[90px]',
            `filter-button-${filter.color}`
          )}
          title={filter.description}
        >
          {/* Icon */}
          <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
          
          {/* Label */}
          <span className="text-sm font-semibold text-center">
            {filter.label}
          </span>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      );
    });
  };
  
  /**
   * Render subject filter buttons
   * Display subject filter buttons (Chủ đề môn học)
   */
  const renderSubjectButtons = () => {
    if (!showSubjects) return null;
    
    return SUBJECT_FILTERS.map((filter) => {
      const Icon = filter.icon;
      
      return (
        <button
          key={filter.id}
          onClick={() => handleSubjectClick(filter.value)}
          className={cn(
            'group relative p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg',
            'flex flex-col items-center gap-2 min-h-[100px]',
            `filter-button-${filter.color}`
          )}
          title={filter.description}
        >
          {/* Icon */}
          <Icon className="h-7 w-7 group-hover:scale-110 transition-transform" />
          
          {/* Label */}
          <span className="text-base font-semibold text-center">
            {filter.label}
          </span>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      );
    });
  };
  
  // ===== MAIN RENDER =====
  
  // Check if we have any filters to show
  const hasGrades = showGrades && GRADE_FILTERS.length > 0;
  const hasSubjects = showSubjects && SUBJECT_FILTERS.length > 0;
  
  if (!hasGrades && !hasSubjects) return null;
  
  return (
    <div className={cn('quick-filter-buttons w-full', className)}>
      {/* Section Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
          <Filter className="h-5 w-5" />
          Lọc nhanh theo chủ đề
        </h3>
        <p className="text-sm text-muted-foreground">
          Chọn lớp học hoặc chủ đề để tìm câu hỏi phù hợp
        </p>
      </div>
      
      {/* Grade Filters Section */}
      {hasGrades && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 text-center">
            Lọc theo lớp học
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {renderGradeButtons()}
          </div>
        </div>
      )}
      
      {/* Subject Filters Section */}
      {hasSubjects && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 text-center">
            Lọc theo chủ đề
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {renderSubjectButtons()}
          </div>
        </div>
      )}
      
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
 * Compact version với fewer buttons - chỉ hiện thị subjects
 */
export function CompactQuickFilterButtons(props: Omit<QuickFilterButtonsProps, 'maxButtons' | 'showGrades'>) {
  return (
    <QuickFilterButtons
      {...props}
      showGrades={false}
      maxButtons={4}
      className={cn('compact-quick-filter-buttons', props.className)}
    />
  );
}

/**
 * Grade Only Quick Filter Buttons
 * Only show grade filters (Lớp học)
 */
export function GradeQuickFilterButtons(props: Omit<QuickFilterButtonsProps, 'showSubjects'>) {
  return (
    <QuickFilterButtons
      {...props}
      showSubjects={false}
      className={cn('grade-quick-filter-buttons', props.className)}
    />
  );
}

/**
 * Subject Only Quick Filter Buttons
 * Only show subject filters (Chủ đề)
 */
export function SubjectQuickFilterButtons(props: Omit<QuickFilterButtonsProps, 'showGrades'>) {
  return (
    <QuickFilterButtons
      {...props}
      showGrades={false}
      className={cn('subject-quick-filter-buttons', props.className)}
    />
  );
}

// ===== EXPORTS =====

export default QuickFilterButtons;
