/**
 * Notification Dropdown Component
 * Notification dropdown component cho admin header
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Settings, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { NotificationDropdownProps, AdminNotification } from '@/types/admin/header';
import { useAdminNotifications } from '@/hooks/admin/use-admin-notifications';
import { useWebSocket } from '@/providers';
import { cn } from '@/lib/utils';

/**
 * Notification Dropdown Component
 * Component chính cho notification dropdown
 */
export function NotificationDropdown({
  className,
  onNotificationClick,
  onMarkAllRead,
  maxNotifications = 5
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearNotification
  } = useAdminNotifications();
  
  // Phase 4 - Task 4.4.1: Add connection status
  const { isConnected, connectionState } = useWebSocket();

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
   * Handle notification click
   * Xử lý khi click vào notification
   */
  const handleNotificationClick = (notification: AdminNotification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Call custom handler if provided
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // Navigate to notification link if provided
    if (notification.href) {
      window.location.href = notification.href;
    }

    setIsOpen(false);
  };

  /**
   * Handle mark all read
   * Xử lý khi mark all notifications as read
   */
  const handleMarkAllRead = () => {
    markAllAsRead();
    
    if (onMarkAllRead) {
      onMarkAllRead();
    }
  };

  /**
   * Render notification trigger
   * Render button để mở notification dropdown
   */
  const renderNotificationTrigger = () => {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary',
          isOpen && 'bg-accent/10 text-foreground',
          'flex-shrink-0'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  };

  /**
   * Render notification dropdown
   * Render dropdown với notifications
   */
  const renderNotificationDropdown = () => {
    if (!isOpen) return null;

    return (
      <div
        className={cn(
          'absolute right-0 top-full mt-2 w-80 bg-background/95 backdrop-blur-md rounded-lg border border-border shadow-lg',
          'animate-in fade-in-0 zoom-in-95 duration-150',
          'z-50'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">
              Thông báo
            </h3>
            
            {/* Phase 4 - Task 4.4.1: Connection status indicator */}
            {isConnected ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full text-xs">
                <Wifi className="w-3 h-3" />
                <span>Live</span>
              </div>
            ) : connectionState === 'connecting' ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded-full text-xs">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span>Đang kết nối...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-600 rounded-full text-xs">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                Đánh dấu đã đọc
              </button>
            )}
            
            <button
              type="button"
              onClick={() => window.location.href = '/3141592654/admin/notifications'}
              className="p-1 text-muted-foreground hover:text-foreground rounded"
              aria-label="Notification settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {renderNotificationContent()}
        </div>

        {/* Footer */}
        {notifications.length > maxNotifications && (
          <div className="border-t border-border px-4 py-3">
            <button
              type="button"
              onClick={() => window.location.href = '/3141592654/admin/notifications'}
              className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium"
            >
              Xem tất cả thông báo
            </button>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render notification content
   * Render nội dung notifications
   */
  const renderNotificationContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (notifications.length === 0) {
      return renderEmptyState();
    }

    const displayNotifications = notifications.slice(0, maxNotifications);

    return (
      <div className="py-2">
        {displayNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => handleNotificationClick(notification)}
            onMarkRead={() => markAsRead(notification.id)}
            onClear={() => clearNotification(notification.id)}
          />
        ))}
      </div>
    );
  };

  /**
   * Render loading state
   * Render trạng thái loading
   */
  const renderLoadingState = () => {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm">Đang tải...</span>
        </div>
      </div>
    );
  };

  /**
   * Render empty state
   * Render khi không có notifications
   */
  const renderEmptyState = () => {
    return (
      <div className="p-6 text-center">
        <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
        <div className="text-sm text-muted-foreground">
          Không có thông báo mới
        </div>
      </div>
    );
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {renderNotificationTrigger()}
      {renderNotificationDropdown()}
    </div>
  );
}

/**
 * Notification Item Component
 * Component cho individual notification item
 */
function NotificationItem({
  notification,
  onClick,
  onMarkRead,
  onClear
}: {
  notification: AdminNotification;
  onClick: () => void;
  onMarkRead: () => void;
  onClear: () => void;
}) {
  /**
   * Get notification type color
   * Lấy màu theo loại notification
   */
  const getTypeColor = () => {
    const colors = {
      info: 'bg-[#5B88B9]',      // Xanh nhạt - info
      success: 'bg-[#48BB78]',   // Xanh lá - success
      warning: 'bg-[#FDAD00]',   // Vàng cam - warning
      error: 'bg-[#FD5653]'      // Đỏ cam - error
    };

    return colors[notification.type] || colors.info;
  };

  /**
   * Format time ago
   * Format thời gian relative
   */
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  return (
    <div
      className={cn(
        'relative px-4 py-3 transition-colors duration-150',
        // Base background for all notifications
        'bg-accent/5',
        // Unread notifications have slightly more prominent background
        !notification.read && 'bg-accent/10',
        // Hover state
        'hover:bg-accent/20'
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
      )}

      {/* Main content */}
      <div
        onClick={onClick}
        className="w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <div className="flex items-start space-x-3">
          {/* Type indicator - perfectly aligned with text baseline */}
          <div className="flex-shrink-0 flex items-baseline">
            <div className={cn(
              'w-2 h-2 rounded-full',
              getTypeColor()
            )} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground mb-1">
              {notification.title}
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {notification.message}
            </div>
            <div className="text-xs text-muted-foreground/70">
              {formatTimeAgo(notification.timestamp)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center space-x-1">
            {!notification.read && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead();
                }}
                className="p-1 text-muted-foreground hover:text-primary rounded"
                aria-label="Mark as read"
              >
                <Check className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="p-1 text-muted-foreground hover:text-destructive rounded"
              aria-label="Clear notification"
            >
              <X className="w-3 h-3" />
            </button>

            {notification.href && (
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
