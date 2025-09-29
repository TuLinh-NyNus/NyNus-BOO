/**
 * Admin Navigation Types
 * Consolidated navigation types for admin interface
 */

import { ReactNode } from 'react';

// ===== CORE NAVIGATION INTERFACES =====

/**
 * Navigation Item Interface
 * Interface cho navigation items
 */
export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  badge?: string | number;
  permissions?: string[];
  isActive?: boolean;
  isDisabled?: boolean;
  children?: NavigationItem[];
  metadata?: Record<string, unknown>;
}

/**
 * Navigation Section Interface
 * Interface cho navigation sections
 */
export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * User Permissions Interface
 * Interface cho user permissions
 */
export interface UserPermissions {
  userId: string;
  permissions: string[];
  role: string;
  roleLevel?: number;
}

// ===== SIDEBAR INTERFACES =====

/**
 * Admin Sidebar Props
 * Props cho AdminSidebar component
 */
export interface AdminSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  showLogo?: boolean;
  showCollapseButton?: boolean;
}

/**
 * Navigation Item Props
 * Props cho NavItem component
 */
export interface NavItemProps {
  item: NavigationItem;
  isActive?: boolean;
  collapsed?: boolean;
  level?: number;
  onClick?: (item: NavigationItem) => void;
  className?: string;
}

/**
 * Navigation Section Props
 * Props cho NavSection component
 */
export interface NavSectionProps {
  section: NavigationSection;
  collapsed?: boolean;
  activeItemId?: string;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
}

/**
 * Admin Logo Props
 * Props cho AdminLogo component
 */
export interface AdminLogoProps {
  collapsed?: boolean;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

// ===== SIDEBAR STATE & ACTIONS =====

/**
 * Sidebar State Interface
 * Interface cho sidebar state
 */
export interface SidebarState {
  collapsed: boolean;
  activeItemId: string | null;
  expandedSections: string[];
  navigationItems: NavigationSection[];
  userPermissions: UserPermissions | null;
  isLoading: boolean;
}

/**
 * Sidebar Actions Interface
 * Interface cho sidebar actions
 */
export interface SidebarActions {
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setActiveItem: (itemId: string | null) => void;
  toggleSection: (sectionId: string) => void;
  expandSection: (sectionId: string) => void;
  collapseSection: (sectionId: string) => void;
  setNavigationItems: (items: NavigationSection[]) => void;
  setUserPermissions: (permissions: UserPermissions | null) => void;
  setLoading: (loading: boolean) => void;
  refreshNavigation: () => void;
}

// ===== SIDEBAR CONFIGURATION =====

/**
 * Sidebar Configuration
 * Configuration cho admin sidebar
 */
export interface AdminSidebarConfig {
  width: {
    expanded: number;
    collapsed: number;
  };
  animation: {
    duration: number;
    easing: string;
  };
  logo: {
    show: boolean;
    showTextWhenCollapsed: boolean;
  };
  navigation: {
    showBadges: boolean;
    showIcons: boolean;
    highlightActive: boolean;
    expandOnHover: boolean;
  };
  permissions: {
    hideUnauthorized: boolean;
    showPermissionHints: boolean;
  };
}

/**
 * Default Sidebar Configuration
 * Default config cho admin sidebar
 */
export const DEFAULT_ADMIN_SIDEBAR_CONFIG: AdminSidebarConfig = {
  width: {
    expanded: 256, // w-64
    collapsed: 64  // w-16
  },
  animation: {
    duration: 200,
    easing: 'ease-in-out'
  },
  logo: {
    show: true,
    showTextWhenCollapsed: false
  },
  navigation: {
    showBadges: true,
    showIcons: true,
    highlightActive: true,
    expandOnHover: false
  },
  permissions: {
    hideUnauthorized: true,
    showPermissionHints: false
  }
};

// ===== NAVIGATION BADGES =====

/**
 * Navigation Badge Type
 * Type cho navigation badges
 */
export type NavigationBadgeType = 'count' | 'dot' | 'text' | 'status';

/**
 * Navigation Badge Interface
 * Interface cho navigation badges
 */
export interface NavigationBadge {
  type: NavigationBadgeType;
  value: string | number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  pulse?: boolean;
}

// ===== ACTIVE NAVIGATION DETECTION =====

/**
 * Active Navigation Detection
 * Interface cho active navigation detection
 */
export interface ActiveNavigationDetection {
  exact: boolean;
  includeChildren: boolean;
  customMatcher?: (pathname: string, itemHref: string) => boolean;
}

// ===== CONTEXT INTERFACES =====

/**
 * Navigation Context Value
 * Context value cho NavigationProvider
 */
export interface NavigationContextValue {
  activeItemId: string | null;
  setActiveItem: (itemId: string | null) => void;
  isItemActive: (item: NavigationItem, pathname: string) => boolean;
  hasPermission: (permissions: string[]) => boolean;
  userPermissions: UserPermissions | null;
}

/**
 * Navigation Provider Props
 * Props cho NavigationProvider
 */
export interface NavigationProviderProps {
  children: ReactNode;
  userPermissions?: UserPermissions;
  activeDetection?: ActiveNavigationDetection;
}

// ===== HOOK RETURN TYPES =====

/**
 * Use Admin Sidebar Hook Return
 * Return type cho useAdminSidebar hook
 */
export interface UseAdminSidebarReturn {
  state: SidebarState;
  actions: SidebarActions;
}

// ===== BREADCRUMB INTERFACES =====

/**
 * Breadcrumb Item Interface
 * Interface cho breadcrumb items
 */
export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  isActive?: boolean;
  isClickable?: boolean;
}

/**
 * Breadcrumb Props
 * Props cho Breadcrumb component
 */
export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  className?: string;
  onItemClick?: (item: BreadcrumbItem) => void;
}

// ===== NAVIGATION TYPE DEFINITIONS =====

/**
 * Navigation Icon Type
 * Type cho navigation icons
 */
export type NavigationIcon =
  | 'LayoutDashboard'
  | 'Users'
  | 'FileQuestion'
  | 'BookOpen'
  | 'BarChart3'
  | 'Bell'
  | 'Shield'
  | 'Settings'
  | 'HelpCircle'
  | 'List'
  | 'Plus'
  | 'Map'
  | 'Key'
  | 'FileText'
  | 'Clock'
  | 'Lock'
  | 'TrendingUp'
  | 'FolderOpen'
  | 'Home'
  | 'ChevronRight'
  | 'User'
  | 'AlertTriangle'
  | 'CheckCircle'
  | 'Info'
  | 'AlertCircle';

/**
 * Navigation Permission Type
 * Type cho navigation permissions
 */
export type NavigationPermission =
  | 'admin.dashboard'
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'questions.read'
  | 'questions.create'
  | 'questions.update'
  | 'questions.delete'
  | 'analytics.read'
  | 'books.read'
  | 'books.create'
  | 'books.update'
  | 'faq.read'
  | 'faq.create'
  | 'faq.update'
  | 'roles.read'
  | 'roles.create'
  | 'roles.update'
  | 'permissions.read'
  | 'audit.read'
  | 'sessions.read'
  | 'notifications.read'
  | 'security.read'
  | 'settings.read'
  | 'settings.update'
  | 'level.read'
  | 'mapcode.read'
  | 'resources.read';

/**
 * Navigation Route Type
 * Type cho navigation routes
 */
export type NavigationRoute =
  | '/3141592654/admin'
  | '/3141592654/admin/users'
  | '/3141592654/admin/questions'
  | '/3141592654/admin/questions/create'
  | '/3141592654/admin/analytics'
  | '/3141592654/admin/books'
  | '/3141592654/admin/faq'
  | '/3141592654/admin/roles'
  | '/3141592654/admin/permissions'
  | '/3141592654/admin/audit'
  | '/3141592654/admin/sessions'
  | '/3141592654/admin/notifications'
  | '/3141592654/admin/security'
  | '/3141592654/admin/settings'
  | '/3141592654/admin/level-progression'
  | '/3141592654/admin/mapcode'
  | '/3141592654/admin/resources';

/**
 * Navigation Item ID Type
 * Type cho navigation item IDs
 */
export type NavigationItemId =
  | 'dashboard'
  | 'users'
  | 'questions'
  | 'questions-list'
  | 'questions-create'
  | 'analytics'
  | 'books'
  | 'faq'
  | 'roles'
  | 'permissions'
  | 'audit'
  | 'sessions'
  | 'notifications'
  | 'security'
  | 'settings'
  | 'level-progression'
  | 'mapcode'
  | 'resources';

/**
 * Navigation Section ID Type
 * Type cho navigation section IDs
 */
export type NavigationSectionId =
  | 'main'
  | 'management'
  | 'system'
  | 'advanced';
