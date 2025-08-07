'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { Suspense } from 'react';

import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import FloatingCTA from '@/components/layout/floating-cta';
import ScrollToTop from '@/components/ui/scroll-to-top';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.includes('/3141592654/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        {!isAdminPage && <Navbar />}
        <main className="flex-1">
          {children}
        </main>
        {!isAdminPage && (
          <>
            <Footer />
            <FloatingCTA />
            <ScrollToTop />
          </>
        )}
      </Suspense>
    </div>
  );
}
