'use client';

import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, UserCheck, UserX, Eye, Users, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Skeleton } from "@/components/ui/display/skeleton";
import { Input } from "@/components/ui/form/input";
import { useToast } from '@/hooks/use-toast';
import { adminUsersService, AdminUser, AdminUserListResponse } from '@/lib/api/admin-users.service';

// Use types from service
type User = AdminUser;
type UserListResponse = AdminUserListResponse;

const roleColors = {
  ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  TEACHER: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  TUTOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  STUDENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  GUEST: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

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

  // Mock data for development
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@nynus.edu.vn',
      firstName: 'Admin',
      lastName: 'System',
      role: 'ADMIN',
      isActive: true,
      lastLoginAt: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      profile: {
        completionRate: 100,
        phoneNumber: '0123456789',
      },
      maxConcurrentIPs: 5,
      stats: {
        totalCourses: 0,
        totalEnrollments: 0,
        totalExamResults: 0,
      },
    },
    {
      id: '2',
      email: 'teacher@nynus.edu.vn',
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      role: 'INSTRUCTOR',
      isActive: true,
      lastLoginAt: '2024-01-14T15:20:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-14T15:20:00Z',
      profile: {
        completionRate: 85,
        bio: 'Giảng viên toán học',
      },
      maxConcurrentIPs: 5,
      stats: {
        totalCourses: 5,
        totalEnrollments: 0,
        totalExamResults: 0,
      },
    },
    {
      id: '3',
      email: 'student@nynus.edu.vn',
      firstName: 'Trần',
      lastName: 'Thị B',
      role: 'STUDENT',
      isActive: true,
      lastLoginAt: '2024-01-15T08:45:00Z',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-15T08:45:00Z',
      profile: {
        completionRate: 65,
      },
      maxConcurrentIPs: 5,
      stats: {
        totalCourses: 0,
        totalEnrollments: 3,
        totalExamResults: 12,
      },
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminUsersService.getUsers({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        isActive: filters.isActive ? filters.isActive === 'true' : undefined,
      });

      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);

      // Fallback to mock data for development
      setUsers(mockUsers);
      setPagination(prev => ({
        ...prev,
        total: mockUsers.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }));

      toast({
        title: 'Thông báo',
        description: 'Đang sử dụng dữ liệu mẫu (API chưa sẵn sàng)',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
                  onChange={(e) => handleSearch(e.target.value)}
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
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={(roleColors as any)[user.role]}>
                        {(roleLabels as any)[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {user.isActive ? (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <UserX className="h-4 w-4 text-red-600" />
                        )}
                        <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                          {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
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
                            className={user.isActive ? 'text-orange-600' : 'text-green-600'}
                          >
                            {user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
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
