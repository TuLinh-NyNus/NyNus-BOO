/**
 * Questions Layout
 * Nested layout cho questions section theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

import { Metadata } from 'next';
import { ReactNode } from 'react';

import { QuestionsHeader, PageContainer } from '@/components/questions/layout';

// ===== METADATA =====

/**
 * Questions Section Metadata
 * SEO metadata cho questions section
 */
export const metadata: Metadata = {
  title: {
    template: '%s | Ngân hàng câu hỏi - NyNus',
    default: 'Ngân hàng câu hỏi - NyNus'
  },
  description: 'Khám phá hàng nghìn câu hỏi toán học được phân loại theo chủ đề và độ khó. Học tập hiệu quả với AI.',
  keywords: [
    'câu hỏi toán',
    'ngân hàng đề',
    'AI toán học', 
    'luyện tập',
    'NyNus',
    'toán học',
    'giáo dục',
    'học tập'
  ],
  openGraph: {
    title: 'Ngân hàng câu hỏi - NyNus',
    description: 'Hàng nghìn câu hỏi toán học được phân loại theo chủ đề và độ khó',
    type: 'website',
    siteName: 'NyNus',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ngân hàng câu hỏi - NyNus',
    description: 'Hàng nghìn câu hỏi toán học được phân loại theo chủ đề và độ khó',
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
  alternates: {
    canonical: '/questions',
  },
};

// ===== TYPES =====

/**
 * Questions Layout Props
 * Props cho QuestionsLayout component
 */
interface QuestionsLayoutProps {
  children: ReactNode;
}

// ===== MAIN COMPONENT =====

/**
 * Questions Layout Component
 * Nested layout cho questions section với proper SEO và structure
 * 
 * Features:
 * - SEO-optimized metadata
 * - Proper semantic HTML structure
 * - Accessibility support
 * - Future-ready cho breadcrumbs và navigation
 * - Clean layout cho question pages
 */
export default function QuestionsLayout({ children }: QuestionsLayoutProps) {
  return (
    <>
      {/* Questions Section Container */}
      <div className="questions-section min-h-screen bg-background">
        {/* Questions Header với breadcrumbs */}
        <QuestionsHeader
          showBreadcrumbs={true}
          showSearchBar={false}
          variant="default"
          size="md"
        />

        {/* Main Questions Content */}
        <main className="questions-main-content">
          {/* Page Content với PageContainer */}
          <PageContainer size="xl" padding="md" as="div">
            {children}
          </PageContainer>
        </main>

        {/* Future: Questions Footer hoặc related content sẽ được thêm ở đây */}
      </div>
      
      {/* Structured Data cho SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'NyNus - Ngân hàng câu hỏi',
            description: 'Hệ thống ngân hàng câu hỏi toán học với AI',
            url: 'https://nynus.com/questions',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://nynus.com/questions/search?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            },
            publisher: {
              '@type': 'Organization',
              name: 'NyNus',
              url: 'https://nynus.com'
            }
          })
        }}
      />
    </>
  );
}


