/**
 * Admin Breadcrumb
 * Full implementation của AdminBreadcrumb với path-based generation
 */

'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { AdminBreadcrumbProps, BreadcrumbItem } from '@/types/admin/breadcrumb';
import { generateBreadcrumbItems } from '@/lib/breadcrumb-labels';
import { BreadcrumbItemComponent } from './breadcrumb-item';
import { BreadcrumbSeparator } from './breadcrumb-separator';

/**
 * Admin Breadcrumb Component
 * Component chính cho admin breadcrumb với dynamic generation
 */
export function AdminBreadcrumb({
  className,
  items: customItems,
  showHome = true,
  homeIcon = 'Home',
  separator,
  maxItems = 5,
  showOverflow = true
}: AdminBreadcrumbProps) {
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
    return generateBreadcrumbItems(pathname, {
      showHome,
      homeIcon,
      maxItems
    });
  }, [pathname, customItems, showHome, homeIcon, maxItems]);

  /**
   * Handle overflow items
   * Xử lý khi có quá nhiều breadcrumb items
   */
  const displayItems = useMemo((): BreadcrumbItem[] => {
    if (!maxItems || breadcrumbItems.length <= maxItems) {
      return breadcrumbItems;
    }

    if (!showOverflow) {
      return breadcrumbItems.slice(-maxItems);
    }

    // Show first item (home), ellipsis, and last few items
    const firstItem = breadcrumbItems[0];
    const lastItems = breadcrumbItems.slice(-(maxItems - 2));

    return [
      firstItem,
      {
        label: '...',
        href: undefined,
        isActive: false,
        disabled: true,
        metadata: { isOverflow: true }
      },
      ...lastItems
    ];
  }, [breadcrumbItems, maxItems, showOverflow]);

  /**
   * Render separator
   * Render separator giữa các breadcrumb items
   */
  const renderSeparator = (index: number) => {
    if (separator) {
      return <BreadcrumbSeparator key={`sep-${index}`}>{separator}</BreadcrumbSeparator>;
    }

    return (
      <BreadcrumbSeparator key={`sep-${index}`}>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </BreadcrumbSeparator>
    );
  };

  /**
   * Render home icon
   * Render home icon cho first breadcrumb
   */
  const renderHomeIcon = () => {
    if (homeIcon === 'Home') {
      return <Home className="h-4 w-4" />;
    }

    // Add other icon mappings if needed
    return null;
  };

  // Don't render if no items
  if (!displayItems || displayItems.length === 0) {
    return null;
  }

  return (
    <nav
      className={`flex items-center space-x-1 text-sm ${className || ''}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isFirst = index === 0;
          const isOverflow = item.metadata?.isOverflow;

          return (
            <React.Fragment key={item.href || `item-${index}`}>
              <li className="flex items-center">
                {/* Breadcrumb Item */}
                <BreadcrumbItemComponent
                  item={item}
                  isLast={isLast}
                  className={`
                    ${isLast ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}
                    ${isOverflow ? 'cursor-default' : ''}
                    ${isFirst && showHome ? 'flex items-center space-x-1' : ''}
                  `}
                >
                  {/* Home icon for first item */}
                  {isFirst && showHome && renderHomeIcon()}

                  {/* Item content */}
                  {isOverflow ? (
                    <span className="px-1">{item.label}</span>
                  ) : item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="hover:underline transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </BreadcrumbItemComponent>
              </li>

              {/* Separator */}
              {!isLast && renderSeparator(index)}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
