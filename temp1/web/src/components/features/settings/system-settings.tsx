'use client';

import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield,
  Database,
  Mail,
  Bell,
  Globe,
  Lock,
  Server,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import React, { useState } from 'react';

import { Button, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea, Tabs, TabsContent, TabsList, TabsTrigger, Switch } from '@/components/ui';
import logger from '@/lib/utils/logger';

/**
 * System Settings Component
 * 
 * Component cài đặt hệ thống
 * Placeholder component - cần implement đầy đủ functionality
 */

function SystemSettings(): JSX.Element {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'NyNus Learning Platform',
    siteDescription: 'Nền tảng học tập trực tuyến hàng đầu',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileUploadSize: 10,
    sessionTimeout: 30,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    backupEnabled: true,
    backupFrequency: 'daily',
    emailNotifications: true,
    smsNotifications: false,
    systemNotifications: true
  });

  const handleSettingChange = (key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implement save settings logic
    logger.info('Settings saved:', settings);
    alert('Cài đặt đã được lưu thành công!');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
              <p className="text-muted-foreground">Quản lý cấu hình và thiết lập hệ thống</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Khôi phục mặc định
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Lưu cài đặt
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Hệ thống</p>
                    <p className="text-xs text-muted-foreground">Hoạt động bình thường</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Cơ sở dữ liệu</p>
                    <p className="text-xs text-muted-foreground">Kết nối ổn định</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-blue-500">
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Bảo mật</p>
                    <p className="text-xs text-muted-foreground">Tất cả dịch vụ hoạt động</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-purple-500">
                  Secure
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Chung</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="backup">Sao lưu</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt chung</CardTitle>
                <CardDescription>Cấu hình cơ bản của hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Tên website</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Kích thước file tối đa (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={settings.maxFileUploadSize}
                      onChange={(e) => handleSettingChange('maxFileUploadSize', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Mô tả website</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Chế độ bảo trì</Label>
                      <p className="text-sm text-muted-foreground">
                        Tạm thời tắt website để bảo trì
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cho phép đăng ký</Label>
                      <p className="text-sm text-muted-foreground">
                        Người dùng mới có thể tạo tài khoản
                      </p>
                    </div>
                    <Switch
                      checked={settings.registrationEnabled}
                      onCheckedChange={(checked) => handleSettingChange('registrationEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Yêu cầu xác thực email</Label>
                      <p className="text-sm text-muted-foreground">
                        Người dùng phải xác thực email khi đăng ký
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailVerificationRequired}
                      onCheckedChange={(checked) => handleSettingChange('emailVerificationRequired', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt bảo mật</CardTitle>
                <CardDescription>Cấu hình bảo mật và xác thực</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Độ dài mật khẩu tối thiểu</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                      min="6"
                      max="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Số lần đăng nhập sai tối đa</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                      min="3"
                      max="10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Thời gian hết hạn phiên (phút)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    min="15"
                    max="480"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Chính sách mật khẩu
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Tối thiểu {settings.passwordMinLength} ký tự</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Phải có ít nhất 1 chữ hoa</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Phải có ít nhất 1 số</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Phải có ít nhất 1 ký tự đặc biệt</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt Email</CardTitle>
                <CardDescription>Cấu hình máy chủ email và template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">Username</Label>
                    <Input
                      id="smtpUsername"
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Email gửi đi</Label>
                  <Input
                    id="fromEmail"
                    placeholder="noreply@nynus.edu.vn"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Gửi email test
                  </Button>
                  <Button variant="outline">
                    Kiểm tra kết nối
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt sao lưu</CardTitle>
                <CardDescription>Cấu hình tự động sao lưu dữ liệu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bật tự động sao lưu</Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động sao lưu dữ liệu theo lịch trình
                    </p>
                  </div>
                  <Switch
                    checked={settings.backupEnabled}
                    onCheckedChange={(checked) => handleSettingChange('backupEnabled', checked)}
                  />
                </div>

                {settings.backupEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Tần suất sao lưu</Label>
                      <select 
                        id="backupFrequency"
                        value={settings.backupFrequency}
                        onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="hourly">Mỗi giờ</option>
                        <option value="daily">Hàng ngày</option>
                        <option value="weekly">Hàng tuần</option>
                        <option value="monthly">Hàng tháng</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Lần sao lưu gần nhất</Label>
                      <p className="text-sm text-muted-foreground">
                        15/06/2024 - 02:00 AM (Thành công)
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Sao lưu ngay
                      </Button>
                      <Button variant="outline">
                        Khôi phục từ backup
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt thông báo</CardTitle>
                <CardDescription>Cấu hình các loại thông báo hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Thông báo email</Label>
                      <p className="text-sm text-muted-foreground">
                        Gửi thông báo qua email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Thông báo SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Gửi thông báo qua tin nhắn
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Thông báo hệ thống</Label>
                      <p className="text-sm text-muted-foreground">
                        Hiển thị thông báo trong ứng dụng
                      </p>
                    </div>
                    <Switch
                      checked={settings.systemNotifications}
                      onCheckedChange={(checked) => handleSettingChange('systemNotifications', checked)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Loại thông báo
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="newUser" defaultChecked className="rounded" />
                      <Label htmlFor="newUser" className="text-sm">Người dùng mới đăng ký</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="courseComplete" defaultChecked className="rounded" />
                      <Label htmlFor="courseComplete" className="text-sm">Hoàn thành khóa học</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="examSubmit" defaultChecked className="rounded" />
                      <Label htmlFor="examSubmit" className="text-sm">Nộp bài thi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="systemError" defaultChecked className="rounded" />
                      <Label htmlFor="systemError" className="text-sm">Lỗi hệ thống</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Default export for lazy loading
export default SystemSettings;
