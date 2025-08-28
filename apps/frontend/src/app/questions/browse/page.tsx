/**
 * Questions Browse Page
 * Browse interface cho public question browsing theo RIPER-5 EXECUTE MODE
 *
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Grid, List, Search } from 'lucide-react';

import { QUESTION_ROUTES, QUESTION_DYNAMIC_ROUTES } from '@/lib/question-paths';
import { QuestionsHeader } from '@/components/questions/layout/questions-header';

// Import new question grid, filter, search, pagination và sort components
import {
  PublicQuestionGrid,
  PublicQuestionFiltersComponent as QuestionFiltersComponent,
  PublicSearchBar,
  SearchSuggestions,
  PublicPaginationControls,
  PublicSortControls,
  useSearchSuggestions
} from '@/components/questions/browse';

// Import hooks cho data fetching
import { usePublicQuestions, usePublicQuestionSearch } from '@/hooks/public';

// Import types
import { PublicQuestionFilters, DEFAULT_PUBLIC_QUESTION_FILTERS } from '@/lib/types/public';

// ===== CONSTANTS =====

/**
 * Page configuration
 */
const PAGE_CONFIG = {
  title: 'Duyệt câu hỏi',
  description: 'Duyệt và tìm kiếm câu hỏi toán học theo chủ đề, độ khó và loại câu hỏi',
  defaultColumns: 3,
  enableVirtualScrolling: true,
  virtualScrollingThreshold: 100,
} as const;



// ===== MAIN COMPONENT =====

/**
 * Questions Browse Page Component
 * Browse interface với PublicQuestionGrid integration
 */
export default function QuestionsBrowsePage() {
  // ===== STATE =====

  const router = useRouter();
  const [filters, setFilters] = useState<PublicQuestionFilters>(DEFAULT_PUBLIC_QUESTION_FILTERS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Search suggestions hook
  const { addSearch } = useSearchSuggestions();

  // ===== DATA FETCHING =====

  // Regular questions (when no search query)
  const {
    data: questionsResponse,
    isLoading: isLoadingQuestions,
    error: questionsError,
    refetch: _refetch
  } = usePublicQuestions(filters, {
    enabled: !searchQuery, // Disable when searching
    refetchOnWindowFocus: false,
  });

  // Search results (when search query exists)
  const {
    data: searchResponse,
    isLoading: isLoadingSearch,
    error: searchError
  } = usePublicQuestionSearch(searchQuery, filters, {
    enabled: searchQuery.length >= 2,
    debounceMs: 300
  });

  // Determine which data to use
  const isSearchMode = searchQuery.length >= 2;
  const questions = isSearchMode ? (searchResponse?.data || []) : (questionsResponse?.data || []);
  const pagination = isSearchMode ? searchResponse?.pagination : questionsResponse?.pagination;
  const isLoading = isSearchMode ? isLoadingSearch : isLoadingQuestions;
  const error = isSearchMode ? searchError : questionsError;

  // ===== EVENT HANDLERS =====

  const handleQuestionView = useCallback((questionId: string) => {
    router.push(QUESTION_DYNAMIC_ROUTES.DETAIL(questionId));
  }, [router]);

  const handleQuestionShare = useCallback((questionId: string) => {
    // TODO: Implement share functionality
    console.log('Share question:', questionId);
  }, []);

  const handleQuestionBookmark = useCallback((questionId: string) => {
    // TODO: Implement bookmark functionality
    console.log('Bookmark question:', questionId);
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<PublicQuestionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addSearch(query);
    }
    setShowSearchSuggestions(false);
  }, [addSearch]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setShowSearchSuggestions(false);
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    addSearch(suggestion);
    setShowSearchSuggestions(false);
  }, [addSearch]);

  const handlePageChange = useCallback((page: number) => {
    handleFilterChange({ page });
  }, [handleFilterChange]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    handleFilterChange({ limit: pageSize, page: 1 }); // Reset to page 1 when changing page size
  }, [handleFilterChange]);

  const handleSortChange = useCallback((sortBy: 'newest' | 'oldest' | 'popular' | 'rating' | 'difficulty', sortDir: 'asc' | 'desc') => {
    handleFilterChange({ sortBy, sortDir, page: 1 }); // Reset to page 1 when changing sort
  }, [handleFilterChange]);
  return (
    <div className="questions-browse-page">
      {/* Enhanced Page Header với QuestionsHeader */}
      <QuestionsHeader
        title="Duyệt câu hỏi"
        description="Tìm kiếm và lọc câu hỏi theo chủ đề, độ khó và loại câu hỏi"
        showBreadcrumbs={true}
        showBackButton={true}
        backButtonHref={QUESTION_ROUTES.LANDING}
        backButtonLabel="Quay lại"
        variant="default"
        size="lg"
        className="border-b"
      />

      {/* Search Section */}
      <section className="search-section py-6 border-b">
        <div>
          <div className="max-w-2xl mx-auto relative">
            <PublicSearchBar
              onSearch={handleSearch}
              onClear={handleSearchClear}
              initialQuery={searchQuery}
              placeholder="Tìm kiếm câu hỏi toán học..."
              isLoading={isLoading}
              showSuggestions={showSearchSuggestions}
              onShowSuggestions={setShowSearchSuggestions}
              autoFocus={false}
              className="w-full"
              suggestions={[]} // Will be populated by SearchSuggestions
              onSuggestionSelect={handleSuggestionSelect}
            />

            {/* Search Suggestions */}
            {showSearchSuggestions && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg">
                <SearchSuggestions
                  query={searchQuery}
                  onSuggestionSelect={handleSuggestionSelect}
                  showRecent={true}
                  showPopular={true}
                  showQueryBased={true}
                  maxSuggestions={8}
                />
              </div>
            )}
          </div>

          {/* Search Status */}
          {isSearchMode && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  'Đang tìm kiếm...'
                ) : (
                  <>
                    Kết quả tìm kiếm cho &quot;<span className="font-medium text-foreground">{searchQuery}</span>&quot;
                    {questions.length > 0 && (
                      <span className="ml-2">({questions.length} câu hỏi)</span>
                    )}
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section py-6 bg-muted/30">
        <div>
          <QuestionFiltersComponent
            filters={filters}
            onFiltersChange={handleFilterChange}
            isLoading={isLoading}
            showFilterChips={true}
            collapsible={true}
            className="max-w-full"
          />

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mt-4">
            {/* Spacer for layout */}
            <div className="flex-1" />
            
            {/* View Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị:</span>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section py-8">
        <div>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              {pagination ? (
                <>
                  Hiển thị <span className="font-medium text-foreground">{pagination.page * pagination.limit - pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> trong tổng số <span className="font-medium text-foreground">{pagination.total.toLocaleString()}</span> câu hỏi
                </>
              ) : (
                <>Hiển thị <span className="font-medium text-foreground">{questions.length}</span> câu hỏi</>
              )}
            </div>

            {/* Sort Controls */}
            <PublicSortControls
              sortBy={filters.sortBy || 'newest'}
              sortDir={filters.sortDir || 'desc'}
              onSortChange={handleSortChange}
              isLoading={isLoading}
              showDirection={true}
              className="flex-shrink-0"
            />
          </div>

          {/* Questions Grid - New Implementation */}
          <PublicQuestionGrid
            questions={questions}
            loading={isLoading}
            error={error?.message || null}
            viewMode={viewMode}
            columns={PAGE_CONFIG.defaultColumns}
            enableVirtualScrolling={PAGE_CONFIG.enableVirtualScrolling}
            virtualScrollingThreshold={PAGE_CONFIG.virtualScrollingThreshold}
            onQuestionView={handleQuestionView}
            onQuestionShare={handleQuestionShare}
            onQuestionBookmark={handleQuestionBookmark}
            showRating={true}
            showViews={true}
            showActions={true}
            className="min-h-[400px]"
          />

          {/* Pagination Controls */}
          {pagination && (
            <div className="pagination-section mt-8">
              <PublicPaginationControls
                pagination={{
                  page: pagination.page,
                  limit: pagination.limit,
                  total: pagination.total,
                  totalPages: pagination.totalPages
                }}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                isLoading={isLoading}
                showPageSizeSelector={true}
                showResultsSummary={true}
                className="max-w-full"
              />
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions py-8 bg-muted/30">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Không tìm thấy câu hỏi phù hợp?
          </h2>
          <p className="text-muted-foreground mb-6">
            Thử tìm kiếm với từ khóa cụ thể hoặc khám phá các chủ đề khác
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={QUESTION_ROUTES.SEARCH}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm nâng cao
            </Link>
            <Link
              href={QUESTION_ROUTES.LANDING}
              className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
            >
              Khám phá chủ đề
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
