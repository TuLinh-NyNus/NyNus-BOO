'use client';

import { ArrowLeft, Edit, Save, X, UserCheck, UserX } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Badge } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useToast } from '@/hooks/use-toast';
// ✅ Import mock data instead of API service
import { getUserById } from '@/lib/mockdata/users';
import { AdminUser } from '@/lib/mockdata/types';
import { UserRole, UserStatus } from '@/lib/mockdata/core-types';

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

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'STUDENT' as AdminUser['role'],
    isActive: true,
    adminNotes: '',
  });

  // ✅ Sử dụng mock data thay vì API call
  const fetchUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData = getUserById(id);
      
      if (userData) {
        setUser(userData);
        setEditForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email,
          role: userData.role,
          isActive: userData.status === 'ACTIVE',
          adminNotes: userData.adminNotes || '',
        });
      } else {
        // Mock user nếu không tìm thấy
        const mockUser: AdminUser = {
          id: id,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          password_hash: '$2b$12$mockHashForTestUser',
          level: 1,
          maxConcurrentSessions: 3,
          loginAttempts: 0,
          activeSessionsCount: 1,
          totalResourceAccess: 50,
          lastLoginAt: new Date('2024-01-15T10:30:00Z'),
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-15T10:30:00Z'),
          adminNotes: 'Test user account',
          maxConcurrentIPs: 3,
          profile: {
            bio: 'This is a test user',
            phoneNumber: '0123456789',
            completionRate: 75,
          },
          stats: {
            totalCourses: 0,
            totalLessons: 5,
            totalExamResults: 12,
            averageScore: 7.5,
          },
        };
        
        setUser(mockUser);
        setEditForm({
          firstName: mockUser.firstName || '',
          lastName: mockUser.lastName || '',
          email: mockUser.email,
          role: mockUser.role,
          isActive: mockUser.status === 'ACTIVE',
          adminNotes: mockUser.adminNotes || '',
        });
      }
      
      toast({
        title: 'Thông báo',
        description: 'Đang sử dụng dữ liệu mẫu (Mock Data)',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin người dùng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (params.id) {
      fetchUser(params.id as string);
    }
  }, [params.id, fetchUser]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...editForm } : null);
      setEditing(false);
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin người dùng',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin người dùng',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;

    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role,
      isActive: user.status === 'ACTIVE',
      adminNotes: user.adminNotes || '',
    });
    setEditing(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[50px]" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy người dùng</h2>
          <p className="text-muted-foreground mb-4">
            Người dùng với ID này không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Badge className={roleColors[user.role as keyof typeof roleColors]}>
            {roleLabels[user.role as keyof typeof roleLabels]}
          </Badge>
          <div className="flex items-center gap-2">
            {user.status === 'ACTIVE' ? (
              <UserCheck className="h-4 w-4 text-green-600" />
            ) : (
              <UserX className="h-4 w-4 text-red-600" />
            )}
            <span className={user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>
              {user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'SUSPENDED' ? 'Tạm ngưng' : 'Không hoạt động'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin người dùng</CardTitle>
            <CardDescription>
              Thông tin cơ bản của tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Tên</Label>
                {editing ? (
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md">{user.firstName}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Họ</Label>
                {editing ? (
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md">{user.lastName}</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {editing ? (
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              ) : (
                <div className="p-2 bg-muted rounded-md">{user.email}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              {editing ? (
                <Select
                  value={editForm.role}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value as AdminUser['role'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    <SelectItem value="INSTRUCTOR">Giảng viên</SelectItem>
                    <SelectItem value="STUDENT">Học sinh</SelectItem>
                    <SelectItem value="GUEST">Khách</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                    {roleLabels[user.role as keyof typeof roleLabels]}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Ghi chú admin</Label>
              {editing ? (
                <Textarea
                  id="adminNotes"
                  value={editForm.adminNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Ghi chú của admin về người dùng này..."
                />
              ) : (
                <div className="p-2 bg-muted rounded-md min-h-[80px]">
                  {user.adminNotes || 'Không có ghi chú'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê</CardTitle>
            <CardDescription>
              Thông tin hoạt động và thống kê
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Khóa học đã tạo:</span>
              <span className="font-medium">{user.stats?.totalCourses || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tổng bài học:</span>
              <span className="font-medium">{user.stats?.totalLessons || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Kết quả thi:</span>
              <span className="font-medium">{user.stats?.totalExamResults || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tỷ lệ hoàn thành:</span>
              <span className="font-medium">{user.profile?.completionRate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Ngày tạo:</span>
              <span className="font-medium">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Đăng nhập cuối:</span>
              <span className="font-medium">
                {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Chưa đăng nhập'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
