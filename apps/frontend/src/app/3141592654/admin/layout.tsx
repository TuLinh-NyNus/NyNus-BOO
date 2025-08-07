/**
 * Admin Layout
 * Main layout cho admin interface theo RIPER-5 EXECUTE MODE
 */

'use client';

import { ReactNode } from 'react';
import { AdminHeader } from '@/components/admin/header';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminBreadcrumb } from '@/components/admin/breadcrumb';
import { MockWebSocketProvider } from '@/components/admin/providers/mock-websocket-provider';
import { AdminErrorBoundary } from '@/components/admin/providers/admin-error-boundary';
import { AdminLayoutProvider } from '@/components/admin/providers/admin-layout-provider';

/**
 * Admin Layout Props
 * Props cho AdminLayout component
 */
interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Admin Layout Component
 * Layout chính cho admin interface với Direct Migration approach
 *
 * Features:
 * - Error boundary với AdminErrorBoundary
 * - Mock WebSocket provider cho real-time functionality
 * - Layout provider cho state management
 * - Responsive design với sidebar và header
 * - Breadcrumb navigation
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminErrorBoundary>
      <MockWebSocketProvider>
        <AdminLayoutProvider>
          <div className="flex h-screen bg-background">
            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Admin Header */}
              <AdminHeader />

              {/* Main Content với Breadcrumb */}
              <main className="flex-1 overflow-y-auto p-6">
                {/* Admin Breadcrumb */}
                <AdminBreadcrumb />

                {/* Page Content */}
                <div className="mt-4">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </AdminLayoutProvider>
      </MockWebSocketProvider>
    </AdminErrorBoundary>
  );
}

