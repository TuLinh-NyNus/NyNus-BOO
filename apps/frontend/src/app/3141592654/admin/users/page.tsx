'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, RefreshCw, AlertCircle } from 'lucide-react';
import { DarkThemeProvider } from '@/components/admin/theme/dark-theme-provider';

// Import user management components
import { useUserManagement } from '@/hooks/admin/use-user-management';
import {
  FilterPanel,
  VirtualizedUserTable,
  UserDetailModal,
  RolePromotionWorkflow,
  UserStatsLoading,
  UserErrorState
} from '@/components/user-management';
import { AdminUser } from '@/types/user';

export default function AdminUsersPage() {
  // ===== HOOKS =====

  /**
   * User management hook với Enhanced User Model support
   */
  const {
    users,
    stats,
    selectedUser,
    isLoading,
    isSearching,
    error,
    applyFilters,
    refreshUsers,
    getUserById,
    clearSelectedUser,
    suspendUser,
    reactivateUser,
    hasUsers,
    hasError
  } = useUserManagement();

  // ===== LOCAL STATE =====
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  // ===== EVENT HANDLERS =====

  /**
   * Handle user detail view (read-only mode)
   * Xử lý xem chi tiết user ở chế độ chỉ đọc
   */
  const handleViewUserDetail = async (userId: string) => {
    await getUserById(userId);
    setModalMode('view');
    setIsDetailModalOpen(true);
  };

  /**
   * Handle user edit
   * Xử lý chỉnh sửa thông tin user
   */
  const handleEditUserDetail = async (userId: string) => {
    await getUserById(userId);
    setModalMode('edit');
    setIsDetailModalOpen(true);
  };

  /**
   * Handle close detail modal
   * Xử lý đóng modal chi tiết
   */
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setModalMode('view'); // Reset về view mode
    clearSelectedUser();
  };

  /**
   * Handle user update from modal
   * Xử lý cập nhật user từ modal
   */
  const handleUserUpdate = (updatedUser: AdminUser) => {
    console.log('User updated:', updatedUser);
    // Refresh users list to reflect changes
    refreshUsers();
  };

  /**
   * Handle user actions from table
   */
  const handleUserAction = async (action: string, user: AdminUser) => {
    try {
      switch (action) {
        case 'suspend':
          await suspendUser(user.id, 'Suspended by admin');
          break;
        case 'activate':
          await reactivateUser(user.id);
          break;
        case 'promote':
          // TODO: Implement role selection dialog
          console.log('Promote user:', user.id);
          break;
        case 'delete':
          console.log('Delete user:', user.id);
          // TODO: Implement delete functionality
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  // ===== RENDER =====

  return (
    <DarkThemeProvider>
      <div className="admin-users-page container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
          <p className="text-muted-foreground">Quản lý tài khoản và quyền hạn của người dùng với Enhanced User Model</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={refreshUsers} disabled={isLoading || isSearching}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading || isSearching ? "animate-spin" : ""}`}
            />
            {isLoading ? "Đang tải..." : isSearching ? "Đang tìm..." : "Làm mới"}
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {isLoading && !stats ? (
        <UserStatsLoading />
      ) : hasError ? (
        <UserErrorState
          error={error || "Không thể tải thống kê người dùng"}
          onRetry={refreshUsers}
        />
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="admin-unified-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newUsersThisMonth} trong tháng này
              </p>
            </CardContent>
          </Card>

          <Card className="admin-unified-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
              <UserPlus className="h-4 w-4 text-badge-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-badge-success">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% tổng số
              </p>
            </CardContent>
          </Card>

          <Card className="admin-unified-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bị tạm ngưng</CardTitle>
              <AlertCircle className="h-4 w-4 text-badge-error" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-badge-error">{stats.suspendedUsers}</div>
              <p className="text-xs text-muted-foreground">
                Cần xem xét
              </p>
            </CardContent>
          </Card>

          <Card className="admin-unified-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ xác thực</CardTitle>
              <RefreshCw className="h-4 w-4 text-badge-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-badge-warning">{stats.inactiveUsers}</div>
              <p className="text-xs text-muted-foreground">
                Cần xác thực email
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Main Content - Components hiển thị độc lập */}
      <div className="space-y-6">
        {/* Advanced Filters */}
        <FilterPanel
          users={users}
          onFiltersChange={applyFilters}
          onSearchResults={(query, results) => {
            console.log(`Search "${query}" returned ${results.length} results`);
          }}
        />

        {/* Role Promotion Workflow */}
        <RolePromotionWorkflow
          selectedUsers={selectedUsers}
          onRefresh={refreshUsers}
        />

        {/* Virtualized Table */}
        <VirtualizedUserTable
          users={users}
          isLoading={isLoading && !hasUsers}
          selectedUsers={selectedUsers.map(u => u.id)}
          onSelectionChange={(selectedIds) => {
            const selected = users.filter(user => selectedIds.includes(user.id));
            setSelectedUsers(selected);
          }}
          onViewUser={(user) => handleViewUserDetail(user.id)}
          onEditUser={(user) => handleEditUserDetail(user.id)}
          onSuspendUser={(user) => handleUserAction('suspend', user)}
          onActivateUser={(user) => handleUserAction('activate', user)}
          onDeleteUser={(user) => handleUserAction('delete', user)}
          onPromoteUser={(user) => handleUserAction('promote', user)}
          containerHeight={800}
          pageSize={50}
        />
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onUserUpdate={handleUserUpdate}
        mode={modalMode}
      />
      </div>
    </DarkThemeProvider>
  );
}

