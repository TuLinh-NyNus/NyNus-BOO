'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { Suspense } from 'react';

import { Providers } from '@/app/providers';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
// import { ThemeProvider } from '@/components/providers/theme-provider';
import ScrollToTop from "@/components/ui/navigation/scroll-to-top";
import { WishlistProvider } from '@/contexts/wishlist-context';

import FloatingCTA from '@/components/layout/floating-cta';



interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.includes('/3141592654/admin');

  return (
    <WishlistProvider>
      <Providers>
        <Suspense fallback={null}>
          {!isAdminPage && <Navbar />}
          <main className="flex-1">
            {children}
          </main>
          {!isAdminPage && (
            <>
              <Footer />
              <FloatingCTA />
            </>
          )}
          <ScrollToTop />
        </Suspense>
      </Providers>
    </WishlistProvider>
  );
}
