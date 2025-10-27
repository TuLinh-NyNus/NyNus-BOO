/**
 * Metadata Display Component
 * Dedicated component cho hiển thị comprehensive metadata và usage statistics theo RIPER-5 EXECUTE MODE
 * 
 * Features:
 * - Complete metadata display (type, difficulty, category, subject, grade, points, timeLimit, tags)
 * - Usage statistics (views, rating, creation date)
 * - Responsive grid layout với proper formatting
 * - Error handling và loading states
 * - Accessibility compliance
 * - Multiple variants và layouts
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import React, { useMemo } from 'react';
import { 
  Badge,
  Alert,
  AlertDescription
} from '@/components/ui';
import { 
  Eye, 
  Star, 
  Clock, 
  Calendar, 
  Tag, 
  BookOpen, 
  GraduationCap, 
  Target,
  TrendingUp,
  AlertTriangle,
  Hash
} from 'lucide-react';

// Import shared components
import { 
  PublicQuestionErrorBoundary,
  QuestionTypeBadge,
  DifficultyIndicator 
} from '@/components/questions/shared';

// Import types
import { PublicQuestion } from '@/types/public';

// Import utils
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// ===== TYPES =====

export interface MetadataDisplayProps {
  /** Question data với metadata */
  question: PublicQuestion;
  
  /** Show metadata section (default: true) */
  showMetadata?: boolean;
  
  /** Show usage statistics (default: true) */
  showStatistics?: boolean;
  
  /** Display variant */
  variant?: 'default' | 'compact' | 'detailed';
  
  /** Layout style */
  layout?: 'horizontal' | 'vertical' | 'grid';
  
  /** Error handler callback */
  onError?: (error: Error) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const VARIANT_STYLES = {
  default: 'metadata-display-default',
  compact: 'metadata-display-compact',
  detailed: 'metadata-display-detailed'
} as const;

const LAYOUT_STYLES = {
  horizontal: 'flex flex-wrap items-center gap-2',
  vertical: 'space-y-3',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
} as const;

// ===== MAIN COMPONENT =====

/**
 * Metadata Display Component
 * Comprehensive component cho hiển thị question metadata và usage statistics
 */
export function MetadataDisplay({
  question,
  showMetadata = true,
  showStatistics = true,
  variant = 'default',
  layout = 'grid',
  onError,
  className = ""
}: MetadataDisplayProps) {
  // ===== COMPUTED VALUES =====
  
  /**
   * Check if question has metadata
   */
  const hasMetadata = useMemo(() => {
    return !!(question?.type || question?.difficulty || question?.category);
  }, [question]);
  
  /**
   * Check if question has statistics
   */
  const hasStatistics = useMemo(() => {
    return !!(question?.views || question?.rating || question?.createdAt);
  }, [question]);
  
  /**
   * Format creation date safely
   */
  const formattedCreatedAt = useMemo(() => {
    if (!question?.createdAt) return null;
    try {
      const date = new Date(question.createdAt);
      if (isNaN(date.getTime())) {
        console.warn('[MetadataDisplay] Invalid date value:', question.createdAt);
        return null;
      }
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.warn('[MetadataDisplay] Date format error:', error);
      return null;
    }
  }, [question?.createdAt]);
  
  /**
   * Format rating display
   */
  const formattedRating = useMemo(() => {
    if (!question?.rating) return null;
    return Math.round(question.rating * 10) / 10; // Round to 1 decimal
  }, [question?.rating]);
  
  // ===== RENDER FUNCTIONS =====
  
  /**
   * Render basic metadata items
   */
  const renderBasicMetadata = () => {
    const items = [];
    
    // Question Type
    if (question.type) {
      items.push(
        <div key="type" className="metadata-item">
          <QuestionTypeBadge 
            type={question.type} 
            variant="badge"
            size={variant === 'compact' ? 'sm' : 'md'}
            showTooltip={true}
          />
        </div>
      );
    }
    
    // Difficulty
    if (question.difficulty) {
      items.push(
        <div key="difficulty" className="metadata-item">
          <DifficultyIndicator 
            difficulty={question.difficulty}
            variant="badge"
            size={variant === 'compact' ? 'sm' : 'md'}
            showTooltip={true}
          />
        </div>
      );
    }
    
    // Category
    if (question.category) {
      items.push(
        <div key="category" className="metadata-item">
          <Badge 
            variant="secondary"
            className={cn(
              "flex items-center gap-1",
              variant === 'compact' ? "text-xs px-2 py-1" : "text-sm px-3 py-1"
            )}
          >
            <BookOpen className="h-3 w-3" />
            {question.category}
          </Badge>
        </div>
      );
    }
    
    // Subject
    if (question.subject) {
      items.push(
        <div key="subject" className="metadata-item">
          <Badge 
            variant="outline"
            className={cn(
              "flex items-center gap-1",
              variant === 'compact' ? "text-xs px-2 py-1" : "text-sm px-3 py-1"
            )}
          >
            <Target className="h-3 w-3" />
            {question.subject}
          </Badge>
        </div>
      );
    }
    
    // Grade
    if (question.grade) {
      items.push(
        <div key="grade" className="metadata-item">
          <Badge 
            variant="outline"
            className={cn(
              "flex items-center gap-1",
              variant === 'compact' ? "text-xs px-2 py-1" : "text-sm px-3 py-1"
            )}
          >
            <GraduationCap className="h-3 w-3" />
            Lớp {question.grade}
          </Badge>
        </div>
      );
    }
    
    // Points
    if (question.points) {
      items.push(
        <div key="points" className="metadata-item">
          <Badge 
            className={cn(
              "bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-1",
              variant === 'compact' ? "text-xs px-2 py-1" : "text-sm px-3 py-1"
            )}
          >
            <Hash className="h-3 w-3" />
            {question.points} điểm
          </Badge>
        </div>
      );
    }
    
    // Time Limit
    if (question.timeLimit) {
      items.push(
        <div key="timeLimit" className="metadata-item">
          <Badge 
            variant="outline"
            className={cn(
              "flex items-center gap-1",
              variant === 'compact' ? "text-xs px-2 py-1" : "text-sm px-3 py-1"
            )}
          >
            <Clock className="h-3 w-3" />
            {question.timeLimit} phút
          </Badge>
        </div>
      );
    }
    
    return items;
  };
  
  /**
   * Render tags
   */
  const renderTags = () => {
    if (!question.tags || question.tags.length === 0) return null;
    
    return (
      <div className="tags-section">
        <div className="flex flex-wrap gap-1">
          {question.tags.slice(0, variant === 'compact' ? 3 : 6).map((tag, index) => (
            <Badge 
              key={index}
              variant="secondary"
              className={cn(
                "flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100",
                variant === 'compact' ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1"
              )}
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </Badge>
          ))}
          {question.tags.length > (variant === 'compact' ? 3 : 6) && (
            <Badge variant="outline" className="text-xs">
              +{question.tags.length - (variant === 'compact' ? 3 : 6)} khác
            </Badge>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render usage statistics
   */
  const renderUsageStatistics = () => {
    const stats = [];

    // Views
    if (question.views !== undefined) {
      stats.push(
        <div key="views" className="stat-item">
          <div className={cn(
            "flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200",
            variant === 'compact' && "p-2"
          )}>
            <div className="flex-shrink-0">
              <Eye className={cn(
                "text-blue-600",
                variant === 'compact' ? "h-4 w-4" : "h-5 w-5"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-medium text-blue-900",
                variant === 'compact' ? "text-sm" : "text-base"
              )}>
                {question.views.toLocaleString('vi-VN')}
              </div>
              <div className={cn(
                "text-blue-600",
                variant === 'compact' ? "text-xs" : "text-sm"
              )}>
                Lượt xem
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Rating
    if (formattedRating !== null) {
      stats.push(
        <div key="rating" className="stat-item">
          <div className={cn(
            "flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200",
            variant === 'compact' && "p-2"
          )}>
            <div className="flex-shrink-0">
              <Star className={cn(
                "text-yellow-600 fill-current",
                variant === 'compact' ? "h-4 w-4" : "h-5 w-5"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-medium text-yellow-900",
                variant === 'compact' ? "text-sm" : "text-base"
              )}>
                {formattedRating}/5.0
              </div>
              <div className={cn(
                "text-yellow-600",
                variant === 'compact' ? "text-xs" : "text-sm"
              )}>
                Đánh giá
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Creation Date
    if (formattedCreatedAt) {
      stats.push(
        <div key="created" className="stat-item">
          <div className={cn(
            "flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200",
            variant === 'compact' && "p-2"
          )}>
            <div className="flex-shrink-0">
              <Calendar className={cn(
                "text-green-600",
                variant === 'compact' ? "h-4 w-4" : "h-5 w-5"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-medium text-green-900",
                variant === 'compact' ? "text-sm" : "text-base"
              )}>
                {formattedCreatedAt}
              </div>
              <div className={cn(
                "text-green-600",
                variant === 'compact' ? "text-xs" : "text-sm"
              )}>
                Ngày tạo
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Popularity Score (calculated from views and rating)
    if (question.views && question.rating) {
      const popularityScore = Math.round((question.views / 100) + (question.rating * 20));
      stats.push(
        <div key="popularity" className="stat-item">
          <div className={cn(
            "flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200",
            variant === 'compact' && "p-2"
          )}>
            <div className="flex-shrink-0">
              <TrendingUp className={cn(
                "text-purple-600",
                variant === 'compact' ? "h-4 w-4" : "h-5 w-5"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-medium text-purple-900",
                variant === 'compact' ? "text-sm" : "text-base"
              )}>
                {popularityScore}
              </div>
              <div className={cn(
                "text-purple-600",
                variant === 'compact' ? "text-xs" : "text-sm"
              )}>
                Độ phổ biến
              </div>
            </div>
          </div>
        </div>
      );
    }

    return stats;
  };

  /**
   * Get layout classes based on layout prop
   */
  const getLayoutClasses = () => {
    if (layout === 'horizontal') {
      return LAYOUT_STYLES.horizontal;
    } else if (layout === 'vertical') {
      return LAYOUT_STYLES.vertical;
    } else {
      return LAYOUT_STYLES.grid;
    }
  };

  /**
   * Get variant-specific styling
   */
  const getVariantStyles = () => {
    const baseStyles = "metadata-display";
    const variantStyle = VARIANT_STYLES[variant];

    switch (variant) {
      case 'compact':
        return cn(baseStyles, variantStyle, "space-y-2");
      case 'detailed':
        return cn(baseStyles, variantStyle, "space-y-6 p-4 bg-card rounded-lg border");
      default:
        return cn(baseStyles, variantStyle, "space-y-4");
    }
  };

  // ===== MAIN RENDER =====

  if (!question) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Không có dữ liệu câu hỏi để hiển thị metadata
        </AlertDescription>
      </Alert>
    );
  }

  if (!showMetadata && !showStatistics) {
    return null;
  }

  if (!hasMetadata && !hasStatistics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Câu hỏi này không có metadata hoặc thống kê để hiển thị
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <PublicQuestionErrorBoundary
      onError={onError}
      enableRetry={true}
      maxRetries={2}
      className="metadata-display-error-boundary"
    >
      <div className={cn(getVariantStyles(), className)}>
        {/* Basic Metadata */}
        {showMetadata && hasMetadata && (
          <div className="metadata-section">
            {variant !== 'compact' && (
              <h3 className="font-medium text-foreground mb-3">Thông tin câu hỏi</h3>
            )}
            <div className={getLayoutClasses()}>
              {renderBasicMetadata()}
            </div>
            {renderTags()}
          </div>
        )}

        {/* Usage Statistics */}
        {showStatistics && hasStatistics && (
          <div className="statistics-section">
            {variant !== 'compact' && (
              <h3 className="font-medium text-foreground mb-3">Thống kê sử dụng</h3>
            )}
            <div className={cn(
              layout === 'horizontal' ? "flex flex-wrap gap-2" :
              layout === 'vertical' ? "space-y-2" :
              "grid grid-cols-2 md:grid-cols-4 gap-3"
            )}>
              {renderUsageStatistics()}
            </div>
          </div>
        )}
      </div>
    </PublicQuestionErrorBoundary>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Metadata Display
 * Simplified display cho dense layouts
 */
export function CompactMetadataDisplay(props: Omit<MetadataDisplayProps, 'variant'>) {
  return (
    <MetadataDisplay
      {...props}
      variant="compact"
      layout="horizontal"
      className={cn("compact-metadata-display", props.className)}
    />
  );
}

/**
 * Detailed Metadata Display
 * Enhanced display với card styling
 */
export function DetailedMetadataDisplay(props: Omit<MetadataDisplayProps, 'variant'>) {
  return (
    <MetadataDisplay
      {...props}
      variant="detailed"
      layout="grid"
      className={cn("detailed-metadata-display", props.className)}
    />
  );
}

/**
 * Statistics-Only Metadata Display
 * Display chỉ usage statistics
 */
export function StatisticsOnlyMetadataDisplay(props: MetadataDisplayProps) {
  return (
    <MetadataDisplay
      {...props}
      showMetadata={false}
      showStatistics={true}
      className={cn("statistics-only-metadata-display", props.className)}
    />
  );
}

/**
 * Metadata-Only Display
 * Display chỉ basic metadata
 */
export function MetadataOnlyDisplay(props: MetadataDisplayProps) {
  return (
    <MetadataDisplay
      {...props}
      showMetadata={true}
      showStatistics={false}
      className={cn("metadata-only-display", props.className)}
    />
  );
}

/**
 * Horizontal Metadata Display
 * Single-line horizontal layout
 */
export function HorizontalMetadataDisplay(props: Omit<MetadataDisplayProps, 'layout'>) {
  return (
    <MetadataDisplay
      {...props}
      layout="horizontal"
      variant="compact"
      className={cn("horizontal-metadata-display", props.className)}
    />
  );
}
