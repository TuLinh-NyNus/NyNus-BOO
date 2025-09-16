'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  School,
  Calendar,
  Shield,
  Monitor,
  Smartphone,
  Globe,
  LogOut,
  Edit,
  Save,
  X
} from 'lucide-react';

// Mock sessions data
const mockSessions = [
  {
    id: '1',
    device: 'Chrome on Windows',
    deviceType: 'desktop',
    ipAddress: '192.168.1.100',
    location: 'Hà Nội, Việt Nam',
    lastActivity: new Date('2025-09-14T18:00:00'),
    current: true,
  },
  {
    id: '2', 
    device: 'Safari on iPhone',
    deviceType: 'mobile',
    ipAddress: '192.168.1.101',
    location: 'Hà Nội, Việt Nam',
    lastActivity: new Date('2025-09-14T16:30:00'),
    current: false,
  },
  {
    id: '3',
    device: 'Chrome on MacBook',
    deviceType: 'desktop',
    ipAddress: '192.168.1.102',
    location: 'TP.HCM, Việt Nam',
    lastActivity: new Date('2025-09-13T20:00:00'),
    current: false,
  },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
    address: '',
    school: '',
    bio: '',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: '',
      address: '',
      school: '',
      bio: '',
    });
  };

  const handleSave = () => {
    // TODO: Call API to update profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleTerminateSession = (sessionId: string) => {
    // TODO: Call API to terminate session
    console.log('Terminating session:', sessionId);
  };

  const handleTerminateAllSessions = () => {
    // TODO: Call API to terminate all sessions
    console.log('Terminating all sessions');
    logout();
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'TEACHER':
        return 'default';
      case 'TUTOR':
        return 'secondary';
      case 'STUDENT':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground">Quản lý thông tin cá nhân và phiên đăng nhập</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="sessions">Phiên đăng nhập</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and basic info */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex gap-2">
                    <Badge variant={getRoleBadgeVariant(user.role as string)}>
                      {user.role}
                    </Badge>
                    {user.level && (
                      <Badge variant="outline">
                        Cấp độ {user.level}
                      </Badge>
                    )}
                    {user.emailVerified && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Đã xác thực
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Họ</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="0123456789"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">Trường học</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="school"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tên trường"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Địa chỉ"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Account info */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Thông tin tài khoản</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ngày tham gia: {user.createdAt.toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Cập nhật lần cuối: {user.updatedAt.toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Phiên đăng nhập</CardTitle>
                  <CardDescription>Quản lý các phiên đăng nhập đang hoạt động</CardDescription>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleTerminateAllSessions}
                >
                  Đăng xuất tất cả thiết bị
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thiết bị</TableHead>
                      <TableHead>Địa chỉ IP</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Hoạt động lần cuối</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSessions.map(session => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.deviceType)}
                            <div>
                              <div className="font-medium">{session.device}</div>
                              {session.current && (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  Phiên hiện tại
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{session.ipAddress}</TableCell>
                        <TableCell>{session.location}</TableCell>
                        <TableCell>
                          {session.lastActivity.toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          {!session.current && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleTerminateSession(session.id)}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Đăng xuất
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>* Bạn có thể đăng nhập tối đa 3 thiết bị cùng lúc</p>
                <p>* Phiên đăng nhập tự động hết hạn sau 30 ngày không hoạt động</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật tài khoản</CardTitle>
              <CardDescription>Cài đặt bảo mật cho tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Đổi mật khẩu</h3>
                    <p className="text-sm text-muted-foreground">
                      Thay đổi mật khẩu đăng nhập của bạn
                    </p>
                  </div>
                  <Button variant="outline">Đổi mật khẩu</Button>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Xác thực 2 yếu tố</h3>
                    <p className="text-sm text-muted-foreground">
                      Thêm lớp bảo mật cho tài khoản
                    </p>
                  </div>
                  <Button variant="outline">Cài đặt</Button>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Xóa tài khoản</h3>
                    <p className="text-sm text-muted-foreground">
                      Xóa vĩnh viễn tài khoản và tất cả dữ liệu
                    </p>
                  </div>
                  <Button variant="destructive">Xóa tài khoản</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}