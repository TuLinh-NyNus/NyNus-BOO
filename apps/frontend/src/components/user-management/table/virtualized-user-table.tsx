'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/form/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/overlay/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  Shield,
  AlertTriangle,
  Clock,
  Globe,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { AdminUser } from '@/lib/mockdata/types';
import { UserRole, UserStatus } from '@/lib/mockdata/core-types';
import { UserTableLoading, UserErrorState } from '../loading';

// ===== INTERFACES =====

/**
 * Props cho VirtualizedUserTable component
 */
interface VirtualizedUserTableProps {
  users: AdminUser[];                                           // Danh sách users để hiển thị
  isLoading?: boolean;                                          // Đang loading
  error?: string | null;                                        // Error message nếu có
  selectedUsers?: string[];                                     // IDs của users được chọn
  onSelectionChange?: (selectedIds: string[]) => void;         // Callback khi selection thay đổi
  onViewUser?: (user: AdminUser) => void;                      // Callback khi view user
  onEditUser?: (user: AdminUser) => void;                      // Callback khi edit user
  onSuspendUser?: (user: AdminUser) => void;                   // Callback khi suspend user
  onActivateUser?: (user: AdminUser) => void;                  // Callback khi activate user
  onDeleteUser?: (user: AdminUser) => void;                    // Callback khi delete user
  onPromoteUser?: (user: AdminUser) => void;                   // Callback khi promote user
  containerHeight?: number;                                     // Chiều cao container (default: 600)
  pageSize?: number;                                            // Số users mỗi trang (default: 50)
  className?: string;
}

/**
 * Column definition cho table
 */
interface TableColumn {
  key: string;
  label: string;
  width: string;
  sortable?: boolean;
}

// ===== CONSTANTS =====

/**
 * Table columns definition
 */
const TABLE_COLUMNS: TableColumn[] = [
  { key: 'select', label: '', width: 'w-12' },
  { key: 'stt', label: 'STT', width: 'w-16' },
  { key: 'user', label: 'Người dùng', width: 'w-64', sortable: true },
  { key: 'role', label: 'Vai trò', width: 'w-32', sortable: true },
  { key: 'status', label: 'Trạng thái', width: 'w-40', sortable: true },
  { key: 'security', label: 'Bảo mật', width: 'w-40' },
  { key: 'activity', label: 'Hoạt động', width: 'w-40' },
  { key: 'actions', label: 'Thao tác', width: 'w-24' },
];

/**
 * Role colors mapping - Dark theme compatible
 */
const ROLE_COLORS = {
  [UserRole.GUEST]: 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground',
  [UserRole.STUDENT]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [UserRole.TUTOR]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  [UserRole.TEACHER]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [UserRole.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

/**
 * Role labels mapping
 */
const ROLE_LABELS = {
  [UserRole.GUEST]: 'Khách',
  [UserRole.STUDENT]: 'Học sinh',
  [UserRole.TUTOR]: 'Gia sư',
  [UserRole.TEACHER]: 'Giáo viên',
  [UserRole.ADMIN]: 'Quản trị viên',
};

/**
 * Status colors mapping - Dark theme compatible
 */
const STATUS_COLORS = {
  [UserStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [UserStatus.INACTIVE]: 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground',
  [UserStatus.SUSPENDED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [UserStatus.PENDING_VERIFICATION]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

/**
 * Status labels mapping
 */
const STATUS_LABELS = {
  [UserStatus.ACTIVE]: 'Hoạt động',
  [UserStatus.INACTIVE]: 'Không hoạt động',
  [UserStatus.SUSPENDED]: 'Tạm ngưng',
  [UserStatus.PENDING_VERIFICATION]: 'Chờ xác thực',
};

// ===== HELPER FUNCTIONS =====

/**
 * Format date cho hiển thị
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'Chưa có';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format risk score với color - Dark theme compatible
 */
function formatRiskScore(score: number | undefined): { text: string; color: string } {
  if (score === undefined || score === null) {
    return { text: 'N/A', color: 'text-muted-foreground' };
  }

  if (score <= 30) {
    return { text: score.toString(), color: 'text-green-600 dark:text-green-400' };
  } else if (score <= 70) {
    return { text: score.toString(), color: 'text-yellow-600 dark:text-yellow-400' };
  } else {
    return { text: score.toString(), color: 'text-red-600 dark:text-red-400' };
  }
}

/**
 * Get user display name
 */
function getUserDisplayName(user: AdminUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || user.email.split('@')[0];
}

/**
 * Get user avatar initials
 */
function getUserInitials(user: AdminUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }
  const name = user.username || user.email.split('@')[0];
  return name.substring(0, 2).toUpperCase();
}

// ===== MAIN COMPONENT =====

/**
 * Virtualized User Table Component với Enhanced User Model support
 * Hiển thị danh sách users với virtual scrolling và advanced features
 */
export function VirtualizedUserTable({
  users,
  isLoading = false,
  error = null,
  selectedUsers = [],
  onSelectionChange,
  onViewUser,
  onEditUser,
  onSuspendUser,
  onActivateUser,
  onDeleteUser,
  onPromoteUser,
  containerHeight = 600,
  pageSize = 50,
  className = ''
}: VirtualizedUserTableProps) {
  // ===== STATES =====
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ===== COMPUTED VALUES =====

  /**
   * Reset to page 1 when users list changes
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  /**
   * Sorted users based on current sort settings
   */
  const sortedUsers = useMemo(() => {
    if (!sortColumn) return users;

    return [...users].sort((a, b) => {
      let aValue: string | UserRole | UserStatus;
      let bValue: string | UserRole | UserStatus;

      switch (sortColumn) {
        case 'user':
          aValue = getUserDisplayName(a).toLowerCase();
          bValue = getUserDisplayName(b).toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortColumn, sortDirection]);

  /**
   * Pagination calculations
   */
  const paginationData = useMemo(() => {
    const totalUsers = sortedUsers.length;
    const totalPages = Math.ceil(totalUsers / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalUsers);
    const currentPageUsers = sortedUsers.slice(startIndex, endIndex);

    return {
      totalUsers,
      totalPages,
      startIndex,
      endIndex,
      currentPageUsers,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [sortedUsers, currentPage, pageSize]);

  /**
   * Check if all users on current page are selected
   */
  const isAllSelected = useMemo(() => {
    const currentPageUserIds = paginationData.currentPageUsers.map(user => user.id);
    return currentPageUserIds.length > 0 && currentPageUserIds.every(id => selectedUsers.includes(id));
  }, [paginationData.currentPageUsers, selectedUsers]);

  /**
   * Check if some users on current page are selected
   */
  const isSomeSelected = useMemo(() => {
    const currentPageUserIds = paginationData.currentPageUsers.map(user => user.id);
    const selectedOnPage = currentPageUserIds.filter(id => selectedUsers.includes(id));
    return selectedOnPage.length > 0 && selectedOnPage.length < currentPageUserIds.length;
  }, [paginationData.currentPageUsers, selectedUsers]);

  // ===== EVENT HANDLERS =====

  /**
   * Handle select all checkbox (only for current page)
   */
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    const currentPageUserIds = paginationData.currentPageUsers.map(user => user.id);

    if (isAllSelected) {
      // Deselect all users on current page
      const newSelection = selectedUsers.filter(id => !currentPageUserIds.includes(id));
      onSelectionChange(newSelection);
    } else {
      // Select all users on current page
      const newSelection = [...new Set([...selectedUsers, ...currentPageUserIds])];
      onSelectionChange(newSelection);
    }
  }, [isAllSelected, paginationData.currentPageUsers, selectedUsers, onSelectionChange]);

  /**
   * Handle individual user selection
   */
  const handleUserSelect = useCallback((userId: string) => {
    if (!onSelectionChange) return;

    if (selectedUsers.includes(userId)) {
      onSelectionChange(selectedUsers.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedUsers, userId]);
    }
  }, [selectedUsers, onSelectionChange]);

  /**
   * Handle column sort
   */
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  /**
   * Handle user action
   */
  const handleUserAction = useCallback((action: string, user: AdminUser) => {
    switch (action) {
      case 'view':
        onViewUser?.(user);
        break;
      case 'edit':
        onEditUser?.(user);
        break;
      case 'suspend':
        onSuspendUser?.(user);
        break;
      case 'activate':
        onActivateUser?.(user);
        break;
      case 'delete':
        onDeleteUser?.(user);
        break;
      case 'promote':
        onPromoteUser?.(user);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }, [onViewUser, onEditUser, onSuspendUser, onActivateUser, onDeleteUser, onPromoteUser]);

  /**
   * Pagination handlers
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1));
  }, [paginationData.totalPages]);

  const handleLastPage = useCallback(() => {
    setCurrentPage(paginationData.totalPages);
  }, [paginationData.totalPages]);

  // ===== RENDER HELPERS =====

  /**
   * Render user info cell
   */
  const renderUserCell = useCallback((user: AdminUser) => {
    return (
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {getUserInitials(user)}
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-foreground truncate">
            {getUserDisplayName(user)}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {user.email}
          </div>
          {user.username && (
            <div className="text-xs text-muted-foreground/70 truncate">
              @{user.username}
            </div>
          )}
        </div>
      </div>
    );
  }, []);

  /**
   * Render role cell với level
   */
  const renderRoleCell = useCallback((user: AdminUser) => {
    const roleLabel = ROLE_LABELS[user.role];
    const roleColor = ROLE_COLORS[user.role];
    
    return (
      <div className="space-y-1">
        <Badge className={`${roleColor} text-xs`}>
          {roleLabel}
        </Badge>
        {user.level && (
          <div className="text-xs text-muted-foreground">
            Level {user.level}
          </div>
        )}
      </div>
    );
  }, []);

  /**
   * Render status cell với email verification
   */
  const renderStatusCell = useCallback((user: AdminUser) => {
    const statusLabel = STATUS_LABELS[user.status];
    const statusColor = STATUS_COLORS[user.status];

    return (
      <div className="flex flex-col gap-1">
        <Badge className={`${statusColor} text-xs whitespace-nowrap`}>
          {statusLabel}
        </Badge>
        <div className="flex items-center text-xs whitespace-nowrap">
          {user.emailVerified ? (
            <span className="text-green-600">✓ Email xác thực</span>
          ) : (
            <span className="text-red-600">✗ Chưa xác thực</span>
          )}
        </div>
      </div>
    );
  }, []);

  /**
   * Render security info cell
   */
  const renderSecurityCell = useCallback((user: AdminUser) => {
    const riskScore = formatRiskScore(user.riskScore);
    
    return (
      <div className="space-y-1 text-xs">
        {/* Risk Score */}
        <div className="flex items-center space-x-1">
          <AlertTriangle className="h-3 w-3" />
          <span className={riskScore.color}>
            Risk: {riskScore.text}
          </span>
        </div>
        
        {/* Active Sessions */}
        <div className="flex items-center space-x-1">
          <Shield className="h-3 w-3" />
          <span className="text-muted-foreground">
            Sessions: {user.activeSessionsCount}
          </span>
        </div>

        {/* Last IP */}
        {user.lastLoginIp && (
          <div className="flex items-center space-x-1">
            <Globe className="h-3 w-3" />
            <span className="text-muted-foreground truncate">
              {user.lastLoginIp}
            </span>
          </div>
        )}
      </div>
    );
  }, []);

  /**
   * Render activity info cell
   */
  const renderActivityCell = useCallback((user: AdminUser) => {
    return (
      <div className="space-y-1 text-xs">
        {/* Last Login */}
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span className="text-muted-foreground">
            {formatDate(user.lastLoginAt)}
          </span>
        </div>

        {/* Resource Access */}
        <div className="flex items-center space-x-1">
          <TrendingUp className="h-3 w-3" />
          <span className="text-muted-foreground">
            Access: {user.totalResourceAccess}
          </span>
        </div>
      </div>
    );
  }, []);

  /**
   * Render actions cell
   */
  const renderActionsCell = useCallback((user: AdminUser) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleUserAction('view', user)}
            className="text-white hover:text-white focus:text-white hover:bg-slate-700 focus:bg-slate-700"
            style={{ color: '#F5F8FA' }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleUserAction('edit', user)}
            className="text-yellow-400 hover:text-yellow-300 focus:text-yellow-300 hover:bg-slate-700 focus:bg-slate-700"
            style={{ color: '#EEB70B' }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </DropdownMenuItem>
          <div className="border-t my-1" />
          {user.status === UserStatus.ACTIVE ? (
            <DropdownMenuItem 
              onClick={() => handleUserAction('suspend', user)}
              className="text-orange-600"
            >
              <UserX className="h-4 w-4 mr-2" />
              Tạm ngưng
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => handleUserAction('activate', user)}
              className="text-green-600"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Kích hoạt
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handleUserAction('promote', user)}>
            <Shield className="h-4 w-4 mr-2" />
            Thăng cấp
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleUserAction('delete', user)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [handleUserAction]);

  // ===== RENDER =====

  // Loading state
  if (isLoading) {
    return <UserTableLoading className={className} />;
  }

  // Error state
  if (error) {
    return <UserErrorState error={error} className={className} />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Danh sách người dùng ({paginationData.totalUsers})</h3>
        {selectedUsers.length > 0 && (
          <Badge variant="secondary">
            Đã chọn: {selectedUsers.length}
          </Badge>
        )}
      </div>

      {/* Table Container with Fixed Header */}
      <div
        className="border rounded-lg overflow-hidden"
        style={{
          height: containerHeight,
          maxHeight: '80vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Fixed Header */}
        <div
          className="bg-background border-b-2 border-border"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: 'hsl(var(--background))',
            borderBottom: '2px solid hsl(var(--border))',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-background hover:bg-background">
                {TABLE_COLUMNS.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`${column.width} ${column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''} font-semibold bg-background`}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    {column.key === 'select' ? (
                      <Checkbox
                        checked={isAllSelected || isSomeSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    ) : column.key === 'stt' ? (
                      <div className="text-center">
                        <span>{column.label}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {column.sortable && sortColumn === column.key && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Scrollable Body */}
        <div
          className="flex-1 overflow-auto"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <Table>
            <TableBody>
              {paginationData.currentPageUsers.map((user, index) => {
                const stt = (currentPage - 1) * pageSize + index + 1;
                return (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    {/* Selection */}
                    <TableCell className="w-12">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserSelect(user.id)}
                      />
                    </TableCell>

                    {/* STT */}
                    <TableCell className="w-16 text-center text-sm text-muted-foreground">
                      {stt}
                    </TableCell>

                    {/* User Info */}
                    <TableCell className="w-64">
                      {renderUserCell(user)}
                    </TableCell>

                    {/* Role */}
                    <TableCell className="w-32">
                      {renderRoleCell(user)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="w-40">
                      {renderStatusCell(user)}
                    </TableCell>

                    {/* Security */}
                    <TableCell className="w-40">
                      {renderSecurityCell(user)}
                    </TableCell>

                    {/* Activity */}
                    <TableCell className="w-40">
                      {renderActivityCell(user)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="w-32">
                      {renderActionsCell(user)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {paginationData.totalUsers === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">Không có người dùng nào</div>
              <div className="text-sm text-muted-foreground/70">
                Thử thay đổi bộ lọc hoặc tìm kiếm
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {paginationData.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          {/* Pagination Info */}
          <div className="text-sm text-muted-foreground">
            Hiển thị {paginationData.startIndex + 1}-{paginationData.endIndex} trong tổng số {paginationData.totalUsers} người dùng
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-2">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFirstPage}
              disabled={!paginationData.hasPrevPage}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={!paginationData.hasPrevPage}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {(() => {
                const { totalPages } = paginationData;
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                const pages = [];
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={i === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i)}
                      className="h-8 w-8 p-0"
                    >
                      {i}
                    </Button>
                  );
                }
                return pages;
              })()}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!paginationData.hasNextPage}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLastPage}
              disabled={!paginationData.hasNextPage}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
