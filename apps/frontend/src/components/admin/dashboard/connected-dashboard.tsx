/**
 * Connected Admin Dashboard
 * Admin dashboard component kết nối với backend gRPC services
 */

'use client';

import React, { useState } from 'react';
import { useAdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { UserRole, UserStatus } from '@/lib/types/user/roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  UserCheck,
  AlertTriangle,
  Activity,
  Eye,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  Ban,
  CheckCircle
} from 'lucide-react';

/**
 * Stats Card Component
 */
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function StatsCard({ title, value, icon, description, trend = 'neutral' }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description && (
          <p className={`text-xs ${trendColors[trend]} mt-1`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * User Role Badge Component
 */
function UserRoleBadge({ role }: { role: UserRole }) {
  const roleConfig = {
    [UserRole.ADMIN]: { label: 'Admin', variant: 'destructive' as const },
    [UserRole.TEACHER]: { label: 'Teacher', variant: 'default' as const },
    [UserRole.TUTOR]: { label: 'Tutor', variant: 'secondary' as const },
    [UserRole.STUDENT]: { label: 'Student', variant: 'outline' as const },
    [UserRole.GUEST]: { label: 'Guest', variant: 'outline' as const }
  };

  const config = roleConfig[role] || roleConfig[UserRole.GUEST];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * User Status Badge Component
 */
function UserStatusBadge({ status }: { status: UserStatus }) {
  const statusConfig = {
    [UserStatus.ACTIVE]: { label: 'Active', variant: 'default' as const },
    [UserStatus.INACTIVE]: { label: 'Inactive', variant: 'secondary' as const },
    [UserStatus.SUSPENDED]: { label: 'Suspended', variant: 'destructive' as const },
    [UserStatus.PENDING]: { label: 'Pending', variant: 'outline' as const },
    [UserStatus.DELETED]: { label: 'Deleted', variant: 'destructive' as const },
    [UserStatus.PENDING_VERIFICATION]: { label: 'Pending', variant: 'outline' as const }
  };

  const config = statusConfig[status] || statusConfig[UserStatus.PENDING_VERIFICATION];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Main Connected Dashboard Component
 */
export function ConnectedAdminDashboard() {
  const { toast } = useToast();
  const {
    stats,
    statsLoading,
    statsError,
    refreshStats,
    users,
    usersLoading,
    usersError,
    usersPagination,
    loadUsers,
    updateUserStatus,
    deleteUser
  } = useAdminDashboard();

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [statusFilter, setStatusFilter] = useState<UserStatus | undefined>();

  /**
   * Handle search and filter
   */
  const handleSearch = () => {
    loadUsers({
      search: searchQuery,
      role: roleFilter,
      status: statusFilter,
      page: 1
    });
  };

  /**
   * Handle user status update
   */
  const handleUpdateStatus = async (userId: string, newStatus: UserStatus) => {
    const success = await updateUserStatus(userId, newStatus);
    if (success) {
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật trạng thái người dùng',
      });
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái người dùng',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle user deletion
   */
  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      toast({
        title: 'Thành công',
        description: 'Đã xóa người dùng',
      });
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa người dùng',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Quản lý hệ thống và giám sát hoạt động
          </p>
        </div>
        <Button onClick={refreshStats} disabled={statsLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      {statsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Lỗi tải thống kê: {statsError}</p>
          </CardContent>
        </Card>
      )}

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Tổng người dùng"
            value={stats.totalUsers}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            description="Tất cả người dùng trong hệ thống"
          />
          <StatsCard
            title="Người dùng hoạt động"
            value={stats.activeUsers}
            icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
            description="Đang online hoặc hoạt động gần đây"
          />
          <StatsCard
            title="Phiên đăng nhập"
            value={stats.totalSessions}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            description="Tổng số phiên đăng nhập hiện tại"
          />
          <StatsCard
            title="Cảnh báo bảo mật"
            value={stats.securityAlerts}
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
            description="Cần xem xét và xử lý"
            trend="down"
          />
        </div>
      )}

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quản lý người dùng</CardTitle>
          <CardDescription>
            Xem và quản lý tất cả người dùng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo email, tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole || undefined)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả vai trò</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                <SelectItem value={UserRole.TUTOR}>Tutor</SelectItem>
                <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatus || undefined)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả trạng thái</SelectItem>
                <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={usersLoading}>
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm
            </Button>
          </div>

          {/* Users Table */}
          {usersError && (
            <div className="text-red-600 mb-4">
              Lỗi tải danh sách người dùng: {usersError}
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                      <TableCell>
                        <UserRoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <UserStatusBadge status={user.status} />
                      </TableCell>
                      <TableCell>{user.level || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.status === UserStatus.ACTIVE ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(user.id, UserStatus.SUSPENDED)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(user.id, UserStatus.ACTIVE)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {usersPagination && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {users.length} trong tổng số {usersPagination.total} người dùng
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadUsers({ page: usersPagination.page - 1 })}
                  disabled={usersPagination.page <= 1}
                >
                  Trước
                </Button>
                <div className="text-sm">
                  Trang {usersPagination.page} / {usersPagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadUsers({ page: usersPagination.page + 1 })}
                  disabled={usersPagination.page >= usersPagination.totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký Audit</CardTitle>
          <CardDescription>
            Theo dõi tất cả hoạt động quan trọng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Audit logs sẽ được hiển thị ở đây khi backend hoàn thành implementation.
          </div>
        </CardContent>
      </Card>

      {/* Resource Access Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Giám sát truy cập tài nguyên</CardTitle>
          <CardDescription>
            Theo dõi các hoạt động truy cập tài nguyên đáng nghi ngờ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Resource access monitoring sẽ được hiển thị ở đây khi backend hoàn thành implementation.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
