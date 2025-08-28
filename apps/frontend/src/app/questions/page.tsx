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
import { HeroSearchBar, QuickFilterButtons, CategoryCardsGrid, FeaturedQuestionsSection, StatsDisplay } from '@/components/questions/landing';

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
      {/* Hero Section */}
      <section className="hero-section py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-primary/5 to-transparent" />

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Ngân hàng câu hỏi
            <span className="block text-primary mt-2">Toán học</span>
          </h1>

          {/* Hero Description */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Khám phá hàng nghìn câu hỏi toán học được phân loại theo chủ đề và độ khó.
            Học tập hiệu quả với sự hỗ trợ của AI.
          </p>

          {/* Hero Search Bar */}
          <div className="mb-12">
            <HeroSearchBar
              placeholder="Tìm kiếm câu hỏi toán học..."
              showSuggestions={true}
              showRecentSearches={true}
              autoFocus={false}
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="mb-12">
            <QuickFilterButtons
              showCategories={true}
              showDifficulties={true}
              maxButtons={7}
              layout="grid"
            />
          </div>
          
          {/* Dynamic Stats */}
          <StatsDisplay
            variant="default"
            layout="grid"
            showIcons={true}
            showAnimations={true}
            staggerAnimation={true}
            animationDuration={1500}
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section py-16">
        <CategoryCardsGrid
          showHeader={true}
          showStats={true}
          staggerAnimation={true}
          columns={4}
          variant="default"
        />
      </section>

      {/* Featured Questions Section */}
      <section className="featured-section py-16 bg-muted/30">
        <FeaturedQuestionsSection
          limit={5}
          showHeader={true}
          showViewAllButton={true}
          staggerAnimation={true}
          variant="default"
        />
      </section>

      {/* CTA Section */}
      <section className="cta-section py-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sẵn sàng bắt đầu học tập?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Khám phá hàng nghìn câu hỏi và nâng cao kỹ năng toán học của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={QUESTION_ROUTES.BROWSE}
              className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Filter className="h-5 w-5 mr-2" />
              Duyệt theo chủ đề
            </Link>
            <Link
              href={QUESTION_ROUTES.SEARCH}
              className="inline-flex items-center px-8 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
            >
              <Search className="h-5 w-5 mr-2" />
              Tìm kiếm nâng cao
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
