/**
 * MapCode Badge Component
 * Hiển thị QuestionCode dưới dạng badge với styling đẹp mắt
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { parseQuestionCode, getQuestionCodeLabel } from '@/lib/utils/question-code';
import { ParsedQuestionCode } from '@/lib/types/question';

// ===== INTERFACES =====

export interface MapCodeBadgeProps {
  /** QuestionCode string để hiển thị */
  code: string;
  /** Variant của badge */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  /** Size của badge */
  size?: 'sm' | 'md' | 'lg';
  /** Hiển thị full label hay chỉ code */
  showLabel?: boolean;
  /** Hiển thị format (ID5/ID6) */
  showFormat?: boolean;
  /** Custom className */
  className?: string;
  /** Click handler */
  onClick?: (code: string, parsed: ParsedQuestionCode) => void;
  /** Tooltip content override */
  title?: string;
}

// ===== SIZE CONFIGURATIONS =====

const SIZE_CONFIGS = {
  sm: {
    badge: 'text-xs px-2 py-1',
    format: 'text-[10px] px-1',
  },
  md: {
    badge: 'text-sm px-2.5 py-1.5',
    format: 'text-xs px-1.5',
  },
  lg: {
    badge: 'text-base px-3 py-2',
    format: 'text-sm px-2',
  },
} as const;

// ===== VARIANT CONFIGURATIONS =====

const VARIANT_CONFIGS = {
  default: {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    format: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  secondary: {
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
    format: 'bg-gray-50 text-gray-600 border-gray-100',
  },
  destructive: {
    badge: 'bg-red-100 text-red-800 border-red-200',
    format: 'bg-red-50 text-red-600 border-red-100',
  },
  outline: {
    badge: 'bg-transparent border-gray-300 text-gray-700',
    format: 'bg-gray-50 text-gray-600 border-gray-200',
  },
} as const;

// ===== MAIN COMPONENT =====

export function MapCodeBadge({
  code,
  variant = 'default',
  size = 'md',
  showLabel = false,
  showFormat = true,
  className,
  onClick,
  title,
}: MapCodeBadgeProps) {
  // Parse QuestionCode
  const parsed = parseQuestionCode(code);
  
  // Get configurations
  const sizeConfig = SIZE_CONFIGS[size];
  const variantConfig = VARIANT_CONFIGS[variant];
  
  // Generate display content
  const displayContent = showLabel ? getQuestionCodeLabel(code) : code;
  const tooltipContent = title || (parsed.isValid ? getQuestionCodeLabel(code) : parsed.error);
  
  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick(code, parsed);
    }
  };
  
  // Render invalid code
  if (!parsed.isValid) {
    return (
      <Badge
        variant="destructive"
        className={cn(
          sizeConfig.badge,
          'cursor-help',
          className
        )}
        title={`Lỗi: ${parsed.error}`}
      >
        {code}
      </Badge>
    );
  }
  
  return (
    <div className="inline-flex items-center gap-1">
      {/* Main Badge */}
      <Badge
        className={cn(
          sizeConfig.badge,
          variantConfig.badge,
          'border font-medium transition-all duration-200',
          onClick && 'cursor-pointer hover:scale-105',
          className
        )}
        title={tooltipContent}
        onClick={handleClick}
      >
        {displayContent}
      </Badge>
      
      {/* Format Badge */}
      {showFormat && (
        <Badge
          className={cn(
            sizeConfig.format,
            variantConfig.format,
            'border font-mono'
          )}
          title={`Format: ${parsed.format}`}
        >
          {parsed.format}
        </Badge>
      )}
    </div>
  );
}

// ===== COMPONENT VARIANTS =====

/**
 * Compact MapCode Badge - chỉ hiển thị code
 */
export function CompactMapCodeBadge({ code, ...props }: Omit<MapCodeBadgeProps, 'showLabel' | 'showFormat'>) {
  return (
    <MapCodeBadge
      code={code}
      showLabel={false}
      showFormat={false}
      size="sm"
      {...props}
    />
  );
}

/**
 * Full MapCode Badge - hiển thị full label và format
 */
export function FullMapCodeBadge({ code, ...props }: Omit<MapCodeBadgeProps, 'showLabel' | 'showFormat'>) {
  return (
    <MapCodeBadge
      code={code}
      showLabel={true}
      showFormat={true}
      {...props}
    />
  );
}

/**
 * Interactive MapCode Badge - có click handler mặc định
 */
export function InteractiveMapCodeBadge({ 
  code, 
  onCodeClick,
  ...props 
}: Omit<MapCodeBadgeProps, 'onClick'> & {
  onCodeClick?: (code: string, parsed: ParsedQuestionCode) => void;
}) {
  const handleClick = (code: string, parsed: ParsedQuestionCode) => {
    if (onCodeClick) {
      onCodeClick(code, parsed);
    } else {
      // Default behavior: copy to clipboard
      navigator.clipboard.writeText(code).then(() => {
        console.log('MapCode copied to clipboard:', code);
      });
    }
  };
  
  return (
    <MapCodeBadge
      code={code}
      onClick={handleClick}
      {...props}
    />
  );
}

// ===== EXPORTS =====

export default MapCodeBadge;
