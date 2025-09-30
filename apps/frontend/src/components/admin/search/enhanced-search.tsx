'use client';

import React, { useState, useCallback } from 'react';
import { Search, Filter, Clock, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/form/checkbox';
import { QuestionFilterService } from '@/services/grpc/question-filter.service';
import { useToast } from '@/hooks';

interface SearchResult {
  question: {
    id: string;
    content: string;
    raw_content: string;
    type: string;
    difficulty: string;
    status: string;
    creator: string;
    tags: string[];
    created_at: string;
  };
  relevance_score: number;
  matched_terms: string[];
  snippet: string;
}

interface SearchFilters {
  search_fields: string[];
  question_code_filter?: {
    grades?: string[];
    subjects?: string[];
    chapters?: string[];
    levels?: string[];
  };
  metadata_filter?: {
    types?: string[];
    difficulties?: string[];
    statuses?: string[];
  };
  highlight_matches: boolean;
}

export function EnhancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    search_fields: ['content', 'solution', 'tags'],
    highlight_matches: true,
  });
  const { toast } = useToast();

  // Vietnamese search suggestions
  const vietnameseSuggestions = [
    'phương trình bậc hai',
    'tích phân từng phần',
    'hình học không gian',
    'đạo hàm hàm số',
    'giới hạn dãy số',
    'bất đẳng thức Cauchy',
    'hệ phương trình tuyến tính',
    'số phức và ứng dụng',
  ];

  const performSearch = useCallback(async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      const searchRequest = {
        query: searchQuery,
        search_fields: filters.search_fields,
        question_code_filter: filters.question_code_filter,
        metadata_filter: filters.metadata_filter,
        pagination: {
          page,
          limit: 20,
        },
        highlight_matches: filters.highlight_matches,
      };

      const response = await QuestionFilterService.searchQuestions(searchRequest);

      setResults(response.questions || []);
      setTotalResults(response.total_count || 0);
      setCurrentPage(page);
      setSearchTime(Date.now() - startTime);

      toast({
        title: "Tìm kiếm thành công",
        description: `Tìm thấy ${response.total_count || 0} kết quả trong ${Date.now() - startTime}ms`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Lỗi tìm kiếm",
        description: "Không thể thực hiện tìm kiếm. Vui lòng thử lại.",
        variant: "destructive",
      });
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  const handleSearch = useCallback(() => {
    performSearch(query, 1);
  }, [query, performSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion, 1);
  }, [performSearch]);

  const updateSearchFields = useCallback((field: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      search_fields: checked
        ? [...prev.search_fields, field]
        : prev.search_fields.filter(f => f !== field)
    }));
  }, []);

  const updateSubjectFilter = useCallback((subjects: string[]) => {
    setFilters(prev => ({
      ...prev,
      question_code_filter: {
        ...prev.question_code_filter,
        subjects,
      }
    }));
  }, []);

  const updateDifficultyFilter = useCallback((difficulties: string[]) => {
    setFilters(prev => ({
      ...prev,
      metadata_filter: {
        ...prev.metadata_filter,
        difficulties,
      }
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Tìm kiếm nâng cao với OpenSearch
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tìm kiếm thông minh với hỗ trợ tiếng Việt, từ đồng nghĩa và tìm kiếm mờ
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nhập từ khóa tìm kiếm (VD: phương trình, tích phân, hình học...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
          </div>

          {/* Vietnamese Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Gợi ý tìm kiếm:</p>
            <div className="flex flex-wrap gap-2">
              {vietnameseSuggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Bộ lọc tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fields" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fields">Trường tìm kiếm</TabsTrigger>
              <TabsTrigger value="subject">Môn học</TabsTrigger>
              <TabsTrigger value="difficulty">Độ khó</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fields" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="content"
                    checked={filters.search_fields.includes('content')}
                    onCheckedChange={(checked) => updateSearchFields('content', checked as boolean)}
                  />
                  <label htmlFor="content" className="text-sm font-medium">
                    Nội dung câu hỏi
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="solution"
                    checked={filters.search_fields.includes('solution')}
                    onCheckedChange={(checked) => updateSearchFields('solution', checked as boolean)}
                  />
                  <label htmlFor="solution" className="text-sm font-medium">
                    Lời giải
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tags"
                    checked={filters.search_fields.includes('tags')}
                    onCheckedChange={(checked) => updateSearchFields('tags', checked as boolean)}
                  />
                  <label htmlFor="tags" className="text-sm font-medium">
                    Thẻ tag
                  </label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="subject" className="space-y-4">
              <Select onValueChange={(value) => updateSubjectFilter([value])}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toan">Toán học</SelectItem>
                  <SelectItem value="ly">Vật lý</SelectItem>
                  <SelectItem value="hoa">Hóa học</SelectItem>
                  <SelectItem value="sinh">Sinh học</SelectItem>
                  <SelectItem value="van">Ngữ văn</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
            
            <TabsContent value="difficulty" className="space-y-4">
              <Select onValueChange={(value) => updateDifficultyFilter([value])}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search Results */}
      {(results.length > 0 || loading) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Kết quả tìm kiếm
              </CardTitle>
              {!loading && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {searchTime}ms
                  </div>
                  <span>{totalResults} kết quả</span>
                  <Badge variant="outline" className="text-xs">
                    Trang {currentPage}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={result.question.id || index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">
                          {result.question.content || 'Không có nội dung'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.snippet || 'Không có đoạn trích'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          Score: {result.relevance_score?.toFixed(2) || '0.00'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {result.question.difficulty || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                    
                    {result.matched_terms && result.matched_terms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Từ khóa:</span>
                        {result.matched_terms.map((term, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {result.question.tags && result.question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Tags:</span>
                        {result.question.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
