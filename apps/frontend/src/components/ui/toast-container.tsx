'use client';

import React from 'react';

import { useNotification } from '@/contexts/notification-context';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from './toast';

/**
 * ToastContainer Component
 * 
 * Component hiển thị tất cả notifications dưới dạng toast messages
 * Tự động render các notifications từ NotificationContext
 */
export function ToastContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <ToastProvider swipeDirection="right">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          variant={notification.type}
          duration={notification.duration}
          onOpenChange={(open) => {
            if (!open) {
              removeNotification(notification.id);
            }
          }}
        >
          <div className="grid gap-1">
            <ToastTitle>{notification.title}</ToastTitle>
            <ToastDescription>{notification.message}</ToastDescription>
          </div>
          
          {/* Action button nếu có */}
          {notification.action && (
            <ToastAction
              altText={notification.action.label}
              onClick={notification.action.onClick}
            >
              {notification.action.label}
            </ToastAction>
          )}
          
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

