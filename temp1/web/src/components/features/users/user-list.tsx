'use client';

import { 
  Search, 
  Filter, 
  Users, 
  Mail, 
  Calendar,
  MoreHorizontal,
  UserCheck,
  UserX,
  Edit
} from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/display/avatar";
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Input } from "@/components/ui/form/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * User List Component
 * 
 * Component hiển thị danh sách người dùng với:
 * - Tìm kiếm và lọc người dùng
 * - Hiển thị thông tin người dùng
 * - Quản lý trạng thái người dùng
 * - Phân trang
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'INSTRUCTOR' | 'STUDENT' | 'GUEST';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  coursesCount?: number;
}

function UserRow({ user }: { user: User }): JSX.Element {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'TEACHER': return 'default';
      case 'INSTRUCTOR': return 'secondary';
      case 'STUDENT': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'INACTIVE': return 'secondary';
      case 'SUSPENDED': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'TEACHER': return 'Giáo viên';
      case 'INSTRUCTOR': return 'Giảng viên';
      case 'STUDENT': return 'Học sinh';
      case 'GUEST': return 'Khách';
      default: return role;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'INACTIVE': return 'Không hoạt động';
      case 'SUSPENDED': return 'Bị khóa';
      default: return status;
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.firstName} />
            <AvatarFallback>{user.firstName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.firstName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getRoleColor(user.role)}>
          {getRoleText(user.role)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusColor(user.status)}>
          {getStatusText(user.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}
      </TableCell>
      <TableCell className="text-center">
        {user.coursesCount || 0}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function UserList(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Mock data - trong thực tế sẽ fetch từ API
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Nguyễn Văn Admin',
      email: 'admin@nynus.edu.vn',
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: '2024-01-15T00:00:00Z',
      lastLogin: '2024-06-15T10:30:00Z',
      coursesCount: 0,
          maxConcurrentIPs: 5},
    {
      id: '2',
      name: 'Trần Thị Giáo Viên',
      email: 'teacher@nynus.edu.vn',
      role: 'TEACHER',
      status: 'ACTIVE',
      createdAt: '2024-02-01T00:00:00Z',
      lastLogin: '2024-06-14T14:20:00Z',
      coursesCount: 12,
    },
    {
      id: '3',
      name: 'Lê Văn Giảng Viên',
      email: 'instructor@nynus.edu.vn',
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      createdAt: '2024-02-15T00:00:00Z',
      lastLogin: '2024-06-13T09:15:00Z',
      coursesCount: 8,
          maxConcurrentIPs: 5},
    {
      id: '4',
      name: 'Phạm Thị Học Sinh',
      email: 'student1@nynus.edu.vn',
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: '2024-03-01T00:00:00Z',
      lastLogin: '2024-06-15T16:45:00Z',
      coursesCount: 5,
          maxConcurrentIPs: 5},
    {
      id: '5',
      name: 'Hoàng Văn Học Sinh 2',
      email: 'student2@nynus.edu.vn',
      role: 'STUDENT',
      status: 'INACTIVE',
      createdAt: '2024-03-15T00:00:00Z',
      lastLogin: '2024-05-20T11:30:00Z',
      coursesCount: 2,
          maxConcurrentIPs: 5},
    {
      id: '6',
      name: 'Vũ Thị Học Sinh 3',
      email: 'student3@nynus.edu.vn',
      role: 'STUDENT',
      status: 'SUSPENDED',
      createdAt: '2024-04-01T00:00:00Z',
      lastLogin: '2024-04-15T08:20:00Z',
      coursesCount: 1,
          maxConcurrentIPs: 5},
  ];

  const roles = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'ADMIN', label: 'Quản trị viên' },
    { value: 'TEACHER', label: 'Giáo viên' },
    { value: 'INSTRUCTOR', label: 'Giảng viên' },
    { value: 'STUDENT', label: 'Học sinh' },
    { value: 'GUEST', label: 'Khách' },
  ];

  const statuses = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'INACTIVE', label: 'Không hoạt động' },
    { value: 'SUSPENDED', label: 'Bị khóa' },
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesStatus = !selectedStatus || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'ACTIVE').length,
    inactive: mockUsers.filter(u => u.status === 'INACTIVE').length,
    suspended: mockUsers.filter(u => u.status === 'SUSPENDED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý tài khoản và quyền người dùng</p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Không hoạt động</CardTitle>
            <UserX className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bị khóa</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            {filteredUsers.length} người dùng được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Đăng nhập cuối</TableHead>
                <TableHead className="text-center">Khóa học</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Default export for lazy loading
export default UserList;
