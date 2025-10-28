/**
 * Settings Tab Component
 * Configuration panel cho Cloudinary, optimization settings và system preferences
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Switch } from '@/components/ui/form/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Badge } from '@/components/ui/display/badge';
import { Separator } from '@/components/ui/display/separator';
import { cn } from '@/lib/utils';
import {
  Cloud,
  Shield,
  Database,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';

// ===== TYPES =====

interface SettingsTabProps {
  className?: string;
}

interface CloudinarySettings {
  enabled: boolean;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
  useRealSDK: boolean;
  autoOptimization: boolean;
  autoWebP: boolean;
  qualityAuto: boolean;
  fetchFormat: 'auto' | 'webp' | 'jpg' | 'png';
}

interface UploadSettings {
  maxFileSize: number; // MB
  maxFiles: number;
  allowedTypes: string[];
  autoResize: boolean;
  maxWidth: number;
  maxHeight: number;
  compressionQuality: number;
}

interface SecuritySettings {
  requireAuth: boolean;
  allowBulkOperations: boolean;
  enableAuditLog: boolean;
  maxConcurrentUploads: number;
  rateLimitEnabled: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number; // minutes
}

interface SystemSettings {
  cacheEnabled: boolean;
  cacheTTL: number; // hours
  enableMetrics: boolean;
  enableNotifications: boolean;
  autoCleanup: boolean;
  cleanupAfterDays: number;
}

// ===== MOCK SETTINGS SERVICE =====

class SettingsService {
  static async loadSettings(): Promise<{
    cloudinary: CloudinarySettings;
    upload: UploadSettings;
    security: SecuritySettings;
    system: SystemSettings;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      cloudinary: {
        enabled: true,
        cloudName: 'nynus-exam-bank',
        apiKey: '123456789012345',
        apiSecret: '***hidden***',
        folder: 'exam-bank/questions',
        useRealSDK: false,
        autoOptimization: true,
        autoWebP: true,
        qualityAuto: true,
        fetchFormat: 'auto',
      },
      upload: {
        maxFileSize: 10,
        maxFiles: 20,
        allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
        autoResize: true,
        maxWidth: 2048,
        maxHeight: 2048,
        compressionQuality: 85,
      },
      security: {
        requireAuth: true,
        allowBulkOperations: true,
        enableAuditLog: true,
        maxConcurrentUploads: 5,
        rateLimitEnabled: true,
        rateLimitRequests: 100,
        rateLimitWindow: 15,
      },
      system: {
        cacheEnabled: true,
        cacheTTL: 24,
        enableMetrics: true,
        enableNotifications: true,
        autoCleanup: false,
        cleanupAfterDays: 30,
      },
    };
  }

  static async saveSettings(settings: unknown): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Settings saved:', settings);
  }

  static async testCloudinaryConnection(settings: CloudinarySettings): Promise<boolean> {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.2; // 80% success rate
  }
}

// ===== SETTINGS SECTIONS =====

function CloudinarySection({ 
  settings, 
  onChange 
}: { 
  settings: CloudinarySettings; 
  onChange: (settings: CloudinarySettings) => void;
}) {
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('testing');
    
    try {
      const success = await SettingsService.testCloudinaryConnection(settings);
      setConnectionStatus(success ? 'success' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Cấu hình Cloudinary CDN
        </CardTitle>
        <CardDescription>
          Thiết lập kết nối và tối ưu hóa với Cloudinary
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Kích hoạt Cloudinary</Label>
            <p className="text-sm text-gray-600">Sử dụng Cloudinary CDN cho image storage</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => onChange({ ...settings, enabled })}
          />
        </div>

        {settings.enabled && (
          <>
            <Separator />
            
            {/* Connection Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cloudName">Cloud Name</Label>
                <Input
                  id="cloudName"
                  value={settings.cloudName}
                  onChange={(e) => onChange({ ...settings, cloudName: e.target.value })}
                  placeholder="your-cloud-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="folder">Folder Path</Label>
                <Input
                  id="folder"
                  value={settings.folder}
                  onChange={(e) => onChange({ ...settings, folder: e.target.value })}
                  placeholder="exam-bank/questions"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  value={settings.apiKey}
                  onChange={(e) => onChange({ ...settings, apiKey: e.target.value })}
                  placeholder="123456789012345"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret</Label>
                <div className="relative">
                  <Input
                    id="apiSecret"
                    type={showApiSecret ? 'text' : 'password'}
                    value={settings.apiSecret}
                    onChange={(e) => onChange({ ...settings, apiSecret: e.target.value })}
                    placeholder="Enter API Secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                  >
                    {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Test Connection */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTestingConnection || !settings.cloudName || !settings.apiKey}
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', isTestingConnection && 'animate-spin')} />
                {isTestingConnection ? 'Đang kiểm tra...' : 'Test kết nối'}
              </Button>
              
              {connectionStatus === 'success' && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Kết nối thành công
                </Badge>
              )}
              
              {connectionStatus === 'error' && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Kết nối thất bại
                </Badge>
              )}
            </div>

            <Separator />

            {/* SDK Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Sử dụng Real SDK</Label>
                <p className="text-sm text-gray-600">Bật để sử dụng Cloudinary SDK thực tế (production)</p>
              </div>
              <Switch
                checked={settings.useRealSDK}
                onCheckedChange={(useRealSDK) => onChange({ ...settings, useRealSDK })}
              />
            </div>

            {/* Optimization Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Tối ưu hóa tự động</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto Optimization</Label>
                    <p className="text-xs text-gray-600">Tự động tối ưu hóa hình ảnh</p>
                  </div>
                  <Switch
                    checked={settings.autoOptimization}
                    onCheckedChange={(autoOptimization) => onChange({ ...settings, autoOptimization })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto WebP</Label>
                    <p className="text-xs text-gray-600">Tự động chuyển đổi WebP</p>
                  </div>
                  <Switch
                    checked={settings.autoWebP}
                    onCheckedChange={(autoWebP) => onChange({ ...settings, autoWebP })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Quality Auto</Label>
                    <p className="text-xs text-gray-600">Tự động điều chỉnh chất lượng</p>
                  </div>
                  <Switch
                    checked={settings.qualityAuto}
                    onCheckedChange={(qualityAuto) => onChange({ ...settings, qualityAuto })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Fetch Format</Label>
                  <Select
                    value={settings.fetchFormat}
                    onValueChange={(fetchFormat: 'auto' | 'webp' | 'jpg' | 'png') => onChange({ ...settings, fetchFormat })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                      <SelectItem value="jpg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function UploadSection({ 
  settings, 
  onChange 
}: { 
  settings: UploadSettings; 
  onChange: (settings: UploadSettings) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Cài đặt Upload
        </CardTitle>
        <CardDescription>
          Cấu hình giới hạn và tối ưu hóa upload
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxFileSize">Kích thước tối đa (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => onChange({ ...settings, maxFileSize: parseInt(e.target.value) || 0 })}
              min="1"
              max="100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxFiles">Số file tối đa</Label>
            <Input
              id="maxFiles"
              type="number"
              value={settings.maxFiles}
              onChange={(e) => onChange({ ...settings, maxFiles: parseInt(e.target.value) || 0 })}
              min="1"
              max="100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxWidth">Chiều rộng tối đa (px)</Label>
            <Input
              id="maxWidth"
              type="number"
              value={settings.maxWidth}
              onChange={(e) => onChange({ ...settings, maxWidth: parseInt(e.target.value) || 0 })}
              min="100"
              max="4096"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxHeight">Chiều cao tối đa (px)</Label>
            <Input
              id="maxHeight"
              type="number"
              value={settings.maxHeight}
              onChange={(e) => onChange({ ...settings, maxHeight: parseInt(e.target.value) || 0 })}
              min="100"
              max="4096"
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Tự động resize</Label>
            <p className="text-sm text-gray-600">Tự động resize hình ảnh vượt quá giới hạn</p>
          </div>
          <Switch
            checked={settings.autoResize}
            onCheckedChange={(autoResize) => onChange({ ...settings, autoResize })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compressionQuality">Chất lượng nén (%)</Label>
          <Input
            id="compressionQuality"
            type="number"
            value={settings.compressionQuality}
            onChange={(e) => onChange({ ...settings, compressionQuality: parseInt(e.target.value) || 0 })}
            min="10"
            max="100"
          />
        </div>

        <div className="space-y-2">
          <Label>Định dạng được phép</Label>
          <div className="flex flex-wrap gap-2">
            {['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].map((type) => (
              <Badge
                key={type}
                variant={settings.allowedTypes.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  const newTypes = settings.allowedTypes.includes(type)
                    ? settings.allowedTypes.filter(t => t !== type)
                    : [...settings.allowedTypes, type];
                  onChange({ ...settings, allowedTypes: newTypes });
                }}
              >
                {type.split('/')[1].toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SecuritySection({ 
  settings, 
  onChange 
}: { 
  settings: SecuritySettings; 
  onChange: (settings: SecuritySettings) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Bảo mật & Giới hạn
        </CardTitle>
        <CardDescription>
          Cấu hình bảo mật và rate limiting
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Yêu cầu xác thực</Label>
                <p className="text-sm text-gray-600">Bắt buộc đăng nhập để upload</p>
              </div>
              <Switch
                checked={settings.requireAuth}
                onCheckedChange={(requireAuth) => onChange({ ...settings, requireAuth })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Cho phép bulk operations</Label>
                <p className="text-sm text-gray-600">Cho phép xóa/download hàng loạt</p>
              </div>
              <Switch
                checked={settings.allowBulkOperations}
                onCheckedChange={(allowBulkOperations) => onChange({ ...settings, allowBulkOperations })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Audit log</Label>
                <p className="text-sm text-gray-600">Ghi log tất cả hoạt động</p>
              </div>
              <Switch
                checked={settings.enableAuditLog}
                onCheckedChange={(enableAuditLog) => onChange({ ...settings, enableAuditLog })}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxConcurrentUploads">Upload đồng thời tối đa</Label>
              <Input
                id="maxConcurrentUploads"
                type="number"
                value={settings.maxConcurrentUploads}
                onChange={(e) => onChange({ ...settings, maxConcurrentUploads: parseInt(e.target.value) || 0 })}
                min="1"
                max="20"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Rate limiting</Label>
                <p className="text-sm text-gray-600">Giới hạn số request per user</p>
              </div>
              <Switch
                checked={settings.rateLimitEnabled}
                onCheckedChange={(rateLimitEnabled) => onChange({ ...settings, rateLimitEnabled })}
              />
            </div>
            
            {settings.rateLimitEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rateLimitRequests">Số request tối đa</Label>
                  <Input
                    id="rateLimitRequests"
                    type="number"
                    value={settings.rateLimitRequests}
                    onChange={(e) => onChange({ ...settings, rateLimitRequests: parseInt(e.target.value) || 0 })}
                    min="10"
                    max="1000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rateLimitWindow">Thời gian reset (phút)</Label>
                  <Input
                    id="rateLimitWindow"
                    type="number"
                    value={settings.rateLimitWindow}
                    onChange={(e) => onChange({ ...settings, rateLimitWindow: parseInt(e.target.value) || 0 })}
                    min="1"
                    max="60"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemSection({ 
  settings, 
  onChange 
}: { 
  settings: SystemSettings; 
  onChange: (settings: SystemSettings) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Hệ thống & Cache
        </CardTitle>
        <CardDescription>
          Cấu hình cache, metrics và maintenance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Kích hoạt cache</Label>
                <p className="text-sm text-gray-600">Cache hình ảnh để tăng tốc độ</p>
              </div>
              <Switch
                checked={settings.cacheEnabled}
                onCheckedChange={(cacheEnabled) => onChange({ ...settings, cacheEnabled })}
              />
            </div>
            
            {settings.cacheEnabled && (
              <div className="space-y-2">
                <Label htmlFor="cacheTTL">Cache TTL (giờ)</Label>
                <Input
                  id="cacheTTL"
                  type="number"
                  value={settings.cacheTTL}
                  onChange={(e) => onChange({ ...settings, cacheTTL: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="168"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Thu thập metrics</Label>
                <p className="text-sm text-gray-600">Ghi nhận thống kê sử dụng</p>
              </div>
              <Switch
                checked={settings.enableMetrics}
                onCheckedChange={(enableMetrics) => onChange({ ...settings, enableMetrics })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Thông báo</Label>
                <p className="text-sm text-gray-600">Gửi thông báo khi có lỗi</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(enableNotifications) => onChange({ ...settings, enableNotifications })}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Tự động dọn dẹp</Label>
                <p className="text-sm text-gray-600">Xóa file tạm và cache cũ</p>
              </div>
              <Switch
                checked={settings.autoCleanup}
                onCheckedChange={(autoCleanup) => onChange({ ...settings, autoCleanup })}
              />
            </div>
            
            {settings.autoCleanup && (
              <div className="space-y-2">
                <Label htmlFor="cleanupAfterDays">Xóa sau (ngày)</Label>
                <Input
                  id="cleanupAfterDays"
                  type="number"
                  value={settings.cleanupAfterDays}
                  onChange={(e) => onChange({ ...settings, cleanupAfterDays: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="365"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== MAIN SETTINGS TAB COMPONENT =====

export default function SettingsTab({ className }: SettingsTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [cloudinarySettings, setCloudinarySettings] = useState<CloudinarySettings>({} as CloudinarySettings);
  const [uploadSettings, setUploadSettings] = useState<UploadSettings>({} as UploadSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({} as SecuritySettings);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({} as SystemSettings);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await SettingsService.loadSettings();
        setCloudinarySettings(settings.cloudinary);
        setUploadSettings(settings.upload);
        setSecuritySettings(settings.security);
        setSystemSettings(settings.system);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [cloudinarySettings, uploadSettings, securitySettings, systemSettings]);

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await SettingsService.saveSettings({
        cloudinary: cloudinarySettings,
        upload: uploadSettings,
        security: securitySettings,
        system: systemSettings,
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset settings
  const handleReset = () => {
    // In real implementation, would reload from server
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Đang tải cài đặt...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cài đặt hệ thống</h3>
          <p className="text-sm text-gray-600">
            Cấu hình Cloudinary, upload settings và bảo mật
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Có thay đổi chưa lưu
            </Badge>
          )}
          
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            <Save className={cn('h-4 w-4 mr-2', isSaving && 'animate-spin')} />
            {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <CloudinarySection 
          settings={cloudinarySettings}
          onChange={setCloudinarySettings}
        />
        
        <UploadSection 
          settings={uploadSettings}
          onChange={setUploadSettings}
        />
        
        <SecuritySection 
          settings={securitySettings}
          onChange={setSecuritySettings}
        />
        
        <SystemSection 
          settings={systemSettings}
          onChange={setSystemSettings}
        />
      </div>

      {/* Help Text */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Lưu ý quan trọng:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Thay đổi cài đặt Cloudinary có thể ảnh hưởng đến tất cả hình ảnh</li>
                <li>• Test kết nối trước khi lưu cài đặt Cloudinary</li>
                <li>• Rate limiting áp dụng cho tất cả users, kể cả admin</li>
                <li>• Auto cleanup sẽ xóa vĩnh viễn các file tạm cũ</li>
                <li>• Backup cài đặt trước khi thay đổi quan trọng</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
