'use client';

import { Search, Hash, Settings, Loader2, Clock, Target } from 'lucide-react';
import React, { useState } from 'react';

import QuestionItem from '@/components/features/questions/QuestionItem';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { QuestionSearchService, SearchResponse } from '@/lib/services/question-search-service';
import logger from '@/lib/utils/logger';

interface QuestionSearchTabsProps {
  onSearchResults?: (results: SearchResponse) => void;
  className?: string;
}

export default function QuestionSearchTabs({ onSearchResults, className = '' }: QuestionSearchTabsProps): JSX.Element {
  // States cho 3 phương thức tìm kiếm
  const [keywordSearch, setKeywordSearch] = useState('');
  const [subcountSearch, setSubcountSearch] = useState('');
  const [questionIdSearch, setQuestionIdSearch] = useState({
    grade: '',
    subject: '',
    chapter: '',
    level: '',
    lesson: '',
    form: ''
  });

  // States cho kết quả và loading
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('keyword');

  // Xử lý tìm kiếm theo từ khóa
  const handleKeywordSearch = async () => {
    if (!keywordSearch.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await QuestionSearchService.searchByKeyword(keywordSearch, 90);
      setSearchResults(results);
      onSearchResults?.(results);
    } catch (error) {
      logger.error('Lỗi tìm kiếm từ khóa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý tìm kiếm theo mã số
  const handleSubcountSearch = async () => {
    if (!subcountSearch.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await QuestionSearchService.searchBySubcount(subcountSearch);
      setSearchResults(results);
      onSearchResults?.(results);
    } catch (error) {
      logger.error('Lỗi tìm kiếm mã số:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý tìm kiếm theo QuestionID format
  const handleQuestionIdSearch = async () => {
    const hasAnyValue = Object.values(questionIdSearch).some(value => value.trim() !== '');
    if (!hasAnyValue) return;
    
    setIsLoading(true);
    try {
      const results = await QuestionSearchService.searchByQuestionIDFormat(questionIdSearch);
      setSearchResults(results);
      onSearchResults?.(results);
    } catch (error) {
      logger.error('Lỗi tìm kiếm QuestionID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset kết quả khi chuyển tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchResults(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="keyword" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Từ khóa
          </TabsTrigger>
          <TabsTrigger value="subcount" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Mã số
          </TabsTrigger>
          <TabsTrigger value="questionid" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            QuestionID
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Tìm kiếm theo từ khóa */}
        <TabsContent value="keyword">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Tìm kiếm theo từ khóa
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tìm kiếm trong nội dung câu hỏi với độ tương đồng ~90%
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập từ khóa tìm kiếm (ví dụ: đạo hàm, phương trình...)"
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleKeywordSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleKeywordSearch}
                  disabled={isLoading || !keywordSearch.trim()}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Tìm kiếm
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Tìm kiếm theo mã số */}
        <TabsContent value="subcount">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Tìm kiếm theo mã số
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tìm kiếm chính xác theo mã số câu hỏi (subcount)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã số (ví dụ: Q001, Q002...)"
                  value={subcountSearch}
                  onChange={(e) => setSubcountSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubcountSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSubcountSearch}
                  disabled={isLoading || !subcountSearch.trim()}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hash className="h-4 w-4" />}
                  Tìm kiếm
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Gợi ý:</strong> Q001, Q002, Q003, Q004, Q005...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Tìm kiếm theo QuestionID format */}
        <TabsContent value="questionid">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tìm kiếm theo QuestionID
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tìm kiếm theo format: lớp - môn - chương - mức độ - bài - dạng
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Lớp</Label>
                  <Select value={questionIdSearch.grade} onValueChange={(value) => 
                    setQuestionIdSearch(prev => ({ ...prev, grade: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lớp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Lớp 10</SelectItem>
                      <SelectItem value="11">Lớp 11</SelectItem>
                      <SelectItem value="12">Lớp 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Môn học</Label>
                  <Select value={questionIdSearch.subject} onValueChange={(value) => 
                    setQuestionIdSearch(prev => ({ ...prev, subject: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn môn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Toán">Toán</SelectItem>
                      <SelectItem value="Vật lý">Vật lý</SelectItem>
                      <SelectItem value="Hóa học">Hóa học</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chapter">Chương</Label>
                  <Input
                    placeholder="Số chương"
                    value={questionIdSearch.chapter}
                    onChange={(e) => setQuestionIdSearch(prev => ({ ...prev, chapter: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Mức độ</Label>
                  <Select value={questionIdSearch.level} onValueChange={(value) => 
                    setQuestionIdSearch(prev => ({ ...prev, level: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dễ">Dễ</SelectItem>
                      <SelectItem value="Trung bình">Trung bình</SelectItem>
                      <SelectItem value="Khó">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson">Bài học</Label>
                  <Input
                    placeholder="Số bài"
                    value={questionIdSearch.lesson}
                    onChange={(e) => setQuestionIdSearch(prev => ({ ...prev, lesson: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form">Dạng</Label>
                  <Select value={questionIdSearch.form} onValueChange={(value) => 
                    setQuestionIdSearch(prev => ({ ...prev, form: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dạng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trắc nghiệm">Trắc nghiệm</SelectItem>
                      <SelectItem value="Tự luận">Tự luận</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleQuestionIdSearch}
                disabled={isLoading || !Object.values(questionIdSearch).some(v => v.trim())}
                className="w-full"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                Tìm kiếm theo QuestionID
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hiển thị kết quả tìm kiếm */}
      {searchResults && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Kết quả tìm kiếm
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {searchResults.searchTime}ms
                </div>
                <Badge variant="secondary">
                  {searchResults.totalCount} kết quả
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {searchResults.results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không tìm thấy câu hỏi nào phù hợp</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.results.map((result, index) => (
                  <div key={result.question._id} className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant={
                        result.matchType === 'exact' ? 'default' :
                        result.matchType === 'partial' ? 'secondary' : 'outline'
                      }>
                        {Math.round(result.matchScore)}% khớp
                      </Badge>
                    </div>
                    <QuestionItem
                      question={result.question}
                      onView={() => logger.info('View question:', result.question._id)}
                      onDelete={() => logger.info('Delete question:', result.question._id)}
                    />
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
