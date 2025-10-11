'use client';

import React from 'react';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '@/contexts/notification-context';
import { ModalProvider } from '@/contexts/modal-context';
import { QueryProvider } from './query-provider';
import { ToastContainer } from '@/components/ui/toast-container';
import { ModalContainer } from '@/components/ui/modal-container';
import { AuthProvider } from '@/contexts/auth-context-grpc';
import { AccessibilityProvider } from '@/contexts/accessibility-context';

// Interface cho props của AppProviders
interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders Component
 *
 * Wrapper component chứa tất cả providers cần thiết cho ứng dụng:
 * - QueryProvider: TanStack Query cho data fetching và caching
 * - ThemeProvider: Quản lý theme - HỖ TRỢ CẢ LIGHT VÀ DARK MODE
 * - SessionProvider: NextAuth session management (REQUIRED for signIn from next-auth/react)
 * - AuthProvider: Quản lý authentication state
 * - AccessibilityProvider: Quản lý accessibility settings
 * - NotificationProvider: Quản lý toast notifications
 * - ModalProvider: Quản lý global modals
 *
 * Component này được sử dụng trong root layout để wrap toàn bộ app
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          storageKey="nynus-theme"
          disableTransitionOnChange
        >
          <AuthProvider>
            <AccessibilityProvider>
              <NotificationProvider>
                <ModalProvider>
                  {children}
                  {/* Global UI containers */}
                  <ToastContainer />
                  <ModalContainer />
                </ModalProvider>
              </NotificationProvider>
            </AccessibilityProvider>
          </AuthProvider>
        </ThemeProvider>
      </SessionProvider>
    </QueryProvider>
  );
}

