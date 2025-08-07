'use client';

import { 
  Users, 
  UserPlus, 
  UserMinus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Shield,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Settings,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress
} from '@/components/ui';
import { UserRole } from '@/lib/mock-data/types';
import logger from '@/lib/utils/logger';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  enrolledCourses: number;
  completedCourses: number;
  totalProgress: number;
  averageScore: number;
  timeSpent: number; // minutes
  lastActivity: string;
  joinedDate: string;
  permissions: string[];
}

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  enrolledDate: string;
  progress: number;
  lastAccessed: string;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  score?: number;
}

interface UserManagementProps {
  courseId?: string;
}

export function UserManagement({ courseId }: UserManagementProps): JSX.Element {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock data
  const users: User[] = [
    {
      id: 'u1',
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@email.com',
      phone: '0123456789',
      role: UserRole.STUDENT,
      status: 'active',
      enrolledCourses: 3,
      completedCourses: 1,
      totalProgress: 68.5,
      averageScore: 85.2,
      timeSpent: 420,
      lastActivity: '2024-01-16T14:30:00Z',
      joinedDate: '2024-01-01',
      permissions: ['view_courses', 'submit_assignments']
    },
    {
      id: 'u2',
      name: 'Trần Thị Bình',
      email: 'binh.tran@email.com',
      phone: '0987654321',
      role: UserRole.INSTRUCTOR,
      status: 'active',
      enrolledCourses: 0,
      completedCourses: 0,
      totalProgress: 0,
      averageScore: 0,
      timeSpent: 1250,
      lastActivity: '2024-01-16T10:15:00Z',
      joinedDate: '2023-12-15',
      permissions: ['create_courses', 'manage_students', 'grade_assignments']
    },
    {
      id: 'u3',
      name: 'Lê Văn Cường',
      email: 'cuong.le@email.com',
      role: UserRole.STUDENT,
      status: 'inactive',
      enrolledCourses: 2,
      completedCourses: 0,
      totalProgress: 25.8,
      averageScore: 62.1,
      timeSpent: 180,
      lastActivity: '2024-01-10T16:45:00Z',
      joinedDate: '2024-01-05',
      permissions: ['view_courses', 'submit_assignments']
    },
    {
      id: 'u4',
      name: 'Admin System',
      email: 'admin@nynus.edu.vn',
      role: UserRole.ADMIN,
      status: 'active',
      enrolledCourses: 0,
      completedCourses: 0,
      totalProgress: 0,
      averageScore: 0,
      timeSpent: 2400,
      lastActivity: '2024-01-16T15:00:00Z',
      joinedDate: '2023-01-01',
      permissions: ['full_access']
    }
  ];

  const enrollments: Enrollment[] = [
    {
      id: 'e1',
      userId: 'u1',
      courseId: 'c1',
      courseName: 'Toán học lớp 12',
      enrolledDate: '2024-01-01',
      progress: 75.5,
      lastAccessed: '2024-01-16T14:30:00Z',
      status: 'active',
      score: 85.2
    },
    {
      id: 'e2',
      userId: 'u1',
      courseId: 'c2',
      courseName: 'Vật lý cơ bản',
      enrolledDate: '2024-01-05',
      progress: 45.8,
      lastAccessed: '2024-01-15T10:20:00Z',
      status: 'active',
      score: 78.5
    },
    {
      id: 'e3',
      userId: 'u3',
      courseId: 'c1',
      courseName: 'Toán học lớp 12',
      enrolledDate: '2024-01-05',
      progress: 25.8,
      lastAccessed: '2024-01-10T16:45:00Z',
      status: 'paused',
      score: 62.1
    }
  ];

  const roles = [
    { value: 'student', label: 'Học viên', color: 'bg-blue-100 text-blue-800' },
    { value: 'instructor', label: 'Giảng viên', color: 'bg-green-100 text-green-800' },
    { value: 'moderator', label: 'Kiểm duyệt viên', color: 'bg-purple-100 text-purple-800' },
    { value: 'admin', label: 'Quản trị viên', color: 'bg-red-100 text-red-800' }
  ];

  const statuses = [
    { value: 'active', label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Không hoạt động', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'suspended', label: 'Tạm khóa', color: 'bg-red-100 text-red-800' },
    { value: 'pending', label: 'Chờ duyệt', color: 'bg-gray-100 text-gray-800' }
  ];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleInfo = (role: string) => {
    return roles.find(r => r.value === role) || roles[0];
  };

  const getStatusInfo = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete' | 'export') => {
    logger.info(`Bulk action: ${action} for users:`, selectedUsers);
    setSelectedUsers([]);
  };

  const renderUserCard = (user: User) => (
    <Card key={user.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleUserSelect(user.id)}
                className="rounded"
              />
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{user.firstName}</h3>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getRoleInfo(user.role).color}>
                {getRoleInfo(user.role).label}
              </Badge>
              <Badge className={getStatusInfo(user.status).color}>
                {getStatusInfo(user.status).label}
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats for Students */}
          {user.role === UserRole.STUDENT && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">{user.enrolledCourses}</div>
                <div className="text-xs text-blue-700">Khóa học</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">{user.totalProgress}%</div>
                <div className="text-xs text-green-700">Tiến độ</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-600">{user.averageScore}</div>
                <div className="text-xs text-purple-700">Điểm TB</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded">
                <div className="text-lg font-bold text-orange-600">{formatTime(user.timeSpent)}</div>
                <div className="text-xs text-orange-700">Thời gian</div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {user.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {user.phone}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Tham gia: {new Date(user.joinedDate).toLocaleDateString('vi-VN')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Hoạt động: {new Date(user.lastActivity).toLocaleDateString('vi-VN')}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Xem
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3 mr-1" />
              Sửa
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
            {user.status === 'active' ? (
              <Button variant="outline" size="sm">
                <XCircle className="h-3 w-3 mr-1" />
                Tạm khóa
              </Button>
            ) : (
              <Button variant="outline" size="sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                Kích hoạt
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Tất cả vai trò</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setFilterRole('');
              setFilterStatus('');
            }}>
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Đã chọn {selectedUsers.length} người dùng
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Kích hoạt
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Tạm khóa
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất file
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {users.length}
            </div>
            <div className="text-sm text-slate-600">Tổng người dùng</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-slate-600">Đang hoạt động</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {users.filter(u => u.role === UserRole.STUDENT).length}
            </div>
            <div className="text-sm text-slate-600">Học viên</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {users.filter(u => u.role === UserRole.INSTRUCTOR).length}
            </div>
            <div className="text-sm text-slate-600">Giảng viên</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsers.map(renderUserCard)}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Không tìm thấy người dùng nào
            </h3>
            <p className="text-slate-600">
              Thử điều chỉnh bộ lọc hoặc thêm người dùng mới
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderEnrollmentsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-slate-700">Học viên</th>
                  <th className="text-left p-3 font-medium text-slate-700">Khóa học</th>
                  <th className="text-center p-3 font-medium text-slate-700">Tiến độ</th>
                  <th className="text-center p-3 font-medium text-slate-700">Điểm</th>
                  <th className="text-center p-3 font-medium text-slate-700">Trạng thái</th>
                  <th className="text-center p-3 font-medium text-slate-700">Đăng ký</th>
                  <th className="text-center p-3 font-medium text-slate-700">Hoạt động cuối</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => {
                  const user = users.find(u => u.id === enrollment.userId);
                  return (
                    <tr key={enrollment.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{user?.name}</div>
                        <div className="text-sm text-slate-600">{user?.email}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{enrollment.courseName}</div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16">
                            <Progress value={enrollment.progress} className="h-2" />
                          </div>
                          <span className="text-sm">{enrollment.progress}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-medium">{enrollment.score || '-'}</span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={
                          enrollment.status === 'active' ? 'default' :
                          enrollment.status === 'completed' ? 'secondary' :
                          enrollment.status === 'paused' ? 'outline' : 'destructive'
                        }>
                          {enrollment.status === 'active' ? 'Đang học' :
                           enrollment.status === 'completed' ? 'Hoàn thành' :
                           enrollment.status === 'paused' ? 'Tạm dừng' : 'Đã bỏ'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center text-sm text-slate-600">
                        {new Date(enrollment.enrolledDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3 text-center text-sm text-slate-600">
                        {new Date(enrollment.lastAccessed).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
          <p className="text-slate-600">
            Quản lý học viên, giảng viên và quyền truy cập
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Nhập file
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất file
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="enrollments">Đăng ký</TabsTrigger>
          <TabsTrigger value="permissions">Quyền hạn</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {renderUsersTab()}
        </TabsContent>

        <TabsContent value="enrollments">
          {renderEnrollmentsTab()}
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Quản lý quyền hạn
              </h3>
              <p className="text-slate-600">
                Tính năng quản lý quyền hạn sẽ được phát triển trong phiên bản tiếp theo
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
