/**
 * Admin Mockdata Index
 * Central export file cho tất cả admin mockdata
 */

// Export dashboard metrics mockdata
export {
  type DashboardMetrics,
  type SystemStatus,
  type RecentActivity,
  mockDashboardMetrics,
  mockSystemStatus,
  mockRecentActivities,
  adminDashboardMockService,
  getFormattedDashboardMetrics,
  getSystemStatusWithLabels,
  getActivitySeverityColor
} from './dashboard-metrics';

// Export header navigation mockdata
export {
  type AdminUser,
  type AdminNotification,
  type SearchSuggestion,
  mockAdminHeaderUser,
  mockNotifications,
  mockSearchSuggestions,
  adminHeaderMockService,
  getNotificationTypeColor,
  getNotificationTypeIcon,
  formatNotificationTimestamp
} from './header-navigation';

// Export roles permissions mockdata
export {
  type Permission,
  type Role,
  mockPermissions,
  mockRoles,
  adminRolesMockService,
  getRoleHierarchy,
  getPermissionCategories,
  roleHasPermission
} from './roles-permissions';

// Export sidebar navigation mockdata
export {
  type NavigationItem,
  type NavigationSection,
  type UserPermissions,
  mockMainNavigation,
  mockManagementNavigation,
  mockSystemNavigation,
  mockAdvancedNavigation,
  mockNavigationSections,
  mockUserPermissions,
  adminSidebarMockService,
  NavigationUtils
} from './sidebar-navigation';
