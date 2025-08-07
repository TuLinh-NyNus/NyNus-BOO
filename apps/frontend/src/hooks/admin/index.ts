/**
 * Admin Hooks Index
 * Barrel exports cho tất cả admin hooks
 */

// Navigation hooks
export {
  useAdminNavigation,
  useActiveNavigationItem,
  useNavigationItemActive,
  useBottomNavigation,
  useNavigationBreadcrumbs,
  useNavigationSearch
} from './use-admin-navigation';

// Search hooks
export {
  useAdminSearch,
  useSearchSuggestions,
  useSearchResults,
  useSearchKeyboardShortcuts
} from './use-admin-search';

// Notification hooks
export {
  useAdminNotifications,
  useNotificationToast
} from './use-admin-notifications';

// Dashboard Hooks
export {
  useDashboardData
} from './use-dashboard-data';

// TODO: Export additional hooks khi được tạo
// export * from './use-realtime-dashboard';

// User Management Hooks
export {
  useUserManagement
} from './use-user-management';
// export * from './use-advanced-user-filters';

// Authentication Hooks
// export * from './use-admin-auth';

// WebSocket Hooks
// export * from './use-admin-websocket';
// export * from './use-websocket-events';

// Performance Hooks
// export * from './use-performance-monitoring';

// Search Hooks
// export * from './use-search-optimization';
// export * from './use-search-suggestions';

// Utility Hooks
// export * from './use-debounce';
