/**
 * User Management Loading Components Index
 * Barrel exports cho tất cả loading components
 */

// Export all loading components
export {
  UserStatsLoading,
  UserTableLoading,
  UserErrorState,
  UserPaginationLoading,
  UserManagementLoading,
  default as UserLoadingComponents
} from './user-loading';

// Export types nếu cần
export type {
  // Có thể export interfaces nếu cần sử dụng bên ngoài
} from './user-loading';
