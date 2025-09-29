/**
 * Difficulty Indicator Component
 * Visual indicators cho question difficulty với color-coded levels
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Badge } from '@/components/ui';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { QuestionDifficulty } from '@/types/question';

/**
 * Props cho Difficulty Indicator
 */
interface DifficultyIndicatorProps {
  /** Difficulty level */
  difficulty?: QuestionDifficulty;
  /** Display variant */
  variant?: 'badge' | 'bar' | 'icon' | 'full';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Show label */
  showLabel?: boolean;
  /** Show tooltip */
  showTooltip?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Difficulty Indicator Component
 * Visual representation của question difficulty levels
 */
export function DifficultyIndicator({
  difficulty,
  variant = 'badge',
  size = 'md',
  showLabel = true,
  showTooltip = true,
  className = ''
}: DifficultyIndicatorProps) {
  /**
   * Get difficulty configuration
   */
  const getDifficultyConfig = (level?: QuestionDifficulty) => {
    if (!level) {
      return {
        label: 'Chưa xác định',
        value: 0,
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-300',
        icon: BarChart3,
        description: 'Độ khó chưa được xác định'
      };
    }

    const configs = {
      [QuestionDifficulty.EASY]: {
        label: 'Dễ',
        value: 1,
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        icon: BarChart3,
        description: 'Câu hỏi cơ bản, phù hợp cho học sinh mới bắt đầu'
      },
      [QuestionDifficulty.MEDIUM]: {
        label: 'Trung bình',
        value: 2,
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300',
        icon: TrendingUp,
        description: 'Câu hỏi vừa phải, cần hiểu biết cơ bản về chủ đề'
      },
      [QuestionDifficulty.HARD]: {
        label: 'Khó',
        value: 3,
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        icon: AlertTriangle,
        description: 'Câu hỏi nâng cao, đòi hỏi tư duy phân tích cao'
      },
      [QuestionDifficulty.EXPERT]: {
        label: 'Chuyên gia',
        value: 4,
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-300',
        icon: AlertTriangle,
        description: 'Câu hỏi chuyên gia, đòi hỏi kiến thức sâu rộng'
      }
    };

    return configs[level] || configs[QuestionDifficulty.MEDIUM];
  };

  const config = getDifficultyConfig(difficulty);
  const Icon = config.icon;

  /**
   * Get size classes
   */
  const getSizeClasses = () => {
    const sizes = {
      sm: {
        badge: 'text-xs px-2 py-1',
        icon: 'h-3 w-3',
        bar: 'h-1',
        text: 'text-xs'
      },
      md: {
        badge: 'text-sm px-3 py-1',
        icon: 'h-4 w-4',
        bar: 'h-2',
        text: 'text-sm'
      },
      lg: {
        badge: 'text-base px-4 py-2',
        icon: 'h-5 w-5',
        bar: 'h-3',
        text: 'text-base'
      }
    };
    return sizes[size];
  };

  const sizeClasses = getSizeClasses();

  /**
   * Render badge variant
   */
  const renderBadge = () => (
    <Badge
      className={`
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border ${sizeClasses.badge} font-medium
        ${className}
      `}
      title={showTooltip ? config.description : undefined}
    >
      <Icon className={`${sizeClasses.icon} mr-1`} />
      {showLabel && config.label}
    </Badge>
  );

  /**
   * Render bar variant
   */
  const renderBar = () => (
    <div 
      className={`difficulty-bar ${className}`}
      title={showTooltip ? `${config.label}: ${config.description}` : undefined}
    >
      {showLabel && (
        <div className={`${sizeClasses.text} font-medium mb-1 ${config.textColor}`}>
          {config.label}
        </div>
      )}
      <div className={`w-full ${config.bgColor} rounded-full ${sizeClasses.bar}`}>
        <div 
          className={`bg-${config.color}-500 ${sizeClasses.bar} rounded-full transition-all duration-300`}
          style={{ width: `${(config.value / 3) * 100}%` }}
        />
      </div>
    </div>
  );

  /**
   * Render icon variant
   */
  const renderIcon = () => (
    <div 
      className={`difficulty-icon ${config.textColor} ${className}`}
      title={showTooltip ? `${config.label}: ${config.description}` : undefined}
    >
      <Icon className={sizeClasses.icon} />
    </div>
  );

  /**
   * Render full variant
   */
  const renderFull = () => (
    <div 
      className={`difficulty-full flex items-center gap-2 ${className}`}
      title={showTooltip ? config.description : undefined}
    >
      <div className={`p-2 rounded-full ${config.bgColor}`}>
        <Icon className={`${sizeClasses.icon} ${config.textColor}`} />
      </div>
      
      {showLabel && (
        <div>
          <div className={`font-medium ${sizeClasses.text}`}>
            {config.label}
          </div>
          <div className="text-xs text-muted-foreground">
            Độ khó: {config.value}/3
          </div>
        </div>
      )}
      
      {/* Progress dots */}
      <div className="flex gap-1 ml-2">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`
              w-2 h-2 rounded-full transition-colors duration-200
              ${level <= config.value 
                ? `bg-${config.color}-500` 
                : 'bg-gray-200'
              }
            `}
          />
        ))}
      </div>
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'bar':
      return renderBar();
    case 'icon':
      return renderIcon();
    case 'full':
      return renderFull();
    case 'badge':
    default:
      return renderBadge();
  }
}

/**
 * Difficulty Scale Component
 * Shows all difficulty levels for comparison
 */
export function DifficultyScale({
  currentDifficulty,
  onSelect,
  className = ''
}: {
  currentDifficulty?: QuestionDifficulty;
  onSelect?: (difficulty: QuestionDifficulty) => void;
  className?: string;
}) {
  const difficulties = [
    QuestionDifficulty.EASY,
    QuestionDifficulty.MEDIUM,
    QuestionDifficulty.HARD
  ];

  return (
    <div className={`difficulty-scale flex gap-2 ${className}`}>
      {difficulties.map((difficulty) => (
        <button
          key={difficulty}
          onClick={() => onSelect?.(difficulty)}
          className={`
            flex-1 transition-all duration-200
            ${currentDifficulty === difficulty 
              ? 'ring-2 ring-blue-500 ring-offset-2' 
              : 'hover:scale-105'
            }
            ${onSelect ? 'cursor-pointer' : 'cursor-default'}
          `}
          disabled={!onSelect}
        >
          <DifficultyIndicator
            difficulty={difficulty}
            variant="full"
            size="sm"
            showLabel={true}
            showTooltip={true}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Difficulty Stats Component
 * Shows difficulty distribution statistics
 */
export function DifficultyStats({
  stats,
  className = ''
}: {
  stats: Record<QuestionDifficulty | 'undefined', number>;
  className?: string;
}) {
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);

  const getDifficultyPercentage = (count: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <div className={`difficulty-stats space-y-3 ${className}`}>
      <h4 className="font-medium text-sm">Phân bố độ khó</h4>
      
      <div className="space-y-2">
        {Object.entries(stats).map(([difficulty, count]) => {
          const difficultyLevel = difficulty === 'undefined' 
            ? undefined 
            : difficulty as QuestionDifficulty;
          const percentage = getDifficultyPercentage(count);
          
          return (
            <div key={difficulty} className="flex items-center gap-3">
              <DifficultyIndicator
                difficulty={difficultyLevel}
                variant="icon"
                size="sm"
                showLabel={false}
                showTooltip={false}
              />
              
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span>{difficultyLevel || 'Chưa xác định'}</span>
                  <span className="text-muted-foreground">
                    {count} ({percentage}%)
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
