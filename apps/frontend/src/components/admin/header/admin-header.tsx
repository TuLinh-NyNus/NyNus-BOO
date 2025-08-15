/**
 * Admin Header
 * Full implementation của AdminHeader với Search + User Menu + Notifications strategy
 */

'use client';

import React from 'react';
import { AdminHeaderProps } from '@/types/admin/header';
import { useAdminLayout } from '@/components/admin/providers/admin-layout-provider';
import { SearchBar } from './search/search-bar';
import { UserMenu } from './user/user-menu';
import { NotificationDropdown } from './notifications/notification-dropdown';
import { AdminBreadcrumb } from '@/components/admin/breadcrumb';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/admin/theme/theme-toggle';

/**
 * Admin Header Component
 * Component chính cho admin header với search, user menu, notifications
 */
export function AdminHeader({
  className,
  showBreadcrumb = true,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  variant = 'default'
}: AdminHeaderProps) {
  const { toggleSidebar, isMobile } = useAdminLayout();

  /**
   * Get header classes
   * Lấy CSS classes cho header với màu nền hài hòa với trang
   */
  const getHeaderClasses = () => {
    const baseClasses = [
      // Sử dụng màu nền giống với background của trang
      'bg-background',
      'border-b border-border',
      'backdrop-blur-sm',
      'transition-all duration-300 ease-in-out',
      'relative z-30'
    ];

    const variantClasses = {
      default: 'shadow-sm',
      minimal: 'shadow-none',
      elevated: 'shadow-md'
    };

    return cn(baseClasses, variantClasses[variant], className);
  };

  /**
   * Get header inline styles for clean appearance
   */
  const getHeaderStyles = (): React.CSSProperties => {
    return {
      // Sử dụng màu nền và text mặc định của theme
      backgroundColor: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      borderColor: 'hsl(var(--border))'
    };
  };

  /**
   * Render mobile menu button
   * Render button để toggle sidebar trên mobile
   */
  const renderMobileMenuButton = () => {
    if (!isMobile) return null;

    return (
      <button
        onClick={toggleSidebar}
        className={cn(
          'p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent',
          'transition-colors duration-150',
          'lg:hidden'
        )}
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    );
  };

  /**
   * Render breadcrumb section
   * Render breadcrumb navigation
   */
  const renderBreadcrumbSection = () => {
    if (!showBreadcrumb) return null;

    return (
      <div className="flex-1 min-w-0">
        <AdminBreadcrumb className="text-sm" />
      </div>
    );
  };

  /**
   * Render search section
   * Render search bar
   */
  const renderSearchSection = () => {
    if (!showSearch) return null;

    return (
      <div className="flex-1 max-w-lg mx-4">
        <SearchBar
          placeholder="Tìm kiếm người dùng, câu hỏi, sách..."
          className="w-full"
        />
      </div>
    );
  };

  /**
   * Render actions section
   * Render notifications và user menu
   */
  const renderActionsSection = () => {
    return (
      <div className="flex items-center space-x-2">
        {/* Theme Toggle */}
        <ThemeToggle variant="ghost" size="md" />

        {/* Notifications */}
        {showNotifications && (
          <NotificationDropdown />
        )}

        {/* User Menu */}
        {showUserMenu && (
          <UserMenu />
        )}
      </div>
    );
  };

  /**
   * Render header content
   * Render main header content
   */
  const renderHeaderContent = () => {
    // Layout varies based on what's shown
    if (showSearch && showBreadcrumb) {
      // Full layout: Mobile menu + Breadcrumb + Search + Actions
      return (
        <>
          {/* Left section */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {renderMobileMenuButton()}
            {renderBreadcrumbSection()}
          </div>

          {/* Center section */}
          {renderSearchSection()}

          {/* Right section */}
          {renderActionsSection()}
        </>
      );
    }

    if (showSearch && !showBreadcrumb) {
      // Search focused: Mobile menu + Search + Actions
      return (
        <>
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {renderMobileMenuButton()}
          </div>

          {/* Center section */}
          {renderSearchSection()}

          {/* Right section */}
          {renderActionsSection()}
        </>
      );
    }

    if (!showSearch && showBreadcrumb) {
      // Breadcrumb focused: Mobile menu + Breadcrumb + Actions
      return (
        <>
          {/* Left section */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {renderMobileMenuButton()}
            {renderBreadcrumbSection()}
          </div>

          {/* Right section */}
          {renderActionsSection()}
        </>
      );
    }

    // Minimal: Mobile menu + Actions only
    return (
      <>
        {/* Left section */}
        <div className="flex items-center space-x-4 flex-1">
          {renderMobileMenuButton()}
        </div>

        {/* Right section */}
        {renderActionsSection()}
      </>
    );
  };

  return (
    <header className={getHeaderClasses()} style={getHeaderStyles()}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {renderHeaderContent()}
        </div>
      </div>
    </header>
  );
}
