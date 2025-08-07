/**
 * Use Admin Navigation Hook
 * Hook cho admin navigation state management và active detection
 */

'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { NavigationItem, NavigationSection } from '@/types/admin/sidebar';
import { NAVIGATION_SECTIONS, BOTTOM_NAVIGATION, NavigationUtils } from '@/lib/admin-navigation';

/**
 * Navigation State Interface
 * Interface cho navigation state
 */
interface NavigationState {
  currentPath: string;
  activeItem: NavigationItem | null;
  activeItemId: string | null;
  activeSection: NavigationSection | null;
  activeSectionId: string | null;
  breadcrumbItems: NavigationItem[];
}

/**
 * Navigation Actions Interface
 * Interface cho navigation actions
 */
interface NavigationActions {
  isItemActive: (item: NavigationItem) => boolean;
  isSectionActive: (section: NavigationSection) => boolean;
  getItemById: (itemId: string) => NavigationItem | null;
  getSectionById: (sectionId: string) => NavigationSection | null;
  getAllItems: () => NavigationItem[];
  getActiveParentItems: () => NavigationItem[];
}

/**
 * Use Admin Navigation Return Type
 * Return type cho useAdminNavigation hook
 */
interface UseAdminNavigationReturn {
  state: NavigationState;
  actions: NavigationActions;
}

/**
 * Use Admin Navigation Hook
 * Main hook cho admin navigation management
 */
export function useAdminNavigation(
  sections: NavigationSection[] = NAVIGATION_SECTIONS
): UseAdminNavigationReturn {
  const pathname = usePathname();

  /**
   * Calculate navigation state
   * Tính toán navigation state từ current pathname
   */
  const navigationState = useMemo((): NavigationState => {
    // Get active item
    const activeItem = NavigationUtils.getActiveItem(pathname, sections);
    
    // Get active section
    const activeSection = sections.find(section =>
      section.items.some(item => 
        NavigationUtils.isPathActive(pathname, item.href) ||
        (item.children && item.children.some(child => 
          NavigationUtils.isPathActive(pathname, child.href)
        ))
      )
    ) || null;

    // Generate breadcrumb items
    const breadcrumbItems = generateBreadcrumbItems(pathname, sections);

    return {
      currentPath: pathname,
      activeItem,
      activeItemId: activeItem?.id || null,
      activeSection,
      activeSectionId: activeSection?.id || null,
      breadcrumbItems
    };
  }, [pathname, sections]);

  /**
   * Navigation actions
   * Actions cho navigation management
   */
  const navigationActions = useMemo((): NavigationActions => ({
    /**
     * Check if item is active
     * Kiểm tra xem item có active không
     */
    isItemActive: (item: NavigationItem): boolean => {
      return NavigationUtils.isPathActive(pathname, item.href);
    },

    /**
     * Check if section is active
     * Kiểm tra xem section có active không
     */
    isSectionActive: (section: NavigationSection): boolean => {
      return section.items.some(item => 
        NavigationUtils.isPathActive(pathname, item.href) ||
        (item.children && item.children.some(child => 
          NavigationUtils.isPathActive(pathname, child.href)
        ))
      );
    },

    /**
     * Get item by ID
     * Lấy navigation item theo ID
     */
    getItemById: (itemId: string): NavigationItem | null => {
      return NavigationUtils.findItemById(itemId, sections);
    },

    /**
     * Get section by ID
     * Lấy navigation section theo ID
     */
    getSectionById: (sectionId: string): NavigationSection | null => {
      return sections.find(section => section.id === sectionId) || null;
    },

    /**
     * Get all items
     * Lấy tất cả navigation items
     */
    getAllItems: (): NavigationItem[] => {
      return NavigationUtils.getAllItems(sections);
    },

    /**
     * Get active parent items
     * Lấy parent items của active item
     */
    getActiveParentItems: (): NavigationItem[] => {
      const activeItem = navigationState.activeItem;
      if (!activeItem) return [];

      const parentItems: NavigationItem[] = [];
      const allItems = NavigationUtils.getAllItems(sections);

      // Find parent items
      for (const item of allItems) {
        if (item.children && item.children.some(child => child.id === activeItem.id)) {
          parentItems.push(item);
        }
      }

      return parentItems;
    }
  }), [pathname, sections, navigationState.activeItem]);

  return {
    state: navigationState,
    actions: navigationActions
  };
}

/**
 * Generate breadcrumb items từ navigation
 * Helper function để generate breadcrumb items
 */
function generateBreadcrumbItems(
  pathname: string, 
  sections: NavigationSection[]
): NavigationItem[] {
  const items: NavigationItem[] = [];
  const allItems = NavigationUtils.getAllItems(sections);

  // Find matching items in path hierarchy
  const pathSegments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    
    const matchingItem = allItems.find(item => item.href === currentPath);
    if (matchingItem) {
      items.push(matchingItem);
    }
  }

  return items;
}

/**
 * Use Active Navigation Item Hook
 * Hook để lấy active navigation item
 */
export function useActiveNavigationItem(
  sections: NavigationSection[] = NAVIGATION_SECTIONS
): NavigationItem | null {
  const { state } = useAdminNavigation(sections);
  return state.activeItem;
}

/**
 * Use Navigation Item Active State Hook
 * Hook để check active state của specific item
 */
export function useNavigationItemActive(
  item: NavigationItem,
  sections: NavigationSection[] = NAVIGATION_SECTIONS
): boolean {
  const { actions } = useAdminNavigation(sections);
  return actions.isItemActive(item);
}

/**
 * Use Bottom Navigation Hook
 * Hook cho bottom navigation items
 */
export function useBottomNavigation() {
  const pathname = usePathname();

  const bottomNavigationState = useMemo(() => {
    const activeItem = BOTTOM_NAVIGATION.find(item =>
      NavigationUtils.isPathActive(pathname, item.href)
    ) || null;

    return {
      items: BOTTOM_NAVIGATION,
      activeItem,
      activeItemId: activeItem?.id || null
    };
  }, [pathname]);

  const bottomNavigationActions = useMemo(() => ({
    isItemActive: (item: NavigationItem): boolean => {
      return NavigationUtils.isPathActive(pathname, item.href);
    },

    getItemById: (itemId: string): NavigationItem | null => {
      return BOTTOM_NAVIGATION.find(item => item.id === itemId) || null;
    }
  }), [pathname]);

  return {
    state: bottomNavigationState,
    actions: bottomNavigationActions
  };
}

/**
 * Use Navigation Breadcrumbs Hook
 * Hook cho navigation breadcrumbs
 */
export function useNavigationBreadcrumbs(
  sections: NavigationSection[] = NAVIGATION_SECTIONS
): NavigationItem[] {
  const { state } = useAdminNavigation(sections);
  return state.breadcrumbItems;
}

/**
 * Use Navigation Search Hook
 * Hook cho navigation search functionality
 */
export function useNavigationSearch(
  query: string,
  sections: NavigationSection[] = NAVIGATION_SECTIONS
): NavigationItem[] {
  return useMemo(() => {
    if (!query || query.length < 2) return [];

    const allItems = NavigationUtils.getAllItems(sections);
    const searchQuery = query.toLowerCase();

    return allItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery) ||
      item.href.toLowerCase().includes(searchQuery)
    );
  }, [query, sections]);
}
