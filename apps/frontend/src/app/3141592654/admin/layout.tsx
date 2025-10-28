/**
 * Admin Layout
 * Main layout cho admin interface theo RIPER-5 EXECUTE MODE
 */

'use client';

import { ReactNode } from 'react';
import { AdminHeader } from '@/components/admin/header';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminErrorBoundary } from '@/components/admin/providers/admin-error-boundary';
import { AdminLayoutProvider } from '@/components/admin/providers/admin-layout-provider';
import { DarkThemeProvider } from '@/components/admin/theme/dark-theme-provider';
import { AdminStatsProvider } from '@/contexts/admin-stats-context';
import { AdminNotificationsProvider } from '@/hooks/admin/use-admin-notifications';
import { WebSocketProvider } from '@/providers';
import { useHydrationFix } from '@/hooks';

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
 * - Admin Stats Provider cho centralized data fetching (fix rate limit)
 * - Responsive design với sidebar và header
 * - Breadcrumb navigation
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  // Fix hydration issues caused by browser extensions
  useHydrationFix();

  return (
    <AdminErrorBoundary>
      <WebSocketProvider>
        <AdminNotificationsProvider>
          <AdminLayoutProvider>
            <AdminStatsProvider cacheTimeout={120000} autoRefresh={false}>
              <DarkThemeProvider className="admin-layout-override fixed inset-0 flex h-screen z-50">
              {/* Admin Sidebar */}
              <AdminSidebar />

              {/* Main Content Area */}
              <div className="flex flex-1 flex-col" suppressHydrationWarning={true}>
                {/* Admin Header */}
                <AdminHeader />

                {/* Main Content - Improved spacing và responsive design */}
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 text-foreground overflow-y-auto overflow-x-hidden admin-main-content">
                  {/* Page Content với proper spacing */}
                  <div className="min-h-full w-full">
                    <div className="w-full max-w-7xl mx-auto space-y-6">
                      {children}
                    </div>
                  </div>
                </main>
              </div>
              </DarkThemeProvider>
            </AdminStatsProvider>
          </AdminLayoutProvider>
        </AdminNotificationsProvider>
      </WebSocketProvider>
    </AdminErrorBoundary>
  );
}

