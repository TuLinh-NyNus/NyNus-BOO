/**
 * Admin Logo Component
 * Logo component cho admin sidebar
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { AdminLogoProps } from '@/types/admin/sidebar';
import { cn } from '@/lib/utils';

/**
 * Admin Logo Component
 * Component để render logo trong admin sidebar
 */
export function AdminLogo({
  collapsed = false,
  showText = true,
  className,
  onClick
}: AdminLogoProps) {
  /**
   * Handle logo click
   * Xử lý khi click vào logo
   */
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  /**
   * Render logo icon
   * Render icon của logo
   */
  const renderLogoIcon = () => {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-gradient-to-br from-[#FDAD00] to-[#E09900] shadow-lg shadow-[#FDAD00]/25',
          collapsed ? 'w-8 h-8' : 'w-10 h-10'
        )}
      >
        <GraduationCap
          className={cn(
            'text-white',
            collapsed ? 'h-5 w-5' : 'h-6 w-6'
          )}
        />
      </div>
    );
  };

  /**
   * Render logo text
   * Render text của logo
   */
  const renderLogoText = () => {
    if (collapsed || !showText) return null;

    return (
      <div className="ml-3 flex flex-col">
        <span className="text-lg font-bold text-foreground">
          NyNus
        </span>
        <span className="text-xs text-muted-foreground -mt-1">
          Admin Panel
        </span>
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
          'absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border shadow-md',
          'opacity-0 group-hover:opacity-100',
          'pointer-events-none z-50 whitespace-nowrap'
        )}
      >
        NyNus Admin Panel
      </div>
    );
  };

  /**
   * Get logo container classes
   * Lấy CSS classes cho logo container
   */
  const getLogoClasses = () => {
    const baseClasses = [
      'group flex items-center',
      'rounded-lg p-2 relative'
    ];

    const layoutClasses = collapsed ? 'justify-center' : 'justify-start';

    return cn(baseClasses, layoutClasses, className);
  };

  /**
   * Render logo content
   * Render nội dung logo
   */
  const renderLogoContent = () => {
    return (
      <>
        {renderLogoIcon()}
        {renderLogoText()}
        {renderTooltip()}
      </>
    );
  };

  // If onClick provided, render as button
  if (onClick) {
    return (
      <button
        type="button"
        className={getLogoClasses()}
        onClick={handleClick}
        aria-label="NyNus Admin Panel"
      >
        {renderLogoContent()}
      </button>
    );
  }

  // Default: render as link to dashboard
  return (
    <Link
      href="/3141592654/admin"
      className={getLogoClasses()}
      onClick={handleClick}
    >
      {renderLogoContent()}
    </Link>
  );
}

/**
 * Simple Admin Logo
 * Simplified version cho basic use cases
 */
export function SimpleAdminLogo({
  collapsed = false,
  className
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <AdminLogo
      collapsed={collapsed}
      showText={!collapsed}
      className={className}
    />
  );
}

/**
 * Custom Admin Logo
 * Logo với custom icon và text
 */
export function CustomAdminLogo({
  icon,
  title = 'NyNus',
  subtitle = 'Admin Panel',
  collapsed = false,
  showText = true,
  className,
  onClick
}: {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  collapsed?: boolean;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const logoClasses = cn(
    'group flex items-center',
    'rounded-lg p-2 relative',
    collapsed ? 'justify-center' : 'justify-start',
    className
  );

  const renderCustomIcon = () => {
    if (icon) {
      return (
        <div
          className={cn(
            'flex items-center justify-center rounded-lg bg-primary text-primary-foreground',
            collapsed ? 'w-8 h-8' : 'w-10 h-10'
          )}
        >
          {icon}
        </div>
      );
    }

    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-gradient-to-br from-[#FDAD00] to-[#E09900] shadow-lg shadow-[#FDAD00]/25',
          collapsed ? 'w-8 h-8' : 'w-10 h-10'
        )}
      >
        <GraduationCap
          className={cn(
            'text-white',
            collapsed ? 'h-5 w-5' : 'h-6 w-6'
          )}
        />
      </div>
    );
  };

  const renderCustomText = () => {
    if (collapsed || !showText) return null;

    return (
      <div className="ml-3 flex flex-col">
        <span className="text-lg font-bold text-foreground">
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-muted-foreground -mt-1">
            {subtitle}
          </span>
        )}
      </div>
    );
  };

  const renderCustomTooltip = () => {
    if (!collapsed) return null;

    return (
      <div
        className={cn(
          'absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border shadow-md',
          'opacity-0 group-hover:opacity-100',
          'pointer-events-none z-50 whitespace-nowrap'
        )}
      >
        {title} {subtitle}
      </div>
    );
  };

  const content = (
    <>
      {renderCustomIcon()}
      {renderCustomText()}
      {renderCustomTooltip()}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={logoClasses}
        onClick={onClick}
        aria-label={`${title} ${subtitle}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href="/3141592654/admin"
      className={logoClasses}
    >
      {content}
    </Link>
  );
}

/**
 * Animated Admin Logo
 * Logo với animation effects - DISABLED
 */
export function AnimatedAdminLogo({
  collapsed = false,
  showText = true,
  className,
  onClick
}: AdminLogoProps) {
  return (
    <AdminLogo
      collapsed={collapsed}
      showText={showText}
      className={className}
      onClick={onClick}
    />
  );
}
