/**
 * Admin Sidebar
 * Full implementation của AdminSidebar với Static Navigation strategy
 */

'use client';

import React from 'react';
import { AdminSidebarProps } from '@/types/admin/sidebar';
import { useAdminLayout } from '@/components/admin/providers/admin-layout-provider';
import { useAdminNavigation, useBottomNavigation } from '@/hooks/admin/use-admin-navigation';
import { NAVIGATION_SECTIONS } from '@/lib/admin-navigation';
import { AdminLogo } from './logo/admin-logo';
import { NavSection } from './navigation/nav-section';
import { NavItem } from './navigation/nav-item';
import { cn } from '@/lib/utils';

/**
 * Admin Sidebar Component
 * Component chính cho admin sidebar với static navigation
 */
export function AdminSidebar({
  className,
  collapsed: controlledCollapsed,
  onToggleCollapse,
  showLogo = true,
  showCollapseButton = true
}: AdminSidebarProps) {
  const { isSidebarCollapsed, toggleSidebar, isMobile } = useAdminLayout();
  const { state: navigationState } = useAdminNavigation(NAVIGATION_SECTIONS);
  const { state: bottomNavState, actions: bottomNavActions } = useBottomNavigation();

  // Use controlled collapsed state if provided, otherwise use context
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : isSidebarCollapsed;

  // Use provided toggle function or context toggle
  const handleToggle = onToggleCollapse || toggleSidebar;

  /**
   * Get sidebar classes
   * Lấy CSS classes cho sidebar
   */
  const getSidebarClasses = () => {
    const baseClasses = [
      'theme-bg theme-fg theme-border border-r flex flex-col transition-all duration-300 ease-in-out',
      'min-h-screen relative'
    ];

    const widthClasses = isCollapsed ? 'w-16' : 'w-64';

    const responsiveClasses = [
      // Mobile: overlay sidebar
      'fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto',
      // Hide on mobile when collapsed, show on desktop
      isCollapsed && isMobile ? 'hidden' : 'block'
    ];

    return cn(baseClasses, widthClasses, responsiveClasses, className);
  };



  /**
   * Render collapse button
   * Render button để toggle sidebar
   */
  const renderCollapseButton = () => {
    if (!showCollapseButton) return null;

    return (
      <button
        onClick={handleToggle}
        className={cn(
          'absolute -right-3 top-6 z-10',
          'w-6 h-6 bg-background border border-border rounded-full',
          'flex items-center justify-center',
          'hover:bg-muted transition-colors duration-150',
          'shadow-sm'
        )}
        aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
      >
        <svg
          className={cn(
            'w-3 h-3 text-muted-foreground transition-transform duration-150',
            isCollapsed ? 'rotate-180' : ''
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    );
  };

  /**
   * Render navigation sections
   * Render các navigation sections
   */
  const renderNavigationSections = () => {
    return NAVIGATION_SECTIONS.map((section) => (
      <NavSection
        key={section.id}
        section={section}
        collapsed={isCollapsed}
        activeItemId={navigationState.activeItemId || undefined}
        onItemClick={handleItemClick}
        className="mb-6"
      />
    ));
  };

  /**
   * Render bottom navigation
   * Render navigation items ở bottom
   */
  const renderBottomNavigation = () => {
    if (!bottomNavState.items || bottomNavState.items.length === 0) {
      return null;
    }

    return (
      <div className="border-t border-gray-200 pt-4">
        {bottomNavState.items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={bottomNavActions.isItemActive(item)}
            collapsed={isCollapsed}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>
    );
  };

  // Remove old active detection methods - now using hooks

  /**
   * Handle item click
   * Xử lý khi click vào navigation item
   */
  const handleItemClick = (item: { name: string }) => {
    // On mobile, collapse sidebar after navigation
    if (isMobile && !isCollapsed) {
      handleToggle();
    }

    // Additional click handling can be added here
    console.log('Navigation item clicked:', item.name);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={getSidebarClasses()}>
        {/* Collapse button */}
        {renderCollapseButton()}

        {/* Logo section */}
        {showLogo && (
          <div className="p-6 border-b border-border">
            <AdminLogo collapsed={isCollapsed} />
          </div>
        )}

        {/* Navigation content */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {/* Main navigation sections */}
            {renderNavigationSections()}
          </nav>
        </div>

        {/* Bottom navigation */}
        <div className="p-4">
          {renderBottomNavigation()}
        </div>
      </aside>
    </>
  );
}
