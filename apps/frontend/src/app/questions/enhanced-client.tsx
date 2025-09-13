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
import Link from 'next/link';
import { Search, Filter, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

import { QUESTION_ROUTES } from '@/lib/question-paths';
import {
  EnhancedSearchBar,
  EnhancedIssuesSpotlight,
  EnhancedClassificationChips,
  EnhancedQuestionTypeFilter
} from '@/components/questions/landing';

/**
 * Enhanced Questions Client Component
 */
export default function EnhancedQuestionsClient() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    types: string[];
    chips: string[];
  }>({ types: [], chips: [] });

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = selectedFilters.types.length > 0 || selectedFilters.chips.length > 0;

  return (
    <div className="min-h-screen bg-background dark:bg-[hsl(223_25%_10%)]">
      {/* Sticky Filter Summary Bar */}
      {isScrolled && hasActiveFilters && (
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
                Bộ lọc đang áp dụng: {selectedFilters.types.length + selectedFilters.chips.length}
              </span>
            </div>
            <button
              onClick={() => setSelectedFilters({ types: [], chips: [] })}
              className="text-xs font-medium text-[hsl(243_75%_65%)] hover:text-[hsl(243_75%_75%)]"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      )}

      {/* Hero Section với Gradient Background */}
      <section className="relative overflow-hidden">
        {/* Gradient Background Pattern - TEMPORARILY DISABLED */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-[hsl(243_75%_65%)]/5 via-transparent to-[hsl(188_85%_65%)]/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, hsl(243 75% 65% / 0.08) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, hsl(188 85% 65% / 0.08) 0%, transparent 50%),
                           radial-gradient(circle at 40% 60%, hsl(267 84% 72% / 0.05) 0%, transparent 50%)`,
        }} /> */}

        <div className="relative z-10 pt-16 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Title with Better Typography */}
            <div className="text-center mb-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[hsl(243_75%_65%)] via-[hsl(267_84%_72%)] to-[hsl(188_85%_65%)] bg-clip-text text-transparent">
                  Ngân hàng{' '}
                </span>
                <span className="text-foreground dark:text-[hsl(220_14%_98%)]">
                  câu hỏi
                </span>
              </h1>
              <p className="text-lg text-muted-foreground dark:text-[hsl(220_15%_72%)] max-w-2xl mx-auto">
                Khám phá kho tàng kiến thức với hàng ngàn câu hỏi chất lượng cao
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="mb-10">
              <EnhancedSearchBar />
            </div>

            {/* Issues Spotlight */}
            <div className="mb-10">
              <EnhancedIssuesSpotlight />
            </div>
          </div>
        </div>
      </section>

      {/* Classification Section */}
      <section className="py-10 bg-muted/30 dark:bg-[hsl(223_28%_12%)]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <EnhancedClassificationChips 
            allowMultiSelect={true}
            showGroupLabels={true}
          />
        </div>
      </section>

      {/* Question Types Filter Section */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <EnhancedQuestionTypeFilter
            showHeader={true}
            allowMultiple={true}
            onSelectionChange={(types) => 
              setSelectedFilters(prev => ({ ...prev, types }))
            }
          />
        </div>
      </section>

      {/* CTA Section với gradient buttons */}
      <section className="py-12 bg-gradient-to-b from-transparent to-muted/30 dark:to-[hsl(223_28%_12%)]/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
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
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-8 right-8 z-50',
            'p-3 rounded-full',
            'bg-gradient-to-r from-[hsl(243_75%_65%)] to-[hsl(188_85%_65%)]',
            'text-white',
            'shadow-lg hover:shadow-xl',
            'transition-all duration-300',
            'hover:scale-110',
            'focus:outline-none focus:ring-4 focus:ring-[hsl(243_75%_65%)]/30'
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}