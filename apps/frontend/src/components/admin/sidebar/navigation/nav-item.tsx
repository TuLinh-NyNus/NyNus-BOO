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
      active: 'bg-blue-50 text-blue-700 border-r-2 border-blue-700',
      inactive: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
      disabled: 'text-gray-400 cursor-not-allowed'
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
          isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'
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
          'bg-gray-100 text-gray-600',
          isActive && 'bg-blue-100 text-blue-800'
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
          'text-gray-400 group-hover:text-gray-600'
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
          'absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'pointer-events-none z-50 whitespace-nowrap'
        )}
      >
        {item.name}
        {item.badge && (
          <span className="ml-1 px-1 bg-gray-700 rounded">
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
