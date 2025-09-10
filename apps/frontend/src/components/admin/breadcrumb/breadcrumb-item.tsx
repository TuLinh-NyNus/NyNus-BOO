/**
 * Breadcrumb Item Component
 * Individual breadcrumb item component
 */

'use client';

import React, { ReactNode } from 'react';
import { BreadcrumbItemProps, BreadcrumbItem } from '@/types/admin/breadcrumb';
import { cn } from '@/lib/utils';

/**
 * Breadcrumb Item Component Props
 * Extended props cho BreadcrumbItemComponent
 */
interface BreadcrumbItemComponentProps extends Omit<BreadcrumbItemProps, 'separator'> {
  children?: ReactNode;
}

/**
 * Breadcrumb Item Component
 * Component để render individual breadcrumb item
 */
export function BreadcrumbItemComponent({
  item,
  isLast = false,
  className,
  onClick,
  children
}: BreadcrumbItemComponentProps) {
  /**
   * Handle click event
   * Xử lý click event cho breadcrumb item
   */
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // Prevent click if item is disabled
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    // Call onClick callback if provided
    if (onClick) {
      onClick(item);
    }
  };

  /**
   * Get item classes
   * Lấy CSS classes cho breadcrumb item
   */
  const getItemClasses = () => {
    const baseClasses = 'transition-colors duration-150';
    
    const stateClasses = {
      active: 'text-foreground font-medium cursor-default',
      disabled: 'text-muted-foreground cursor-not-allowed',
      clickable: 'text-muted-foreground hover:text-foreground cursor-pointer',
      default: 'text-muted-foreground'
    };

    let stateClass = stateClasses.default;
    
    if (item.isActive || isLast) {
      stateClass = stateClasses.active;
    } else if (item.disabled) {
      stateClass = stateClasses.disabled;
    } else if (item.href || onClick) {
      stateClass = stateClasses.clickable;
    }

    return cn(baseClasses, stateClass, className);
  };

  /**
   * Render item content
   * Render nội dung của breadcrumb item
   */
  const renderItemContent = () => {
    // If children provided, use children
    if (children) {
      return children;
    }

    // Default content is just the label
    return item.label;
  };

  /**
   * Render item with appropriate wrapper
   * Render item với wrapper phù hợp (span hoặc button)
   */
  const renderItem = () => {
    const content = renderItemContent();
    const classes = getItemClasses();

    // If item is disabled or active, render as span
    if (item.disabled || item.isActive || isLast) {
      return (
        <span 
          className={classes}
          aria-current={item.isActive || isLast ? 'page' : undefined}
          title={item.label}
        >
          {content}
        </span>
      );
    }

    // If item has href but no onClick, it will be handled by parent Link component
    // So we render as span here
    if (item.href && !onClick) {
      return (
        <span className={classes} title={item.label}>
          {content}
        </span>
      );
    }

    // If item has onClick, render as button
    if (onClick) {
      return (
        <button
          type="button"
          className={classes}
          onClick={handleClick}
          title={item.label}
          aria-label={`Navigate to ${item.label}`}
        >
          {content}
        </button>
      );
    }

    // Default: render as span
    return (
      <span className={classes} title={item.label}>
        {content}
      </span>
    );
  };

  return renderItem();
}

/**
 * Simple Breadcrumb Item
 * Simplified version cho basic use cases
 */
export function SimpleBreadcrumbItem({
  label,
  isActive = false,
  disabled = false,
  className,
  onClick
}: {
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const item: BreadcrumbItem = {
    label,
    isActive,
    disabled
  };

  return (
    <BreadcrumbItemComponent
      item={item}
      isLast={isActive}
      className={className}
      onClick={onClick ? () => onClick() : undefined}
    />
  );
}

/**
 * Breadcrumb Item với Icon
 * Breadcrumb item với icon support
 */
export function IconBreadcrumbItem({
  item,
  icon,
  iconPosition = 'left',
  isLast = false,
  className,
  onClick
}: BreadcrumbItemComponentProps & {
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}) {
  const content = (
    <span className="flex items-center space-x-1">
      {icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{item.label}</span>
      {icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </span>
  );

  return (
    <BreadcrumbItemComponent
      item={item}
      isLast={isLast}
      className={className}
      onClick={onClick}
    >
      {content}
    </BreadcrumbItemComponent>
  );
}

/**
 * Truncated Breadcrumb Item
 * Breadcrumb item với text truncation
 */
export function TruncatedBreadcrumbItem({
  item,
  maxLength = 20,
  isLast = false,
  className,
  onClick
}: BreadcrumbItemComponentProps & {
  maxLength?: number;
}) {
  const truncatedLabel = item.label.length > maxLength 
    ? `${item.label.substring(0, maxLength - 3)}...`
    : item.label;

  const truncatedItem: BreadcrumbItem = {
    ...item,
    label: truncatedLabel
  };

  return (
    <BreadcrumbItemComponent
      item={truncatedItem}
      isLast={isLast}
      className={className}
      onClick={onClick}
    />
  );
}
