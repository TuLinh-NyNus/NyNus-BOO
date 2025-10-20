/**
 * Exams Search Page
 * Search interface cho exam searching theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowLeft, Clock, TrendingUp, X } from 'lucide-react';


import { EXAM_ROUTES, EXAM_DYNAMIC_ROUTES } from '@/lib/exam-paths';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Import exam components
import { ExamCard } from '@/components/features/exams/shared/exam-card';

// Import types
import { Exam, ExamFilters } from '@/types/exam';

// Import services
import { ExamService } from '@/services/grpc/exam.service';

// Import hooks
import { useDebounce } from '@/hooks';

// ===== CONSTANTS =====

const PAGE_CONFIG = {
  title: 'Tìm kiếm đề thi',
  description: 'Tìm kiếm đề thi theo từ khóa, môn học, độ khó',
  defaultPageSize: 12,
  debounceDelay: 300,
  maxRecentSearches: 5,
} as const;

const POPULAR_SEARCHES = [
  'Toán học lớp 10',
  'Vật lý lớp 11',
  'Hóa học lớp 12',
  'Đề thi thử THPT',
  'Ôn tập cuối kỳ',
];

// ===== HELPER FUNCTIONS =====

/**
 * Get recent searches from localStorage
 */
const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('nynus-exam-recent-searches');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Save recent searches to localStorage
 */
const saveRecentSearches = (searches: string[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('nynus-exam-recent-searches', JSON.stringify(searches));
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Add search to recent searches
 */
const addToRecentSearches = (query: string): void => {
  if (!query.trim()) return;
  
  const recent = getRecentSearches();
  const updated = [
    query,
    ...recent.filter(item => item !== query)
  ].slice(0, PAGE_CONFIG.maxRecentSearches);
  
  saveRecentSearches(updated);
};

// ===== SEARCH RESULTS COMPONENT =====

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  // ===== STATE =====

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery, PAGE_CONFIG.debounceDelay);

  // ===== EFFECTS =====

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setExams([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const filters: ExamFilters = {
          search: debouncedQuery,
          page: 1,
          limit: PAGE_CONFIG.defaultPageSize,
        };

        const response = await ExamService.listExams(filters);
        setExams(response.exams);

        // Add to recent searches
        addToRecentSearches(debouncedQuery);
        setRecentSearches(getRecentSearches());
      } catch (err) {
        console.error('Search failed:', err);
        setError('Không thể tìm kiếm đề thi');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // ===== EVENT HANDLERS =====

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setExams([]);
    setShowSuggestions(false);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  }, []);

  const handleExamView = useCallback((exam: Exam) => {
    router.push(EXAM_DYNAMIC_ROUTES.DETAIL(exam.id));
  }, [router]);

  const handleExamTake = useCallback((exam: Exam) => {
    router.push(EXAM_DYNAMIC_ROUTES.TAKE(exam.id));
  }, [router]);

  const handleBack = useCallback(() => {
    router.push(EXAM_ROUTES.LANDING);
  }, [router]);

  // ===== RENDER =====

  return (
    <div className="exams-search-page min-h-screen bg-gradient-to-br from-green-500/20 via-teal-500/10 to-blue-500/20">
      {/* Page Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{PAGE_CONFIG.title}</h1>
              <p className="text-muted-foreground">{PAGE_CONFIG.description}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đề thi theo tên, môn học, chủ đề..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                className="pl-10 pr-20 h-12 text-base"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSearchClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && !loading && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {/* Recent Searches */}
                {recentSearches.length > 0 && !searchQuery && (
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Tìm kiếm gần đây
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Searches */}
                {!searchQuery && (
                  <div className="p-2 border-t">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      Tìm kiếm phổ biến
                    </div>
                    {POPULAR_SEARCHES.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="main-content py-8">
        <div className="container mx-auto px-4">
          {/* Search Status */}
          {searchQuery && (
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  'Đang tìm kiếm...'
                ) : (
                  <>
                    Kết quả tìm kiếm cho &quot;<span className="font-medium text-foreground">{searchQuery}</span>&quot;
                    {exams.length > 0 && (
                      <span className="ml-2">({exams.length} đề thi)</span>
                    )}
                  </>
                )}
              </p>
            </div>
          )}

          {/* Search Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_CONFIG.defaultPageSize }).map((_, index) => (
                <div key={index} className="h-56 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : exams.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Không tìm thấy đề thi nào phù hợp</p>
              <div className="text-sm text-muted-foreground">
                <p>Gợi ý:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Kiểm tra chính tả từ khóa</li>
                  <li>Thử sử dụng từ khóa khác</li>
                  <li>Tìm kiếm theo môn học hoặc khối lớp</li>
                </ul>
              </div>
            </div>
          ) : exams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  viewMode="card"
                  onView={handleExamView}
                  onTakeExam={handleExamTake}
                  showActions={true}
                  showProgress={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nhập từ khóa để tìm kiếm đề thi</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Exams Search Page Component
 * Search page với Suspense wrapper cho useSearchParams
 */
export default function ExamsSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải trang tìm kiếm...</p>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

