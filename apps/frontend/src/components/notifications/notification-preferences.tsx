/**
 * Notification Preferences Component
 * Component để cấu hình preferences cho notifications
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useBackendNotifications } from '@/hooks/use-backend-notifications';
import type { NotificationPreferences } from '@/services/grpc/notification.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Mail,
  Smartphone,
  MessageSquare,
  Shield,
  Package,
  TrendingUp,
  Save,
  RefreshCw
} from 'lucide-react';

/**
 * Preference Item Component
 */
interface PreferenceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function PreferenceItem({ icon, title, description, checked, onChange, disabled = false }: PreferenceItemProps) {
  return (
    <div className="flex items-center justify-between space-x-4 py-3">
      <div className="flex items-start space-x-3 flex-1">
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
        <div className="flex-1">
          <Label htmlFor={title} className="text-sm font-medium cursor-pointer">
            {title}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        </div>
      </div>
      <Switch
        id={title}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

/**
 * Main Notification Preferences Component
 */
export function NotificationPreferences() {
  const { toast } = useToast();
  const {
    preferences,
    preferencesLoading,
    loadPreferences,
    updatePreferences
  } = useBackendNotifications();

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync local preferences with backend preferences
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
      setHasChanges(false);
    }
  }, [preferences]);

  // Handle preference change
  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    if (!localPreferences) return;

    const newPreferences = { ...localPreferences, [key]: value };
    setLocalPreferences(newPreferences);
    setHasChanges(true);
  };

  // Save preferences
  const handleSave = async () => {
    if (!localPreferences || !hasChanges) return;

    setSaving(true);

    try {
      const success = await updatePreferences(localPreferences);
      
      if (success) {
        setHasChanges(false);
        toast({
          title: 'Thành công',
          description: 'Đã lưu cài đặt thông báo',
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt thông báo',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset preferences
  const handleReset = () => {
    if (preferences) {
      setLocalPreferences(preferences);
      setHasChanges(false);
    }
  };

  // Refresh preferences
  const handleRefresh = () => {
    loadPreferences();
  };

  if (preferencesLoading && !localPreferences) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải cài đặt...</span>
        </CardContent>
      </Card>
    );
  }

  if (!localPreferences) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Settings className="h-12 w-12 text-gray-300 mb-2" />
          <p className="text-gray-500">Không thể tải cài đặt thông báo</p>
          <Button variant="outline" onClick={handleRefresh} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Cài đặt thông báo</CardTitle>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={preferencesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${preferencesLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
        
        <CardDescription>
          Quản lý cách bạn nhận thông báo từ hệ thống
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div>
          <h3 className="text-lg font-medium mb-4">Kênh thông báo</h3>
          
          <div className="space-y-1">
            <PreferenceItem
              icon={<Mail className="h-4 w-4 text-blue-500" />}
              title="Email"
              description="Nhận thông báo qua email"
              checked={localPreferences.emailNotifications}
              onChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
            />
            
            <Separator />
            
            <PreferenceItem
              icon={<Smartphone className="h-4 w-4 text-green-500" />}
              title="Push Notifications"
              description="Nhận thông báo đẩy trên thiết bị"
              checked={localPreferences.pushNotifications}
              onChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
            />
            
            <Separator />
            
            <PreferenceItem
              icon={<MessageSquare className="h-4 w-4 text-purple-500" />}
              title="SMS"
              description="Nhận thông báo qua tin nhắn SMS"
              checked={localPreferences.smsNotifications}
              onChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
            />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-medium mb-4">Loại thông báo</h3>
          
          <div className="space-y-1">
            <PreferenceItem
              icon={<Shield className="h-4 w-4 text-red-500" />}
              title="Cảnh báo bảo mật"
              description="Thông báo về hoạt động đăng nhập, thay đổi mật khẩu và các vấn đề bảo mật"
              checked={localPreferences.securityAlerts}
              onChange={(checked) => handlePreferenceChange('securityAlerts', checked)}
            />
            
            <Separator />
            
            <PreferenceItem
              icon={<Package className="h-4 w-4 text-blue-500" />}
              title="Cập nhật sản phẩm"
              description="Thông báo về khóa học mới, tính năng mới và cập nhật hệ thống"
              checked={localPreferences.productUpdates}
              onChange={(checked) => handlePreferenceChange('productUpdates', checked)}
            />
            
            <Separator />
            
            <PreferenceItem
              icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
              title="Email marketing"
              description="Nhận email về khuyến mãi, sự kiện và tin tức từ NyNus"
              checked={localPreferences.marketingEmails}
              onChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? 'Có thay đổi chưa lưu' : 'Tất cả thay đổi đã được lưu'}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving}
              >
                Hủy
              </Button>
            )}
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Lưu cài đặt
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
