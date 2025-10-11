/**
 * Notification Dropdown Component
 * Dropdown component để hiển thị notifications trong NyNus system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  ExternalLink,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// ===== TYPES =====

export interface NotificationDropdownProps {
  className?: string;
  maxHeight?: number;
  showMarkAllAsRead?: boolean;
  showClearAll?: boolean;
}

// ===== NOTIFICATION ITEM COMPONENT =====

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (url: string) => void;
}

const NotificationItem = memo<NotificationItemProps>(({
  notification,
  onMarkAsRead,
  onDelete,
  onAction
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case 'security':
        return 'Bảo mật';
      case 'success':
        return 'Thành công';
      case 'warning':
        return 'Cảnh báo';
      case 'error':
        return 'Lỗi';
      default:
        return 'Thông tin';
    }
  };

  const timeAgo = formatDistanceToNow(notification.createdAt, {
    addSuffix: true,
    locale: vi
  });

  return (
    <div className={cn(
      'p-3 hover:bg-muted/50 transition-colors duration-150 border-l-2',
      notification.isRead ? 'border-l-transparent' : 'border-l-primary bg-primary/5'
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {getTypeLabel()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
          </div>

          <h4 className={cn(
            'text-sm font-medium mb-1',
            notification.isRead ? 'text-muted-foreground' : 'text-foreground'
          )}>
            {notification.title}
          </h4>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {notification.message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {notification.actionUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onAction?.(notification.actionUrl!)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {notification.actionLabel || 'Xem chi tiết'}
              </Button>
            )}

            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <Check className="h-3 w-3 mr-1" />
                Đánh dấu đã đọc
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

// ===== MAIN COMPONENT =====

export const NotificationDropdown = memo<NotificationDropdownProps>(({
  className,
  maxHeight: _maxHeight = 400, // Unused but kept for future use
  showMarkAllAsRead = true,
  showClearAll = true
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refreshNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // ===== HANDLERS =====

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handleAction = (url: string) => {
    window.location.href = url;
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  const handleRefresh = async () => {
    await refreshNotifications();
  };

  // ===== RENDER =====

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative h-9 w-9 rounded-full',
            unreadCount > 0 && 'text-primary',
            className
          )}
          aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Thông báo</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-7 px-2"
              >
                Làm mới
              </Button>
              {showMarkAllAsRead && unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-7 px-2"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Đánh dấu tất cả
                </Button>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} thông báo chưa đọc
            </p>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Đang tải...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="mt-2"
              >
                Thử lại
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Không có thông báo nào
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onAction={handleAction}
                  />
                  {index < notifications.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && showClearAll && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Xóa tất cả thông báo
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

NotificationDropdown.displayName = 'NotificationDropdown';

export default NotificationDropdown;
