/**
 * User Menu Component
 * User menu dropdown component cho admin header
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { User, Settings, LogOut, Shield, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { UserMenuProps, AdminUser } from '@/types/admin/header';
import { adminHeaderMockService } from '@/lib/mockdata/admin-header';
import { cn } from '@/lib/utils';

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
  const [user, setUser] = useState<AdminUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Load user data
   * Load thông tin user từ mock service
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await adminHeaderMockService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUser();
  }, []);

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
          // Default logout behavior
          console.log('Logout clicked');
        }
        break;
    }
  };

  /**
   * Render user avatar
   * Render avatar của user
   */
  const renderUserAvatar = () => {
    if (user?.avatar) {
      return (
        <Image
          src={user.avatar}
          alt={user.name}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    // Fallback to initials
    const initials = user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';

    return (
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
        <span className="text-sm font-medium text-white">
          {initials}
        </span>
      </div>
    );
  };

  /**
   * Render user trigger button
   * Render button để mở user menu
   */
  const renderUserTrigger = () => {
    const triggerClasses = cn(
      'flex items-center space-x-2 p-2 rounded-lg',
      'hover:bg-gray-100 transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-blue-500',
      variant === 'compact' ? 'space-x-1' : 'space-x-2'
    );

    return (
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClasses}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User avatar */}
        {renderUserAvatar()}

        {/* User info (hidden on compact) */}
        {variant !== 'compact' && user && (
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-gray-900 truncate max-w-24">
              {user.name}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-24">
              {user.role}
            </div>
          </div>
        )}

        {/* Chevron icon */}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform duration-150',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>
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
          'absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200',
          'animate-in fade-in-0 zoom-in-95 duration-150',
          'z-50'
        )}
      >
        {/* User info header */}
        {user && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {renderUserAvatar()}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {user.role}
                </div>
              </div>
            </div>
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
            icon={HelpCircle}
            label="Trợ giúp"
            description="Hướng dẫn sử dụng"
            onClick={() => window.location.href = '/3141592654/admin/help'}
          />
        </div>

        {/* Logout section */}
        <div className="border-t border-gray-100 py-2">
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

  if (!user) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {renderUserTrigger()}
      {renderUserDropdown()}
    </div>
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
    'hover:bg-gray-50 transition-colors duration-150',
    'focus:bg-gray-50 focus:outline-none',
    variant === 'danger' && 'hover:bg-red-50 focus:bg-red-50'
  );

  const iconClasses = cn(
    'w-4 h-4 mr-3 flex-shrink-0',
    variant === 'danger' ? 'text-red-500' : 'text-gray-400'
  );

  const labelClasses = cn(
    'text-sm font-medium',
    variant === 'danger' ? 'text-red-700' : 'text-gray-900'
  );

  const descriptionClasses = cn(
    'text-xs mt-0.5',
    variant === 'danger' ? 'text-red-500' : 'text-gray-500'
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
