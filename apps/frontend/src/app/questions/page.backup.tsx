/**
 * Questions Landing Page
 * Main landing page cho public question interface theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';

import { QUESTION_ROUTES } from '@/lib/question-paths';
import { CombinedSearchBar, IssuesSpotlight, ClassificationChips, QuestionTypeCardsGrid } from '@/components/questions/landing';

// ===== METADATA =====

/**
 * Questions Landing Page Metadata
 * SEO metadata cho questions landing page
 */
export const metadata: Metadata = {
  title: 'Ngân hàng câu hỏi',
  description: 'Khám phá hàng nghìn câu hỏi toán học được phân loại theo chủ đề và độ khó. Học tập hiệu quả với AI.',
  keywords: [
    'câu hỏi toán học',
    'ngân hàng đề thi',
    'luyện tập toán',
    'AI giáo dục',
    'NyNus'
  ],
  openGraph: {
    title: 'Ngân hàng câu hỏi - NyNus',
    description: 'Hàng nghìn câu hỏi toán học được phân loại theo chủ đề và độ khó',
    type: 'website',
  },
  alternates: {
    canonical: '/questions',
  },
};

// ===== MOCK DATA =====

// Featured questions data now handled by FeaturedQuestionsSection component

// Category data now imported from shared constants

// ===== MAIN COMPONENT =====

/**
 * Questions Landing Page Component
 * Landing page cho public question interface với hero section và categories
 */
export default function QuestionsLandingPage() {
  return (
    <div className="questions-landing-page">
      {/* Hero Section - Tối giản, tập trung Search + Spotlight + Chips */}
      <section className="hero-section py-14">
        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          {/* Hero Title ngắn gọn */}
          <h1 className="mb-3 text-4xl font-bold text-foreground md:text-5xl">
            Ngân hàng câu hỏi
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Đơn giản, rõ ràng. Tìm nhanh theo văn bản hoặc subcount, lọc theo nhu cầu.
          </p>

          {/* Combined Search Bar (Text/Subcount) */}
          <div className="mb-6">
            <CombinedSearchBar />
          </div>

          {/* Issues Spotlight: nêu bật vấn đề cần quan tâm */}
          <div className="mb-6">
            <IssuesSpotlight />
          </div>

          {/* Classification Chips: nhóm chip phân loại rõ ràng */}
          <div className="mb-4">
            <ClassificationChips />
          </div>
        </div>
      </section>

      {/* Loại câu hỏi (giữ lại nhưng gọn) */}
      <section className="question-types-section py-10">
        <QuestionTypeCardsGrid
          showHeader={true}
          showStats={false}
          staggerAnimation={false}
          columns={4}
          variant="default"
        />
      </section>

      {/* CTA đơn giản */}
      <section className="cta-section py-10">
        <div className="text-center">
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={QUESTION_ROUTES.BROWSE}
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Filter className="mr-2 h-5 w-5" />
              Duyệt theo chủ đề
            </Link>
            <Link
              href={QUESTION_ROUTES.SEARCH}
              className="inline-flex items-center rounded-lg bg-secondary px-6 py-3 font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              <Search className="mr-2 h-5 w-5" />
              Tìm kiếm nâng cao
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
