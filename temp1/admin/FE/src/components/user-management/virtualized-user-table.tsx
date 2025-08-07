/**
 * Virtualized User Table Component
 * Component table ảo cho user management với performance optimization
 */

"use client";

import React, { useRef, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
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

import { AdminUser } from "../../types/admin-user";
import { useVirtualUserTable } from "../../hooks/use-virtual-user-table";

/**
 * Virtualized User Table Props
 * Props cho Virtualized User Table component
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
 * Get role badge component
 * Lấy role badge component
 */
function getRoleBadge(role: string) {
  const roleConfig = {
    ADMIN: { label: "Admin", variant: "destructive" as const },
    TEACHER: { label: "Giáo viên", variant: "default" as const },
    TUTOR: { label: "Gia sư", variant: "secondary" as const },
    STUDENT: { label: "Học viên", variant: "outline" as const },
    GUEST: { label: "Khách", variant: "secondary" as const },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.STUDENT;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Get status badge component
 * Lấy status badge component
 */
function getStatusBadge(status: string) {
  const statusConfig = {
    ACTIVE: { label: "Hoạt động", variant: "secondary" as const, icon: Activity },
    SUSPENDED: { label: "Tạm ngưng", variant: "destructive" as const, icon: UserX },
    PENDING_VERIFICATION: { label: "Chờ xác thực", variant: "default" as const, icon: Shield },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

/**
 * Format last login time
 * Format thời gian đăng nhập cuối
 */
function formatLastLogin(lastLoginAt?: string): string {
  if (!lastLoginAt) return "Chưa đăng nhập";

  const date = new Date(lastLoginAt);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)} giờ trước`;
  } else {
    return date.toLocaleDateString("vi-VN");
  }
}

/**
 * User Row Component
 * Component row cho user
 */
interface UserRowProps {
  user: AdminUser;
  style: React.CSSProperties;
  onViewUser?: (user: AdminUser) => void;
  onSuspendUser?: (user: AdminUser) => void;
  onActivateUser?: (user: AdminUser) => void;
  onDeleteUser?: (user: AdminUser) => void;
  onPromoteUser?: (user: AdminUser) => void;
  measureRef?: (element: HTMLElement | null) => void;
}

function UserRow({
  user,
  style,
  onViewUser,
  onSuspendUser,
  onActivateUser,
  onDeleteUser,
  onPromoteUser,
  measureRef,
}: UserRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  // Measure element for dynamic sizing
  useEffect(() => {
    if (measureRef && rowRef.current) {
      measureRef(rowRef.current);
    }
  }, [measureRef, user]);

  return (
    <TableRow ref={rowRef} style={style} className="border-b">
      {/* User Info */}
      <TableCell>
        <div>
          <div className="font-medium">
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : "Chưa cập nhật tên"}
          </div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          {!user.emailVerified && (
            <Badge variant="outline" className="text-xs mt-1">
              Chưa xác thực email
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Role */}
      <TableCell>
        {getRoleBadge(user.role)}
        {user.level && <div className="text-xs text-muted-foreground mt-1">Level {user.level}</div>}
      </TableCell>

      {/* Status */}
      <TableCell>{getStatusBadge(user.status)}</TableCell>

      {/* Last Login */}
      <TableCell>
        <div className="text-sm">{formatLastLogin(user.lastLoginAt)}</div>
        {user.activeSessionsCount > 0 && (
          <div className="text-xs text-muted-foreground">
            {user.activeSessionsCount} phiên hoạt động
          </div>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewUser?.(user)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>

            {user.status === "ACTIVE" ? (
              <DropdownMenuItem onClick={() => onSuspendUser?.(user)} className="text-orange-600">
                <UserX className="mr-2 h-4 w-4" />
                Tạm ngưng
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onActivateUser?.(user)} className="text-green-600">
                <UserCheck className="mr-2 h-4 w-4" />
                Kích hoạt
              </DropdownMenuItem>
            )}

            {user.role !== "ADMIN" && (
              <DropdownMenuItem onClick={() => onPromoteUser?.(user)} className="text-blue-600">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Thăng cấp
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => onDeleteUser?.(user)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

/**
 * Virtualized User Table Component
 * Component table ảo cho user management
 */
export function VirtualizedUserTable({
  users,
  isLoading = false,
  onViewUser,
  onSuspendUser,
  onActivateUser,
  onDeleteUser,
  onPromoteUser,
  containerHeight = 600,
  className = "",
}: VirtualizedUserTableProps) {
  const {
    virtualizer,
    containerRef,
    virtualItems,
    totalSize,
    visibleRange,
    scrollToTop,
    scrollToBottom,
    measureElement,
    isScrolling,
    metrics,
  } = useVirtualUserTable({
    users,
    containerHeight,
    estimateSize: 80,
    overscan: 5,
    enableSmoothScrolling: true,
    enableDynamicSizing: true,
  });

  /**
   * Measure element callback
   * Callback đo element
   */
  const measureElementCallback = useCallback(
    (index: number) => {
      return (element: HTMLElement | null) => {
        if (element) {
          measureElement(index, element);
        }
      };
    },
    [measureElement]
  );

  if (isLoading) {
    return (
      <div className={`border rounded-md ${className}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Đăng nhập cuối</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={`border rounded-md p-8 text-center ${className}`}>
        <p className="text-muted-foreground">Không có người dùng nào</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Table Header */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Đăng nhập cuối</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      {/* Virtual Scrolling Container */}
      <div ref={containerRef} className="overflow-auto" style={{ height: containerHeight }}>
        <div
          style={{
            height: totalSize,
            width: "100%",
            position: "relative",
          }}
        >
          <Table>
            <TableBody>
              {virtualItems.map((virtualItem) => {
                const user = users[virtualItem.index];
                if (!user) return null;

                return (
                  <UserRow
                    key={user.id}
                    user={user}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    onViewUser={onViewUser}
                    onSuspendUser={onSuspendUser}
                    onActivateUser={onActivateUser}
                    onDeleteUser={onDeleteUser}
                    onPromoteUser={onPromoteUser}
                    measureRef={measureElementCallback(virtualItem.index)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Performance Metrics (Development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="p-2 bg-muted text-xs text-muted-foreground border-t">
          <div className="flex justify-between items-center">
            <span>
              Rendering: {metrics.renderedItemsCount}/{metrics.totalItemsCount} items (
              {metrics.renderRatio}%)
            </span>
            <span>Avg Height: {metrics.averageItemHeight}px</span>
            <span>
              Visible: {visibleRange.start}-{visibleRange.end}
            </span>
            {isScrolling && <span className="text-blue-600">Scrolling...</span>}
          </div>
        </div>
      )}

      {/* Scroll Controls */}
      <div className="p-2 border-t flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Hiển thị {Math.min(users.length, metrics.renderedItemsCount)} / {users.length} người dùng
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            disabled={visibleRange.start === 0}
          >
            Đầu trang
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToBottom}
            disabled={visibleRange.end >= users.length - 1}
          >
            Cuối trang
          </Button>
        </div>
      </div>
    </div>
  );
}
