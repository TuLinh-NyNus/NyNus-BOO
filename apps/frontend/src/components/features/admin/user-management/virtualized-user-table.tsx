/**
 * Virtualized User Table Component
 * Component table ảo cho user management với performance optimization
 */

"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui/form/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  UserX,
  UserCheck,
  Trash2,
  Shield,
  ShieldCheck,
  Activity,
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";
import { useVirtualUserTable } from "@/hooks/admin/use-virtual-user-table";

/**
 * Admin User interface (simplified)
 */
interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  activeSessionsCount: number;
  totalResourceAccess: number;
  riskScore?: number;
}

/**
 * Virtualized User Table Props
 */
interface VirtualizedUserTableProps {
  users: AdminUser[];
  isLoading?: boolean;
  selectedUsers?: AdminUser[];
  onSelectionChange?: (users: AdminUser[]) => void;
  onViewUser?: (user: AdminUser) => void;
  onSuspendUser?: (user: AdminUser) => void;
  onActivateUser?: (user: AdminUser) => void;
  onDeleteUser?: (user: AdminUser) => void;
  onPromoteUser?: (user: AdminUser) => void;
  containerHeight?: number;
  className?: string;
}

/**
 * User role labels mapping
 */
// const USER_ROLE_LABELS: Record<UserRole, string> = {
//   [UserRole.GUEST]: "Khách",
//   [UserRole.STUDENT]: "Học viên",
//   [UserRole.TUTOR]: "Trợ giảng",
//   [UserRole.TEACHER]: "Giảng viên",
//   [UserRole.ADMIN]: "Quản trị viên",
// };

/**
 * Get role badge component
 */
function getRoleBadge(role: UserRole) {
  const roleConfig = {
    [UserRole.ADMIN]: { label: "Admin", className: "bg-red-100 text-red-800" },
    [UserRole.TEACHER]: { label: "Giáo viên", className: "bg-purple-100 text-purple-800" },
    [UserRole.TUTOR]: { label: "Gia sư", className: "bg-green-100 text-green-800" },
    [UserRole.STUDENT]: { label: "Học viên", className: "bg-blue-100 text-blue-800" },
    [UserRole.GUEST]: { label: "Khách", className: "bg-gray-100 text-gray-800" },
  };

  const config = roleConfig[role] || roleConfig[UserRole.STUDENT];

  return <Badge className={config.className}>{config.label}</Badge>;
}

/**
 * Get status badge component
 */
function getStatusBadge(status: string) {
  const statusConfig = {
    ACTIVE: { label: "Hoạt động", className: "bg-green-100 text-green-800", icon: Activity },
    SUSPENDED: { label: "Tạm ngưng", className: "bg-red-100 text-red-800", icon: UserX },
    PENDING_VERIFICATION: { label: "Chờ xác thực", className: "bg-yellow-100 text-yellow-800", icon: Shield },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
  const IconComponent = config.icon;

  return (
    <Badge className={config.className}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

/**
 * Format date for display
 */
function formatDate(dateString?: string): string {
  if (!dateString) return "Chưa có";

  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get user display name
 */
function getUserDisplayName(user: AdminUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email;
}

/**
 * Virtualized User Table Component
 */
export function VirtualizedUserTable({
  users,
  isLoading = false,
  selectedUsers = [],
  onSelectionChange,
  onViewUser,
  onSuspendUser,
  onActivateUser,
  onDeleteUser,
  onPromoteUser,
  containerHeight = 400,
  className = "",
}: VirtualizedUserTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Virtual table hook
  const {
    virtualState,
    scrollElementProps,
    getItemProps,
    scrollToTop,
  } = useVirtualUserTable({
    itemHeight: 80,
    containerHeight,
    overscan: 5,
    totalItems: users.length,
  });

  /**
   * Handle user selection
   */
  const handleUserSelection = useCallback((user: AdminUser, isSelected: boolean) => {
    if (!onSelectionChange) return;

    if (isSelected) {
      onSelectionChange([...selectedUsers, user]);
    } else {
      onSelectionChange(selectedUsers.filter(u => u.id !== user.id));
    }
  }, [selectedUsers, onSelectionChange]);

  /**
   * Check if user is selected
   */
  const isUserSelected = useCallback((user: AdminUser) => {
    return selectedUsers.some(u => u.id === user.id);
  }, [selectedUsers]);

  /**
   * Render user row
   */
  const renderUserRow = useCallback((user: AdminUser, index: number) => {
    const isSelected = isUserSelected(user);
    const itemProps = getItemProps(index);

    return (
      <div
        {...itemProps}
        className={`flex items-center gap-4 p-4 border-b hover:bg-muted/25 ${
          isSelected ? 'bg-blue-50 border-blue-200' : ''
        }`}
      >
        {/* Selection Checkbox */}
        {onSelectionChange && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handleUserSelection(user, e.target.checked)}
            className="rounded"
          />
        )}

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium truncate">{getUserDisplayName(user)}</span>
            {user.emailVerified && <ShieldCheck className="h-4 w-4 text-green-500" />}
          </div>
          <div className="text-sm text-muted-foreground truncate">{user.email}</div>
        </div>

        {/* Role Badge */}
        <div className="flex-shrink-0">
          {getRoleBadge(user.role)}
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          {getStatusBadge(user.status)}
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 text-center">
          <div className="text-sm font-medium">{user.activeSessionsCount}</div>
          <div className="text-xs text-muted-foreground">Sessions</div>
        </div>

        <div className="flex-shrink-0 text-center">
          <div className="text-sm font-medium">{user.totalResourceAccess}</div>
          <div className="text-xs text-muted-foreground">Resources</div>
        </div>

        {/* Last Login */}
        <div className="flex-shrink-0 text-sm text-muted-foreground">
          {formatDate(user.lastLoginAt)}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewUser && (
                <DropdownMenuItem onClick={() => onViewUser(user)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </DropdownMenuItem>
              )}
              {onPromoteUser && (
                <DropdownMenuItem onClick={() => onPromoteUser(user)}>
                  <Shield className="h-4 w-4 mr-2" />
                  Thay đổi role
                </DropdownMenuItem>
              )}
              {user.status === 'ACTIVE' && onSuspendUser && (
                <DropdownMenuItem onClick={() => onSuspendUser(user)}>
                  <UserX className="h-4 w-4 mr-2" />
                  Tạm khóa
                </DropdownMenuItem>
              )}
              {user.status === 'SUSPENDED' && onActivateUser && (
                <DropdownMenuItem onClick={() => onActivateUser(user)}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Kích hoạt
                </DropdownMenuItem>
              )}
              {onDeleteUser && (
                <DropdownMenuItem 
                  onClick={() => onDeleteUser(user)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa user
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }, [
    getItemProps,
    isUserSelected,
    handleUserSelection,
    onSelectionChange,
    onViewUser,
    onPromoteUser,
    onSuspendUser,
    onActivateUser,
    onDeleteUser,
  ]);

  /**
   * Scroll to top when users change
   */
  useEffect(() => {
    scrollToTop();
  }, [users.length, scrollToTop]);

  if (isLoading) {
    return (
      <div className={`border rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-muted-foreground">Đang tải users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={`border rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <UserX className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Không có users nào</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="flex items-center gap-4 p-4 bg-muted/25 border-b font-medium text-sm">
        {onSelectionChange && <div className="w-4"></div>}
        <div className="flex-1">User</div>
        <div className="flex-shrink-0 w-20">Role</div>
        <div className="flex-shrink-0 w-24">Status</div>
        <div className="flex-shrink-0 w-16 text-center">Sessions</div>
        <div className="flex-shrink-0 w-16 text-center">Resources</div>
        <div className="flex-shrink-0 w-20">Last Login</div>
        <div className="flex-shrink-0 w-10"></div>
      </div>

      {/* Virtual Table Container */}
      <div ref={containerRef} {...scrollElementProps}>
        <div style={{ height: virtualState.totalHeight, position: 'relative' }}>
          {virtualState.visibleItems.map((item) => {
            const user = users[item.index];
            return user ? renderUserRow(user, item.index) : null;
          })}
        </div>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between p-4 bg-muted/25 border-t text-sm text-muted-foreground">
        <div>
          Hiển thị {virtualState.visibleStartIndex + 1}-{Math.min(virtualState.visibleEndIndex + 1, users.length)} của {users.length} users
        </div>
        <div>
          {selectedUsers.length > 0 && (
            <span>{selectedUsers.length} users được chọn</span>
          )}
        </div>
      </div>
    </div>
  );
}
