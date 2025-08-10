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
   * Lấy CSS classes cho header với vibrant gradients inspired by Hero
   */
  const getHeaderClasses = () => {
    const baseClasses = [
      // Vibrant gradient background inspired by Hero component (#4417DB, #E57885, #F18582)
      'bg-gradient-to-r from-[#4417DB]/15 via-[#E57885]/10 to-[#F18582]/15',
      'dark:from-[#4417DB]/25 dark:via-[#E57885]/15 dark:to-[#F18582]/25',
      'border-b border-[#4417DB]/30 dark:border-[#4417DB]/40',
      'backdrop-blur-sm',
      'transition-all duration-300 ease-in-out',
      'relative z-30'
    ];

    const variantClasses = {
      default: 'shadow-lg shadow-[#4417DB]/15 dark:shadow-[#4417DB]/25',
      minimal: 'shadow-sm',
      elevated: 'shadow-xl shadow-[#4417DB]/20 dark:shadow-[#4417DB]/30'
    };

    return cn(baseClasses, variantClasses[variant], className);
  };

  /**
   * Get header inline styles for enhanced visual appeal
   */
  const getHeaderStyles = (): React.CSSProperties => {
    return {
      // Add vibrant gradient overlay matching Hero component
      background: `
        linear-gradient(90deg,
          rgba(68, 23, 219, 0.15) 0%,
          rgba(229, 120, 133, 0.10) 50%,
          rgba(241, 133, 130, 0.15) 100%
        ),
        var(--color-background)
      `,
      color: 'var(--color-foreground)',
      borderColor: 'rgba(68, 23, 219, 0.3)'
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
          'p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100',
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
      {/* Gradient overlay for enhanced visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 dark:from-white/10 dark:via-white/15 dark:to-white/10 pointer-events-none" />

      <div className="px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16">
          {renderHeaderContent()}
        </div>
      </div>
    </header>
  );
}
