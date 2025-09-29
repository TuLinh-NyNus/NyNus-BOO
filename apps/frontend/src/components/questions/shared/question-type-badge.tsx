/**
 * Question Type Badge Component
 * Reusable badge component cho question types theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React from "react";
import { Badge } from "@/components/ui";
import {
  CheckSquare,
  ToggleLeft,
  FileText,
  PenTool,
  Link2,
  HelpCircle
} from "lucide-react";

// Import types
import { QuestionType } from "@/types/question";

// ===== TYPES =====

export interface QuestionTypeBadgeProps {
  /** Question type */
  type: QuestionType;
  /** Display variant */
  variant?: 'badge' | 'icon' | 'full';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Show icon */
  showIcon?: boolean;
  /** Show label */
  showLabel?: boolean;
  /** Show tooltip */
  showTooltip?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ===== CONFIGURATION =====

/**
 * Question type configuration
 * Centralized configuration cho question type display
 */
const QUESTION_TYPE_CONFIG = {
  [QuestionType.MC]: {
    label: 'Trắc nghiệm',
    shortLabel: 'TN',
    icon: CheckSquare,
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    description: 'Câu hỏi trắc nghiệm với nhiều lựa chọn'
  },
  [QuestionType.MULTIPLE_CHOICE]: {
    label: 'Trắc nghiệm',
    shortLabel: 'TN',
    icon: CheckSquare,
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    description: 'Câu hỏi trắc nghiệm với nhiều lựa chọn'
  },
  [QuestionType.TF]: {
    label: 'Đúng/Sai',
    shortLabel: 'Đ/S',
    icon: ToggleLeft,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    description: 'Câu hỏi đúng hoặc sai'
  },
  [QuestionType.SA]: {
    label: 'Tự luận ngắn',
    shortLabel: 'TLN',
    icon: FileText,
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    description: 'Câu hỏi tự luận ngắn'
  },
  [QuestionType.ES]: {
    label: 'Tự luận',
    shortLabel: 'TL',
    icon: PenTool,
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    description: 'Câu hỏi tự luận dài'
  },
  [QuestionType.MA]: {
    label: 'Ghép đôi',
    shortLabel: 'GĐ',
    icon: Link2,
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    borderColor: 'border-pink-200',
    description: 'Câu hỏi ghép đôi'
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
    gap: 'gap-1'
  },
  md: {
    badge: 'text-sm px-3 py-1',
    icon: 'h-4 w-4',
    text: 'text-sm',
    gap: 'gap-2'
  },
  lg: {
    badge: 'text-base px-4 py-2',
    icon: 'h-5 w-5',
    text: 'text-base',
    gap: 'gap-2'
  }
} as const;

// ===== HELPER FUNCTIONS =====

/**
 * Get question type configuration
 */
function getTypeConfig(type: QuestionType) {
  return QUESTION_TYPE_CONFIG[type] || {
    label: 'Không xác định',
    shortLabel: '?',
    icon: HelpCircle,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    description: 'Loại câu hỏi không xác định'
  };
}

/**
 * Get size classes
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg') {
  return SIZE_CONFIG[size];
}

// ===== MAIN COMPONENT =====

export function QuestionTypeBadge({
  type,
  variant = 'badge',
  size = 'md',
  showIcon = true,
  showLabel = true,
  showTooltip = true,
  className = ""
}: QuestionTypeBadgeProps) {
  // ===== COMPUTED VALUES =====
  
  const config = getTypeConfig(type);
  const sizeClasses = getSizeClasses(size);
  const Icon = config.icon;

  // ===== VARIANT RENDERING =====

  /**
   * Render icon variant
   */
  const renderIcon = () => (
    <div 
      className={`
        question-type-icon inline-flex items-center justify-center
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
        question-type-badge
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border ${sizeClasses.badge} font-medium transition-all duration-200
        ${className}
      `}
      title={showTooltip ? `${config.label}: ${config.description}` : undefined}
    >
      <div className={`flex items-center ${sizeClasses.gap}`}>
        {showIcon && <Icon className={sizeClasses.icon} />}
        {showLabel && (
          <span>
            {size === 'sm' ? config.shortLabel : config.label}
          </span>
        )}
      </div>
    </Badge>
  );

  /**
   * Render full variant
   */
  const renderFull = () => (
    <div 
      className={`
        question-type-full flex items-center ${sizeClasses.gap}
        transition-all duration-200 ${className}
      `}
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
            {config.description}
          </div>
        </div>
      )}
    </div>
  );

  // ===== RENDER =====

  switch (variant) {
    case 'icon':
      return renderIcon();
    case 'full':
      return renderFull();
    case 'badge':
    default:
      return renderBadge();
  }
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact question type badge
 */
export function QuestionTypeBadgeCompact(props: Omit<QuestionTypeBadgeProps, 'variant' | 'size'>) {
  return (
    <QuestionTypeBadge
      {...props}
      variant="badge"
      size="sm"
      showLabel={false}
      className={`${props.className} compact-variant`}
    />
  );
}

/**
 * Question type icon only
 */
export function QuestionTypeIcon(props: Omit<QuestionTypeBadgeProps, 'variant' | 'showLabel'>) {
  return (
    <QuestionTypeBadge
      {...props}
      variant="icon"
      showLabel={false}
      className={`${props.className} icon-variant`}
    />
  );
}

/**
 * Full question type display
 */
export function QuestionTypeDisplay(props: Omit<QuestionTypeBadgeProps, 'variant'>) {
  return (
    <QuestionTypeBadge
      {...props}
      variant="full"
      className={`${props.className} full-variant`}
    />
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get question type label
 */
export function getQuestionTypeLabel(type: QuestionType): string {
  return getTypeConfig(type).label;
}

/**
 * Get question type short label
 */
export function getQuestionTypeShortLabel(type: QuestionType): string {
  return getTypeConfig(type).shortLabel;
}

/**
 * Get question type color
 */
export function getQuestionTypeColor(type: QuestionType): string {
  const config = getTypeConfig(type);
  return `${config.bgColor} ${config.textColor} ${config.borderColor}`;
}

// ===== DEFAULT EXPORTS =====

export default QuestionTypeBadge;
