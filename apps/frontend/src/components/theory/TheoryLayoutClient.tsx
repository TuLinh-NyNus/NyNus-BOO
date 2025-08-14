/**
 * Theory Layout Client Component
 * Client-side layout cho theory pages với responsive design
 */

'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TheoryNavigation } from './TheoryNavigation';
import { TheoryBreadcrumb } from './TheoryBreadcrumb';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TheoryLayoutClientProps {
  children: React.ReactNode;
}

/**
 * Theory Layout Client Component
 * Responsive layout với sidebar navigation và breadcrumb
 */
export function TheoryLayoutClient({ children }: TheoryLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Handle responsive breakpoints
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-50 flex items-center justify-between bg-background border-b px-4 py-3">
          <h1 className="text-lg font-semibold text-primary">Lý thuyết Toán</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transition-transform duration-300 ease-in-out",
            "md:relative md:translate-x-0",
            isMobile && !sidebarOpen && "-translate-x-full",
            isMobile && sidebarOpen && "translate-x-0"
          )}
        >
          {/* Desktop Header */}
          {!isMobile && (
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h1 className="text-xl font-bold text-primary">Lý thuyết Toán</h1>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <TheoryNavigation />
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="border-b bg-muted/30">
            <div className="container mx-auto px-4 py-3">
              <TheoryBreadcrumb />
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
