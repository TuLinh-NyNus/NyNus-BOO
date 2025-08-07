'use client';

import React from 'react';

import { Plus, Search, MoreHorizontal, Edit, Trash2, UserCheck, UserX, Eye, Users, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { Badge } from "@/components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { Input } from "@/components/ui";
import { useToast } from '@/hooks/use-toast';
// ✅ Import mock data instead of API service
import { getMockUsersResponse } from '@/lib/mockdata/users';
import { AdminUser } from '@/lib/mockdata/types';
import { UserRole, UserStatus } from '@/lib/mockdata/core-types';

// Use types from mock data
type User = AdminUser;

// ✅ Role colors mapping với Enhanced User Model
const roleColors = {
  ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  TEACHER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  TUTOR: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  STUDENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  GUEST: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

// ✅ Role labels mapping với Enhanced User Model
const roleLabels = {
  ADMIN: 'Quản trị viên',
  TEACHER: 'Giáo viên',
  TUTOR: 'Gia sư',
  STUDENT: 'Học sinh',
  GUEST: 'Khách',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { toast } = useToast();

  // ✅ Sử dụng mock data thay vì API call
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockResponse = getMockUsersResponse(
        pagination.page,
        pagination.limit,
        {
          role: filters.role ? filters.role as UserRole : undefined,
          status: filters.isActive ? (filters.isActive === 'true' ? UserStatus.ACTIVE : UserStatus.INACTIVE) : undefined,
          search: filters.search || undefined,
        }
      );

      if (mockResponse.success && mockResponse.data) {
        setUsers(mockResponse.data.users);
        setPagination(mockResponse.data.pagination);
      }

      toast({
        title: 'Thông báo',
        description: 'Đang sử dụng dữ liệu mẫu (Mock Data)',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách người dùng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRoleFilter = (value: string) => {
    setFilters(prev => ({ ...prev, role: value === 'all' ? '' : value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, isActive: value === 'all' ? '' : value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ✅ Routing paths cho /3141592654/admin/users/
  const handleUserAction = (action: string, userId: string) => {
    switch (action) {
      case 'view':
        router.push(`/3141592654/admin/users/${userId}`);
        break;
      case 'edit':
        router.push(`/3141592654/admin/users/${userId}`);
        break;
      default:
        toast({
          title: 'Thông báo',
          description: `Chức năng ${action} đang được phát triển`,
        });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Desktop buttons */}
          <Button
            variant="outline"
            onClick={() => router.push('/3141592654/admin/users/bulk-operations')}
            className="hidden sm:flex"
          >
            <Users className="mr-2 h-4 w-4" />
            Thao tác hàng loạt
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/3141592654/admin/users/permissions')}
            className="hidden sm:flex"
          >
            <Settings className="mr-2 h-4 w-4" />
            Quản lý quyền
          </Button>

          {/* Mobile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="sm:hidden">
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quản lý Users</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/3141592654/admin/users/bulk-operations')}>
                <Users className="mr-2 h-4 w-4" />
                Thao tác hàng loạt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/3141592654/admin/users/permissions')}>
                <Settings className="mr-2 h-4 w-4" />
                Quản lý quyền
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Thêm người dùng</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc danh sách người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={filters.search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filters.role || 'all'} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                <SelectItem value="TEACHER">Giáo viên</SelectItem>
                <SelectItem value="TUTOR">Gia sư</SelectItem>
                <SelectItem value="STUDENT">Học sinh</SelectItem>
                <SelectItem value="GUEST">Khách</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.isActive || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Tổng cộng {pagination.total} người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đăng nhập cuối</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[40px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName || 'Unknown'} {user.lastName || 'User'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                        {roleLabels[user.role as keyof typeof roleLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {user.status === 'ACTIVE' ? (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <UserX className="h-4 w-4 text-red-600" />
                        )}
                        <span className={user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>
                          {user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'SUSPENDED' ? 'Tạm ngưng' : 'Không hoạt động'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Chưa đăng nhập'}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleUserAction('view', user.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction('edit', user.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleUserAction('toggle-status', user.id)}
                            className={user.status === 'ACTIVE' ? 'text-orange-600' : 'text-green-600'}
                          >
                            {user.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUserAction('delete', user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

