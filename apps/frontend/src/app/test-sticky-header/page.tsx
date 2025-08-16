'use client';

import React from 'react';
import { StickyHeaderDemo } from '@/components/test/sticky-header-demo';
import { DarkThemeProvider } from '@/components/admin/theme/dark-theme-provider';

/**
 * Test page cho sticky header functionality
 * Trang này để test sticky header trong môi trường React thực tế
 */
export default function TestStickyHeaderPage() {
  return (
    <DarkThemeProvider>
      <div className="min-h-screen bg-background">
        <StickyHeaderDemo />
      </div>
    </DarkThemeProvider>
  );
}
