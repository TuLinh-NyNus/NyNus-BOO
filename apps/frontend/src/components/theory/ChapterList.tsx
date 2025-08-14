/**
 * Chapter List Component
 * Enhanced grid layout cho chapter browsing với search và filtering
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  FileText,
  Search,
  Filter,
  Clock,
  ChevronRight,
  Eye,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileInfo } from '@/lib/theory/file-operations';

interface ChapterInfo {
  name: string;
  slug: string;
  files: FileInfo[];
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  completionRate?: number;
  isPopular?: boolean;
}

interface ChapterListProps {
  chapters: ChapterInfo[];
  baseUrl: string;
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showProgress?: boolean;
  gridCols?: 1 | 2 | 3;
}

type SortOption = 'name' | 'difficulty' | 'files' | 'popularity' | 'progress';
type FilterOption = 'all' | 'easy' | 'medium' | 'hard' | 'completed' | 'in-progress';

// Helper functions
const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDifficultyLabel = (difficulty?: string) => {
  switch (difficulty) {
    case 'easy': return 'Dễ';
    case 'medium': return 'Trung bình';
    case 'hard': return 'Khó';
    default: return 'Chưa xác định';
  }
};

/**
 * Chapter List Component
 * Grid layout với search, filtering, và progress tracking
 */
export function ChapterList({
  chapters,
  baseUrl,
  className,
  showSearch = true,
  showFilters = true,
  showProgress = true,
  gridCols = 3
}: ChapterListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Filter và sort chapters
  const filteredAndSortedChapters = useMemo(() => {
    let filtered = chapters;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chapter =>
        chapter.name.toLowerCase().includes(query) ||
        chapter.description?.toLowerCase().includes(query) ||
        chapter.files.some(file => 
          file.fileName.toLowerCase().includes(query)
        )
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(chapter => {
        switch (filterBy) {
          case 'easy':
          case 'medium':
          case 'hard':
            return chapter.difficulty === filterBy;
          case 'completed':
            return (chapter.completionRate || 0) >= 100;
          case 'in-progress':
            return (chapter.completionRate || 0) > 0 && (chapter.completionRate || 0) < 100;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (difficultyOrder[a.difficulty || 'medium'] || 2) - 
                 (difficultyOrder[b.difficulty || 'medium'] || 2);
        case 'files':
          return b.files.length - a.files.length;
        case 'popularity':
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        case 'progress':
          return (b.completionRate || 0) - (a.completionRate || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [chapters, searchQuery, sortBy, filterBy]);

  // Debounced search
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, sortBy, filterBy]);



  return (
    <div className={cn("space-y-6", className)}>
      {/* Search và Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm chương..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                  <SelectItem value="difficulty">Độ khó</SelectItem>
                  <SelectItem value="files">Số bài học</SelectItem>
                  <SelectItem value="popularity">Phổ biến</SelectItem>
                  {showProgress && <SelectItem value="progress">Tiến độ</SelectItem>}
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                <SelectTrigger className="w-36">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                  {showProgress && (
                    <>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="in-progress">Đang học</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isLoading ? 'Đang tìm kiếm...' : `${filteredAndSortedChapters.length} chương`}
          {searchQuery && ` cho "${searchQuery}"`}
        </span>
        {filteredAndSortedChapters.length > 0 && (
          <span>
            Tổng {filteredAndSortedChapters.reduce((sum, ch) => sum + ch.files.length, 0)} bài học
          </span>
        )}
      </div>

      {/* Chapter Grid */}
      <div className={cn(
        "grid gap-6",
        gridCols === 1 && "grid-cols-1",
        gridCols === 2 && "grid-cols-1 md:grid-cols-2",
        gridCols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {filteredAndSortedChapters.map((chapter) => (
          <ChapterCard
            key={chapter.slug}
            chapter={chapter}
            baseUrl={baseUrl}
            showProgress={showProgress}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredAndSortedChapters.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Không tìm thấy chương nào</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? `Không có chương nào phù hợp với "${searchQuery}"`
              : 'Không có chương nào phù hợp với bộ lọc hiện tại'
            }
          </p>
          {(searchQuery || filterBy !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Chapter Card Component
 * Individual chapter card với preview và progress
 */
interface ChapterCardProps {
  chapter: ChapterInfo;
  baseUrl: string;
  showProgress: boolean;
}

function ChapterCard({ chapter, baseUrl, showProgress }: ChapterCardProps) {
  const chapterUrl = `${baseUrl}/${chapter.slug}`;
  const completionRate = chapter.completionRate || 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {chapter.name}
              </CardTitle>
              {chapter.isPopular && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Phổ biến
                </Badge>
              )}
            </div>
            {chapter.description && (
              <CardDescription className="line-clamp-2">
                {chapter.description}
              </CardDescription>
            )}
          </div>
          {chapter.difficulty && (
            <Badge 
              variant="outline" 
              className={cn("text-xs", getDifficultyColor(chapter.difficulty))}
            >
              {getDifficultyLabel(chapter.difficulty)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        {showProgress && completionRate > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tiến độ</span>
              <span>{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        )}

        {/* Chapter stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{chapter.files.length} bài</span>
          </div>
          {chapter.estimatedTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>~{chapter.estimatedTime}h</span>
            </div>
          )}
        </div>

        {/* Action button */}
        <Link href={chapterUrl}>
          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Eye className="h-4 w-4 mr-2" />
            Xem chương
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
