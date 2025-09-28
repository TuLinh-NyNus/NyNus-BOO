/**
 * Exams Layout
 * Nested layout cho exams section theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

import { Metadata } from 'next';
import { ReactNode } from 'react';

// ===== METADATA =====

/**
 * Exams Section Metadata
 * SEO metadata cho exams section với proper keywords và descriptions
 */
export const metadata: Metadata = {
  title: {
    template: '%s | Đề thi - NyNus',
    default: 'Quản lý Đề thi - NyNus',
  },
  description: 'Hệ thống quản lý và làm bài thi trực tuyến. Tạo đề thi, làm bài thi và xem kết quả với AI hỗ trợ.',
  keywords: [
    'đề thi trực tuyến',
    'quản lý đề thi',
    'làm bài thi',
    'kết quả thi',
    'AI giáo dục',
    'NyNus',
    'exam management',
    'online exam',
    'exam results'
  ],
  openGraph: {
    title: 'Quản lý Đề thi - NyNus',
    description: 'Hệ thống quản lý và làm bài thi trực tuyến với AI hỗ trợ',
    type: 'website',
    siteName: 'NyNus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quản lý Đề thi - NyNus',
    description: 'Hệ thống quản lý và làm bài thi trực tuyến với AI hỗ trợ',
  },
  alternates: {
    canonical: '/exams',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ===== TYPES =====

/**
 * Exams Layout Props Interface
 * Props cho ExamsLayout component
 */
interface ExamsLayoutProps {
  children: ReactNode;
}

// ===== MAIN COMPONENT =====

/**
 * Exams Layout Component
 * Nested layout cho exams section với proper SEO và structure
 * 
 * Features:
 * - SEO-optimized metadata
 * - Proper semantic HTML structure
 * - Accessibility support
 * - Future-ready cho breadcrumbs và navigation
 * - Clean layout cho exam pages
 * - Responsive design
 */
export default function ExamsLayout({ children }: ExamsLayoutProps) {
  return (
    <>
      {/* Exams Section Container */}
      <div className="exams-section min-h-screen bg-background">
        {/* Exams Header với breadcrumbs (future) */}
        <header className="exams-header border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Quản lý Đề thi
                </h1>
                <p className="text-sm text-muted-foreground">
                  Tạo, quản lý và làm bài thi trực tuyến
                </p>
              </div>
              
              {/* Future: Quick actions hoặc navigation sẽ được thêm ở đây */}
              <div className="flex items-center space-x-2">
                {/* Placeholder for future quick actions */}
              </div>
            </div>
          </div>
        </header>

        {/* Main Exams Content */}
        <main className="exams-main-content">
          {/* Page Content với responsive container */}
          <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>

        {/* Future: Exams Footer hoặc related content sẽ được thêm ở đây */}
      </div>
    </>
  );
}

// ===== LAYOUT CONFIGURATION =====

/**
 * Layout configuration cho exams section
 * Có thể được sử dụng bởi child components
 */
export const EXAMS_LAYOUT_CONFIG = {
  maxWidth: '7xl',
  padding: {
    x: 4,
    y: 8,
  },
  header: {
    height: 'auto',
    sticky: false, // Future: có thể enable sticky header
  },
  navigation: {
    showBreadcrumbs: false, // Future: enable breadcrumbs
    showQuickActions: false, // Future: enable quick actions
  },
  responsive: {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
} as const;

// ===== TYPE EXPORTS =====

/**
 * Layout configuration type
 */
export type ExamsLayoutConfig = typeof EXAMS_LAYOUT_CONFIG;

/**
 * Layout props type export
 */
export type { ExamsLayoutProps };
