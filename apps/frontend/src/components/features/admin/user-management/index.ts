/**
 * User Management Components Index
 * Export tất cả user management components
 *
 * @author NyNus Team
 * @version 1.0.0
 */

// Export core user management components
export { BulkRolePromotionDialog } from './bulk-role-promotion';
export { RolePromotionDialog } from './role-promotion-dialog';
export { RolePromotionWorkflow } from './role-promotion-workflow';
export { VirtualizedUserTable } from './virtualized-user-table';
export { UserDetailModal } from './user-detail-modal';
export { UserOverviewTab } from './user-overview-tab';
export { UserSecurityTab } from './user-security-tab';
export { UserActivityTab } from './user-activity-tab';
export { UserSessionsTab } from './user-sessions-tab';

// Export filter components
export { FilterPanel } from './filters/filter-panel';
export { DateRangePicker } from './filters/date-range-picker';
export { FilterPresets } from './filters/filter-presets';
export { SavedFilters } from './filters/saved-filters';

// Export search components
export { EnhancedSearch } from './search/enhanced-search';

// Export hooks
export { useVirtualUserTable } from '@/hooks/admin/use-virtual-user-table';

// Export types
export type {
  BulkRolePromotionData,
  BulkOperationResult,
  PromotionWorkflowStep,
  PromotionRequest,
  UserActivity,
  UserSession,
  SecurityEvent,
  UserFilterOptions
} from '@/lib/mockdata/user-management';
export const UserStats = () => null;
