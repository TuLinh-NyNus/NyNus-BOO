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
import { Search, ArrowLeft, Clock, TrendingUp } from 'lucide-react';
import { Suspense } from 'react';

import { QUESTION_ROUTES, QUESTION_DYNAMIC_ROUTES } from '@/lib/question-paths';

// ===== MOCK DATA =====

/**
 * Mock search results data
 * Temporary data cho development phase
 */
const mockSearchResults = [
  {
    id: 'q001',
    title: 'Giải phương trình bậc hai với tham số m',
    content: 'Cho phương trình $x^2 + 2mx + m^2 - 1 = 0$. Tìm giá trị của $m$ để phương trình có nghiệm kép.',
    category: 'Đại số',
    difficulty: 'Trung bình',
    type: 'Trắc nghiệm',
    views: 1234,
    rating: 4.8,
    relevance: 95
  },
  {
    id: 'q002',
    title: 'Phương trình bậc hai trong hình học',
    content: 'Ứng dụng phương trình bậc hai để giải bài toán tìm tọa độ giao điểm của đường thẳng và parabol.',
    category: 'Hình học',
    difficulty: 'Khó',
    type: 'Tự luận',
    views: 987,
    rating: 4.9,
    relevance: 87
  },
  {
    id: 'q003',
    title: 'Hệ phương trình bậc hai',
    content: 'Giải hệ phương trình gồm một phương trình bậc nhất và một phương trình bậc hai.',
    category: 'Đại số',
    difficulty: 'Trung bình',
    type: 'Trắc nghiệm',
    views: 756,
    rating: 4.7,
    relevance: 82
  }
];

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

  // Filter results based on search params
  const filteredResults = mockSearchResults.filter(result => {
    const matchesQuery = !query || result.title.toLowerCase().includes(query.toLowerCase()) || 
                        result.content.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || result.category === category;
    const matchesDifficulty = !difficulty || result.difficulty === difficulty;
    
    return matchesQuery && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="questions-search-page">
      {/* Page Header */}
      <section className="page-header py-8 border-b">
        <div>
          {/* Breadcrumb */}
          <nav className="breadcrumb mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Trang chủ
              </Link>
              <span className="mx-2">/</span>
              <Link href={QUESTION_ROUTES.LANDING} className="hover:text-foreground transition-colors">
                Ngân hàng câu hỏi
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Tìm kiếm</span>
            </div>
          </nav>
          
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Kết quả tìm kiếm
              </h1>
              {query && (
                <p className="text-lg text-muted-foreground">
                  Kết quả cho: <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
                </p>
              )}
            </div>
            
            {/* Back Button */}
            <Link
              href={QUESTION_ROUTES.BROWSE}
              className="inline-flex items-center px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại duyệt
            </Link>
          </div>
        </div>
      </section>

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
                Tìm thấy <span className="font-medium text-foreground">{filteredResults.length}</span> kết quả
                {query && <span> cho &ldquo;{query}&rdquo;</span>}
              </div>
              
              <select className="px-3 py-2 bg-background border rounded-md text-sm">
                <option value="relevance">Liên quan nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>

            {/* Search Results */}
            {filteredResults.length > 0 ? (
              <div className="space-y-6">
                {filteredResults.map((result) => (
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
