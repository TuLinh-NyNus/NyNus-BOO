/**
 * Notification Dropdown Component
 * Notification dropdown component cho admin header
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Settings, ExternalLink } from 'lucide-react';
import { NotificationDropdownProps, AdminNotification } from '@/types/admin/header';
import { useAdminNotifications } from '@/hooks/admin/use-admin-notifications';
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
          'relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          isOpen && 'bg-gray-100 text-gray-900'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
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
          'absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200',
          'animate-in fade-in-0 zoom-in-95 duration-150',
          'z-50'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900">
            Thông báo
          </h3>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Đánh dấu đã đọc
              </button>
            )}
            
            <button
              type="button"
              onClick={() => window.location.href = '/3141592654/admin/notifications'}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
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
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={() => window.location.href = '/3141592654/admin/notifications'}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
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
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
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
        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <div className="text-sm text-gray-500">
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
      info: 'text-blue-600 bg-blue-50',
      success: 'text-green-600 bg-green-50',
      warning: 'text-yellow-600 bg-yellow-50',
      error: 'text-red-600 bg-red-50'
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
        'relative px-4 py-3 hover:bg-gray-50 transition-colors duration-150',
        !notification.read && 'bg-blue-50/50'
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      {/* Main content */}
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left focus:outline-none"
      >
        <div className="flex items-start space-x-3">
          {/* Type indicator */}
          <div className={cn(
            'flex-shrink-0 w-2 h-2 rounded-full mt-2',
            getTypeColor()
          )} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {notification.title}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {notification.message}
            </div>
            <div className="text-xs text-gray-500">
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
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
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
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              aria-label="Clear notification"
            >
              <X className="w-3 h-3" />
            </button>

            {notification.href && (
              <ExternalLink className="w-3 h-3 text-gray-400" />
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
