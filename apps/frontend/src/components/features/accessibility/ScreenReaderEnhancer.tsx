/**
 * Screen Reader Enhancer Component
 * Component để cải thiện hỗ trợ screen reader với ARIA patterns
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Volume2,
  Settings,
  Headphones,
  Keyboard,
  Accessibility,
  RefreshCw,
  Eye,
  MousePointer
} from 'lucide-react';
import { motion } from 'framer-motion';

// ===== TYPES =====

export interface ScreenReaderEnhancerProps {
  className?: string;
  autoDetect?: boolean;
  enableLiveRegion?: boolean;
}

interface ScreenReaderSettings {
  enabled: boolean;
  announceNavigation: boolean;
  announceFormChanges: boolean;
  announceContentUpdates: boolean;
  announceErrors: boolean;
  verbosityLevel: 'minimal' | 'normal' | 'verbose';
  speechRate: number;
  speechVolume: number;
  enableKeyboardShortcuts: boolean;
  enableFocusIndicators: boolean;
  enableSkipLinks: boolean;
}

interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'screen-reader' | 'keyboard' | 'visual' | 'motor';
  impact: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'error';
}

interface AriaLiveRegion {
  id: string;
  type: 'polite' | 'assertive' | 'off';
  content: string;
  timestamp: Date;
  category: 'navigation' | 'form' | 'content' | 'error' | 'success';
}

// ===== CONSTANTS =====

const VERBOSITY_LEVELS = {
  minimal: 'Tối thiểu - Chỉ thông báo quan trọng',
  normal: 'Bình thường - Thông báo cân bằng',
  verbose: 'Chi tiết - Thông báo đầy đủ'
};

const CATEGORY_ICONS = {
  'screen-reader': Headphones,
  'keyboard': Keyboard,
  'visual': Eye,
  'motor': MousePointer
};

const IMPACT_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

// ===== MAIN COMPONENT =====

export const ScreenReaderEnhancer: React.FC<ScreenReaderEnhancerProps> = ({
  className,
  autoDetect = true,
  enableLiveRegion = true
}) => {
  // ===== STATE =====

  const [settings, setSettings] = useState<ScreenReaderSettings>({
    enabled: false,
    announceNavigation: true,
    announceFormChanges: true,
    announceContentUpdates: true,
    announceErrors: true,
    verbosityLevel: 'normal',
    speechRate: 1.0,
    speechVolume: 0.8,
    enableKeyboardShortcuts: true,
    enableFocusIndicators: true,
    enableSkipLinks: true
  });

  const [features, setFeatures] = useState<AccessibilityFeature[]>([]);
  const [liveRegions, setLiveRegions] = useState<AriaLiveRegion[]>([]);
  const [isScreenReaderDetected, setIsScreenReaderDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const liveRegionRef = useRef<HTMLDivElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  // ===== EFFECTS =====

  useEffect(() => {
    initializeAccessibilityFeatures();
    if (autoDetect) {
      detectScreenReader();
    }
    setupKeyboardShortcuts();

    return () => {
      cleanupKeyboardShortcuts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDetect]);

  useEffect(() => {
    if (settings.enabled && enableLiveRegion) {
      setupLiveRegion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.enabled, enableLiveRegion]);

  // ===== HANDLERS =====

  const initializeAccessibilityFeatures = useCallback(() => {
    setIsLoading(true);
    
    const accessibilityFeatures: AccessibilityFeature[] = [
      {
        id: 'aria-labels',
        name: 'ARIA Labels',
        description: 'Semantic labels cho screen readers',
        enabled: true,
        category: 'screen-reader',
        impact: 'high',
        status: 'active'
      },
      {
        id: 'keyboard-navigation',
        name: 'Keyboard Navigation',
        description: 'Điều hướng bằng bàn phím',
        enabled: true,
        category: 'keyboard',
        impact: 'high',
        status: 'active'
      },
      {
        id: 'focus-indicators',
        name: 'Focus Indicators',
        description: 'Hiển thị focus rõ ràng',
        enabled: settings.enableFocusIndicators,
        category: 'visual',
        impact: 'medium',
        status: settings.enableFocusIndicators ? 'active' : 'inactive'
      },
      {
        id: 'skip-links',
        name: 'Skip Links',
        description: 'Liên kết bỏ qua nội dung',
        enabled: settings.enableSkipLinks,
        category: 'keyboard',
        impact: 'medium',
        status: settings.enableSkipLinks ? 'active' : 'inactive'
      },
      {
        id: 'high-contrast',
        name: 'High Contrast Mode',
        description: 'Chế độ tương phản cao',
        enabled: false,
        category: 'visual',
        impact: 'medium',
        status: 'inactive'
      },
      {
        id: 'reduced-motion',
        name: 'Reduced Motion',
        description: 'Giảm hiệu ứng chuyển động',
        enabled: false,
        category: 'motor',
        impact: 'low',
        status: 'inactive'
      }
    ];

    setFeatures(accessibilityFeatures);
    setIsLoading(false);
  }, [settings.enableFocusIndicators, settings.enableSkipLinks]);

  const detectScreenReader = useCallback(() => {
    // Detect screen reader presence
    const hasScreenReader =
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      window.speechSynthesis !== undefined ||
      'speechSynthesis' in window;

    setIsScreenReaderDetected(hasScreenReader);

    if (hasScreenReader && !settings.enabled) {
      setSettings(prev => ({ ...prev, enabled: true }));
      announceToScreenReader('Screen reader support đã được kích hoạt tự động', 'assertive');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.enabled]);

  const setupLiveRegion = useCallback(() => {
    if (!liveRegionRef.current) return;

    // Setup ARIA live region
    liveRegionRef.current.setAttribute('aria-live', 'polite');
    liveRegionRef.current.setAttribute('aria-atomic', 'true');
    liveRegionRef.current.setAttribute('aria-relevant', 'additions text');
  }, []);

  const setupKeyboardShortcuts = useCallback(() => {
    if (!settings.enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + A: Toggle accessibility features
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
        announceToScreenReader(
          `Accessibility features ${settings.enabled ? 'tắt' : 'bật'}`,
          'assertive'
        );
      }

      // Alt + S: Skip to main content
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
        if (mainContent) {
          (mainContent as HTMLElement).focus();
          announceToScreenReader('Đã chuyển đến nội dung chính', 'polite');
        }
      }

      // Alt + N: Skip to navigation
      if (event.altKey && event.key === 'n') {
        event.preventDefault();
        const navigation = document.querySelector('nav') || document.querySelector('[role="navigation"]');
        if (navigation) {
          (navigation as HTMLElement).focus();
          announceToScreenReader('Đã chuyển đến menu điều hướng', 'polite');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.enableKeyboardShortcuts, settings.enabled]);

  const cleanupKeyboardShortcuts = useCallback(() => {
    // Cleanup will be handled by useEffect return
  }, []);

  const announceToScreenReader = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite',
    category: AriaLiveRegion['category'] = 'content'
  ) => {
    if (!settings.enabled || !enableLiveRegion) return;

    const newRegion: AriaLiveRegion = {
      id: `live-${Date.now()}`,
      type: priority,
      content: message,
      timestamp: new Date(),
      category
    };

    setLiveRegions(prev => [...prev.slice(-9), newRegion]); // Keep last 10

    // Update live region
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = '';
      
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
        }
      }, 100);
    }

    // Use Speech Synthesis API if available
    if ('speechSynthesis' in window && settings.speechVolume > 0) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = settings.speechRate;
      utterance.volume = settings.speechVolume;
      utterance.lang = 'vi-VN';
      
      window.speechSynthesis.speak(utterance);
    }
  }, [settings.enabled, settings.speechRate, settings.speechVolume, enableLiveRegion]);

  const handleSettingChange = useCallback(<K extends keyof ScreenReaderSettings>(
    key: K,
    value: ScreenReaderSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Announce setting changes
    if (settings.enabled) {
      const settingNames: Record<string, string> = {
        announceNavigation: 'thông báo điều hướng',
        announceFormChanges: 'thông báo thay đổi form',
        announceContentUpdates: 'thông báo cập nhật nội dung',
        announceErrors: 'thông báo lỗi',
        verbosityLevel: 'mức độ chi tiết',
        enableKeyboardShortcuts: 'phím tắt',
        enableFocusIndicators: 'hiển thị focus',
        enableSkipLinks: 'liên kết bỏ qua'
      };

      const settingName = settingNames[key] || key;
      announceToScreenReader(`Đã thay đổi ${settingName}`, 'polite');
    }
  }, [settings.enabled, announceToScreenReader]);

  const handleFeatureToggle = useCallback((featureId: string, enabled: boolean) => {
    setFeatures(prev =>
      prev.map(feature =>
        feature.id === featureId
          ? { ...feature, enabled, status: enabled ? 'active' : 'inactive' }
          : feature
      )
    );

    const feature = features.find(f => f.id === featureId);
    if (feature) {
      announceToScreenReader(
        `${feature.name} đã được ${enabled ? 'bật' : 'tắt'}`,
        'polite'
      );
    }
  }, [features, announceToScreenReader]);

  const testScreenReader = useCallback(() => {
    announceToScreenReader(
      'Đây là test thông báo screen reader. Nếu bạn nghe được tin nhắn này, screen reader đang hoạt động bình thường.',
      'assertive'
    );
  }, [announceToScreenReader]);

  // ===== RENDER FUNCTIONS =====

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Main Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Screen Reader Support</Label>
              <p className="text-sm text-muted-foreground">
                Kích hoạt hỗ trợ screen reader và ARIA enhancements
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detection Status */}
      <Alert>
        <Accessibility className="h-4 w-4" />
        <AlertDescription>
          <strong>Screen Reader Detection:</strong> {isScreenReaderDetected ? (
            <span className="text-green-600">Đã phát hiện screen reader</span>
          ) : (
            <span className="text-gray-600">Không phát hiện screen reader</span>
          )}
        </AlertDescription>
      </Alert>

      {/* Announcement Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Announcement Settings</CardTitle>
          <CardDescription>Cấu hình các loại thông báo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Thông báo điều hướng</Label>
            <Switch
              checked={settings.announceNavigation}
              onCheckedChange={(checked) => handleSettingChange('announceNavigation', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Thông báo thay đổi form</Label>
            <Switch
              checked={settings.announceFormChanges}
              onCheckedChange={(checked) => handleSettingChange('announceFormChanges', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Thông báo cập nhật nội dung</Label>
            <Switch
              checked={settings.announceContentUpdates}
              onCheckedChange={(checked) => handleSettingChange('announceContentUpdates', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Thông báo lỗi</Label>
            <Switch
              checked={settings.announceErrors}
              onCheckedChange={(checked) => handleSettingChange('announceErrors', checked)}
              disabled={!settings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Verbosity Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verbosity Level</CardTitle>
          <CardDescription>Mức độ chi tiết của thông báo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(VERBOSITY_LEVELS).map(([level, description]) => (
              <div key={level} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={level}
                  name="verbosity"
                  value={level}
                  checked={settings.verbosityLevel === level}
                  onChange={(e) => handleSettingChange('verbosityLevel', e.target.value as ScreenReaderSettings['verbosityLevel'])}
                  disabled={!settings.enabled}
                  className="h-4 w-4"
                />
                <Label htmlFor={level} className="flex-1">
                  <div className="font-medium capitalize">{level}</div>
                  <div className="text-sm text-muted-foreground">{description}</div>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Speech Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Speech Settings</CardTitle>
          <CardDescription>Cấu hình tốc độ và âm lượng speech synthesis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tốc độ đọc: {settings.speechRate.toFixed(1)}x</Label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => handleSettingChange('speechRate', parseFloat(e.target.value))}
              disabled={!settings.enabled}
              className="w-full mt-2"
            />
          </div>

          <div>
            <Label>Âm lượng: {Math.round(settings.speechVolume * 100)}%</Label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.speechVolume}
              onChange={(e) => handleSettingChange('speechVolume', parseFloat(e.target.value))}
              disabled={!settings.enabled}
              className="w-full mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Button */}
      <Button
        onClick={testScreenReader}
        disabled={!settings.enabled}
        className="w-full"
      >
        <Volume2 className="h-4 w-4 mr-2" />
        Test Screen Reader
      </Button>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-4">
      {features.map((feature) => {
        const IconComponent = CATEGORY_ICONS[feature.category];
        
        return (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <IconComponent className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{feature.name}</h4>
                    <Badge className={cn('text-xs', IMPACT_COLORS[feature.impact])}>
                      {feature.impact} impact
                    </Badge>
                    <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {feature.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Category: {feature.category}
                  </div>
                </div>
              </div>
              <Switch
                checked={feature.enabled}
                onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderLiveRegions = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Live regions log - các thông báo gần đây cho screen reader
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {liveRegions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có thông báo nào
          </div>
        ) : (
          liveRegions.slice().reverse().map((region) => (
            <div key={region.id} className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={region.type === 'assertive' ? 'destructive' : 'secondary'}>
                  {region.type}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {region.timestamp.toLocaleTimeString('vi-VN')}
                </div>
              </div>
              <div className="text-sm">{region.content}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Category: {region.category}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ===== MAIN RENDER =====

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang khởi tạo accessibility features...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Skip Link */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Bỏ qua đến nội dung chính
      </a>

      {/* Live Region */}
      {enableLiveRegion && (
        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Screen Reader Enhancer</h2>
          <p className="text-muted-foreground">
            Cải thiện hỗ trợ screen reader với ARIA patterns và keyboard navigation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isScreenReaderDetected && (
            <Badge className="bg-green-100 text-green-800">
              <Headphones className="h-3 w-3 mr-1" />
              Screen Reader Detected
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Accessibility className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="live-regions" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Live Regions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Screen Reader Settings</CardTitle>
              <CardDescription>
                Cấu hình chi tiết cho screen reader support và speech synthesis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSettings()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Features</CardTitle>
              <CardDescription>
                Quản lý các tính năng accessibility như ARIA labels, keyboard navigation, focus indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderFeatures()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-regions">
          <Card>
            <CardHeader>
              <CardTitle>ARIA Live Regions</CardTitle>
              <CardDescription>
                Log các thông báo đã được gửi đến screen reader qua ARIA live regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLiveRegions()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScreenReaderEnhancer;
