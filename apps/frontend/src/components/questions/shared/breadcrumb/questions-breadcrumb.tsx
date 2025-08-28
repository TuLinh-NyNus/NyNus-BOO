/**
 * Questions Breadcrumb Component
 * Breadcrumb navigation cho questions section theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, Search, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  generateQuestionBreadcrumbs,
  BreadcrumbItem as BaseBreadcrumbItem
} from '@/lib/question-paths';

// ===== EXTENDED TYPES =====

/**
 * Extended Breadcrumb Item Interface
 * Extends base BreadcrumbItem với additional properties
 */
interface BreadcrumbItem extends BaseBreadcrumbItem {
  isEllipsis?: boolean;
}

// ===== TYPES =====

/**
 * Questions Breadcrumb Props Interface
 * Props cho QuestionsBreadcrumb component
 */
interface QuestionsBreadcrumbProps {
  className?: string;
  items?: BreadcrumbItem[];
  showHome?: boolean;
  showIcons?: boolean;
  maxItems?: number;
  separator?: 'chevron' | 'slash' | 'dot';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Breadcrumb Icon Mapping
 * Mapping icons cho different breadcrumb types
 */
const BREADCRUMB_ICONS = {
  'Trang chủ': Home,
  'Ngân hàng câu hỏi': BookOpen,
  'Duyệt câu hỏi': Search,
  'Tìm kiếm': Search,
  'Kết quả tìm kiếm': Search,
  default: FileText
} as const;

/**
 * Separator Components
 * Different separator styles
 */
const SEPARATORS = {
  chevron: ChevronRight,
  slash: () => <span className="text-muted-foreground">/</span>,
  dot: () => <span className="text-muted-foreground">•</span>
} as const;

// ===== MAIN COMPONENT =====

/**
 * Questions Breadcrumb Component
 * Breadcrumb navigation với automatic generation từ pathname
 * 
 * Features:
 * - Automatic breadcrumb generation từ URL
 * - Custom breadcrumb items support
 * - Responsive design với mobile truncation
 * - Icon support cho different page types
 * - Multiple separator styles
 * - Accessibility optimized
 */
export function QuestionsBreadcrumb({
  className,
  items: customItems,
  showHome = true,
  showIcons = true,
  maxItems = 5,
  separator = 'chevron',
  size = 'md'
}: QuestionsBreadcrumbProps) {
  const pathname = usePathname();

  /**
   * Generate breadcrumb items
   * Generate breadcrumb items từ pathname hoặc sử dụng custom items
   */
  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    // Use custom items if provided
    if (customItems && customItems.length > 0) {
      return customItems;
    }

    // Generate from pathname
    const items = generateQuestionBreadcrumbs(pathname);
    
    // Filter home item if disabled
    if (!showHome) {
      return items.filter(item => item.href !== '/');
    }

    return items;
  }, [pathname, customItems, showHome]);

  /**
   * Truncate items if exceeds maxItems
   * Handle breadcrumb overflow với ellipsis
   */
  const displayItems = useMemo((): BreadcrumbItem[] => {
    if (breadcrumbItems.length <= maxItems) {
      return breadcrumbItems;
    }

    // Keep first item (home), last item (current), và middle items
    const firstItem = breadcrumbItems[0];
    const lastItem = breadcrumbItems[breadcrumbItems.length - 1];
    const middleItems = breadcrumbItems.slice(1, -1);
    
    // Calculate how many middle items we can show
    const availableSlots = maxItems - 2; // Reserve slots for first và last
    
    if (middleItems.length <= availableSlots) {
      return breadcrumbItems;
    }

    // Show ellipsis
    const visibleMiddleItems = middleItems.slice(-availableSlots + 1);
    
    return [
      firstItem,
      { label: '...', href: '', isEllipsis: true },
      ...visibleMiddleItems,
      lastItem
    ];
  }, [breadcrumbItems, maxItems]);

  /**
   * Get breadcrumb item icon
   * Lấy icon cho breadcrumb item
   */
  const getItemIcon = (item: BreadcrumbItem) => {
    if (!showIcons) return null;

    const IconComponent = BREADCRUMB_ICONS[item.label as keyof typeof BREADCRUMB_ICONS] || BREADCRUMB_ICONS.default;
    return <IconComponent className="h-4 w-4" />;
  };

  /**
   * Get separator component
   * Lấy separator component
   */
  const getSeparator = () => {
    const SeparatorComponent = SEPARATORS[separator];
    return <SeparatorComponent className="h-4 w-4 text-muted-foreground" />;
  };

  /**
   * Get breadcrumb classes
   * Generate CSS classes cho breadcrumb
   */
  const getBreadcrumbClasses = () => {
    const baseClasses = [
      'flex items-center space-x-1',
      'text-sm',
      'overflow-hidden'
    ];

    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm', 
      lg: 'text-base'
    };

    return cn(baseClasses, sizeClasses[size], className);
  };

  /**
   * Get item classes
   * Generate CSS classes cho breadcrumb item
   */
  const getItemClasses = (item: BreadcrumbItem, isLast: boolean) => {
    const baseClasses = [
      'flex items-center space-x-1',
      'transition-colors duration-200'
    ];

    if (item.isEllipsis) {
      return cn(baseClasses, 'text-muted-foreground cursor-default');
    }

    if (isLast || item.isActive) {
      return cn(baseClasses, 'text-foreground font-medium cursor-default');
    }

    return cn(
      baseClasses,
      'text-muted-foreground hover:text-foreground',
      'hover:underline cursor-pointer'
    );
  };

  // Don't render if no items
  if (displayItems.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className={getBreadcrumbClasses()}
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.isEllipsis;

          return (
            <li key={`${item.href}-${index}`} className="flex items-center">
              {/* Separator (except for first item) */}
              {index > 0 && (
                <span className="mx-2" aria-hidden="true">
                  {getSeparator()}
                </span>
              )}

              {/* Breadcrumb Item */}
              {isEllipsis ? (
                <span className={getItemClasses(item, isLast)}>
                  {item.label}
                </span>
              ) : isLast || item.isActive ? (
                <span 
                  className={getItemClasses(item, isLast)}
                  aria-current="page"
                >
                  {getItemIcon(item)}
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">
                    {item.label}
                  </span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={getItemClasses(item, isLast)}
                  title={item.label}
                >
                  {getItemIcon(item)}
                  <span className="truncate max-w-[100px] sm:max-w-[150px]">
                    {item.label}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ===== SPECIALIZED BREADCRUMBS =====

/**
 * Compact Questions Breadcrumb
 * Compact version cho mobile hoặc limited space
 */
export function CompactQuestionsBreadcrumb(props: QuestionsBreadcrumbProps) {
  return (
    <QuestionsBreadcrumb
      {...props}
      size="sm"
      maxItems={3}
      showIcons={false}
      separator="slash"
      className={cn('sm:hidden', props.className)}
    />
  );
}

/**
 * Full Questions Breadcrumb
 * Full version cho desktop
 */
export function FullQuestionsBreadcrumb(props: QuestionsBreadcrumbProps) {
  return (
    <QuestionsBreadcrumb
      {...props}
      size="md"
      maxItems={6}
      showIcons={true}
      separator="chevron"
      className={cn('hidden sm:flex', props.className)}
    />
  );
}

// ===== BREADCRUMB UTILITIES =====

/**
 * Questions Breadcrumb Configuration
 * Configuration object cho breadcrumb behavior
 */
export const QUESTIONS_BREADCRUMB_CONFIG = {
  icons: BREADCRUMB_ICONS,
  separators: SEPARATORS,
  
  defaults: {
    showHome: true,
    showIcons: true,
    maxItems: 5,
    separator: 'chevron' as const,
    size: 'md' as const
  },
  
  responsive: {
    mobile: {
      maxItems: 3,
      showIcons: false,
      separator: 'slash' as const
    },
    desktop: {
      maxItems: 6,
      showIcons: true,
      separator: 'chevron' as const
    }
  }
} as const;

// ===== TYPE EXPORTS =====

/**
 * Breadcrumb Separator Type
 * Union type của separator options
 */
export type BreadcrumbSeparator = keyof typeof SEPARATORS;

/**
 * Breadcrumb Size Type
 * Union type của size options
 */
export type BreadcrumbSize = 'sm' | 'md' | 'lg';
