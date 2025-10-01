'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { Suspense } from 'react';

import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import FloatingCTA from '@/components/layout/floating-cta';
import DarkBackground from '@/components/layout/dark-background';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/common/error-boundaries';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.includes('/3141592654/admin');
  const isHomepage = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col" suppressHydrationWarning>
      <PageErrorBoundary>
        {/* Nền dark thống nhất cho tất cả trang (trừ home/admin) khi theme=dark */}
        <DarkBackground />
        <Suspense fallback={null}>
          {!isAdminPage && (
            <ComponentErrorBoundary componentName="Navbar">
              <Navbar />
            </ComponentErrorBoundary>
          )}
          <main className={`flex-1 ${isHomepage ? 'pt-0' : 'pt-16'}`} suppressHydrationWarning>
            {children}
          </main>
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
