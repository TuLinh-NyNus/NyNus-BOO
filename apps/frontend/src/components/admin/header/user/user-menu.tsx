/**
 * User Menu Component
 * User menu dropdown component cho admin header
 * Enhanced với UserDisplay component và notification support
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Settings, LogOut, Shield, Bell, HelpCircle, Eye } from 'lucide-react';
import { UserMenuProps } from '@/types/admin/header';
import { cn } from '@/lib/utils';
import { UserDisplay } from '@/components/features/auth/UserDisplay';
import { useNotificationBadge } from '@/components/features/notifications/NotificationBadge';
import { HydrationSafe } from '@/components/common/hydration-safe';
import { useAuth } from '@/contexts/auth-context-grpc';
import { useAdminNotifications } from '@/hooks/admin/use-admin-notifications';

/**
 * User Menu Component
 * Component chính cho user menu dropdown
 */
export function UserMenu({
  className,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  variant = 'default'
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isLoading: authLoading, logout } = useAuth();
  const { unreadCount, actions } = useAdminNotifications();
  const { refreshNotifications } = actions;

  // Notification badge hook
  const {
    count: notificationCount,
    setCount: setNotificationCount
  } = useNotificationBadge(0);

  useEffect(() => {
    setNotificationCount(unreadCount);
  }, [unreadCount, setNotificationCount]);

  useEffect(() => {
    if (isOpen) {
      refreshNotifications().catch(error => {
        console.error('Failed to refresh notifications', error);
      });
    }
  }, [isOpen, refreshNotifications]);

  const displayName = useMemo(() => {
    if (!user) return 'Người dùng';
    if (user.name) return user.name;

    const composedName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return composedName || user.email || 'Người dùng';
  }, [user]);

  /**
   * Handle click outside
   * Xử lý khi click bên ngoài dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handle menu item click
   * Xử lý khi click vào menu item
   */
  const handleMenuItemClick = (action: string) => {
    setIsOpen(false);

    switch (action) {
      case 'profile':
        if (onProfileClick) {
          onProfileClick();
        } else {
          window.location.href = '/3141592654/admin/profile';
        }
        break;
      case 'settings':
        if (onSettingsClick) {
          onSettingsClick();
        } else {
          window.location.href = '/3141592654/admin/settings';
        }
        break;
      case 'logout':
        if (onLogoutClick) {
          onLogoutClick();
        } else {
          logout().catch(error => {
            console.error('Logout failed', error);
          });
        }
        break;
    }
  };

  // renderUserAvatar function removed - now handled by UserDisplay component

  /**
   * Render user trigger button
   * Render button để mở user menu với UserDisplay component
   */
  const renderUserTrigger = () => {
    const isUserLoading = authLoading && !user;

    if (isUserLoading) {
      return (
        <div className="flex items-center space-x-2 p-2" suppressHydrationWarning={true}>
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          {variant !== 'compact' && (
            <div className="hidden sm:block space-y-1">
              <div className="h-4 bg-muted animate-pulse rounded w-20" />
              <div className="h-3 bg-muted animate-pulse rounded w-16" />
            </div>
          )}
        </div>
      );
    }

    if (!user) {
      return (
        <button
          type="button"
          className={cn(
            'flex items-center space-x-2 p-2 rounded-lg text-sm text-muted-foreground',
            'hover:bg-accent/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <User className="w-4 h-4" />
          <span>Tài khoản</span>
        </button>
      );
    }

    return (
      <div className="flex-shrink-0">
        <UserDisplay
          user={user}
          variant={variant === 'compact' ? 'compact' : 'dropdown-trigger'}
          size="md"
          showRole={variant !== 'compact'}
          showLevel={false}
          showAvatar={true}
          showNotificationBadge={true}
          notificationCount={notificationCount}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'hover:bg-accent/10 transition-colors duration-150 rounded-lg',
            'w-full',
            isOpen && '[&_svg]:rotate-180'
          )}
          ariaLabel={`User menu for ${displayName}. ${isOpen ? 'Expanded' : 'Collapsed'}`}
        />
      </div>
    );
  };

  /**
   * Render user menu dropdown
   * Render dropdown menu
   */
  const renderUserDropdown = () => {
    if (!isOpen) return null;

    return (
      <div
        className={cn(
          'absolute right-0 top-full mt-2 w-64 bg-background rounded-lg shadow-lg border border-border',
          'animate-in fade-in-0 zoom-in-95 duration-150',
          'z-50'
        )}
      >
        {/* User info header với UserDisplay */}
        {user && (
          <div className="px-4 py-3 border-b border-border">
            <UserDisplay
              user={user}
              variant="full"
              size="md"
              showRole={true}
              showLevel={true}
              showAvatar={true}
              showNotificationBadge={false}
              className="w-full"
            />
          </div>
        )}

        {/* Menu items */}
        <div className="py-2">
          <UserMenuItem
            icon={User}
            label="Hồ sơ cá nhân"
            description="Xem và chỉnh sửa thông tin"
            onClick={() => handleMenuItemClick('profile')}
          />
          
          <UserMenuItem
            icon={Settings}
            label="Cài đặt"
            description="Tùy chỉnh hệ thống"
            onClick={() => handleMenuItemClick('settings')}
          />
          
          <UserMenuItem
            icon={Shield}
            label="Bảo mật"
            description="Quản lý bảo mật tài khoản"
            onClick={() => window.location.href = '/3141592654/admin/security'}
          />
          
          <UserMenuItem
            icon={Bell}
            label="Thông báo"
            description="Cài đặt thông báo"
            onClick={() => window.location.href = '/3141592654/admin/notifications/settings'}
          />

          <UserMenuItem
            icon={Eye}
            label="Accessibility"
            description="Cài đặt trợ năng"
            onClick={() => window.location.href = '/accessibility'}
          />

          <UserMenuItem
            icon={HelpCircle}
            label="Trợ giúp"
            description="Hướng dẫn sử dụng"
            onClick={() => window.location.href = '/3141592654/admin/help'}
          />
        </div>

        {/* Logout section */}
        <div className="border-t border-border py-2">
          <UserMenuItem
            icon={LogOut}
            label="Đăng xuất"
            description="Thoát khỏi hệ thống"
            onClick={() => handleMenuItemClick('logout')}
            variant="danger"
          />
        </div>
      </div>
    );
  };

  // Loading state được handle trong renderUserTrigger

  return (
    <HydrationSafe fallback={
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
    }>
      <div ref={dropdownRef} className={cn('relative flex-shrink-0', className)}>
        {renderUserTrigger()}
        {renderUserDropdown()}
      </div>
    </HydrationSafe>
  );
}

/**
 * User Menu Item Component
 * Component cho individual menu item
 */
function UserMenuItem({
  icon: Icon,
  label,
  description,
  onClick,
  variant = 'default'
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  const itemClasses = cn(
    'w-full flex items-center px-4 py-2 text-left',
    'hover:bg-accent/10 transition-colors duration-150',
    'focus:bg-accent/10 focus:outline-none',
    variant === 'danger' && 'hover:bg-destructive/10 focus:bg-destructive/10'
  );

  const iconClasses = cn(
    'w-4 h-4 mr-3 flex-shrink-0',
    variant === 'danger' ? 'text-destructive' : 'text-muted-foreground'
  );

  const labelClasses = cn(
    'text-sm font-medium',
    variant === 'danger' ? 'text-destructive' : 'text-foreground'
  );

  const descriptionClasses = cn(
    'text-xs mt-0.5',
    variant === 'danger' ? 'text-destructive/80' : 'text-muted-foreground'
  );

  return (
    <button type="button" onClick={onClick} className={itemClasses}>
      <Icon className={iconClasses} />
      <div className="flex-1 min-w-0">
        <div className={labelClasses}>{label}</div>
        {description && (
          <div className={descriptionClasses}>{description}</div>
        )}
      </div>
    </button>
  );
}

/**
 * Compact User Menu
 * Compact version cho mobile
 */
export function CompactUserMenu({
  className,
  onProfileClick,
  onSettingsClick,
  onLogoutClick
}: Omit<UserMenuProps, 'variant'>) {
  return (
    <UserMenu
      className={className}
      onProfileClick={onProfileClick}
      onSettingsClick={onSettingsClick}
      onLogoutClick={onLogoutClick}
      variant="compact"
    />
  );
}
