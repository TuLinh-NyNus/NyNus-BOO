/**
 * Enhanced User Display Component
 * Unified component để hiển thị user information với multiple variants
 * 
 * @author NyNus Team
 * @version 2.0.0
 */

"use client";

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LevelIndicator } from './LevelIndicator';
import { NotificationBadge } from '../notifications/NotificationBadge';
import { ChevronDown } from 'lucide-react';
import { useIsHydrated } from '@/components/common/hydration-safe';
import { getProtobufRoleLabel, getProtobufRoleColor } from '@/lib/utils/type-converters';
import { useUserDisplayOptimization } from '@/hooks/usePerformanceOptimization';
import type { User as UserType } from '@/types/user';

// ===== TYPES =====

export interface UserDisplayProps {
  /** User data object */
  user: UserType;
  /** Display variant */
  variant?: 'compact' | 'full' | 'dropdown-trigger' | 'card' | 'mobile-compact' | 'mobile-full';
  /** Component size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show role badge */
  showRole?: boolean;
  /** Show level indicator */
  showLevel?: boolean;
  /** Show user avatar */
  showAvatar?: boolean;
  /** Show notification badge */
  showNotificationBadge?: boolean;
  /** Notification count */
  notificationCount?: number;
  /** Click handler */
  onClick?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

// ===== CONSTANTS =====

const SIZE_CONFIG = {
  sm: {
    avatar: 'h-8 w-8',
    text: 'text-sm',
    badge: 'text-xs',
    gap: 'gap-2',
    padding: 'p-2'
  },
  md: {
    avatar: 'h-10 w-10',
    text: 'text-sm',
    badge: 'text-xs',
    gap: 'gap-3',
    padding: 'p-3'
  },
  lg: {
    avatar: 'h-12 w-12',
    text: 'text-base',
    badge: 'text-sm',
    gap: 'gap-4',
    padding: 'p-4'
  },
  xl: {
    avatar: 'h-16 w-16',
    text: 'text-lg',
    badge: 'text-base',
    gap: 'gap-5',
    padding: 'p-5'
  }
} as const;

const VARIANT_CONFIG = {
  compact: {
    showName: false,
    showEmail: false,
    showRole: false,
    showLevel: false,
    layout: 'horizontal'
  },
  full: {
    showName: true,
    showEmail: true,
    showRole: true,
    showLevel: true,
    layout: 'vertical'
  },
  'dropdown-trigger': {
    showName: true,
    showEmail: false,
    showRole: true,
    showLevel: false,
    layout: 'horizontal'
  },
  card: {
    showName: true,
    showEmail: true,
    showRole: true,
    showLevel: true,
    layout: 'vertical'
  },
  'mobile-compact': {
    showName: false,
    showEmail: false,
    showRole: false,
    showLevel: false,
    layout: 'horizontal'
  },
  'mobile-full': {
    showName: true,
    showEmail: false,
    showRole: true,
    showLevel: true,
    layout: 'vertical'
  }
} as const;

// ===== COMPONENT =====

export const UserDisplay = memo<UserDisplayProps>(({
  user,
  variant = 'full',
  size = 'md',
  showRole = true,
  showLevel = true,
  showAvatar = true,
  showNotificationBadge = false,
  notificationCount = 0,
  onClick,
  isLoading = false,
  className = '',
  ariaLabel
}) => {
  // ===== HYDRATION SAFETY =====

  const isHydrated = useIsHydrated();

  // ===== PERFORMANCE OPTIMIZATION =====

  const { startRender, endRender, cachedUserData } = useUserDisplayOptimization();

  // Use cached user data if available
  const optimizedUser = cachedUserData || user;

  // ===== COMPUTED VALUES =====

  const sizeConfig = SIZE_CONFIG[size];
  const variantConfig = VARIANT_CONFIG[variant];
  
  const userInitials = useMemo(() => {
    if (!optimizedUser?.firstName && !optimizedUser?.lastName) return 'U';
    return `${optimizedUser.firstName?.[0] || ''}${optimizedUser.lastName?.[0] || ''}`.toUpperCase();
  }, [optimizedUser?.firstName, optimizedUser?.lastName]);

  const userFullName = useMemo(() => {
    return `${optimizedUser?.firstName || ''} ${optimizedUser?.lastName || ''}`.trim() || 'Người dùng';
  }, [optimizedUser?.firstName, optimizedUser?.lastName]);

  const roleLabel = useMemo(() => {
    return optimizedUser?.role ? getProtobufRoleLabel(optimizedUser.role) : 'Không xác định';
  }, [optimizedUser?.role]);

  const roleColor = useMemo(() => {
    return optimizedUser?.role ? getProtobufRoleColor(optimizedUser.role) : 'gray';
  }, [optimizedUser?.role]);

  // ===== RENDER FUNCTIONS =====

  /**
   * Render user avatar với notification badge
   */
  const renderAvatar = () => {
    if (!showAvatar) return null;

    return (
      <div className="relative">
        <Avatar className={cn(sizeConfig.avatar, 'ring-2 ring-background')}>
          <AvatarImage
            src={optimizedUser?.avatar}
            alt={`${userFullName} avatar`}
            className="object-cover"
          />
          <AvatarFallback className="bg-muted text-muted-foreground font-medium">
            {isLoading ? (
              <div className="animate-pulse bg-muted-foreground/20 rounded-full w-full h-full" />
            ) : (
              userInitials
            )}
          </AvatarFallback>
        </Avatar>
        
        {showNotificationBadge && notificationCount > 0 && (
          <NotificationBadge 
            count={notificationCount}
            className="absolute -top-1 -right-1"
            size={size === 'sm' ? 'sm' : 'md'}
          />
        )}
      </div>
    );
  };

  /**
   * Render user information text
   */
  const renderUserInfo = () => {
    if (variant === 'compact') return null;

    return (
      <div className="flex-1 min-w-0">
        {/* User Name */}
        {variantConfig.showName && (
          <div className={cn(
            sizeConfig.text,
            'font-medium text-foreground truncate'
          )}>
            {isLoading ? (
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
            ) : (
              userFullName
            )}
          </div>
        )}

        {/* User Email */}
        {variantConfig.showEmail && user?.email && (
          <div className={cn(
            'text-xs text-muted-foreground truncate'
          )}>
            {isLoading ? (
              <div className="h-3 bg-muted animate-pulse rounded w-32 mt-1" />
            ) : (
              user.email
            )}
          </div>
        )}

        {/* Role and Level */}
        {(variantConfig.showRole || variantConfig.showLevel) && (
          <div className="flex items-center gap-2 mt-1">
            {variantConfig.showRole && showRole && optimizedUser?.role && (
              <Badge 
                variant="secondary"
                className={cn(
                  sizeConfig.badge,
                  `bg-${roleColor}-100 text-${roleColor}-700 border-${roleColor}-200`
                )}
              >
                {roleLabel}
              </Badge>
            )}
            
            {variantConfig.showLevel && showLevel && optimizedUser?.level && (
              <LevelIndicator
                level={optimizedUser.level}
                size={size === 'lg' ? 'md' : 'sm'}
                showProgress={false}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render dropdown chevron for trigger variant
   */
  const renderChevron = () => {
    if (variant !== 'dropdown-trigger') return null;

    return (
      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
    );
  };

  // ===== LOADING STATE =====

  // Start performance tracking - chỉ chạy một lần khi component mount
  // ✅ FIX: Thêm empty dependency array để tránh infinite re-render loop
  React.useEffect(() => {
    startRender();
    return () => endRender();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array = chỉ chạy khi mount/unmount

  if (isLoading || !isHydrated) {
    return (
      <div className={cn(
        'flex items-center',
        sizeConfig.gap,
        sizeConfig.padding,
        'animate-pulse',
        className
      )}>
        <div className={cn(sizeConfig.avatar, 'bg-muted rounded-full')} />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-32" />
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====

  const containerClasses = cn(
    'flex items-center transition-colors duration-200',
    sizeConfig.gap,
    {
      // Layout classes
      'flex-col text-center': variantConfig.layout === 'vertical' && variant === 'card',
      'flex-row': variantConfig.layout === 'horizontal' || variant !== 'card',
      
      // Interactive classes
      'cursor-pointer hover:bg-accent/50 rounded-lg': onClick,
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2': onClick,
      
      // Padding classes
      [sizeConfig.padding]: variant === 'card',
      'p-2': variant === 'dropdown-trigger',
      'p-1': variant === 'compact',
    },
    className
  );

  const Component = onClick ? Button : 'div';
  const componentProps = onClick ? {
    variant: 'ghost' as const,
    className: containerClasses,
    onClick,
    'aria-label': ariaLabel || `User menu for ${userFullName}`,
    role: 'button',
    tabIndex: 0
  } : {
    className: containerClasses,
    'aria-label': ariaLabel || `User information for ${userFullName}`,
    role: 'img'
  };

  return (
    <Component {...componentProps} suppressHydrationWarning={true}>
      {renderAvatar()}
      {renderUserInfo()}
      {renderChevron()}
    </Component>
  );
});

UserDisplay.displayName = 'UserDisplay';

export default UserDisplay;
