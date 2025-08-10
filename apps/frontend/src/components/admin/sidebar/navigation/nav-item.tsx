/**
 * Navigation Item Component
 * Individual navigation item component cho admin sidebar
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavItemProps, NavigationItem } from '@/types/admin/sidebar';
import { getIconComponent } from '@/lib/admin-navigation';
import { cn } from '@/lib/utils';

/**
 * Navigation Item Component
 * Component để render individual navigation item
 */
export function NavItem({
  item,
  isActive = false,
  collapsed = false,
  level = 0,
  onClick,
  className
}: NavItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const IconComponent = getIconComponent(item.icon);

  /**
   * Handle click event
   * Xử lý click event cho navigation item
   */
  const handleClick = (event: React.MouseEvent) => {
    // If item has children, toggle expansion
    if (hasChildren) {
      event.preventDefault();
      setIsExpanded(!isExpanded);
    }

    // Call onClick callback if provided
    if (onClick) {
      onClick(item);
    }
  };

  /**
   * Get item classes
   * Lấy CSS classes cho navigation item
   */
  const getItemClasses = () => {
    const baseClasses = [
      'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
      'transition-all duration-150 ease-in-out',
      'relative'
    ];

    const stateClasses = {
      active: 'bg-primary/10 text-primary border-r-2 border-primary',
      inactive: 'text-foreground hover:bg-muted hover:text-foreground',
      disabled: 'text-muted-foreground cursor-not-allowed'
    };

    const levelClasses = level > 0 ? `ml-${level * 4}` : '';

    let stateClass = stateClasses.inactive;
    if (isActive) {
      stateClass = stateClasses.active;
    } else if (item.isDisabled) {
      stateClass = stateClasses.disabled;
    }

    return cn(baseClasses, stateClass, levelClasses, className);
  };

  /**
   * Render item icon
   * Render icon cho navigation item
   */
  const renderIcon = () => {
    if (!IconComponent) return null;

    return (
      <IconComponent
        className={cn(
          'flex-shrink-0 h-5 w-5',
          collapsed ? 'mx-auto' : 'mr-3',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}
        aria-hidden="true"
      />
    );
  };

  /**
   * Render item badge
   * Render badge cho navigation item
   */
  const renderBadge = () => {
    if (!item.badge || collapsed) return null;

    const badgeValue = typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge;

    return (
      <span
        className={cn(
          'ml-auto inline-block py-0.5 px-2 text-xs rounded-full',
          'bg-muted text-muted-foreground',
          isActive && 'bg-primary/20 text-primary'
        )}
      >
        {badgeValue}
      </span>
    );
  };

  /**
   * Render expand icon
   * Render icon để expand/collapse children
   */
  const renderExpandIcon = () => {
    if (!hasChildren || collapsed) return null;

    const ExpandIcon = isExpanded ? ChevronDown : ChevronRight;

    return (
      <ExpandIcon
        className={cn(
          'ml-auto h-4 w-4 transition-transform duration-150',
          'text-muted-foreground group-hover:text-foreground'
        )}
        aria-hidden="true"
      />
    );
  };

  /**
   * Render item content
   * Render nội dung của navigation item
   */
  const renderItemContent = () => {
    return (
      <>
        {renderIcon()}
        
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.name}</span>
            {renderBadge()}
            {renderExpandIcon()}
          </>
        )}
      </>
    );
  };

  /**
   * Render children items
   * Render children navigation items
   */
  const renderChildren = () => {
    if (!hasChildren || !isExpanded || collapsed) return null;

    return (
      <div className="mt-1 space-y-1">
        {item.children!.map((childItem) => (
          <NavItem
            key={childItem.id}
            item={childItem}
            isActive={false} // Will be determined by parent
            collapsed={false}
            level={level + 1}
            onClick={onClick}
          />
        ))}
      </div>
    );
  };

  /**
   * Render tooltip for collapsed state
   * Render tooltip khi sidebar collapsed
   */
  const renderTooltip = () => {
    if (!collapsed) return null;

    return (
      <div
        className={cn(
          'absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'pointer-events-none z-50 whitespace-nowrap shadow-md'
        )}
      >
        {item.name}
        {item.badge && (
          <span className="ml-1 px-1 bg-muted text-muted-foreground rounded">
            {item.badge}
          </span>
        )}
      </div>
    );
  };

  /**
   * Render navigation item
   * Main render method
   */
  const renderNavItem = () => {
    const itemClasses = getItemClasses();
    const content = renderItemContent();

    // If item is disabled, render as span
    if (item.isDisabled) {
      return (
        <span className={itemClasses}>
          {content}
          {renderTooltip()}
        </span>
      );
    }

    // If item has children or no href, render as button
    if (hasChildren || !item.href) {
      return (
        <button
          type="button"
          className={cn(itemClasses, 'w-full text-left')}
          onClick={handleClick}
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {content}
          {renderTooltip()}
        </button>
      );
    }

    // Default: render as link
    return (
      <Link
        href={item.href}
        className={itemClasses}
        onClick={handleClick}
      >
        {content}
        {renderTooltip()}
      </Link>
    );
  };

  return (
    <div>
      {renderNavItem()}
      {renderChildren()}
    </div>
  );
}

/**
 * Simple Nav Item
 * Simplified version cho basic use cases
 */
export function SimpleNavItem({
  name,
  href,
  icon,
  isActive = false,
  collapsed = false,
  badge,
  onClick
}: {
  name: string;
  href?: string;
  icon: string;
  isActive?: boolean;
  collapsed?: boolean;
  badge?: string | number;
  onClick?: () => void;
}) {
  const item: NavigationItem = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    href: href || '#',
    icon,
    badge
  };

  return (
    <NavItem
      item={item}
      isActive={isActive}
      collapsed={collapsed}
      onClick={onClick ? () => onClick() : undefined}
    />
  );
}
