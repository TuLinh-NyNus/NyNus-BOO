'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { Suspense } from 'react';

import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import FloatingCTA from '@/components/layout/floating-cta';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/common/error-boundaries';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.includes('/3141592654/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <PageErrorBoundary>
        <Suspense fallback={null}>
          {!isAdminPage && (
            <ComponentErrorBoundary componentName="Navbar">
              <Navbar />
            </ComponentErrorBoundary>
          )}
          <main className="flex-1">
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
