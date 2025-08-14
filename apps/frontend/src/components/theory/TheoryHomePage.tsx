/**
 * Theory Home Page Component
 * Landing page component cho theory section
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, FileText, Search, TrendingUp, Clock, Users, ChevronRight } from 'lucide-react';
import { getDirectoryStructure, searchFiles } from '@/lib/theory/file-operations';
import type { DirectoryStructure, FileInfo } from '@/lib/theory/file-operations';

/**
 * Convert Vietnamese grade name to English slug
 * Converts "LỚP 10" → "grade-10", "LỚP 11" → "grade-11", etc.
 */
function convertGradeToSlug(gradeName: string): string {
  const gradeNumber = gradeName.replace(/[^\d]/g, ''); // Extract number only
  return `grade-${gradeNumber}`;
}

/**
 * Theory Home Page Component
 * Overview và navigation cho theory content
 */
export function TheoryHomePage() {
  const [directoryStructure, setDirectoryStructure] = useState<DirectoryStructure | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Load directory structure
  useEffect(() => {
    async function loadData() {
      try {
        const structure = await getDirectoryStructure();
        setDirectoryStructure(structure);
      } catch (error) {
        console.error('Error loading directory structure:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle search
  useEffect(() => {
    async function performSearch() {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const results = await searchFiles(searchQuery);
        setSearchResults(results.files);
      } catch (error) {
        console.error('Error searching files:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Thư viện Lý thuyết Toán học
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Khám phá kiến thức toán học từ cơ bản đến nâng cao với hệ thống LaTeX rendering 
          và navigation thông minh. Học tập hiệu quả với nội dung chất lượng cao.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          
          {/* Search Results */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {searching ? (
                <div className="p-4 text-center text-muted-foreground">
                  Đang tìm kiếm...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.slice(0, 5).map((file, index) => (
                    <Link
                      key={index}
                      href={`/theory/${file.grade.toLowerCase().replace(/\s+/g, '-')}/${file.chapter?.toLowerCase().replace(/\s+/g, '-')}/${file.fileName.replace('.tex', '').toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors"
                      onClick={() => setSearchQuery('')}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {file.fileName.replace('.tex', '')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {file.chapter} - {file.grade}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {searchResults.length > 5 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground border-t">
                      +{searchResults.length - 5} kết quả khác
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Không tìm thấy kết quả
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {directoryStructure && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{directoryStructure.subjects.length}</div>
                  <div className="text-sm text-muted-foreground">Môn học</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{directoryStructure.totalFiles}</div>
                  <div className="text-sm text-muted-foreground">Bài học</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    {directoryStructure.subjects.reduce((sum, subject) => sum + subject.grades.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Lớp học</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">1.2k+</div>
                  <div className="text-sm text-muted-foreground">Học viên</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subjects Overview */}
      {directoryStructure && (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Môn học</h2>
          
          <div className="grid gap-8">
            {directoryStructure.subjects.map((subject, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    {subject.name}
                  </CardTitle>
                  <CardDescription>
                    {subject.grades.length} lớp học với tổng cộng {subject.grades.reduce((sum, grade) => sum + grade.fileCount, 0)} bài học
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subject.grades.map((grade, gradeIndex) => (
                      <Card key={gradeIndex} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{grade.name}</CardTitle>
                            <Badge variant="secondary">
                              {grade.files.length} bài
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="text-sm text-muted-foreground">
                              {grade.fileCount} bài học
                            </div>
                            <Link
                              href={`/theory/${convertGradeToSlug(grade.name)}`}
                            >
                              <Button className="w-full" variant="outline">
                                Xem chi tiết
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Tính năng nổi bật</h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                LaTeX Rendering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Hiển thị công thức toán học và nội dung chuyên nghiệp với hệ thống LaTeX rendering tiên tiến.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Search className="h-5 w-5 text-primary" />
                Tìm kiếm thông minh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tìm kiếm nhanh chóng trong toàn bộ thư viện với khả năng tìm kiếm theo nội dung và tên bài học.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                Học tập hiệu quả
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ước tính thời gian đọc và tổ chức nội dung khoa học giúp tối ưu hóa quá trình học tập.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
