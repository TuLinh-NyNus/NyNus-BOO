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

// User Management Hooks
export {
  useUserManagement
} from './use-user-management';
