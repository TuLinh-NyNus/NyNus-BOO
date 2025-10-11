/**
 * Advanced User Settings Component
 * Comprehensive user preferences và settings management
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/form/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  Globe,
  Shield,
  Palette,
  Monitor,
  Save,
  RefreshCw,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context-grpc';
import { toastSuccess, toastError } from '@/components/ui/feedback/enhanced-toast';

// ===== TYPES =====

export interface AdvancedUserSettingsProps {
  className?: string;
}

interface UserPreferences {
  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  
  // Learning preferences
  autoPlayVideos: boolean;
  defaultVideoQuality: '480p' | '720p' | '1080p';
  playbackSpeed: number;
  
  // Privacy settings
  profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  
  // Localization
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Accessibility
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardShortcuts: boolean;
  
  // Security
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  
  // Marketing
  marketingEmails: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
}

// ===== CONSTANTS =====

const DEFAULT_PREFERENCES: UserPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  autoPlayVideos: true,
  defaultVideoQuality: '720p',
  playbackSpeed: 1.0,
  profileVisibility: 'PUBLIC',
  showOnlineStatus: true,
  allowDirectMessages: true,
  timezone: 'Asia/Ho_Chi_Minh',
  language: 'vi',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReaderMode: false,
  keyboardShortcuts: true,
  twoFactorEnabled: false,
  loginAlerts: true,
  marketingEmails: false,
  productUpdates: true,
  securityAlerts: true,
  weeklyDigest: true
};

const TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' }
];

const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' }
];

// ===== MAIN COMPONENT =====

export const AdvancedUserSettings: React.FC<AdvancedUserSettingsProps> = ({
  className
}) => {
  // ===== STATE =====

  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { user } = useAuth();

  // ===== HANDLERS =====

  const loadUserPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real gRPC service call
      // const response = await UserService.getPreferences();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, use default preferences
      setPreferences(DEFAULT_PREFERENCES);
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      toastError('Không thể tải cài đặt người dùng');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePreferenceChange = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with real gRPC service call
      // await UserService.updatePreferences(preferences);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setHasChanges(false);
      toastSuccess('Đã lưu cài đặt', 'Các thay đổi đã được áp dụng thành công');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toastError('Không thể lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    setHasChanges(true);
  }, []);

  // ===== EFFECTS =====

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user, loadUserPreferences]);

  // ===== RENDER FUNCTIONS =====

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email notifications</Label>
            <p className="text-sm text-muted-foreground">
              Nhận thông báo qua email
            </p>
          </div>
          <Switch
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push notifications</Label>
            <p className="text-sm text-muted-foreground">
              Nhận thông báo đẩy trên thiết bị
            </p>
          </div>
          <Switch
            checked={preferences.pushNotifications}
            onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>SMS notifications</Label>
            <p className="text-sm text-muted-foreground">
              Nhận thông báo qua tin nhắn SMS
            </p>
          </div>
          <Switch
            checked={preferences.smsNotifications}
            onCheckedChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Loại thông báo</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Cảnh báo bảo mật</Label>
            <p className="text-sm text-muted-foreground">
              Thông báo về hoạt động đăng nhập và bảo mật
            </p>
          </div>
          <Switch
            checked={preferences.securityAlerts}
            onCheckedChange={(checked) => handlePreferenceChange('securityAlerts', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Cập nhật sản phẩm</Label>
            <p className="text-sm text-muted-foreground">
              Thông báo về tính năng mới và cải tiến
            </p>
          </div>
          <Switch
            checked={preferences.productUpdates}
            onCheckedChange={(checked) => handlePreferenceChange('productUpdates', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email marketing</Label>
            <p className="text-sm text-muted-foreground">
              Nhận thông tin khuyến mãi và ưu đãi
            </p>
          </div>
          <Switch
            checked={preferences.marketingEmails}
            onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Tóm tắt hàng tuần</Label>
            <p className="text-sm text-muted-foreground">
              Báo cáo tiến độ học tập hàng tuần
            </p>
          </div>
          <Switch
            checked={preferences.weeklyDigest}
            onCheckedChange={(checked) => handlePreferenceChange('weeklyDigest', checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Giao diện</Label>
          <Select
            value={preferences.theme}
            onValueChange={(value: 'light' | 'dark' | 'auto') => 
              handlePreferenceChange('theme', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Sáng</SelectItem>
              <SelectItem value="dark">Tối</SelectItem>
              <SelectItem value="auto">Tự động</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Kích thước chữ</Label>
          <Select
            value={preferences.fontSize}
            onValueChange={(value: 'small' | 'medium' | 'large') => 
              handlePreferenceChange('fontSize', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Nhỏ</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="large">Lớn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Khả năng tiếp cận</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Độ tương phản cao</Label>
            <p className="text-sm text-muted-foreground">
              Tăng độ tương phản cho dễ nhìn hơn
            </p>
          </div>
          <Switch
            checked={preferences.highContrast}
            onCheckedChange={(checked) => handlePreferenceChange('highContrast', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Giảm chuyển động</Label>
            <p className="text-sm text-muted-foreground">
              Giảm hiệu ứng animation và chuyển động
            </p>
          </div>
          <Switch
            checked={preferences.reducedMotion}
            onCheckedChange={(checked) => handlePreferenceChange('reducedMotion', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Chế độ screen reader</Label>
            <p className="text-sm text-muted-foreground">
              Tối ưu hóa cho phần mềm đọc màn hình
            </p>
          </div>
          <Switch
            checked={preferences.screenReaderMode}
            onCheckedChange={(checked) => handlePreferenceChange('screenReaderMode', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Phím tắt</Label>
            <p className="text-sm text-muted-foreground">
              Bật các phím tắt bàn phím
            </p>
          </div>
          <Switch
            checked={preferences.keyboardShortcuts}
            onCheckedChange={(checked) => handlePreferenceChange('keyboardShortcuts', checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderLearningSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Tự động phát video</Label>
            <p className="text-sm text-muted-foreground">
              Video sẽ tự động phát khi tải trang
            </p>
          </div>
          <Switch
            checked={preferences.autoPlayVideos}
            onCheckedChange={(checked) => handlePreferenceChange('autoPlayVideos', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label>Chất lượng video mặc định</Label>
          <Select
            value={preferences.defaultVideoQuality}
            onValueChange={(value: '480p' | '720p' | '1080p') => 
              handlePreferenceChange('defaultVideoQuality', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="480p">480p (Tiết kiệm dữ liệu)</SelectItem>
              <SelectItem value="720p">720p (Cân bằng)</SelectItem>
              <SelectItem value="1080p">1080p (Chất lượng cao)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tốc độ phát mặc định: {preferences.playbackSpeed}x</Label>
          <Slider
            value={[preferences.playbackSpeed]}
            onValueChange={([value]: number[]) => handlePreferenceChange('playbackSpeed', value)}
            min={0.5}
            max={2.0}
            step={0.25}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Hiển thị hồ sơ</Label>
          <Select
            value={preferences.profileVisibility}
            onValueChange={(value: 'PUBLIC' | 'FRIENDS' | 'PRIVATE') => 
              handlePreferenceChange('profileVisibility', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">Công khai</SelectItem>
              <SelectItem value="FRIENDS">Chỉ bạn bè</SelectItem>
              <SelectItem value="PRIVATE">Riêng tư</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Hiển thị trạng thái online</Label>
            <p className="text-sm text-muted-foreground">
              Cho phép người khác thấy bạn đang online
            </p>
          </div>
          <Switch
            checked={preferences.showOnlineStatus}
            onCheckedChange={(checked) => handlePreferenceChange('showOnlineStatus', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Cho phép tin nhắn trực tiếp</Label>
            <p className="text-sm text-muted-foreground">
              Người khác có thể gửi tin nhắn cho bạn
            </p>
          </div>
          <Switch
            checked={preferences.allowDirectMessages}
            onCheckedChange={(checked) => handlePreferenceChange('allowDirectMessages', checked)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Bảo mật</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Cảnh báo đăng nhập</Label>
            <p className="text-sm text-muted-foreground">
              Thông báo khi có đăng nhập từ thiết bị mới
            </p>
          </div>
          <Switch
            checked={preferences.loginAlerts}
            onCheckedChange={(checked) => handlePreferenceChange('loginAlerts', checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderLocalizationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Ngôn ngữ</Label>
          <Select
            value={preferences.language}
            onValueChange={(value) => handlePreferenceChange('language', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Múi giờ</Label>
          <Select
            value={preferences.timezone}
            onValueChange={(value) => handlePreferenceChange('timezone', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Định dạng thời gian</Label>
          <Select
            value={preferences.timeFormat}
            onValueChange={(value: '12h' | '24h') => 
              handlePreferenceChange('timeFormat', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12 giờ (AM/PM)</SelectItem>
              <SelectItem value="24h">24 giờ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // ===== MAIN RENDER =====

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải cài đặt...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cài đặt nâng cao</h2>
          <p className="text-muted-foreground">
            Tùy chỉnh trải nghiệm NyNus theo sở thích của bạn
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            Đặt lại
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Bạn có thay đổi chưa được lưu. Nhấn &quot;Lưu thay đổi&quot; để áp dụng.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Thông báo</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Giao diện</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Học tập</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Riêng tư</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Ngôn ngữ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>
                Quản lý cách bạn nhận thông báo từ NyNus
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationSettings()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Giao diện và khả năng tiếp cận</CardTitle>
              <CardDescription>
                Tùy chỉnh giao diện và cải thiện khả năng tiếp cận
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderAppearanceSettings()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt học tập</CardTitle>
              <CardDescription>
                Tùy chỉnh trải nghiệm học tập và xem video
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLearningSettings()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Riêng tư và bảo mật</CardTitle>
              <CardDescription>
                Kiểm soát quyền riêng tư và cài đặt bảo mật
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPrivacySettings()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle>Ngôn ngữ và khu vực</CardTitle>
              <CardDescription>
                Cài đặt ngôn ngữ, múi giờ và định dạng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLocalizationSettings()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedUserSettings;
