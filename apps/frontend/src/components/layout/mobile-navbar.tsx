/**
 * Mobile Navbar Component
 * Navbar component tối ưu cho mobile devices với touch-friendly interactions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  BookOpen,
  Users,
  Settings,
  User,
  ChevronRight,
  Wifi,
  WifiOff,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context-grpc';
import { UserDisplay } from '@/components/features/auth/UserDisplay';
import { useNotifications } from '@/hooks/useNotifications';
import { useOnlineStatus } from '@/hooks/usePWA';

// ===== TYPES =====

interface MobileNavbarProps {
  className?: string;
  onMenuToggle?: (isOpen: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  requiresAuth?: boolean;
}

// ===== CONSTANTS =====

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Trang chủ',
    href: '/',
    icon: Home,
  },
  {
    id: 'courses',
    label: 'Khóa học',
    href: '/courses',
    icon: BookOpen,
  },
  {
    id: 'questions',
    label: 'Câu hỏi',
    href: '/questions',
    icon: Users,
    requiresAuth: true,
  },
  {
    id: 'profile',
    label: 'Hồ sơ',
    href: '/profile',
    icon: User,
    requiresAuth: true,
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    href: '/settings',
    icon: Settings,
    requiresAuth: true,
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    href: '/accessibility',
    icon: Eye,
  },
];

// ===== COMPONENT =====

export function MobileNavbar({ className, onMenuToggle }: MobileNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [_isAnimating, _setIsAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const isOnline = useOnlineStatus();

  // ===== EFFECTS =====

  // Handle menu toggle
  useEffect(() => {
    onMenuToggle?.(isMenuOpen);
  }, [isMenuOpen, onMenuToggle]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // ===== HANDLERS =====

  const openMenu = () => {
    _setIsAnimating(true);
    setIsMenuOpen(true);
    setTimeout(() => _setIsAnimating(false), 300);
  };

  const closeMenu = () => {
    _setIsAnimating(true);
    setIsMenuOpen(false);
    setTimeout(() => _setIsAnimating(false), 300);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      closeMenu();
    }
  };

  const handleNavItemClick = () => {
    closeMenu();
  };

  // ===== RENDER FUNCTIONS =====

  const renderMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={isMenuOpen ? closeMenu : openMenu}
      className={cn(
        'relative h-11 w-11 transition-all duration-200',
        'hover:bg-accent/10 focus:bg-accent/10',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
      )}
      aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
      aria-expanded={isMenuOpen}
    >
      <div className="relative">
        {isMenuOpen ? (
          <X className="h-5 w-5 transition-transform duration-200" />
        ) : (
          <Menu className="h-5 w-5 transition-transform duration-200" />
        )}
        
        {/* Notification indicator */}
        {!isMenuOpen && unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  );

  const renderNetworkStatus = () => (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span>Đã kết nối</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span>Không có kết nối</span>
        </>
      )}
    </div>
  );

  const renderUserSection = () => {
    if (!isAuthenticated || !user) {
      return (
        <div className="px-4 py-3 border-b border-border">
          <Link
            href="/login"
            onClick={handleNavItemClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">Đăng nhập</div>
              <div className="text-sm text-muted-foreground">Truy cập tài khoản</div>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Link>
        </div>
      );
    }

    return (
      <div className="px-4 py-3 border-b border-border">
        <UserDisplay
          user={user}
          variant="full"
          size="md"
          showRole={true}
          showLevel={true}
          showAvatar={true}
          showNotificationBadge={true}
          notificationCount={unreadCount}
          className="w-full p-3 rounded-lg hover:bg-accent/10 transition-colors"
        />
      </div>
    );
  };

  const renderNavItems = () => {
    const filteredItems = NAV_ITEMS.filter(item => 
      !item.requiresAuth || isAuthenticated
    );

    return (
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={handleNavItemClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                    'hover:bg-accent/10 focus:bg-accent/10',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isActive && 'bg-accent/20 text-primary font-medium'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <IconComponent className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="h-5 px-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className={cn(
                    'h-4 w-4 transition-transform',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  };

  const renderLogoutButton = () => {
    if (!isAuthenticated) return null;

    return (
      <div className="px-4 py-3 border-t border-border">
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            closeMenu();
          }}
          className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <User className="h-5 w-5" />
          Đăng xuất
        </Button>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <>
      {/* Menu Button */}
      <div className={cn('md:hidden', className)}>
        {renderMenuButton()}
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          ref={overlayRef}
          className={cn(
            'fixed inset-0 z-50 md:hidden',
            'bg-black/50 backdrop-blur-sm',
            'animate-in fade-in-0 duration-300'
          )}
          onClick={handleOverlayClick}
        >
          {/* Menu Panel */}
          <div
            ref={menuRef}
            className={cn(
              'fixed left-0 top-0 h-full w-80 max-w-[85vw]',
              'bg-background border-r border-border shadow-xl',
              'flex flex-col',
              'animate-in slide-in-from-left-0 duration-300'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">N</span>
                </div>
                <span className="font-semibold">NyNus</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMenu}
                className="h-8 w-8"
                aria-label="Đóng menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Network Status */}
            {renderNetworkStatus()}

            {/* User Section */}
            {renderUserSection()}

            {/* Navigation Items */}
            {renderNavItems()}

            {/* Logout Button */}
            {renderLogoutButton()}
          </div>
        </div>
      )}
    </>
  );
}

export default MobileNavbar;
