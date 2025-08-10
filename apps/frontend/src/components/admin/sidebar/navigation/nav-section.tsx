/**
 * Navigation Section Component
 * Navigation section component cho admin sidebar
 */

'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavSectionProps, NavigationItem } from '@/types/admin/sidebar';
import { NavItem } from './nav-item';
import { cn } from '@/lib/utils';

/**
 * Navigation Section Component
 * Component để render navigation section với title và items
 */
export function NavSection({
  section,
  collapsed = false,
  activeItemId,
  onItemClick,
  className
}: NavSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(!section.defaultCollapsed);
  const hasTitle = !!section.title;
  const isCollapsible = section.collapsible !== false; // Default to true

  /**
   * Handle section toggle
   * Xử lý toggle section expansion
   */
  const handleToggle = () => {
    if (isCollapsible && !collapsed) {
      setIsExpanded(!isExpanded);
    }
  };

  /**
   * Check if item is active
   * Kiểm tra xem item có active không
   */
  const isItemActive = (item: NavigationItem): boolean => {
    return item.id === activeItemId;
  };

  /**
   * Handle item click
   * Xử lý khi click vào navigation item
   */
  const handleItemClick = (item: NavigationItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  /**
   * Render section title
   * Render title của navigation section
   */
  const renderSectionTitle = () => {
    if (!hasTitle || collapsed) return null;

    // For collapsible sections, render as a single clickable div to avoid nested buttons
    if (isCollapsible) {
      return (
        <div
          className="flex items-center w-full px-3 py-2 cursor-pointer hover:bg-muted rounded-md transition-colors duration-150"
          onClick={handleToggle}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Thu gọn ${section.title}` : `Mở rộng ${section.title}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
          <span className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {section.title}
          </span>

          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-2" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground ml-2" />
          )}
        </div>
      );
    }

    // For non-collapsible sections, render as simple div
    return (
      <div className="flex items-center px-3 py-2">
        <span className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {section.title}
        </span>
      </div>
    );
  };

  /**
   * Render section items
   * Render navigation items trong section
   */
  const renderSectionItems = () => {
    // Don't render items if section is collapsed (and has title)
    if (hasTitle && !isExpanded && !collapsed) {
      return null;
    }

    return (
      <div className={cn('space-y-1', hasTitle && !collapsed && 'mt-2')}>
        {section.items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={isItemActive(item)}
            collapsed={collapsed}
            onClick={handleItemClick}
          />
        ))}
      </div>
    );
  };

  /**
   * Render section divider
   * Render divider giữa các sections
   */
  const renderSectionDivider = () => {
    if (!hasTitle || collapsed) return null;

    return <div className="border-t border-gray-200 my-4" />;
  };

  // Don't render anything if no items
  if (!section.items || section.items.length === 0) {
    return null;
  }

  return (
    <div className={cn('navigation-section', className)}>
      {/* Section divider (before title) */}
      {hasTitle && renderSectionDivider()}
      
      {/* Section title */}
      {renderSectionTitle()}
      
      {/* Section items */}
      {renderSectionItems()}
    </div>
  );
}

/**
 * Compact Nav Section
 * Compact version cho collapsed sidebar
 */
export function CompactNavSection({
  section,
  activeItemId,
  onItemClick,
  className
}: Omit<NavSectionProps, 'collapsed'>) {
  return (
    <NavSection
      section={section}
      collapsed={true}
      activeItemId={activeItemId}
      onItemClick={onItemClick}
      className={className}
    />
  );
}

/**
 * Expandable Nav Section
 * Section với expand/collapse functionality
 */
export function ExpandableNavSection({
  section,
  defaultExpanded = true,
  activeItemId,
  onItemClick,
  className
}: NavSectionProps & {
  defaultExpanded?: boolean;
}) {
  const expandableSection = {
    ...section,
    collapsible: true,
    defaultCollapsed: !defaultExpanded
  };

  return (
    <NavSection
      section={expandableSection}
      activeItemId={activeItemId}
      onItemClick={onItemClick}
      className={className}
    />
  );
}

/**
 * Simple Nav Section
 * Simplified version cho basic use cases
 */
export function SimpleNavSection({
  title,
  items,
  collapsed = false,
  activeItemId,
  onItemClick,
  className
}: {
  title?: string;
  items: NavigationItem[];
  collapsed?: boolean;
  activeItemId?: string | null;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
}) {
  const section = {
    id: title?.toLowerCase().replace(/\s+/g, '-') || 'section',
    title,
    items
  };

  return (
    <NavSection
      section={section}
      collapsed={collapsed}
      activeItemId={activeItemId || undefined}
      onItemClick={onItemClick}
      className={className}
    />
  );
}

/**
 * Nav Section với Custom Styling
 * Section với custom styling options
 */
export function StyledNavSection({
  section,
  collapsed = false,
  activeItemId,
  onItemClick,
  variant = 'default',
  size = 'md',
  className
}: NavSectionProps & {
  variant?: 'default' | 'compact' | 'spacious';
  size?: 'sm' | 'md' | 'lg';
}) {
  const variantClasses = {
    default: 'space-y-1',
    compact: 'space-y-0.5',
    spacious: 'space-y-2'
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn(variantClasses[variant], sizeClasses[size])}>
      <NavSection
        section={section}
        collapsed={collapsed}
        activeItemId={activeItemId}
        onItemClick={onItemClick}
        className={className}
      />
    </div>
  );
}
