'use client';

import React from 'react';
import { AdminCard, AdminCardHeader, AdminCardTitle, AdminCardContent, AdminBadge, AdminText } from '../ui';

/**
 * Color Test Component
 * Component để test màu sắc trong dark theme
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

export function ColorTest() {
  return (
    <div className="space-y-6 p-6">
      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle>Test Màu Sắc Dark Theme</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="space-y-4">
          {/* Text Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Text Colors</h3>
            <div className="space-y-2">
              <AdminText variant="primary">Primary Text - Màu chính</AdminText>
              <AdminText variant="secondary">Secondary Text - Màu phụ</AdminText>
              <AdminText variant="muted">Muted Text - Màu mờ</AdminText>
            </div>
          </div>

          {/* Badge Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Badge Colors</h3>
            <div className="flex flex-wrap gap-2">
              <AdminBadge adminVariant="default">Default</AdminBadge>
              <AdminBadge adminVariant="success">Success</AdminBadge>
              <AdminBadge adminVariant="warning">Warning</AdminBadge>
              <AdminBadge adminVariant="error">Error</AdminBadge>
              <AdminBadge adminVariant="secondary">Secondary</AdminBadge>
            </div>
          </div>

          {/* User Info Simulation */}
          <div>
            <h3 className="text-lg font-semibold mb-2">User Info Example</h3>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                JD
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground truncate">
                  John Doe
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  john.doe@example.com
                </div>
                <div className="text-xs text-muted-foreground/70 truncate">
                  @johndoe
                </div>
              </div>
              <AdminBadge adminVariant="success">Active</AdminBadge>
            </div>
          </div>

          {/* Status Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Status Examples</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-foreground">User Active</span>
                <AdminBadge adminVariant="success">Hoạt động</AdminBadge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-foreground">User Suspended</span>
                <AdminBadge adminVariant="error">Tạm ngưng</AdminBadge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-foreground">User Pending</span>
                <AdminBadge adminVariant="warning">Chờ xác thực</AdminBadge>
              </div>
            </div>
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
