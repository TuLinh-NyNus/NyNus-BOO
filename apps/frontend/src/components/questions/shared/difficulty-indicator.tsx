/**
 * Difficulty Indicator Component
 * Reusable difficulty indicator cho public questions theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React from "react";
import { Badge } from "@/components/ui";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  HelpCircle
} from "lucide-react";

// Import types
import { QuestionDifficulty } from "@/lib/types/question";

// ===== TYPES =====

export interface DifficultyIndicatorProps {
  /** Difficulty level */
  difficulty: QuestionDifficulty;
  /** Display variant */
  variant?: 'badge' | 'bar' | 'dots' | 'icon' | 'full';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Show label */
  showLabel?: boolean;
  /** Show tooltip */
  showTooltip?: boolean;
  /** Show progress indicator */
  showProgress?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ===== CONFIGURATION =====

/**
 * Difficulty configuration
 * Centralized configuration cho difficulty display
 */
const DIFFICULTY_CONFIG = {
  [QuestionDifficulty.EASY]: {
    label: 'Dễ',
    value: 1,
    maxValue: 3,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    progressColor: 'bg-green-500',
    icon: BarChart3,
    description: 'Câu hỏi cơ bản, phù hợp cho người mới bắt đầu'
  },
  [QuestionDifficulty.MEDIUM]: {
    label: 'Trung bình',
    value: 2,
    maxValue: 3,
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    progressColor: 'bg-yellow-500',
    icon: TrendingUp,
    description: 'Câu hỏi vừa phải, cần hiểu biết cơ bản'
  },
  [QuestionDifficulty.HARD]: {
    label: 'Khó',
    value: 3,
    maxValue: 3,
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    progressColor: 'bg-red-500',
    icon: AlertTriangle,
    description: 'Câu hỏi nâng cao, đòi hỏi tư duy phân tích cao'
  }
} as const;

/**
 * Size configuration
 */
const SIZE_CONFIG = {
  sm: {
    badge: 'text-xs px-2 py-1',
    icon: 'h-3 w-3',
    text: 'text-xs',
    dot: 'w-1.5 h-1.5',
    gap: 'gap-1'
  },
  md: {
    badge: 'text-sm px-3 py-1',
    icon: 'h-4 w-4',
    text: 'text-sm',
    dot: 'w-2 h-2',
    gap: 'gap-2'
  },
  lg: {
    badge: 'text-base px-4 py-2',
    icon: 'h-5 w-5',
    text: 'text-base',
    dot: 'w-3 h-3',
    gap: 'gap-2'
  }
} as const;

// ===== HELPER FUNCTIONS =====

/**
 * Get difficulty configuration
 */
function getDifficultyConfig(difficulty: QuestionDifficulty) {
  return DIFFICULTY_CONFIG[difficulty] || {
    label: 'Không xác định',
    value: 0,
    maxValue: 3,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    progressColor: 'bg-gray-500',
    icon: HelpCircle,
    description: 'Độ khó chưa được xác định'
  };
}

/**
 * Get size classes
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg') {
  return SIZE_CONFIG[size];
}

// ===== MAIN COMPONENT =====

export function DifficultyIndicator({
  difficulty,
  variant = 'badge',
  size = 'md',
  showLabel = true,
  showTooltip = true,
  showProgress = false,
  className = ""
}: DifficultyIndicatorProps) {
  // ===== COMPUTED VALUES =====
  
  const config = getDifficultyConfig(difficulty);
  const sizeClasses = getSizeClasses(size);
  const Icon = config.icon;

  // ===== VARIANT RENDERING =====

  /**
   * Render icon variant
   */
  const renderIcon = () => (
    <div 
      className={`
        difficulty-icon inline-flex items-center justify-center
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border rounded-full p-1 transition-all duration-200
        ${className}
      `}
      title={showTooltip ? `${config.label}: ${config.description}` : undefined}
    >
      <Icon className={sizeClasses.icon} />
    </div>
  );

  /**
   * Render badge variant
   */
  const renderBadge = () => (
    <Badge
      className={`
        difficulty-badge
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border ${sizeClasses.badge} font-medium transition-all duration-200
        ${className}
      `}
      title={showTooltip ? `${config.label}: ${config.description}` : undefined}
    >
      <div className={`flex items-center ${sizeClasses.gap}`}>
        <Icon className={sizeClasses.icon} />
        {showLabel && <span>{config.label}</span>}
        {showProgress && (
          <div className="flex gap-0.5 ml-1">
            {Array.from({ length: config.maxValue }, (_, index) => (
              <div
                key={index}
                className={`
                  ${sizeClasses.dot} rounded-full transition-colors duration-200
                  ${index < config.value ? config.progressColor : 'bg-gray-300'}
                `}
              />
            ))}
          </div>
        )}
      </div>
    </Badge>
  );

  /**
   * Render bar variant
   */
  const renderBar = () => (
    <div 
      className={`
        difficulty-bar flex items-center ${sizeClasses.gap}
        ${className}
      `}
      title={showTooltip ? `${config.label}: ${config.description}` : undefined}
    >
      {showLabel && (
        <span className={`${sizeClasses.text} font-medium ${config.textColor}`}>
          {config.label}
        </span>
      )}
      
      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-12">
        <div 
          className={`${config.progressColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${(config.value / config.maxValue) * 100}%` }}
        />
      </div>
      
      <span className="text-xs text-muted-foreground">
        {config.value}/{config.maxValue}
      </span>
    </div>
  );

  /**
   * Render dots variant
   */
  const renderDots = () => (
    <div 
      className={`
        difficulty-dots flex items-center ${sizeClasses.gap}
        ${className}
      `}
      title={showTooltip ? `${config.label}: ${config.description}` : undefined}
    >
      {showLabel && (
        <span className={`${sizeClasses.text} font-medium`}>
          {config.label}
        </span>
      )}
      
      <div className="flex gap-1">
        {Array.from({ length: config.maxValue }, (_, index) => (
          <div
            key={index}
            className={`
              ${sizeClasses.dot} rounded-full transition-all duration-200
              ${index < config.value 
                ? `${config.progressColor} scale-110` 
                : 'bg-gray-300'
              }
            `}
          />
        ))}
      </div>
    </div>
  );

  /**
   * Render full variant
   */
  const renderFull = () => (
    <div 
      className={`
        difficulty-full flex items-center ${sizeClasses.gap}
        transition-all duration-200 ${className}
      `}
      title={showTooltip ? config.description : undefined}
    >
      <div className={`p-2 rounded-full ${config.bgColor}`}>
        <Icon className={`${sizeClasses.icon} ${config.textColor}`} />
      </div>
      
      {showLabel && (
        <div className="flex-1">
          <div className={`font-medium ${sizeClasses.text}`}>
            {config.label}
          </div>
          <div className="text-xs text-muted-foreground">
            Độ khó: {config.value}/{config.maxValue}
          </div>
        </div>
      )}
      
      {showProgress && (
        <div className="flex gap-1">
          {Array.from({ length: config.maxValue }, (_, index) => (
            <div
              key={index}
              className={`
                w-2 h-2 rounded-full transition-colors duration-200
                ${index < config.value ? config.progressColor : 'bg-gray-200'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );

  // ===== RENDER =====

  switch (variant) {
    case 'icon':
      return renderIcon();
    case 'bar':
      return renderBar();
    case 'dots':
      return renderDots();
    case 'full':
      return renderFull();
    case 'badge':
    default:
      return renderBadge();
  }
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact difficulty indicator
 */
export function DifficultyIndicatorCompact(props: Omit<DifficultyIndicatorProps, 'variant' | 'size'>) {
  return (
    <DifficultyIndicator
      {...props}
      variant="dots"
      size="sm"
      showLabel={false}
      className={`${props.className} compact-variant`}
    />
  );
}

/**
 * Difficulty icon only
 */
export function DifficultyIcon(props: Omit<DifficultyIndicatorProps, 'variant' | 'showLabel'>) {
  return (
    <DifficultyIndicator
      {...props}
      variant="icon"
      showLabel={false}
      className={`${props.className} icon-variant`}
    />
  );
}

/**
 * Difficulty progress bar
 */
export function DifficultyProgressBar(props: Omit<DifficultyIndicatorProps, 'variant'>) {
  return (
    <DifficultyIndicator
      {...props}
      variant="bar"
      className={`${props.className} bar-variant`}
    />
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get difficulty label
 */
export function getDifficultyLabel(difficulty: QuestionDifficulty): string {
  return getDifficultyConfig(difficulty).label;
}

/**
 * Get difficulty value
 */
export function getDifficultyValue(difficulty: QuestionDifficulty): number {
  return getDifficultyConfig(difficulty).value;
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: QuestionDifficulty): string {
  const config = getDifficultyConfig(difficulty);
  return `${config.bgColor} ${config.textColor} ${config.borderColor}`;
}

// ===== DEFAULT EXPORTS =====

export default DifficultyIndicator;
