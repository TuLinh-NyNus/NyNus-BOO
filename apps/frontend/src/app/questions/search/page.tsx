/**
 * Questions Search Page
 * Search results interface cho public question search theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Suspense, useState, useEffect } from 'react';

import { QUESTION_ROUTES, QUESTION_DYNAMIC_ROUTES } from '@/lib/question-paths';
import { QuestionsHeader } from '@/components/questions/layout';
import { QuestionFilterService } from '@/services/grpc/question-filter.service';

// ===== TYPES =====

interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  type: string;
  views: number;
  rating: number;
  relevance: number;
}

// ===== MOCK DATA FOR SIDEBAR =====

/**
 * Mock recent searches
 * Temporary data cho development phase
 */
const recentSearches = [
  'phương trình bậc hai',
  'tích phân',
  'hình học không gian',
  'xác suất',
  'đạo hàm'
];

/**
 * Mock popular searches
 * Temporary data cho development phase
 */
const popularSearches = [
  'logarit',
  'lượng giác',
  'số phức',
  'ma trận',
  'giới hạn'
];

// ===== SEARCH RESULTS COMPONENT =====

/**
 * Search Results Component
 * Component hiển thị kết quả tìm kiếm
 */
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const difficulty = searchParams.get('difficulty') || '';

  // State for search results
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch search results from backend
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setSearchResults([]);
        setTotalCount(0);
        return;
      }

      setIsLoading(true);
      try {
        // Call QuestionFilterService.searchQuestions() - Real backend data
        const response = await QuestionFilterService.searchQuestions({
          query,
          search_fields: ['content', 'solution'], // Search in content and solution
          metadata_filter: {
            // Apply filters if provided
            ...(difficulty && { difficulties: [difficulty] }),
            // Note: category filter not directly supported, will filter client-side
          },
          pagination: {
            page: 1,
            limit: 50, // Get first 50 results
          },
          highlight_matches: true,
        });

        // Map gRPC response to SearchResult format
        const results: SearchResult[] = response.questions.map((item: Record<string, unknown>) => {
          const question = item.question as Record<string, unknown>;
          return {
            id: String(question.id || ''),
            title: String(question.content || '').substring(0, 100), // Use content as title
            content: String(question.content || ''),
            category: String(question.subject || 'Chưa phân loại'),
            difficulty: String(question.difficulty || 'MEDIUM'),
            type: String(question.type || 'MULTIPLE_CHOICE'),
            views: 0, // Not available from backend
            rating: 0, // Not available from backend
            relevance: Number(item.relevance_score || 0) * 100, // Convert to percentage
          };
        });

        // Client-side category filter if needed
        const filteredResults = category
          ? results.filter(r => r.category === category)
          : results;

        setSearchResults(filteredResults);
        setTotalCount(response.total_count || filteredResults.length);
      } catch (error) {
        console.error('Failed to search questions:', error);
        setSearchResults([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, category, difficulty]);

  return (
    <div className="questions-search-page">
      {/* Page Header with QuestionsHeader */}
      <QuestionsHeader
        title="Kết quả tìm kiếm"
        description={query ? `Kết quả cho: "${query}"` : 'Tìm kiếm câu hỏi trong ngân hàng'}
        showBreadcrumbs={false}  // Breadcrumb already shown in layout
        showBackButton={true}
        backButtonHref={QUESTION_ROUTES.BROWSE}
        backButtonLabel="Quay lại duyệt"
        variant="default"
        size="md"
        className="border-b"
      />

      {/* Search Bar Section */}
      <section className="search-section py-6 bg-muted/30">
        <div>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                defaultValue={query}
                className="w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex gap-2">
              <select 
                defaultValue={category}
                className="px-3 py-3 bg-background border rounded-lg text-sm"
              >
                <option value="">Tất cả chủ đề</option>
                <option value="Đại số">Đại số</option>
                <option value="Hình học">Hình học</option>
                <option value="Giải tích">Giải tích</option>
                <option value="Xác suất">Xác suất</option>
              </select>
              
              <select 
                defaultValue={difficulty}
                className="px-3 py-3 bg-background border rounded-lg text-sm"
              >
                <option value="">Tất cả độ khó</option>
                <option value="Dễ">Dễ</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Khó">Khó</option>
              </select>
              
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Recent Searches */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Tìm kiếm gần đây
              </h3>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Link
                    key={index}
                    href={`/questions/search?q=${encodeURIComponent(search)}`}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {search}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Popular Searches */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Tìm kiếm phổ biến
              </h3>
              <div className="space-y-2">
                {popularSearches.map((search, index) => (
                  <Link
                    key={index}
                    href={`/questions/search?q=${encodeURIComponent(search)}`}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {search}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {isLoading ? (
                  <span>Đang tìm kiếm...</span>
                ) : (
                  <>
                    Tìm thấy <span className="font-medium text-foreground">{totalCount}</span> kết quả
                    {query && <span> cho &ldquo;{query}&rdquo;</span>}
                  </>
                )}
              </div>

              <select className="px-3 py-2 bg-background border rounded-md text-sm">
                <option value="relevance">Liên quan nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>

            {/* Search Results */}
            {isLoading ? (
              /* Loading State */
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Đang tìm kiếm câu hỏi...</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-6">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={QUESTION_DYNAMIC_ROUTES.DETAIL(result.id)}
                    className="search-result-card block p-6 bg-card rounded-lg border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Result Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          {result.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          result.difficulty === 'Dễ' ? 'bg-green-100 text-green-700' :
                          result.difficulty === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {result.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {result.relevance}% liên quan
                        </span>
                      </div>
                    </div>
                    
                    {/* Result Title */}
                    <h3 className="text-xl font-semibold text-foreground mb-3 hover:text-primary transition-colors">
                      {result.title}
                    </h3>
                    
                    {/* Result Content */}
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {result.content}
                    </p>
                    
                    {/* Result Meta */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>{result.views.toLocaleString()} lượt xem</span>
                        <span>⭐ {result.rating}</span>
                        <span className="px-2 py-1 bg-muted rounded text-xs">
                          {result.type}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* No Results */
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-muted-foreground mb-6">
                  Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={QUESTION_ROUTES.BROWSE}
                    className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Duyệt tất cả câu hỏi
                  </Link>
                  <Link
                    href={QUESTION_ROUTES.LANDING}
                    className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Về trang chủ
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Questions Search Page Component
 * Search page với Suspense wrapper cho useSearchParams
 */
export default function QuestionsSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải kết quả tìm kiếm...</p>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
