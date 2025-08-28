/**
 * Stats Display Component
 * Dynamic statistics display với animated counters và loading states
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Grid3X3, Star, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useQuestionStats } from '@/hooks/public';
import { NumberCounter, RatingCounter } from '@/components/ui';
import { PublicQuestionStats } from '@/lib/types/public';

// ===== TYPES =====

/**
 * Stats Display Props Interface
 * Props cho StatsDisplay component
 */
export interface StatsDisplayProps {
  variant?: 'default' | 'compact' | 'enhanced';
  layout?: 'grid' | 'inline' | 'vertical';
  showIcons?: boolean;
  showAnimations?: boolean;
  animationDuration?: number;
  staggerAnimation?: boolean;
  onStatsLoad?: (stats: PublicQuestionStats) => void;
  className?: string;
}

/**
 * Stat Item Configuration Interface
 * Configuration cho individual stat items
 */
interface StatItemConfig {
  key: keyof PublicQuestionStats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  formatter: (value: number) => string;
  color: string;
  description?: string;
}

// ===== CONSTANTS =====

/**
 * Stats configuration
 * Configuration cho each stat item
 */
const STATS_CONFIG: StatItemConfig[] = [
  {
    key: 'totalQuestions',
    label: 'Câu hỏi',
    icon: BookOpen,
    formatter: (value: number) => value.toLocaleString(),
    color: 'text-primary',
    description: 'Tổng số câu hỏi có sẵn'
  },
  {
    key: 'totalCategories',
    label: 'Chủ đề',
    icon: Grid3X3,
    formatter: (value: number) => value.toString(),
    color: 'text-blue-600',
    description: 'Số lượng chủ đề học tập'
  },
  {
    key: 'averageRating',
    label: 'Đánh giá',
    icon: Star,
    formatter: (value: number) => value.toFixed(1),
    color: 'text-yellow-600',
    description: 'Đánh giá trung bình từ học viên'
  },
  {
    key: 'recentlyAdded',
    label: 'Mới thêm',
    icon: Plus,
    formatter: (value: number) => `+${value}`,
    color: 'text-green-600',
    description: 'Câu hỏi được thêm gần đây'
  }
];

/**
 * Fallback stats data
 * Default values khi không load được data
 */
const FALLBACK_STATS: PublicQuestionStats = {
  totalQuestions: 6749,
  totalCategories: 12,
  totalSubjects: 8,
  averageRating: 4.8,
  recentlyAdded: 24,
  popularCategories: [],
  difficultyDistribution: []
};

// ===== MAIN COMPONENT =====

/**
 * Stats Display Component
 * Dynamic statistics display với animated counters
 * 
 * Features:
 * - Integration với useQuestionStats hook
 * - Animated counters với stagger effects
 * - Loading states với skeleton UI
 * - Error handling với retry functionality
 * - Multiple layout variants
 * - Responsive design
 */
export function StatsDisplay({
  variant = 'default',
  layout = 'grid',
  showIcons = true,
  showAnimations = true,
  animationDuration = 1500,
  staggerAnimation = true,
  onStatsLoad,
  className
}: StatsDisplayProps) {
  // ===== HOOKS =====
  
  const { data: stats, isLoading, isError, error, refetch } = useQuestionStats({
    enabled: true,
    refetchInterval: 30 * 60 * 1000 // 30 minutes
  });
  
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
  
  /**
   * Stats load callback
   * Call onStatsLoad khi stats được load
   */
  useEffect(() => {
    if (stats && onStatsLoad) {
      onStatsLoad(stats);
    }
  }, [stats, onStatsLoad]);
  
  // ===== RENDER HELPERS =====
  
  /**
   * Get layout classes
   * Generate layout classes based on variant và layout
   */
  const getLayoutClasses = () => {
    const baseClasses = 'stats-display';
    
    if (layout === 'inline') {
      return `${baseClasses} flex flex-wrap items-center justify-center gap-8`;
    }
    
    if (layout === 'vertical') {
      return `${baseClasses} flex flex-col gap-4`;
    }
    
    // Grid layout (default)
    switch (variant) {
      case 'compact':
        return `${baseClasses} grid grid-cols-2 gap-4`;
      case 'enhanced':
        return `${baseClasses} grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto`;
      default:
        return `${baseClasses} grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto`;
    }
  };
  
  /**
   * Get stagger delay
   * Calculate stagger delay cho each stat item
   */
  const getStaggerDelay = (index: number) => {
    if (!staggerAnimation) return 0;
    return index * 200; // 200ms delay between each stat
  };
  
  /**
   * Get stat value
   * Extract stat value từ stats object
   */
  const getStatValue = (config: StatItemConfig): number => {
    if (!stats) return FALLBACK_STATS[config.key] as number;
    return stats[config.key] as number;
  };
  
  /**
   * Render stat item
   * Render individual stat item với animation
   */
  const renderStatItem = (config: StatItemConfig, index: number) => {
    const Icon = config.icon;
    const value = getStatValue(config);
    
    return (
      <div
        key={config.key}
        className={cn(
          'stat-item text-center',
          // Stagger animation
          staggerAnimation && !isVisible && 'opacity-0 translate-y-4',
          staggerAnimation && isVisible && 'opacity-100 translate-y-0',
          'transition-all duration-500 ease-out'
        )}
        style={staggerAnimation ? {
          transitionDelay: `${getStaggerDelay(index)}ms`
        } : undefined}
      >
        {/* Icon */}
        {showIcons && (
          <div className="stat-icon flex items-center justify-center mb-2">
            <Icon className={cn('h-6 w-6', config.color)} />
          </div>
        )}
        
        {/* Value */}
        <div className={cn('stat-value text-3xl font-bold mb-1', config.color)}>
          {showAnimations ? (
            config.key === 'averageRating' ? (
              <RatingCounter
                value={value}
                duration={animationDuration}
                easing="easeOutQuart"
              />
            ) : (
              <NumberCounter
                value={value}
                duration={animationDuration}
                easing="easeOutQuart"
              />
            )
          ) : (
            config.formatter(value)
          )}
        </div>
        
        {/* Label */}
        <div className="stat-label text-sm text-muted-foreground">
          {config.label}
        </div>
        
        {/* Description (enhanced variant only) */}
        {variant === 'enhanced' && config.description && (
          <div className="stat-description text-xs text-muted-foreground mt-1 opacity-75">
            {config.description}
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
      <div className={getLayoutClasses()}>
        {STATS_CONFIG.map((_, index) => (
          <div key={index} className="stat-item-skeleton text-center animate-pulse">
            {showIcons && (
              <div className="stat-icon-skeleton w-6 h-6 bg-muted rounded mx-auto mb-2" />
            )}
            <div className="stat-value-skeleton w-16 h-8 bg-muted rounded mx-auto mb-1" />
            <div className="stat-label-skeleton w-12 h-4 bg-muted rounded mx-auto" />
          </div>
        ))}
      </div>
    );
  };
  
  /**
   * Render error state
   * Display error message với retry option
   */
  const renderError = () => {
    return (
      <div className="stats-error text-center py-8">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <h3 className="text-sm font-medium text-foreground mb-2">
          Không thể tải thống kê
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {error?.message || 'Đã xảy ra lỗi khi tải dữ liệu thống kê.'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Thử lại
        </button>
      </div>
    );
  };
  
  /**
   * Render stats
   * Display stats với animations
   */
  const renderStats = () => {
    return (
      <div className={getLayoutClasses()}>
        {STATS_CONFIG.map((config, index) => renderStatItem(config, index))}
      </div>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <div className={cn('stats-display-wrapper', className)}>
      {isLoading && renderLoading()}
      {isError && renderError()}
      {!isLoading && !isError && renderStats()}
    </div>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Stats Display
 * Compact version với 2x2 grid
 */
export function CompactStatsDisplay(props: Omit<StatsDisplayProps, 'variant'>) {
  return (
    <StatsDisplay
      {...props}
      variant="compact"
      className={cn('compact-stats-display', props.className)}
    />
  );
}

/**
 * Enhanced Stats Display
 * Enhanced version với descriptions và better layout
 */
export function EnhancedStatsDisplay(props: Omit<StatsDisplayProps, 'variant'>) {
  return (
    <StatsDisplay
      {...props}
      variant="enhanced"
      className={cn('enhanced-stats-display', props.className)}
    />
  );
}

/**
 * Inline Stats Display
 * Horizontal inline layout
 */
export function InlineStatsDisplay(props: Omit<StatsDisplayProps, 'layout'>) {
  return (
    <StatsDisplay
      {...props}
      layout="inline"
      className={cn('inline-stats-display', props.className)}
    />
  );
}

// ===== EXPORTS =====

export default StatsDisplay;
