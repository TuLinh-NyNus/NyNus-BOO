/**
 * Admin Exam Settings Page
 * Global exam configuration and policies
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Settings,
  Shield,
  Users,
  FileText,
  AlertTriangle
} from 'lucide-react';

// UI Components
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
  Textarea
} from '@/components/ui';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Paths
import { ADMIN_PATHS } from '@/lib/admin-paths';

// ===== TYPES =====

interface ExamSettings {
  // General Settings
  defaultDuration: number;
  defaultMaxAttempts: number;
  defaultPassPercentage: number;
  
  // Security Settings
  enableAntiCheating: boolean;
  enableScreenLock: boolean;
  enableTimeLimit: boolean;
  allowPause: boolean;
  
  // Access Settings
  requireApproval: boolean;
  allowGuestAccess: boolean;
  enableRoleBasedAccess: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  
  // Advanced Settings
  enableAnalytics: boolean;
  enableExport: boolean;
  autoArchiveDays: number;
  
  // Custom Messages
  welcomeMessage: string;
  completionMessage: string;
  failureMessage: string;
}

// ===== CONSTANTS =====

const DEFAULT_SETTINGS: ExamSettings = {
  defaultDuration: 60,
  defaultMaxAttempts: 3,
  defaultPassPercentage: 70,
  enableAntiCheating: true,
  enableScreenLock: false,
  enableTimeLimit: true,
  allowPause: true,
  requireApproval: false,
  allowGuestAccess: false,
  enableRoleBasedAccess: true,
  emailNotifications: true,
  smsNotifications: false,
  enableAnalytics: true,
  enableExport: true,
  autoArchiveDays: 365,
  welcomeMessage: 'Chào mừng bạn đến với bài thi. Hãy đọc kỹ hướng dẫn trước khi bắt đầu.',
  completionMessage: 'Chúc mừng! Bạn đã hoàn thành bài thi thành công.',
  failureMessage: 'Rất tiếc, bạn chưa đạt điểm yêu cầu. Hãy cố gắng lần sau.',
};

// ===== MAIN COMPONENT =====

/**
 * Admin Exam Settings Page Component
 * Global configuration for exam system
 */
export default function AdminExamSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // ===== STATE =====

  const [settings, setSettings] = useState<ExamSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // ===== HANDLERS =====

  const handleBack = () => {
    if (hasChanges) {
      if (!confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang?')) {
        return;
      }
    }
    router.push(ADMIN_PATHS.EXAMS);
  };

  const handleSettingChange = (key: keyof ExamSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // TODO: Replace with real API call
      // await ExamService.updateSettings(settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Thành công',
        description: 'Đã lưu cài đặt thành công',
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục cài đặt mặc định?')) {
      setSettings(DEFAULT_SETTINGS);
      setHasChanges(true);
    }
  };

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cài đặt đề thi</h1>
            <p className="text-muted-foreground">
              Cấu hình toàn cục cho hệ thống đề thi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            Khôi phục mặc định
          </Button>
          
          <Button onClick={handleSave} disabled={!hasChanges || loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cài đặt chung
            </CardTitle>
            <CardDescription>
              Cấu hình mặc định cho đề thi mới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultDuration">Thời gian mặc định (phút)</Label>
              <Input
                id="defaultDuration"
                type="number"
                value={settings.defaultDuration}
                onChange={(e) => handleSettingChange('defaultDuration', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultMaxAttempts">Số lần thi tối đa</Label>
              <Input
                id="defaultMaxAttempts"
                type="number"
                value={settings.defaultMaxAttempts}
                onChange={(e) => handleSettingChange('defaultMaxAttempts', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultPassPercentage">Điểm đậu mặc định (%)</Label>
              <Input
                id="defaultPassPercentage"
                type="number"
                value={settings.defaultPassPercentage}
                onChange={(e) => handleSettingChange('defaultPassPercentage', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Bảo mật
            </CardTitle>
            <CardDescription>
              Cài đặt bảo mật và chống gian lận
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableAntiCheating">Chống gian lận</Label>
              <Switch
                id="enableAntiCheating"
                checked={settings.enableAntiCheating}
                onCheckedChange={(checked) => handleSettingChange('enableAntiCheating', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableScreenLock">Khóa màn hình</Label>
              <Switch
                id="enableScreenLock"
                checked={settings.enableScreenLock}
                onCheckedChange={(checked) => handleSettingChange('enableScreenLock', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableTimeLimit">Giới hạn thời gian</Label>
              <Switch
                id="enableTimeLimit"
                checked={settings.enableTimeLimit}
                onCheckedChange={(checked) => handleSettingChange('enableTimeLimit', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allowPause">Cho phép tạm dừng</Label>
              <Switch
                id="allowPause"
                checked={settings.allowPause}
                onCheckedChange={(checked) => handleSettingChange('allowPause', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Access Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quyền truy cập
            </CardTitle>
            <CardDescription>
              Cài đặt quyền truy cập và phê duyệt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="requireApproval">Yêu cầu phê duyệt</Label>
              <Switch
                id="requireApproval"
                checked={settings.requireApproval}
                onCheckedChange={(checked) => handleSettingChange('requireApproval', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allowGuestAccess">Cho phép khách</Label>
              <Switch
                id="allowGuestAccess"
                checked={settings.allowGuestAccess}
                onCheckedChange={(checked) => handleSettingChange('allowGuestAccess', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableRoleBasedAccess">Phân quyền theo vai trò</Label>
              <Switch
                id="enableRoleBasedAccess"
                checked={settings.enableRoleBasedAccess}
                onCheckedChange={(checked) => handleSettingChange('enableRoleBasedAccess', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cài đặt nâng cao
            </CardTitle>
            <CardDescription>
              Tính năng nâng cao và tự động hóa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableAnalytics">Thống kê chi tiết</Label>
              <Switch
                id="enableAnalytics"
                checked={settings.enableAnalytics}
                onCheckedChange={(checked) => handleSettingChange('enableAnalytics', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableExport">Cho phép xuất dữ liệu</Label>
              <Switch
                id="enableExport"
                checked={settings.enableExport}
                onCheckedChange={(checked) => handleSettingChange('enableExport', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="autoArchiveDays">Tự động lưu trữ sau (ngày)</Label>
              <Input
                id="autoArchiveDays"
                type="number"
                value={settings.autoArchiveDays}
                onChange={(e) => handleSettingChange('autoArchiveDays', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Thông báo tùy chỉnh</CardTitle>
          <CardDescription>
            Tùy chỉnh thông báo hiển thị cho học sinh
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Thông báo chào mừng</Label>
            <Textarea
              id="welcomeMessage"
              value={settings.welcomeMessage}
              onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="completionMessage">Thông báo hoàn thành</Label>
            <Textarea
              id="completionMessage"
              value={settings.completionMessage}
              onChange={(e) => handleSettingChange('completionMessage', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="failureMessage">Thông báo không đạt</Label>
            <Textarea
              id="failureMessage"
              value={settings.failureMessage}
              onChange={(e) => handleSettingChange('failureMessage', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Warning Notice */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">Có thay đổi chưa lưu</div>
                <div className="text-sm text-orange-700">
                  Nhớ lưu cài đặt trước khi rời khỏi trang
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
