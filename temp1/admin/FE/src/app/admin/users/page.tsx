"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Textarea,
} from "@/components/ui";
import { Users, UserPlus, UserX, AlertCircle, RefreshCw, Eye, CheckCircle } from "lucide-react";

// Import user management components
import { useUserManagement } from "@/hooks/use-user-management";
import { FilterPanel } from "@/components/user-management/filters/filter-panel";
import { VirtualizedUserTable } from "@/components/user-management/virtualized-user-table";
import { AdvancedUserFilters } from "@/types/user-filters";
import { AdminUser } from "@/types/admin-user";
import { UserDetailModal } from "@/components/user-management/user-detail-modal";
import {
  UserStatsLoading,
  UserTableLoading,
  UserErrorState,
  UserPaginationLoading,
} from "@/components/user-management/user-loading";
import { AdminErrorBoundary } from "@/lib/error-handling/global-error-boundary";
import { RolePromotionWorkflow } from "@/components/user-management/role-promotion-workflow";

/**
 * User Management Page
 * Trang quản lý người dùng cho Admin
 */

// User interface for user management
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  level?: number;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  activeSessionsCount: number;
  totalResourceAccess: number;
  riskScore?: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  growthPercentage: number;
}

export default function UserManagementPage() {
  // User management hook
  const {
    users,
    stats,
    selectedUser,
    isLoading,
    isSearching,
    error,
    pagination,
    filters,
    searchUsers,
    applyFilters,
    changePage,
    refreshUsers,
    getUserById,
    clearSelectedUser,
    clearFilters,
    hasUsers,
    hasError,
  } = useUserManagement({
    initialLimit: 25,
    enableCaching: true,
    debounceDelay: 300,
  });

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);

  /**
   * Handle search input change
   * Xử lý thay đổi search input
   */
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchUsers(value);
  };

  /**
   * Handle filter changes
   * Xử lý thay đổi filters
   */
  const handleFilterChange = (type: "role" | "status", value: string) => {
    if (type === "role") {
      setFilterRole(value);
    } else {
      setFilterStatus(value);
    }

    applyFilters({
      role:
        type === "role"
          ? value === "all"
            ? undefined
            : value
          : filterRole === "all"
            ? undefined
            : filterRole,
      status:
        type === "status"
          ? value === "all"
            ? undefined
            : value
          : filterStatus === "all"
            ? undefined
            : filterStatus,
    });
  };

  /**
   * Handle user detail view
   * Xử lý xem chi tiết user
   */
  const handleViewUserDetail = async (userId: string) => {
    await getUserById(userId);
    setIsDetailModalOpen(true);
  };

  /**
   * Handle close detail modal
   * Xử lý đóng modal chi tiết
   */
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    clearSelectedUser();
  };

  /**
   * Handle advanced filters change
   * Xử lý thay đổi advanced filters
   */
  const handleAdvancedFiltersChange = (filters: AdvancedUserFilters) => {
    // Convert advanced filters to existing filter format
    const convertedFilters: any = {};

    if (filters.search) {
      setSearchTerm(filters.search);
    }

    if (filters.roles?.length === 1) {
      setFilterRole(filters.roles[0]);
      convertedFilters.role = filters.roles[0];
    } else if (filters.roles?.length === 0) {
      setFilterRole("all");
    }

    if (filters.statuses?.length === 1) {
      setFilterStatus(filters.statuses[0]);
      convertedFilters.status = filters.statuses[0];
    } else if (filters.statuses?.length === 0) {
      setFilterStatus("all");
    }

    // Apply filters to existing system
    applyFilters(convertedFilters);
  };

  /**
   * Handle search results from enhanced search
   * Xử lý kết quả search từ enhanced search
   */
  const handleSearchResults = (query: string, results: AdminUser[]) => {
    // This could be used for additional processing of search results
    // For now, the search is handled by the existing searchUsers function
    console.log(`Search "${query}" returned ${results.length} results`);
  };

  /**
   * Clear all filters
   * Xóa tất cả filters
   */
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    clearFilters();
  };

  /**
   * Get role badge color
   */
  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: "destructive",
      TEACHER: "default",
      TUTOR: "secondary",
      STUDENT: "outline",
      GUEST: "secondary",
    };
    return <Badge variant={colors[role as keyof typeof colors] as any}>{role}</Badge>;
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: "secondary",
      SUSPENDED: "destructive",
      PENDING_VERIFICATION: "default",
    };
    const labels = {
      ACTIVE: "Hoạt động",
      SUSPENDED: "Tạm ngưng",
      PENDING_VERIFICATION: "Chờ xác thực",
    };
    return (
      <Badge variant={colors[status as keyof typeof colors] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (timestamp?: string) => {
    if (!timestamp) return "Chưa đăng nhập";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} giờ trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  /**
   * Handle user suspension
   */
  const handleSuspendUser = async () => {
    if (!selectedUser || !suspensionReason.trim()) return;

    try {
      // API call to suspend user
      console.log("Suspending user:", selectedUser.id, "Reason:", suspensionReason);

      // Refresh users list
      await refreshUsers();

      setIsSuspendDialogOpen(false);
      setSuspensionReason("");
    } catch (error) {
      console.error("Failed to suspend user:", error);
    }
  };

  /**
   * Handle user reactivation
   */
  const handleReactivateUser = async (userId: string) => {
    try {
      // API call to reactivate user
      console.log("Reactivating user:", userId);

      // Refresh users list
      await refreshUsers();
    } catch (error) {
      console.error("Failed to reactivate user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu người dùng...</span>
      </div>
    );
  }

  return (
    <AdminErrorBoundary level="page" enableRetry={true} showErrorDetails={true}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
            <p className="text-muted-foreground">Quản lý tài khoản và quyền hạn của người dùng</p>
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

        {/* User Statistics */}
        {isLoading && !stats ? (
          <UserStatsLoading />
        ) : hasError ? (
          <UserErrorState
            error={error || "Không thể tải thống kê người dùng"}
            onRetry={refreshUsers}
          />
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.newUsersThisMonth} tháng này
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalUsers ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}
                  % tổng số
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tạm ngưng</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.suspendedUsers}</div>
                <p className="text-xs text-muted-foreground">Cần xem xét</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Người dùng mới</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newUsersToday}</div>
                <p className="text-xs text-muted-foreground">Đăng ký hôm nay</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Người dùng</CardTitle>
            <CardDescription>Quản lý tất cả tài khoản người dùng trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Advanced Filters */}
            <div className="mb-6">
              <FilterPanel
                users={users}
                onFiltersChange={handleAdvancedFiltersChange}
                onSearchResults={handleSearchResults}
              />
            </div>

            {/* Role Promotion Workflow */}
            <div className="mb-6">
              <RolePromotionWorkflow selectedUsers={selectedUsers} onRefresh={refreshUsers} />
            </div>

            {/* Virtualized Table */}
            <VirtualizedUserTable
              users={users}
              isLoading={isLoading && !hasUsers}
              selectedUsers={selectedUsers}
              onSelectionChange={setSelectedUsers}
              onViewUser={(user) => handleViewUserDetail(user.id)}
              onSuspendUser={(user) => {
                // Handle suspend user
                console.log("Suspend user:", user.id);
              }}
              onActivateUser={(user) => {
                // Handle activate user
                console.log("Activate user:", user.id);
              }}
              onDeleteUser={(user) => {
                // Handle delete user
                console.log("Delete user:", user.id);
              }}
              onPromoteUser={(user) => {
                // Handle promote user
                console.log("Promote user:", user.id);
              }}
              containerHeight={600}
            />
          </CardContent>
        </Card>

        {/* User Detail Modal */}
        <UserDetailModal
          user={selectedUser}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onUserUpdate={(updatedUser) => {
            // Handle user update if needed
            console.log("User updated:", updatedUser);
          }}
        />
      </div>
    </AdminErrorBoundary>
  );
}
