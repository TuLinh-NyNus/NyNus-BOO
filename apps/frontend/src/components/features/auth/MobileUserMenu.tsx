/**
 * Mobile User Menu Component
 * Full-screen user menu tối ưu cho mobile devices với touch-friendly interactions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Edit,
  Camera,
  Moon,
  Sun,
  Globe,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/auth-context-grpc';
import { UserDisplay } from '@/components/features/auth/UserDisplay';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from 'next-themes';
import { logger } from '@/lib/utils/logger';

// ===== TYPES =====

interface MobileUserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  badge?: number;
  variant?: 'default' | 'danger';
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

// ===== COMPONENT =====

export function MobileUserMenu({ isOpen, onClose, className }: MobileUserMenuProps) {
  const [_isAnimating, _setIsAnimating] = useState(false);
  const [_activeSection, _setActiveSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();

  // ===== EFFECTS =====

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      _setIsAnimating(true);
      setTimeout(() => _setIsAnimating(false), 300);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ===== HANDLERS =====

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  /**
   * Handle user logout
   * Business Logic: Đăng xuất user và đóng mobile menu
   */
  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      logger.error('[MobileUserMenu] Logout failed', {
        operation: 'logout',
        userId: user?.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleThemeToggle = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
  };

  // ===== MENU CONFIGURATION =====

  const menuSections: MenuSection[] = [
    {
      id: 'account',
      title: 'Tài khoản',
      items: [
        {
          id: 'profile',
          label: 'Hồ sơ cá nhân',
          description: 'Xem và chỉnh sửa thông tin',
          icon: User,
          href: '/profile'
        },
        {
          id: 'edit-profile',
          label: 'Chỉnh sửa hồ sơ',
          description: 'Cập nhật thông tin cá nhân',
          icon: Edit,
          href: '/profile/edit'
        },
        {
          id: 'change-avatar',
          label: 'Đổi ảnh đại diện',
          description: 'Cập nhật ảnh hồ sơ',
          icon: Camera,
          onClick: () => {
            // Handle avatar change
            logger.debug('[MobileUserMenu] Change avatar clicked', {
              operation: 'changeAvatar',
              userId: user?.id,
            });
          }
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Tùy chỉnh',
      items: [
        {
          id: 'settings',
          label: 'Cài đặt',
          description: 'Tùy chỉnh hệ thống',
          icon: Settings,
          href: '/settings'
        },
        {
          id: 'notifications',
          label: 'Thông báo',
          description: 'Quản lý thông báo',
          icon: Bell,
          href: '/notifications',
          badge: unreadCount
        },
        {
          id: 'dark-mode',
          label: 'Chế độ tối',
          description: 'Bật/tắt giao diện tối',
          icon: theme === 'dark' ? Moon : Sun,
          showToggle: true,
          toggleValue: theme === 'dark',
          onToggle: handleThemeToggle
        },
        {
          id: 'language',
          label: 'Ngôn ngữ',
          description: 'Tiếng Việt',
          icon: Globe,
          onClick: () => {
            // Handle language change
            logger.debug('[MobileUserMenu] Language settings clicked', {
              operation: 'changeLanguage',
              userId: user?.id,
            });
          }
        }
      ]
    },
    {
      id: 'security',
      title: 'Bảo mật',
      items: [
        {
          id: 'security-settings',
          label: 'Bảo mật tài khoản',
          description: 'Mật khẩu, 2FA, phiên đăng nhập',
          icon: Shield,
          href: '/security'
        },
        {
          id: 'device-management',
          label: 'Quản lý thiết bị',
          description: 'Các thiết bị đã đăng nhập',
          icon: Smartphone,
          href: '/security/devices'
        }
      ]
    },
    {
      id: 'support',
      title: 'Hỗ trợ',
      items: [
        {
          id: 'help',
          label: 'Trợ giúp',
          description: 'Hướng dẫn sử dụng',
          icon: HelpCircle,
          href: '/help'
        }
      ]
    }
  ];

  // ===== RENDER FUNCTIONS =====

  const renderHeader = () => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <h2 className="text-lg font-semibold">Menu</h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-9 w-9"
        aria-label="Đóng menu"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );

  const renderUserProfile = () => {
    if (!user) return null;

    return (
      <div className="px-6 py-6 border-b border-border">
        <UserDisplay
          user={user}
          variant="full"
          size="lg"
          showRole={true}
          showLevel={true}
          showAvatar={true}
          showNotificationBadge={true}
          notificationCount={unreadCount}
          className="w-full"
        />
      </div>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const ItemIcon = item.icon;
    
    if (item.showToggle) {
      return (
        <div
          key={item.id}
          className={cn(
            'flex items-center justify-between px-6 py-4',
            'hover:bg-accent/10 active:bg-accent/20 transition-colors',
            'min-h-[64px]' // Touch-friendly height
          )}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-shrink-0">
              <ItemIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground">{item.label}</div>
              {item.description && (
                <div className="text-sm text-muted-foreground mt-0.5">
                  {item.description}
                </div>
              )}
            </div>
          </div>
          <Switch
            checked={item.toggleValue}
            onCheckedChange={item.onToggle}
            className="flex-shrink-0"
          />
        </div>
      );
    }

    const handleClick = () => {
      if (item.onClick) {
        item.onClick();
      } else if (item.href) {
        window.location.href = item.href;
      }
      onClose();
    };

    return (
      <button
        key={item.id}
        type="button"
        onClick={handleClick}
        className={cn(
          'w-full flex items-center justify-between px-6 py-4',
          'hover:bg-accent/10 active:bg-accent/20 transition-colors',
          'text-left min-h-[64px]', // Touch-friendly height
          item.variant === 'danger' && 'hover:bg-destructive/10 active:bg-destructive/20'
        )}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            <ItemIcon className={cn(
              'h-5 w-5',
              item.variant === 'danger' ? 'text-destructive' : 'text-muted-foreground'
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn(
              'font-medium',
              item.variant === 'danger' ? 'text-destructive' : 'text-foreground'
            )}>
              {item.label}
            </div>
            {item.description && (
              <div className={cn(
                'text-sm mt-0.5',
                item.variant === 'danger' ? 'text-destructive/80' : 'text-muted-foreground'
              )}>
                {item.description}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.badge && item.badge > 0 && (
            <Badge variant="destructive" className="h-5 px-2 text-xs">
              {item.badge > 99 ? '99+' : item.badge}
            </Badge>
          )}
          <ChevronRight className={cn(
            'h-4 w-4',
            item.variant === 'danger' ? 'text-destructive' : 'text-muted-foreground'
          )} />
        </div>
      </button>
    );
  };

  const renderMenuSection = (section: MenuSection) => (
    <div key={section.id} className="py-2">
      <div className="px-6 py-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {section.title}
        </h3>
      </div>
      <div className="space-y-0">
        {section.items.map(renderMenuItem)}
      </div>
    </div>
  );

  const renderLogoutSection = () => (
    <div className="border-t border-border mt-4">
      <button
        type="button"
        onClick={handleLogout}
        className={cn(
          'w-full flex items-center gap-4 px-6 py-4',
          'hover:bg-destructive/10 active:bg-destructive/20 transition-colors',
          'text-left min-h-[64px]' // Touch-friendly height
        )}
      >
        <LogOut className="h-5 w-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium text-destructive">Đăng xuất</div>
          <div className="text-sm text-destructive/80 mt-0.5">
            Thoát khỏi tài khoản
          </div>
        </div>
      </button>
    </div>
  );

  // ===== MAIN RENDER =====

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={cn(
        'fixed inset-0 z-50',
        'bg-black/50 backdrop-blur-sm',
        'animate-in fade-in-0 duration-300',
        className
      )}
      onClick={handleOverlayClick}
    >
      {/* Menu Panel */}
      <div
        ref={menuRef}
        className={cn(
          'fixed inset-y-0 right-0 w-full max-w-sm',
          'bg-background shadow-xl border-l border-border',
          'flex flex-col overflow-hidden',
          'animate-in slide-in-from-right-0 duration-300'
        )}
      >
        {/* Header */}
        {renderHeader()}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User Profile */}
          {renderUserProfile()}

          {/* Menu Sections */}
          <div className="py-2">
            {menuSections.map(renderMenuSection)}
          </div>

          {/* Logout Section */}
          {renderLogoutSection()}

          {/* Bottom Padding for safe area */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}

export default MobileUserMenu;
