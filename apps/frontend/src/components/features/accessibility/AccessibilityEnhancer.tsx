/**
 * Accessibility Enhancer Component
 * Enhanced accessibility features cho user interface components
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
import { Slider } from '@/components/ui/form/slider';
import {
  Eye,
  Volume2,
  MousePointer,
  Zap,
  Settings,
  RefreshCw,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useHighContrast, useReducedMotion } from '@/lib/utils/question-list-accessibility';

// ===== TYPES =====

export interface AccessibilityEnhancerProps {
  className?: string;
  showControls?: boolean;
  autoDetect?: boolean;
}

interface AccessibilitySettings {
  // Visual enhancements
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: number; // 100 = normal, 150 = large
  focusIndicators: boolean;
  
  // Audio enhancements
  screenReader: boolean;
  audioFeedback: boolean;
  speechRate: number; // 0.5 to 2.0
  speechVolume: number; // 0 to 1
  
  // Motor enhancements
  keyboardNavigation: boolean;
  stickyKeys: boolean;
  clickDelay: number; // milliseconds
  
  // Cognitive enhancements
  simplifiedUI: boolean;
  autoFocus: boolean;
  skipAnimations: boolean;
}

interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  category: 'visual' | 'audio' | 'motor' | 'cognitive';
  enabled: boolean;
  impact: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'error';
}

// ===== CONSTANTS =====

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 100,
  focusIndicators: true,
  screenReader: false,
  audioFeedback: false,
  speechRate: 1.0,
  speechVolume: 0.8,
  keyboardNavigation: true,
  stickyKeys: false,
  clickDelay: 0,
  simplifiedUI: false,
  autoFocus: false,
  skipAnimations: false
};

const CATEGORY_ICONS = {
  visual: Eye,
  audio: Volume2,
  motor: MousePointer,
  cognitive: Zap
};

const IMPACT_COLORS = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

// ===== MAIN COMPONENT =====

export function AccessibilityEnhancer({
  className,
  showControls = true,
  autoDetect = true
}: AccessibilityEnhancerProps) {
  // ===== STATE =====

  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [features, setFeatures] = useState<AccessibilityFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  
  const { setTheme } = useTheme();
  const isHighContrast = useHighContrast();
  const prefersReducedMotion = useReducedMotion();
  
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // ===== EFFECTS =====

  useEffect(() => {
    // ✅ FIX: Inline initialization logic để tránh function dependency
    // Prevents infinite loop caused by initializeAccessibility recreation
    setIsLoading(true);

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('nynus-accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    }

    // Initialize features list for UI display
    const accessibilityFeatures: AccessibilityFeature[] = [
      {
        id: 'high-contrast',
        name: 'Chế độ tương phản cao',
        description: 'Tăng độ tương phản cho người khiếm thị',
        category: 'visual',
        enabled: settings.highContrast,
        impact: 'high',
        status: settings.highContrast ? 'active' : 'inactive'
      },
      {
        id: 'large-text',
        name: 'Chữ to',
        description: 'Tăng kích thước chữ cho dễ đọc',
        category: 'visual',
        enabled: settings.fontSize > 100,
        impact: 'medium',
        status: settings.fontSize > 100 ? 'active' : 'inactive'
      },
      {
        id: 'screen-reader',
        name: 'Hỗ trợ đọc màn hình',
        description: 'Tối ưu cho phần mềm đọc màn hình',
        category: 'audio',
        enabled: settings.screenReader,
        impact: 'high',
        status: settings.screenReader ? 'active' : 'inactive'
      },
      {
        id: 'keyboard-nav',
        name: 'Điều hướng bàn phím',
        description: 'Hỗ trợ điều hướng bằng bàn phím',
        category: 'motor',
        enabled: settings.keyboardNavigation,
        impact: 'high',
        status: settings.keyboardNavigation ? 'active' : 'inactive'
      },
      {
        id: 'reduced-motion',
        name: 'Giảm chuyển động',
        description: 'Giảm hiệu ứng animation cho người nhạy cảm',
        category: 'cognitive',
        enabled: settings.reducedMotion,
        impact: 'medium',
        status: settings.reducedMotion ? 'active' : 'inactive'
      }
    ];
    setFeatures(accessibilityFeatures);

    // Auto-detect accessibility needs if enabled
    if (autoDetect) {
      // Detect screen reader
      const hasScreenReader =
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        'speechSynthesis' in window;

      if (hasScreenReader) {
        setSettings(prev => ({ ...prev, screenReader: true }));
      }

      // Detect high contrast preference
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        setSettings(prev => ({ ...prev, highContrast: true }));
        setTheme('dark');
      }
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDetect, settings.highContrast, settings.fontSize, settings.screenReader, settings.keyboardNavigation, settings.reducedMotion]); // ✅ Primitive dependencies for features update

  useEffect(() => {
    // ✅ FIX: Inline apply settings logic để tránh function dependency
    // Prevents infinite loop caused by applyAccessibilitySettings recreation
    const root = document.documentElement;

    // Apply font size
    root.style.setProperty('--accessibility-font-scale', `${settings.fontSize / 100}`);

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Save settings to localStorage
    localStorage.setItem('nynus-accessibility-settings', JSON.stringify(settings));
  }, [settings]); // ✅ Settings object dependency is acceptable here

  useEffect(() => {
    // Sync with system preferences
    setSettings(prev => ({
      ...prev,
      highContrast: isHighContrast,
      reducedMotion: prefersReducedMotion
    }));
  }, [isHighContrast, prefersReducedMotion]);

  // ===== HANDLERS =====
  // Note: initializeAccessibility, detectAccessibilityNeeds, applyAccessibilitySettings
  // have been inlined into useEffect hooks above to prevent infinite loops

  const announceToScreenReader = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (!settings.screenReader || !liveRegionRef.current) return;

    liveRegionRef.current.setAttribute('aria-live', priority);
    liveRegionRef.current.textContent = '';
    
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = message;
      }
    }, 100);

    // Use Speech Synthesis API if available
    if ('speechSynthesis' in window && settings.audioFeedback) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = settings.speechRate;
      utterance.volume = settings.speechVolume;
      utterance.lang = 'vi-VN';
      
      window.speechSynthesis.speak(utterance);
    }
  }, [settings.screenReader, settings.audioFeedback, settings.speechRate, settings.speechVolume]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Announce changes to screen reader
    announceToScreenReader(`${key} đã được ${value ? 'bật' : 'tắt'}`, 'polite');
  }, [announceToScreenReader]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    announceToScreenReader('Cài đặt accessibility đã được reset về mặc định', 'assertive');
  }, [announceToScreenReader]);

  // ===== RENDER FUNCTIONS =====

  const renderFeatureCard = (feature: AccessibilityFeature) => {
    const IconComponent = CATEGORY_ICONS[feature.category];
    const impactColor = IMPACT_COLORS[feature.impact];

    return (
      <Card key={feature.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-sm">{feature.name}</CardTitle>
            </div>
            <Badge className={cn('text-xs', impactColor)}>
              {feature.impact}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {feature.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {feature.status === 'active' ? 'Đang bật' : 'Đang tắt'}
            </span>
            <div className="flex items-center gap-2">
              {feature.status === 'active' && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {feature.status === 'error' && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
      {/* Live Region for Screen Reader */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Main Controls */}
      {showControls && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài đặt Accessibility
                </CardTitle>
                <CardDescription>
                  Tùy chỉnh trải nghiệm cho nhu cầu accessibility của bạn
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSettings}
                >
                  Reset
                </Button>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  aria-label="Bật/tắt accessibility features"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Cài đặt hiển thị
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Tương phản cao</label>
                    <p className="text-xs text-muted-foreground">Tăng độ tương phản màu sắc</p>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Giảm chuyển động</label>
                    <p className="text-xs text-muted-foreground">Giảm hiệu ứng animation</p>
                  </div>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kích thước chữ: {settings.fontSize}%</label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]: number[]) => updateSetting('fontSize', value)}
                  min={75}
                  max={200}
                  step={25}
                  className="w-full"
                />
              </div>
            </div>

            {/* Audio Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Cài đặt âm thanh
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Hỗ trợ đọc màn hình</label>
                    <p className="text-xs text-muted-foreground">Tối ưu cho screen reader</p>
                  </div>
                  <Switch
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Phản hồi âm thanh</label>
                    <p className="text-xs text-muted-foreground">Âm thanh khi tương tác</p>
                  </div>
                  <Switch
                    checked={settings.audioFeedback}
                    onCheckedChange={(checked) => updateSetting('audioFeedback', checked)}
                  />
                </div>
              </div>

              {settings.audioFeedback && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tốc độ đọc: {settings.speechRate}x</label>
                    <Slider
                      value={[settings.speechRate]}
                      onValueChange={([value]: number[]) => updateSetting('speechRate', value)}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Âm lượng: {Math.round(settings.speechVolume * 100)}%</label>
                    <Slider
                      value={[settings.speechVolume]}
                      onValueChange={([value]: number[]) => updateSetting('speechVolume', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(renderFeatureCard)}
      </div>
    </div>
  );
}

export default AccessibilityEnhancer;
