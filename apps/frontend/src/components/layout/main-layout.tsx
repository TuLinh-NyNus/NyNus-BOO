'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { Suspense } from 'react';

import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import FloatingCTA from '@/components/layout/floating-cta';
import DarkBackground from '@/components/layout/dark-background';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/common/error-boundaries';
import { TokenExpiryNotification } from '@/components/common/TokenExpiryNotification';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.includes('/3141592654/admin');
  const isHomepage = pathname === '/';

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col bg-background",
        isAdminPage && "overflow-hidden" // Prevent body scroll for admin pages
      )} 
      suppressHydrationWarning
    >
      <PageErrorBoundary>
        {/* Nền dark thống nhất cho tất cả trang (trừ home/admin) khi theme=dark */}
        <DarkBackground />
        
        {/* ✅ PHASE 1: Token Expiry Notification - Global notification for all authenticated pages */}
        <ComponentErrorBoundary componentName="TokenExpiryNotification">
          <TokenExpiryNotification />
        </ComponentErrorBoundary>
        
        <Suspense fallback={null}>
          {!isAdminPage && (
            <ComponentErrorBoundary componentName="Navbar">
              <Navbar />
            </ComponentErrorBoundary>
          )}
          {/* For admin pages, render children directly without main wrapper */}
          {isAdminPage ? (
            children
          ) : (
            <main className={`flex-1 ${isHomepage ? 'pt-0' : 'pt-16'}`} suppressHydrationWarning>
              {children}
            </main>
          )}
          {!isAdminPage && (
            <>
              <ComponentErrorBoundary componentName="Footer">
                <Footer />
              </ComponentErrorBoundary>
              <ComponentErrorBoundary componentName="FloatingCTA">
                <FloatingCTA />
              </ComponentErrorBoundary>
            </>
          )}
        </Suspense>
      </PageErrorBoundary>
    </div>
  );
}
