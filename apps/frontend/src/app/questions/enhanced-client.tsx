/**
 * Enhanced Questions Client Component
 * Client component cho Questions page với thiết kế UX/UI cải tiến
 * 
 * Improvements:
 * - Thanh tìm kiếm hợp nhất với dropdown chế độ
 * - Issues spotlight với gradient đẹp
 * - Chips được tổ chức theo nhóm với clear all
 * - Question types là filter buttons
 * - Sticky filter bar khi scroll
 * 
 * @author NyNus Development Team
 * @version 2.0.0
 * @created 2025-01-19
 */

'use client';

import { useState, useEffect } from 'react';
// import Link from 'next/link'; // TEMPORARILY HIDDEN
import { /* Search, Filter, */ ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// import { QUESTION_ROUTES } from '@/lib/question-paths'; // TEMPORARILY HIDDEN
import {
  EnhancedSearchBar,
  // EnhancedIssuesSpotlight, // TEMPORARILY HIDDEN
  // UnifiedFilterSection, // TEMPORARILY HIDDEN
  // MobileFilterSheet, // TEMPORARILY HIDDEN
  // DecorativeElements, // TEMPORARILY HIDDEN
  // MathBackground // TEMPORARILY HIDDEN
} from '@/components/questions/landing';

/**
 * Enhanced Questions Client Component
 */
export default function EnhancedQuestionsClient() {
  const [_isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  // Filter states - TEMPORARILY DISABLED
  // const [selectedFilters, setSelectedFilters] = useState<{
  //   types: string[];
  //   chips: string[];
  // }>({ types: [], chips: [] });
  // const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // const [isMobile, setIsMobile] = useState(false);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Detect mobile screen size - TEMPORARILY DISABLED
  // useEffect(() => {
  //   const checkMobile = () => {
  //     setIsMobile(window.innerWidth < 768);
  //   };

  //   checkMobile();
  //   window.addEventListener('resize', checkMobile);
  //   return () => window.removeEventListener('resize', checkMobile);
  // }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const hasActiveFilters = selectedFilters.types.length > 0; // || selectedFilters.chips.length > 0;

  return (
    <div className="min-h-screen relative">
      {/* Separated Math Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base color layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-light-bg)] via-[var(--color-light-secondary-bg)] to-[var(--color-light-surface)] dark:from-[hsl(223_25%_12%)] dark:via-[hsl(223_25%_11%)] dark:to-[hsl(223_25%_13%)]" />
        
        {/* Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
            <pattern
              id="dot-pattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="1"
                cy="1"
                r="1"
                fill="currentColor"
                fillOpacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          <rect width="100%" height="100%" fill="url(#dot-pattern)" opacity="0.3" />
        </svg>

        {/* Base gradient - Full coverage */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-[var(--color-secondary)]/3 to-[var(--color-accent)]/5" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-accent)]/4 via-[var(--color-primary)]/2 to-[var(--color-secondary)]/4" />
        
        {/* Animated gradient orbs - More coverage */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-[var(--color-primary)]/6 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[var(--color-accent)]/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-20 left-1/3 w-[450px] h-[450px] bg-[var(--color-secondary)]/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[var(--color-primary)]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-1/3 right-1/2 w-[500px] h-[500px] bg-[var(--color-accent)]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }} />
          {/* Center coverage orbs */}
          <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-[var(--color-secondary)]/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-[700px] h-[700px] bg-[var(--color-primary)]/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Floating math symbols pattern across entire page */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]">
          <div className="absolute top-10 left-20 text-4xl font-light text-[var(--color-primary)] animate-float">∑</div>
          <div className="absolute top-32 right-40 text-3xl font-light text-[var(--color-accent)] animate-float-delayed">∫</div>
          <div className="absolute bottom-40 left-1/4 text-4xl font-light text-[var(--color-secondary)] animate-float">π</div>
          <div className="absolute bottom-20 right-1/3 text-5xl font-light text-[var(--color-primary)] animate-float-delayed">√</div>
          <div className="absolute top-1/3 left-1/2 text-5xl font-light text-[var(--color-accent)] animate-float">∮</div>
          <div className="absolute top-2/3 right-20 text-4xl font-light text-[var(--color-secondary)] animate-float-delayed">∇</div>
          <div className="absolute bottom-1/4 left-10 text-5xl font-light text-[var(--color-primary)] animate-float">∂</div>
          <div className="absolute top-1/2 left-1/3 text-3xl font-light text-[var(--color-accent)] animate-float-delayed">θ</div>
          <div className="absolute bottom-1/2 right-1/2 text-4xl font-light text-[var(--color-secondary)] animate-float">λ</div>
          <div className="absolute top-3/4 left-3/4 text-5xl font-light text-[var(--color-primary)] animate-float-delayed">∞</div>
          <div className="absolute top-20 left-2/3 text-3xl font-light text-[var(--color-secondary)] animate-float">Σ</div>
          <div className="absolute bottom-1/3 left-1/3 text-4xl font-light text-[var(--color-accent)] animate-float-delayed">Δ</div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64">
          <div className="absolute inset-0 rounded-full border border-[var(--color-primary)]/5 animate-pulse" />
          <div className="absolute inset-4 rounded-full border border-[var(--color-primary)]/3 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-8 rounded-full border border-[var(--color-primary)]/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-1/3 left-1/5 w-48 h-48">
          <div className="absolute inset-0 rounded-full border border-[var(--color-accent)]/5 animate-pulse" />
          <div className="absolute inset-3 rounded-full border border-[var(--color-accent)]/3 animate-pulse" style={{ animationDelay: '0.8s' }} />
        </div>
      </div>

      {/* Unified UI Content Layer */}
      <div className="relative z-10 min-h-screen">

      {/* Sticky Filter Summary Bar - TEMPORARILY HIDDEN */}
      {/* {isScrolled && hasActiveFilters && (
        <div className={cn(
          'fixed top-16 left-0 right-0 z-30',
          'bg-white/98 dark:bg-[hsl(223_28%_11%)]/98',
          'backdrop-blur-xl',
          'border-b border-border dark:border-[hsl(221_27%_28%)]/50',
          'shadow-md',
          'transition-all duration-200',
          'py-2.5 px-4'
        )}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[hsl(243_75%_65%)]" />
              <span className="text-sm font-medium">
                Bộ lọc đang áp dụng: {selectedFilters.types.length}
              </span>
            </div>
            <button
              // onClick={() => setSelectedFilters({ types: [], chips: [] })}
              className="text-xs font-medium text-[hsl(243_75%_65%)] hover:text-[hsl(243_75%_75%)]"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      )} */}

        {/* Unified Content Container - Centered and Larger */}
        <div className="relative flex items-start justify-center min-h-screen pt-20">
          {/* Hero Section */}
          <section className="relative w-full">
            <div className="relative z-10 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Title with Better Typography - Larger */}
                <div className="text-center mb-16">
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                  Ngân hàng{' '}
                </span>
                    <span className="text-foreground">
                  câu hỏi
                </span>
              </h1>
                  <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-5xl mx-auto leading-relaxed whitespace-nowrap">
                Khám phá kho tàng kiến thức với hàng ngàn câu hỏi chất lượng cao
              </p>
            </div>

                {/* Enhanced Search Bar - Larger */}
                <div className="mb-16">
                  <div className="max-w-4xl mx-auto">
              <EnhancedSearchBar />
                  </div>
            </div>

                {/* Issues Spotlight - TEMPORARILY HIDDEN */}
                {/* <div className="mb-10">
              <EnhancedIssuesSpotlight />
                </div> */}
          </div>
        </div>
      </section>
        </div>

      {/* Unified Filter Section - TEMPORARILY HIDDEN */}
      {/* {!isMobile && (
        <section className="relative py-12 bg-gradient-to-b from-transparent via-muted/20 to-transparent dark:from-transparent dark:via-[hsl(223_28%_12%)]/30 dark:to-transparent">
          <DecorativeElements variant="section" className="opacity-50" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <UnifiedFilterSection 
              // onFiltersChange={(filters) => setSelectedFilters(filters)}
          />
        </div>
      </section>
      )} */}

      {/* Mobile Filter Hint - TEMPORARILY HIDDEN */}
      {/* {isMobile && (
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground dark:text-[hsl(220_15%_72%)] mb-4">
                Sử dụng nút lọc để tìm kiếm theo tiêu chí
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Filter className="h-3 w-3" />
                <span>Nhấn vào nút lọc phía dưới</span>
              </div>
            </div>
        </div>
      </section>
      )} */}

      {/* CTA Section với gradient buttons - TEMPORARILY HIDDEN */}
      {/* <section className="relative py-12 bg-gradient-to-b from-transparent to-muted/30 dark:to-[hsl(223_28%_12%)]/30 overflow-hidden">
        <MathBackground className="opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-[hsl(220_14%_98%)]">
            Bắt đầu khám phá ngay
          </h2>
          <p className="text-muted-foreground dark:text-[hsl(220_15%_72%)] mb-8">
            Chọn cách bạn muốn tìm kiếm câu hỏi
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={QUESTION_ROUTES.BROWSE}
              className={cn(
                'inline-flex items-center justify-center',
                'px-8 py-4 rounded-2xl',
                'bg-gradient-to-r from-[hsl(243_75%_65%)] to-[hsl(267_84%_72%)]',
                'text-white font-medium',
                'shadow-lg hover:shadow-xl',
                'transition-all duration-300',
                'hover:scale-105',
                'group'
              )}
            >
              <Filter className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              Duyệt theo chủ đề
            </Link>
            <Link
              href={QUESTION_ROUTES.SEARCH}
              className={cn(
                'inline-flex items-center justify-center',
                'px-8 py-4 rounded-2xl',
                'border-2 border-[hsl(243_75%_65%)]/50',
                'bg-white dark:bg-[hsl(223_28%_11%)]',
                'text-[hsl(243_75%_65%)] font-medium',
                'hover:bg-[hsl(243_75%_65%)]/5 dark:hover:bg-[hsl(243_75%_65%)]/10',
                'transition-all duration-300',
                'hover:scale-105',
                'group'
              )}
            >
              <Search className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Tìm kiếm nâng cao
            </Link>
          </div>
        </div>
      </section> */}

      {/* Mobile Filter Button - TEMPORARILY HIDDEN */}
      {/* {isMobile && (
        <button
          // onClick={() => setIsMobileFilterOpen(true)}
          className={cn(
            'fixed bottom-8 left-8 z-40',
            'px-6 py-3 rounded-full',
            'bg-gradient-to-r from-[hsl(243_75%_65%)] to-[hsl(267_84%_72%)]',
            'text-white font-medium',
            'shadow-lg hover:shadow-xl',
            'transition-all duration-300',
            'hover:scale-110',
            'focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/30',
            'flex items-center gap-2'
          )}
          aria-label="Mở bộ lọc"
        >
          <Filter className="h-5 w-5" />
          <span>Bộ lọc</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
              {selectedFilters.types.length}
            </span>
          )}
        </button>
      )} */}


      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={cn(
              'fixed bottom-8 z-50',
              'right-8',
            'p-3 rounded-full',
              'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]',
            'text-white',
            'shadow-lg hover:shadow-xl',
            'transition-all duration-300',
            'hover:scale-110',
            'focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/30'
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

        {/* Mobile Filter Sheet - TEMPORARILY HIDDEN */}
        {/* {isMobile && (
          <MobileFilterSheet
            isOpen={isMobileFilterOpen}
            // onClose={() => setIsMobileFilterOpen(false)}
            // onApplyFilters={(filters) => setSelectedFilters(filters)}
            initialFilters={selectedFilters}
          />
        )} */}
      </div>
    </div>
  );
}