/**
 * Admin Sidebar
 * Full implementation của AdminSidebar với Static Navigation strategy
 *
 * FIX HYDRATION ERROR:
 * - Thêm suppressHydrationWarning cho các container elements
 * - Ngăn chặn hydration mismatch do browser extensions (Bitwarden, etc.)
 * - Browser extensions có thể inject attributes như bis_skin_checked="1"
 */

'use client';

import React from 'react';
import { AdminSidebarProps, NavigationSection, NavigationItem } from '@/types/admin/sidebar';
import { useAdminLayout } from '@/components/admin/providers/admin-layout-provider';
import { useAdminNavigation, useBottomNavigation } from '@/hooks/admin/use-admin-navigation';
import { NAVIGATION_SECTIONS } from '@/lib/admin-navigation';
import { useAdminSidebarBadges } from '@/hooks/admin/use-admin-sidebar-badges';
import { AdminLogo } from './logo/admin-logo';
import { NavSection } from './navigation/nav-section';
import { NavItem } from './navigation/nav-item';
import { cn } from '@/lib/utils';
import { HydrationSafe } from '@/components/common/hydration-safe';

type SidebarBadgeCounts = {
  users?: number;
  questions?: number;
  books?: number;
  sessions?: number;
  notifications?: number;
};

const compactNumberFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1
});

function formatBadgeValue(value?: number) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (value < 1000) {
    return value.toString();
  }

  return compactNumberFormatter.format(value).toLowerCase();
}

function applyBadgesToSections(
  sections: NavigationSection[],
  counts: SidebarBadgeCounts,
  loading: boolean
): NavigationSection[] {
  const applyToItem = (item: NavigationItem): NavigationItem => {
    const next: NavigationItem = {
      ...item,
      ...(item.children ? { children: item.children.map(applyToItem) } : {})
    };

    let badgeValue: string | number | undefined;

    switch (item.id) {
      case 'users':
        badgeValue = counts.users !== undefined ? formatBadgeValue(counts.users) : loading ? '...' : undefined;
        break;
      case 'questions':
        badgeValue = counts.questions !== undefined ? formatBadgeValue(counts.questions) : loading ? '...' : undefined;
        break;
      case 'books':
        badgeValue = counts.books !== undefined ? formatBadgeValue(counts.books) : loading ? '...' : undefined;
        break;
      case 'sessions':
        badgeValue = counts.sessions !== undefined ? formatBadgeValue(counts.sessions) : loading ? '...' : undefined;
        break;
      case 'notifications':
        badgeValue = counts.notifications !== undefined ? formatBadgeValue(counts.notifications) : loading ? '...' : undefined;
        break;
      default:
        badgeValue = item.badge;
    }

    if (badgeValue !== undefined) {
      next.badge = badgeValue;
    } else {
      delete next.badge;
    }

    return next;
  };

  return sections.map((section) => ({
    ...section,
    items: section.items.map(applyToItem)
  }));
}

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
  const { counts, loading: badgeLoading, error: badgeError } = useAdminSidebarBadges();
  const navigationSections = React.useMemo(
    () => applyBadgesToSections(NAVIGATION_SECTIONS, counts, badgeLoading),
    [counts, badgeLoading]
  );
  const { state: navigationState } = useAdminNavigation(navigationSections);
  const { state: bottomNavState, actions: bottomNavActions } = useBottomNavigation();

  React.useEffect(() => {
    if (badgeError) {
      // Only log non-rate-limit errors as errors
      const isRateLimit = badgeError.toLowerCase().includes('rate limit');
      if (isRateLimit) {
        console.warn('[AdminSidebar] Some badge data temporarily unavailable due to rate limit');
      } else {
        console.error('[AdminSidebar] Failed to load sidebar badges', badgeError);
      }
    }
  }, [badgeError]);

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
      'h-full relative'
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
    return navigationSections.map((section) => (
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
        <div className="border-t border-border pt-4">
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
      <aside
        className={getSidebarClasses()}
        suppressHydrationWarning={true}
      >
        {/* Collapse button */}
        {renderCollapseButton()}

        {/* Logo section */}
        {showLogo && (
          <div
            className="p-6 border-b border-border"
            suppressHydrationWarning={true}
          >
            <AdminLogo collapsed={isCollapsed} />
          </div>
        )}

        {/* Navigation content */}
        <HydrationSafe className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {/* Main navigation sections */}
            {renderNavigationSections()}
          </nav>
        </HydrationSafe>

        {/* Bottom navigation */}
        <div
          className="p-4"
          suppressHydrationWarning={true}
        >
          {renderBottomNavigation()}
        </div>
      </aside>
    </>
  );
}
