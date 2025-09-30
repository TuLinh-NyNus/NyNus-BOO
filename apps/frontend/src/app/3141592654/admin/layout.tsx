/**
 * Admin Layout
 * Main layout cho admin interface theo RIPER-5 EXECUTE MODE
 */

'use client';

import { ReactNode } from 'react';
import { AdminHeader } from '@/components/admin/header';
import { AdminSidebar } from '@/components/admin/sidebar';
import { MockWebSocketProvider } from '@/components/admin/providers/mock-websocket-provider';
import { AdminErrorBoundary } from '@/components/admin/providers/admin-error-boundary';
import { AdminLayoutProvider } from '@/components/admin/providers/admin-layout-provider';
import { DarkThemeProvider } from '@/components/admin/theme/dark-theme-provider';
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
 * - Responsive design với sidebar và header
 * - Breadcrumb navigation
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  // Fix hydration issues caused by browser extensions
  useHydrationFix();

  return (
    <AdminErrorBoundary>
      <MockWebSocketProvider>
        <AdminLayoutProvider>
          <DarkThemeProvider>
            {/* Admin layout với fixed positioning để override MainLayout */}
            <div
              className="admin-layout-override fixed inset-0 flex h-screen bg-background z-50"
              suppressHydrationWarning={true}
            >
            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col">
              {/* Admin Header */}
              <AdminHeader />

              {/* Main Content - Improved spacing và responsive design */}
              <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 text-foreground overflow-y-auto admin-main-content">
                {/* Page Content với proper spacing */}
                <div className="min-h-full max-w-full overflow-x-hidden admin-container">
                  <div className="w-full max-w-7xl mx-auto space-y-6">
                    {children}
                  </div>
                </div>
              </main>
            </div>
          </div>
          </DarkThemeProvider>
        </AdminLayoutProvider>
      </MockWebSocketProvider>
    </AdminErrorBoundary>
  );
}

