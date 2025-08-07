'use client';

import { ArrowLeft, Edit, Save, X, UserCheck, UserX, RotateCcw } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { AdvancedProfileManager } from '@/components/features/admin/user-management/advanced-profile-manager';
import { CommunicationTools } from '@/components/features/admin/communication/communication-tools';
import { CourseEnrollmentManager } from '@/components/features/admin/content-management/course-enrollment-manager';
import { IPLimitControls } from '@/components/features/admin/security/ip-limit-controls';
import { PasswordSecurityManager } from '@/components/features/admin/security/password-security-manager';
import { RoleChangeDialog } from '@/components/features/admin/security/role-change-dialog';
import { RoleHistory } from '@/components/features/admin/security/role-history';
import { SessionAnalyticsDashboard } from '@/components/features/admin/monitoring/session-analytics-dashboard';
import { SessionMonitor } from '@/components/features/admin/monitoring/session-monitor';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Skeleton } from "@/components/ui/display/skeleton";
import { useToast } from '@/hooks/use-toast';
import { adminUsersService, AdminUser } from '@/lib/api/admin-users.service';

const roleColors = {
  ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  INSTRUCTOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  STUDENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  GUEST: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const roleLabels = {
  ADMIN: 'Quản trị viên',
  INSTRUCTOR: 'Giảng viên',
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
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'STUDENT' as AdminUser['role'],
    isActive: true,
    adminNotes: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchUser(params.id as string);
    }
  }, [params.id]);

  const fetchUser = async (id: string) => {
    try {
      setLoading(true);
      const userData = await adminUsersService.getUserById(id);
      setUser(userData);
      setEditForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
        adminNotes: userData.adminNotes || '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      
      // Mock data for development
      const mockUser: AdminUser = {
        id: id,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        isActive: true,
        lastLoginAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        adminNotes: 'Test user account',
        maxConcurrentIPs: 3,
        profile: {
          bio: 'This is a test user',
          phoneNumber: '0123456789',
          completionRate: 75,
        },
        stats: {
          totalCourses: 0,
          totalEnrollments: 5,
          totalExamResults: 12,
        },
      };
      
      setUser(mockUser);
      setEditForm({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
        isActive: mockUser.isActive,
        adminNotes: mockUser.adminNotes || '',
      });
      
      toast({
        title: 'Thông báo',
        description: 'Đang sử dụng dữ liệu mẫu (API chưa sẵn sàng)',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      await adminUsersService.updateUser(user.id, editForm);
      
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      adminNotes: user.adminNotes || '',
    });
    setEditing(false);
  };

  const handleRoleChanged = (updatedUser: AdminUser) => {
    setUser(updatedUser);
    setEditForm(prev => ({ ...prev, role: updatedUser.role }));
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
          <Badge className={(roleColors as any)[user.role]}>
            {(roleLabels as any)[user.role]}
          </Badge>
          <div className="flex items-center gap-2">
            {user.isActive ? (
              <UserCheck className="h-4 w-4 text-green-600" />
            ) : (
              <UserX className="h-4 w-4 text-red-600" />
            )}
            <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
              {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
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

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="advanced-profile">Profile nâng cao</TabsTrigger>
          <TabsTrigger value="courses">Khóa học</TabsTrigger>
          <TabsTrigger value="communication">Giao tiếp</TabsTrigger>
          <TabsTrigger value="role-history">Lịch sử vai trò</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="session-analytics">Session Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
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
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
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
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
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
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
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
                      <Badge className={(roleColors as any)[user.role]}>
                        {(roleLabels as any)[user.role]}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRoleDialogOpen(true)}
                      >
                        Thay đổi vai trò
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Ghi chú admin</Label>
                  {editing ? (
                    <Textarea
                      id="adminNotes"
                      value={editForm.adminNotes}
                      onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
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
                  <span className="text-sm">Đăng ký học:</span>
                  <span className="font-medium">{user.stats?.totalEnrollments || 0}</span>
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
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ cá nhân</CardTitle>
              <CardDescription>
                Thông tin chi tiết về hồ sơ người dùng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tiểu sử</Label>
                <div className="p-2 bg-muted rounded-md min-h-[80px]">
                  {user.profile?.bio || 'Chưa có thông tin'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <div className="p-2 bg-muted rounded-md">
                  {user.profile?.phoneNumber || 'Chưa có thông tin'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced-profile" className="space-y-4">
          <AdvancedProfileManager user={user} onProfileUpdated={setUser} />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <CourseEnrollmentManager user={user} />
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <CommunicationTools user={user} />
        </TabsContent>

        <TabsContent value="role-history" className="space-y-4">
          <RoleHistory user={user} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoạt động</CardTitle>
              <CardDescription>
                Các hoạt động gần đây của người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Chức năng đang được phát triển
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-6">
            <PasswordSecurityManager user={user} />
            <IPLimitControls
              user={user}
              onUpdate={(newLimit) => {
                setUser(prev => prev ? { ...prev, maxConcurrentIPs: newLimit } : null);
              }}
            />
            <SessionMonitor user={user} />
          </div>
        </TabsContent>

        <TabsContent value="session-analytics" className="space-y-4">
          <SessionAnalyticsDashboard />
        </TabsContent>
      </Tabs>

      {/* Role Change Dialog */}
      {user && (
        <RoleChangeDialog
          user={user}
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          onRoleChanged={handleRoleChanged}
        />
      )}
    </div>
  );
}
