'use client';

import { 
  Mail, 
  Save, 
  Send, 
  Settings,
  Eye,
  Edit,
  Copy,
  TestTube,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import React, { useState } from 'react';

import { Button, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea, Tabs, TabsContent, TabsList, TabsTrigger, Switch } from '@/components/ui';
import logger from '@/lib/utils/logger';

/**
 * Email Settings Component
 * 
 * Component cài đặt email và template
 * Placeholder component - cần implement đầy đủ functionality
 */

function EmailSettings(): JSX.Element {
  const [activeTab, setActiveTab] = useState('smtp');
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@nynus.edu.vn',
    smtpPassword: '',
    fromEmail: 'noreply@nynus.edu.vn',
    fromName: 'NyNus Learning Platform',
    encryption: 'tls',
    enabled: true
  });

  const [testEmail, setTestEmail] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Mock email templates
  const emailTemplates = [
    {
      id: 'welcome',
      name: 'Chào mừng người dùng mới',
      subject: 'Chào mừng bạn đến với NyNus!',
      description: 'Email gửi khi người dùng đăng ký thành công',
      enabled: true,
      lastModified: '2024-06-15T10:30:00Z'
    },
    {
      id: 'password-reset',
      name: 'Đặt lại mật khẩu',
      subject: 'Yêu cầu đặt lại mật khẩu',
      description: 'Email gửi khi người dùng yêu cầu đặt lại mật khẩu',
      enabled: true,
      lastModified: '2024-06-14T15:20:00Z'
    },
    {
      id: 'course-completion',
      name: 'Hoàn thành khóa học',
      subject: 'Chúc mừng! Bạn đã hoàn thành khóa học',
      description: 'Email gửi khi học viên hoàn thành khóa học',
      enabled: true,
      lastModified: '2024-06-13T09:45:00Z'
    },
    {
      id: 'exam-reminder',
      name: 'Nhắc nhở bài thi',
      subject: 'Nhắc nhở: Bài thi sắp diễn ra',
      description: 'Email nhắc nhở học viên về bài thi sắp tới',
      enabled: false,
      lastModified: '2024-06-12T14:15:00Z'
    }
  ];

  const handleConfigChange = (key: string, value: unknown) => {
    setEmailConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    // Simulate API call
    setTimeout(() => {
      setConnectionStatus('success');
      setTimeout(() => setConnectionStatus('idle'), 3000);
    }, 2000);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      alert('Vui lòng nhập địa chỉ email test');
      return;
    }
    // TODO: Implement send test email logic
    logger.info('Sending test email to:', testEmail);
    alert(`Email test đã được gửi đến ${testEmail}`);
  };

  const handleSaveConfig = () => {
    // TODO: Implement save config logic
    logger.info('Email config saved:', emailConfig);
    alert('Cấu hình email đã được lưu thành công!');
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <TestTube className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Cài đặt Email</h1>
              <p className="text-muted-foreground">Quản lý cấu hình email và template</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleTestConnection}>
              {getConnectionStatusIcon()}
              <span className="ml-2">
                {connectionStatus === 'testing' ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
              </span>
            </Button>
            <Button onClick={handleSaveConfig}>
              <Save className="h-4 w-4 mr-2" />
              Lưu cài đặt
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Trạng thái kết nối SMTP</p>
                  <p className="text-xs text-muted-foreground">
                    {connectionStatus === 'success' ? 'Kết nối thành công' : 
                     connectionStatus === 'testing' ? 'Đang kiểm tra kết nối...' :
                     connectionStatus === 'error' ? 'Kết nối thất bại' : 'Chưa kiểm tra'}
                  </p>
                </div>
              </div>
              <Badge variant={
                connectionStatus === 'success' ? 'default' :
                connectionStatus === 'error' ? 'destructive' : 'secondary'
              } className={
                connectionStatus === 'success' ? 'bg-green-500' :
                connectionStatus === 'error' ? 'bg-red-500' : ''
              }>
                {connectionStatus === 'success' ? 'Hoạt động' :
                 connectionStatus === 'error' ? 'Lỗi' : 'Chưa xác định'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="smtp">Cấu hình SMTP</TabsTrigger>
            <TabsTrigger value="templates">Template Email</TabsTrigger>
            <TabsTrigger value="test">Kiểm tra Email</TabsTrigger>
          </TabsList>

          {/* SMTP Configuration */}
          <TabsContent value="smtp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình máy chủ SMTP</CardTitle>
                <CardDescription>Thiết lập kết nối với máy chủ email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label>Bật gửi email</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép hệ thống gửi email
                    </p>
                  </div>
                  <Switch
                    checked={emailConfig.enabled}
                    onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
                  />
                </div>

                {emailConfig.enabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host *</Label>
                        <Input
                          id="smtpHost"
                          value={emailConfig.smtpHost}
                          onChange={(e) => handleConfigChange('smtpHost', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port *</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={emailConfig.smtpPort}
                          onChange={(e) => handleConfigChange('smtpPort', parseInt(e.target.value))}
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">Username *</Label>
                        <Input
                          id="smtpUsername"
                          value={emailConfig.smtpUsername}
                          onChange={(e) => handleConfigChange('smtpUsername', e.target.value)}
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">Password *</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={emailConfig.smtpPassword}
                          onChange={(e) => handleConfigChange('smtpPassword', e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromEmail">Email gửi đi *</Label>
                        <Input
                          id="fromEmail"
                          value={emailConfig.fromEmail}
                          onChange={(e) => handleConfigChange('fromEmail', e.target.value)}
                          placeholder="noreply@nynus.edu.vn"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fromName">Tên người gửi</Label>
                        <Input
                          id="fromName"
                          value={emailConfig.fromName}
                          onChange={(e) => handleConfigChange('fromName', e.target.value)}
                          placeholder="NyNus Learning Platform"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="encryption">Mã hóa</Label>
                      <select 
                        id="encryption"
                        value={emailConfig.encryption}
                        onChange={(e) => handleConfigChange('encryption', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="none">Không mã hóa</option>
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                      </select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Templates */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Email</CardTitle>
                <CardDescription>Quản lý các mẫu email tự động</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant={template.enabled ? 'default' : 'secondary'}>
                            {template.enabled ? 'Bật' : 'Tắt'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {template.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Chỉnh sửa lần cuối: {new Date(template.lastModified).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-sm font-medium mt-2">
                          Tiêu đề: {template.subject}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={template.enabled}
                          onCheckedChange={(checked) => {
                            // TODO: Update template status
                            logger.info(`Toggle template ${template.id}:`, checked);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Email */}
          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kiểm tra gửi Email</CardTitle>
                <CardDescription>Gửi email test để kiểm tra cấu hình</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Email nhận test</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testSubject">Tiêu đề email test</Label>
                  <Input
                    id="testSubject"
                    defaultValue="Test Email từ NyNus Platform"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testContent">Nội dung email test</Label>
                  <Textarea
                    id="testContent"
                    rows={6}
                    defaultValue={`Xin chào,

Đây là email test từ hệ thống NyNus Learning Platform.

Nếu bạn nhận được email này, có nghĩa là cấu hình email đã hoạt động chính xác.

Thời gian gửi: ${new Date().toLocaleString('vi-VN')}

Trân trọng,
Đội ngũ NyNus`}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSendTestEmail}>
                    <Send className="h-4 w-4 mr-2" />
                    Gửi email test
                  </Button>
                  <Button variant="outline" onClick={handleTestConnection}>
                    {getConnectionStatusIcon()}
                    <span className="ml-2">Kiểm tra kết nối</span>
                  </Button>
                </div>

                {connectionStatus === 'success' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p className="text-sm text-green-700">
                        Kết nối SMTP thành công! Bạn có thể gửi email test.
                      </p>
                    </div>
                  </div>
                )}

                {connectionStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-red-700">
                        Không thể kết nối đến máy chủ SMTP. Vui lòng kiểm tra lại cấu hình.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Default export for lazy loading
export default EmailSettings;
