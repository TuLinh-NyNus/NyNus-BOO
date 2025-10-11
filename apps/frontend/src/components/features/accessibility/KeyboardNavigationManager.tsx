/**
 * Keyboard Navigation Manager Component
 * Component để quản lý keyboard navigation và focus management
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
  Keyboard,
  Navigation,
  Target,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CornerDownLeft,
  Space,
  Command,
  Settings,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

// ===== TYPES =====

export interface KeyboardNavigationManagerProps {
  className?: string;
  enableFocusTrap?: boolean;
  enableFocusIndicators?: boolean;
}

interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: 'navigation' | 'action' | 'accessibility' | 'form';
  enabled: boolean;
  global: boolean;
  handler: () => void;
}

interface FocusableElement {
  id: string;
  element: HTMLElement;
  type: 'button' | 'input' | 'link' | 'select' | 'textarea' | 'custom';
  tabIndex: number;
  isVisible: boolean;
  isDisabled: boolean;
  ariaLabel?: string;
  role?: string;
}

interface NavigationSettings {
  enableArrowKeys: boolean;
  enableTabNavigation: boolean;
  enableEnterSpace: boolean;
  enableEscapeKey: boolean;
  enableHomeEnd: boolean;
  enablePageUpDown: boolean;
  wrapNavigation: boolean;
  skipDisabledElements: boolean;
  highlightFocusedElement: boolean;
  announceNavigation: boolean;
}

interface FocusHistory {
  timestamp: Date;
  elementId: string;
  elementType: string;
  action: 'focus' | 'blur' | 'click' | 'keyboard';
  keys?: string[];
}

// ===== CONSTANTS =====

const DEFAULT_SETTINGS: NavigationSettings = {
  enableArrowKeys: true,
  enableTabNavigation: true,
  enableEnterSpace: true,
  enableEscapeKey: true,
  enableHomeEnd: true,
  enablePageUpDown: true,
  wrapNavigation: true,
  skipDisabledElements: true,
  highlightFocusedElement: true,
  announceNavigation: false
};

const KEY_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'ArrowUp': ArrowUp,
  'ArrowDown': ArrowDown,
  'ArrowLeft': ArrowLeft,
  'ArrowRight': ArrowRight,
  'Enter': CornerDownLeft,
  'Space': Space,
  'Alt': Command,
  'Ctrl': Command,
  'Shift': Command,
  'Tab': Keyboard
};

const CATEGORY_COLORS = {
  navigation: 'bg-blue-100 text-blue-800',
  action: 'bg-green-100 text-green-800',
  accessibility: 'bg-purple-100 text-purple-800',
  form: 'bg-orange-100 text-orange-800'
};

// ===== MAIN COMPONENT =====

export const KeyboardNavigationManager: React.FC<KeyboardNavigationManagerProps> = ({
  className,
  enableFocusTrap: _enableFocusTrap = false,
  enableFocusIndicators: _enableFocusIndicators = true
}) => {
  // ===== STATE =====

  const [settings, setSettings] = useState<NavigationSettings>(DEFAULT_SETTINGS);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);
  const [focusHistory, setFocusHistory] = useState<FocusHistory[]>([]);
  const [_currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const _focusTrapRef = useRef<HTMLDivElement>(null);
  const _lastFocusedElement = useRef<HTMLElement | null>(null);

  // ===== EFFECTS =====

  useEffect(() => {
    initializeKeyboardNavigation();
    setupKeyboardListeners();
    scanFocusableElements();

    return () => {
      cleanupKeyboardListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings.highlightFocusedElement) {
      addFocusStyles();
    } else {
      removeFocusStyles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.highlightFocusedElement]);

  // ===== HANDLERS =====

  const initializeKeyboardNavigation = useCallback(() => {
    setIsLoading(true);

    const defaultShortcuts: KeyboardShortcut[] = [
      {
        id: 'skip-to-main',
        name: 'Skip to Main Content',
        description: 'Chuyển đến nội dung chính',
        keys: ['Alt', 'S'],
        category: 'navigation',
        enabled: true,
        global: true,
        handler: () => {
          const main = document.querySelector('main') || document.querySelector('[role="main"]');
          if (main) {
            (main as HTMLElement).focus();
            addToFocusHistory('main', 'custom', 'keyboard', ['Alt', 'S']);
          }
        }
      },
      {
        id: 'skip-to-nav',
        name: 'Skip to Navigation',
        description: 'Chuyển đến menu điều hướng',
        keys: ['Alt', 'N'],
        category: 'navigation',
        enabled: true,
        global: true,
        handler: () => {
          const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
          if (nav) {
            (nav as HTMLElement).focus();
            addToFocusHistory('nav', 'custom', 'keyboard', ['Alt', 'N']);
          }
        }
      },
      {
        id: 'focus-search',
        name: 'Focus Search',
        description: 'Focus vào ô tìm kiếm',
        keys: ['Ctrl', 'K'],
        category: 'action',
        enabled: true,
        global: true,
        handler: () => {
          const search = document.querySelector('input[type="search"]') || 
                        document.querySelector('[role="searchbox"]');
          if (search) {
            (search as HTMLElement).focus();
            addToFocusHistory('search', 'input', 'keyboard', ['Ctrl', 'K']);
          }
        }
      },
      {
        id: 'toggle-accessibility',
        name: 'Toggle Accessibility',
        description: 'Bật/tắt accessibility features',
        keys: ['Alt', 'A'],
        category: 'accessibility',
        enabled: true,
        global: true,
        handler: () => {
          setIsActive(prev => !prev);
          addToFocusHistory('accessibility-toggle', 'custom', 'keyboard', ['Alt', 'A']);
        }
      },
      {
        id: 'show-shortcuts',
        name: 'Show Shortcuts',
        description: 'Hiển thị danh sách phím tắt',
        keys: ['Alt', 'H'],
        category: 'accessibility',
        enabled: true,
        global: true,
        handler: () => {
          // TODO: Show shortcuts modal
          console.log('Show shortcuts modal');
          addToFocusHistory('shortcuts-modal', 'custom', 'keyboard', ['Alt', 'H']);
        }
      }
    ];

    setShortcuts(defaultShortcuts);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupKeyboardListeners = useCallback(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive) return;

      // Handle global shortcuts
      const pressedKeys: string[] = [];
      if (event.ctrlKey) pressedKeys.push('Ctrl');
      if (event.altKey) pressedKeys.push('Alt');
      if (event.shiftKey) pressedKeys.push('Shift');
      if (event.metaKey) pressedKeys.push('Meta');
      pressedKeys.push(event.key);

      const shortcut = shortcuts.find(s =>
        s.enabled &&
        s.global &&
        s.keys.length === pressedKeys.length &&
        s.keys.every(key => pressedKeys.includes(key))
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.handler();
        return;
      }

      // Handle navigation keys
      if (settings.enableArrowKeys) {
        handleArrowKeyNavigation(event);
      }

      if (settings.enableHomeEnd) {
        handleHomeEndNavigation(event);
      }

      if (settings.enableEscapeKey && event.key === 'Escape') {
        handleEscapeKey(event);
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!isActive) return;

      const target = event.target as HTMLElement;
      if (target) {
        addToFocusHistory(
          target.id || target.tagName.toLowerCase(),
          target.tagName.toLowerCase() as FocusHistory['elementType'],
          'focus'
        );

        if (settings.announceNavigation) {
          announceElement(target);
        }
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      if (!isActive) return;

      const target = event.target as HTMLElement;
      if (target) {
        addToFocusHistory(
          target.id || target.tagName.toLowerCase(),
          target.tagName.toLowerCase() as FocusHistory['elementType'],
          'blur'
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, settings, shortcuts]);

  const cleanupKeyboardListeners = useCallback(() => {
    // Cleanup handled by useEffect return
  }, []);

  const handleArrowKeyNavigation = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;

    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = currentIndex + 1;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex - 1;
        break;
    }

    if (settings.wrapNavigation) {
      if (nextIndex >= focusableElements.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = focusableElements.length - 1;
    } else {
      nextIndex = Math.max(0, Math.min(nextIndex, focusableElements.length - 1));
    }

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      focusableElements[nextIndex].focus();
      setCurrentFocusIndex(nextIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.wrapNavigation]);

  const handleHomeEndNavigation = useCallback((event: KeyboardEvent) => {
    if (!['Home', 'End'].includes(event.key)) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    event.preventDefault();

    if (event.key === 'Home') {
      focusableElements[0].focus();
      setCurrentFocusIndex(0);
    } else if (event.key === 'End') {
      const lastIndex = focusableElements.length - 1;
      focusableElements[lastIndex].focus();
      setCurrentFocusIndex(lastIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    // Close modals, dropdowns, etc.
    const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
    const activeDropdown = document.querySelector('[role="menu"][aria-expanded="true"]');
    
    if (activeModal || activeDropdown) {
      event.preventDefault();
      // TODO: Implement modal/dropdown closing logic
      console.log('Escape key pressed - close active overlays');
    }
  }, []);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ');

    const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    
    return elements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             el.offsetParent !== null;
    });
  }, []);

  const scanFocusableElements = useCallback(() => {
    const elements = getFocusableElements();
    const focusableData: FocusableElement[] = elements.map((el, index) => ({
      id: el.id || `focusable-${index}`,
      element: el,
      type: el.tagName.toLowerCase() as FocusableElement['type'],
      tabIndex: el.tabIndex,
      isVisible: el.offsetParent !== null,
      isDisabled: el.hasAttribute('disabled'),
      ariaLabel: el.getAttribute('aria-label') || undefined,
      role: el.getAttribute('role') || undefined
    }));

    setFocusableElements(focusableData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToFocusHistory = useCallback((
    elementId: string,
    elementType: string,
    action: FocusHistory['action'],
    keys?: string[]
  ) => {
    const historyEntry: FocusHistory = {
      timestamp: new Date(),
      elementId,
      elementType,
      action,
      keys
    };

    setFocusHistory(prev => [...prev.slice(-19), historyEntry]); // Keep last 20
  }, []);

  const announceElement = useCallback((element: HTMLElement) => {
    if (!settings.announceNavigation) return;

    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('title') || 
                  element.textContent?.trim() || 
                  element.tagName.toLowerCase();

    // TODO: Integrate with screen reader announcements
    console.log(`Focus on: ${label}`);
  }, [settings.announceNavigation]);

  const addFocusStyles = useCallback(() => {
    const style = document.createElement('style');
    style.id = 'keyboard-navigation-styles';
    style.textContent = `
      *:focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
      }
      
      *:focus-visible {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
      }
    `;
    
    document.head.appendChild(style);
  }, []);

  const removeFocusStyles = useCallback(() => {
    const existingStyle = document.getElementById('keyboard-navigation-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  }, []);

  const handleSettingChange = useCallback(<K extends keyof NavigationSettings>(
    key: K,
    value: NavigationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleShortcutToggle = useCallback((shortcutId: string, enabled: boolean) => {
    setShortcuts(prev =>
      prev.map(shortcut =>
        shortcut.id === shortcutId ? { ...shortcut, enabled } : shortcut
      )
    );
  }, []);

  // ===== RENDER FUNCTIONS =====

  const renderKeyboardShortcuts = () => (
    <div className="space-y-4">
      {shortcuts.map((shortcut) => (
        <motion.div
          key={shortcut.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border rounded-lg p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">{shortcut.name}</h4>
                <Badge className={cn('text-xs', CATEGORY_COLORS[shortcut.category])}>
                  {shortcut.category}
                </Badge>
                {shortcut.global && (
                  <Badge variant="outline" className="text-xs">Global</Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {shortcut.description}
              </p>
              
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, index) => {
                  const IconComponent = KEY_ICONS[key];
                  return (
                    <React.Fragment key={key}>
                      {index > 0 && <span className="text-muted-foreground mx-1">+</span>}
                      <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-muted rounded">
                        {IconComponent && <IconComponent className="h-3 w-3" />}
                        {key}
                      </kbd>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            
            <Switch
              checked={shortcut.enabled}
              onCheckedChange={(checked) => handleShortcutToggle(shortcut.id, checked)}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderNavigationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Navigation Keys</CardTitle>
          <CardDescription>Cấu hình các phím điều hướng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Arrow Keys Navigation</Label>
            <Switch
              checked={settings.enableArrowKeys}
              onCheckedChange={(checked) => handleSettingChange('enableArrowKeys', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Tab Navigation</Label>
            <Switch
              checked={settings.enableTabNavigation}
              onCheckedChange={(checked) => handleSettingChange('enableTabNavigation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Enter/Space Activation</Label>
            <Switch
              checked={settings.enableEnterSpace}
              onCheckedChange={(checked) => handleSettingChange('enableEnterSpace', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Escape Key</Label>
            <Switch
              checked={settings.enableEscapeKey}
              onCheckedChange={(checked) => handleSettingChange('enableEscapeKey', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Home/End Keys</Label>
            <Switch
              checked={settings.enableHomeEnd}
              onCheckedChange={(checked) => handleSettingChange('enableHomeEnd', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Navigation Behavior</CardTitle>
          <CardDescription>Cấu hình hành vi điều hướng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Wrap Navigation</Label>
            <Switch
              checked={settings.wrapNavigation}
              onCheckedChange={(checked) => handleSettingChange('wrapNavigation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Skip Disabled Elements</Label>
            <Switch
              checked={settings.skipDisabledElements}
              onCheckedChange={(checked) => handleSettingChange('skipDisabledElements', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Highlight Focused Element</Label>
            <Switch
              checked={settings.highlightFocusedElement}
              onCheckedChange={(checked) => handleSettingChange('highlightFocusedElement', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Announce Navigation</Label>
            <Switch
              checked={settings.announceNavigation}
              onCheckedChange={(checked) => handleSettingChange('announceNavigation', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFocusableElements = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Tìm thấy {focusableElements.length} elements có thể focus
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={scanFocusableElements}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rescan
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {focusableElements.map((element, _index) => (
          <div key={element.id} className="border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {element.type}
                </Badge>
                {element.role && (
                  <Badge variant="secondary" className="text-xs">
                    {element.role}
                  </Badge>
                )}
                {!element.isVisible && (
                  <Badge variant="destructive" className="text-xs">Hidden</Badge>
                )}
                {element.isDisabled && (
                  <Badge variant="destructive" className="text-xs">Disabled</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Tab: {element.tabIndex}
              </div>
            </div>
            
            <div className="text-sm font-mono">
              {element.id || `<${element.type}>`}
            </div>
            
            {element.ariaLabel && (
              <div className="text-xs text-muted-foreground mt-1">
                ARIA: {element.ariaLabel}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFocusHistory = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Focus history - các sự kiện focus gần đây
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {focusHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có lịch sử focus
          </div>
        ) : (
          focusHistory.slice().reverse().map((entry, _index) => (
            <div key={_index} className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={
                  entry.action === 'focus' ? 'default' :
                  entry.action === 'blur' ? 'secondary' :
                  entry.action === 'keyboard' ? 'destructive' : 'outline'
                }>
                  {entry.action}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {entry.timestamp.toLocaleTimeString('vi-VN')}
                </div>
              </div>
              
              <div className="text-sm">
                <span className="font-mono">{entry.elementId}</span>
                <span className="text-muted-foreground ml-2">({entry.elementType})</span>
              </div>
              
              {entry.keys && (
                <div className="flex items-center gap-1 mt-2">
                  {entry.keys.map((key, keyIndex) => (
                    <React.Fragment key={key}>
                      {keyIndex > 0 && <span className="text-muted-foreground">+</span>}
                      <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded">
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              )}
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
          <span>Đang khởi tạo keyboard navigation...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Keyboard Navigation Manager</h2>
          <p className="text-muted-foreground">
            Quản lý keyboard navigation, focus management và accessibility shortcuts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </div>

      {/* Status Alert */}
      {!isActive && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Keyboard navigation is currently disabled. Enable it to use keyboard shortcuts and enhanced navigation.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="shortcuts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shortcuts" className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Shortcuts
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="elements" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Elements
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shortcuts">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>
                Quản lý các phím tắt toàn cục và navigation shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderKeyboardShortcuts()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Settings</CardTitle>
              <CardDescription>
                Cấu hình hành vi keyboard navigation và focus management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderNavigationSettings()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elements">
          <Card>
            <CardHeader>
              <CardTitle>Focusable Elements</CardTitle>
              <CardDescription>
                Danh sách các elements có thể focus trên trang hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderFocusableElements()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Focus History</CardTitle>
              <CardDescription>
                Lịch sử các sự kiện focus và keyboard interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderFocusHistory()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KeyboardNavigationManager;
