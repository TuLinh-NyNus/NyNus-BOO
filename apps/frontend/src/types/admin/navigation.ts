/**
 * Admin Navigation Types
 * Type definitions cho admin navigation system
 */

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
 * Navigation Badge Color Type
 * Type cho navigation badge colors
 */
export type NavigationBadgeColor = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/**
 * Navigation Section ID Type
 * Type cho navigation section IDs
 */
export type NavigationSectionId = 
  | 'main'
  | 'management'
  | 'system'
  | 'advanced';

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
 * User Role Type
 * Type cho user roles
 */
export type UserRole = 
  | 'ADMIN'
  | 'TEACHER'
  | 'TUTOR'
  | 'STUDENT'
  | 'GUEST';

/**
 * Navigation State Type
 * Type cho navigation states
 */
export type NavigationState = 
  | 'active'
  | 'inactive'
  | 'disabled'
  | 'loading';

/**
 * Navigation Animation Type
 * Type cho navigation animations
 */
export type NavigationAnimation = 
  | 'none'
  | 'fade'
  | 'slide'
  | 'scale'
  | 'bounce';

/**
 * Navigation Layout Type
 * Type cho navigation layouts
 */
export type NavigationLayout = 
  | 'vertical'
  | 'horizontal'
  | 'compact'
  | 'minimal';

/**
 * Navigation Theme Type
 * Type cho navigation themes
 */
export type NavigationTheme = 
  | 'light'
  | 'dark'
  | 'auto';

/**
 * Navigation Size Type
 * Type cho navigation sizes
 */
export type NavigationSize = 
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl';

/**
 * Navigation Variant Type
 * Type cho navigation variants
 */
export type NavigationVariant = 
  | 'default'
  | 'minimal'
  | 'compact'
  | 'pills'
  | 'underline';

/**
 * Navigation Position Type
 * Type cho navigation positions
 */
export type NavigationPosition = 
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'fixed'
  | 'sticky';

/**
 * Navigation Behavior Type
 * Type cho navigation behaviors
 */
export type NavigationBehavior = 
  | 'hover'
  | 'click'
  | 'auto'
  | 'manual';

/**
 * Navigation Constants
 * Constants cho navigation system
 */
export const NAVIGATION_CONSTANTS = {
  DEFAULT_ANIMATION_DURATION: 200,
  DEFAULT_DEBOUNCE_MS: 300,
  DEFAULT_MAX_ITEMS: 10,
  DEFAULT_BADGE_LIMIT: 99,
  DEFAULT_TOOLTIP_DELAY: 500,
  
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 768,
    DESKTOP: 1024,
    WIDE: 1280
  },
  
  SIZES: {
    SIDEBAR_EXPANDED: 256,
    SIDEBAR_COLLAPSED: 64,
    HEADER_HEIGHT: 64,
    BREADCRUMB_HEIGHT: 40
  },
  
  Z_INDEX: {
    SIDEBAR: 40,
    HEADER: 50,
    DROPDOWN: 1000,
    MODAL: 1050,
    TOOLTIP: 1070
  }
} as const;

/**
 * Navigation Icon Mapping
 * Mapping cho navigation icons
 */
export const NAVIGATION_ICON_MAPPING = {
  dashboard: 'LayoutDashboard',
  users: 'Users',
  questions: 'FileQuestion',
  'questions-list': 'List',
  'questions-create': 'Plus',
  analytics: 'BarChart3',
  books: 'BookOpen',
  faq: 'HelpCircle',
  roles: 'Shield',
  permissions: 'Key',
  audit: 'FileText',
  sessions: 'Clock',
  notifications: 'Bell',
  security: 'Lock',
  settings: 'Settings',
  'level-progression': 'TrendingUp',
  mapcode: 'Map',
  resources: 'FolderOpen'
} as const;

/**
 * Navigation Permission Mapping
 * Mapping cho navigation permissions
 */
export const NAVIGATION_PERMISSION_MAPPING = {
  dashboard: ['admin.dashboard'],
  users: ['users.read'],
  questions: ['questions.read'],
  'questions-list': ['questions.read'],
  'questions-create': ['questions.create'],
  analytics: ['analytics.read'],
  books: ['books.read'],
  faq: ['faq.read'],
  roles: ['roles.read'],
  permissions: ['permissions.read'],
  audit: ['audit.read'],
  sessions: ['sessions.read'],
  notifications: ['notifications.read'],
  security: ['security.read'],
  settings: ['settings.read'],
  'level-progression': ['level.read'],
  mapcode: ['mapcode.read'],
  resources: ['resources.read']
} as const;

/**
 * Navigation Route Mapping
 * Mapping cho navigation routes
 */
export const NAVIGATION_ROUTE_MAPPING = {
  dashboard: '/3141592654/admin',
  users: '/3141592654/admin/users',
  questions: '/3141592654/admin/questions',
  'questions-list': '/3141592654/admin/questions',
  'questions-create': '/3141592654/admin/questions/create',
  analytics: '/3141592654/admin/analytics',
  books: '/3141592654/admin/books',
  faq: '/3141592654/admin/faq',
  roles: '/3141592654/admin/roles',
  permissions: '/3141592654/admin/permissions',
  audit: '/3141592654/admin/audit',
  sessions: '/3141592654/admin/sessions',
  notifications: '/3141592654/admin/notifications',
  security: '/3141592654/admin/security',
  settings: '/3141592654/admin/settings',
  'level-progression': '/3141592654/admin/level-progression',
  mapcode: '/3141592654/admin/mapcode',
  resources: '/3141592654/admin/resources'
} as const;

/**
 * Navigation Validation Functions
 * Functions để validate navigation data
 */
export const NavigationValidation = {
  isValidIcon: (icon: string): icon is NavigationIcon => {
    const validIcons: string[] = Object.values(NAVIGATION_ICON_MAPPING);
    return validIcons.includes(icon);
  },

  isValidPermission: (permission: string): permission is NavigationPermission => {
    const validPermissions: string[] = Object.values(NAVIGATION_PERMISSION_MAPPING).flat();
    return validPermissions.includes(permission);
  },

  isValidRoute: (route: string): route is NavigationRoute => {
    const validRoutes: string[] = Object.values(NAVIGATION_ROUTE_MAPPING);
    return validRoutes.includes(route);
  },

  isValidItemId: (itemId: string): itemId is NavigationItemId => {
    const validItemIds: string[] = Object.keys(NAVIGATION_ROUTE_MAPPING);
    return validItemIds.includes(itemId);
  },

  isValidSectionId: (sectionId: string): sectionId is NavigationSectionId => {
    const validSectionIds: NavigationSectionId[] = ['main', 'management', 'system', 'advanced'];
    return validSectionIds.includes(sectionId as NavigationSectionId);
  }
} as const;
