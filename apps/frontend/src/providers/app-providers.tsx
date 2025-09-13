'use client';

import React from 'react';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { ModalProvider } from '@/contexts/modal-context';
import { QueryProvider } from './query-provider';
import { ToastContainer } from '@/components/ui/toast-container';
import { ModalContainer } from '@/components/ui/modal-container';

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
 * - AuthProvider: Quản lý authentication state
 * - NotificationProvider: Quản lý toast notifications
 * - ModalProvider: Quản lý global modals
 *
 * Component này được sử dụng trong root layout để wrap toàn bộ app
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={true}
        storageKey="nynus-theme"
        disableTransitionOnChange
      >
        <AuthProvider>
          <NotificationProvider>
            <ModalProvider>
              {children}
              {/* Global UI containers */}
              <ToastContainer />
              <ModalContainer />
            </ModalProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

