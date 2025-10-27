import { ArrowDownUp, Filter, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { LibraryItemKind } from '@/services/grpc/library.service';

import {
  BOOK_TYPE_OPTIONS,
  DIFFICULTY_OPTIONS,
  EXAM_TYPE_OPTIONS,
  GRADE_OPTIONS,
  LIBRARY_TYPES,
  ROLE_OPTIONS,
  SORT_OPTIONS,
  SUBJECT_OPTIONS,
  VIDEO_QUALITY_OPTIONS,
} from './constants';
import { LibrarySearchAutocomplete } from './search-autocomplete';
import { LibraryTagCloud, type Tag } from './tag-cloud';
import type { LibrarySortField, LibrarySortOrder } from '@/hooks/library/use-library-items';

export interface LibraryFilterPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedTags?: string[];
  onTagSelect?: (tagId: string) => void;
  onTagDeselect?: (tagId: string) => void;
  onClearTags?: () => void;
  selectedTypes: LibraryItemKind[];
  onToggleType: (kind: LibraryItemKind) => void;
  subject?: string;
  onSubjectChange: (value?: string) => void;
  grade?: string;
  onGradeChange: (value?: string) => void;
  bookType?: string;
  onBookTypeChange: (value?: string) => void;
  examType?: string;
  onExamTypeChange: (value?: string) => void;
  videoQuality?: string;
  onVideoQualityChange: (value?: string) => void;
  difficulty?: string;
  onDifficultyChange: (value?: string) => void;
  requiredRole?: string;
  onRequiredRoleChange: (value?: string) => void;
  onlyActive: boolean;
  onOnlyActiveChange: (value: boolean) => void;
  sortBy: LibrarySortField;
  sortOrder: LibrarySortOrder;
  onSortByChange: (value: LibrarySortField) => void;
  onSortOrderChange: (value: LibrarySortOrder) => void;
  onReset: () => void;
}

export function LibraryFilterPanel({
  search,
  onSearchChange,
  selectedTypes,
  onToggleType,
  subject,
  onSubjectChange,
  grade,
  onGradeChange,
  bookType,
  onBookTypeChange,
  examType,
  onExamTypeChange,
  videoQuality,
  onVideoQualityChange,
  difficulty,
  onDifficultyChange,
  requiredRole,
  onRequiredRoleChange,
  onlyActive,
  onOnlyActiveChange,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  onReset,
  selectedTags = [],
  onTagSelect,
  onTagDeselect,
  onClearTags,
}: LibraryFilterPanelProps) {
  // Mock tags data - TODO: Replace with API call
  const mockTags: Tag[] = [
    { id: '1', name: 'toán-học', count: 245, trending: true },
    { id: '2', name: 'vật-lý', count: 189, trending: true },
    { id: '3', name: 'hóa-học', count: 156 },
    { id: '4', name: 'sinh-học', count: 134 },
    { id: '5', name: 'văn-học', count: 198, trending: true },
    { id: '6', name: 'lịch-sử', count: 87 },
    { id: '7', name: 'địa-lý', count: 76 },
    { id: '8', name: 'tiếng-anh', count: 223, trending: true },
    { id: '9', name: 'đề-thi-thử', count: 312, trending: true },
    { id: '10', name: 'ôn-tập', count: 267 },
    { id: '11', name: 'luyện-đề', count: 198 },
    { id: '12', name: 'giải-tích', count: 145 },
    { id: '13', name: 'hình-học', count: 132 },
    { id: '14', name: 'đại-số', count: 156 },
    { id: '15', name: 'thpt-quốc-gia', count: 289, trending: true },
  ];

  return (
    <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm shadow-primary/5 backdrop-blur lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-primary/20 lg:scrollbar-track-transparent">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Filter className="h-4 w-4" />
              Bộ lọc thư viện
            </div>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">Khám phá tài nguyên</h2>
            <p className="text-sm text-muted-foreground">
              Lọc theo loại nội dung, môn học và mức độ để tìm tài liệu phù hợp nhất với bạn.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-2 text-muted-foreground hover:text-primary"
          >
            <RotateCcw className="h-4 w-4" />
            Đặt lại
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-3">
            <Label htmlFor="library-search" className="text-xs uppercase tracking-wide text-muted-foreground">
              Từ khóa
            </Label>
            <LibrarySearchAutocomplete
              value={search}
              onChange={onSearchChange}
              placeholder="Tìm kiếm theo tên tài liệu, chủ đề hoặc thẻ..."
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sắp xếp</Label>
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={(value) => onSortByChange(value as LibrarySortField)}>
                <SelectTrigger className="h-11 flex-1 rounded-xl border-border/50 bg-muted/40 text-left">
                  <SelectValue placeholder="Chọn tiêu chí" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60 bg-background/95 shadow-lg">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex h-11 items-stretch overflow-hidden rounded-xl border border-border/50 bg-muted/40">
                {(['desc', 'asc'] as LibrarySortOrder[]).map((value) => (
                  <Button
                    key={value}
                    variant={sortOrder === value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onSortOrderChange(value)}
                    className={cn(
                      'flex-1 gap-2 rounded-none px-4 text-xs font-medium transition',
                      sortOrder === value
                        ? 'bg-primary text-primary-foreground shadow shadow-primary/30'
                        : 'text-muted-foreground hover:text-primary',
                    )}
                  >
                    <ArrowDownUp className="h-4 w-4" />
                    {value === 'desc' ? 'Giảm dần' : 'Tăng dần'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Loại nội dung</Label>
          <div className="flex flex-wrap gap-2">
            {LIBRARY_TYPES.map(({ value, label, description }) => {
              const isSelected = selectedTypes.includes(value as LibraryItemKind);
              return (
                <Button
                  key={value}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToggleType(value as LibraryItemKind)}
                  className={cn(
                    'h-auto min-w-[150px] rounded-xl border border-border/50 px-4 py-3 text-left transition',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow shadow-primary/40'
                      : 'bg-muted/40 text-foreground hover:border-primary/40 hover:bg-primary/10',
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Môn học</Label>
            <Select value={subject ?? ''} onValueChange={(value) => onSubjectChange(value || undefined)}>
              <SelectTrigger className="h-11 rounded-xl border-border/50 bg-muted/30">
                <SelectValue placeholder="Tất cả môn" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60 bg-background/95 shadow-lg">
                <SelectItem value="">Tất cả môn</SelectItem>
                {SUBJECT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Khối lớp</Label>
            <Select value={grade ?? ''} onValueChange={(value) => onGradeChange(value || undefined)}>
              <SelectTrigger className="h-11 rounded-xl border-border/50 bg-muted/30">
                <SelectValue placeholder="Tất cả khối lớp" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60 bg-background/95 shadow-lg">
                <SelectItem value="">Tất cả khối lớp</SelectItem>
                {GRADE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Vai trò tối thiểu</Label>
            <Select value={requiredRole ?? ''} onValueChange={(value) => onRequiredRoleChange(value || undefined)}>
              <SelectTrigger className="h-11 rounded-xl border-border/50 bg-muted/30">
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60 bg-background/95 shadow-lg">
                <SelectItem value="">Tất cả</SelectItem>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {selectedTypes.includes('book') && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Loại sách</Label>
              <Select value={bookType ?? ''} onValueChange={(value) => onBookTypeChange(value || undefined)}>
                <SelectTrigger className="h-11 rounded-xl border-border/50 bg-muted/30">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60 bg-background/95 shadow-lg">
                  <SelectItem value="">Tất cả</SelectItem>
                  {BOOK_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedTypes.includes('exam') && (
            <>
              <div className="flex flex-col gap-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Loại đề</Label>
                <Select value={examType ?? ''} onValueChange={(value) => onExamTypeChange(value || undefined)}>
                  <SelectTrigger className="h-11 rounded-xl border-border/50 bg-muted/30">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/60 bg-background/95 shadow-lg">
                    <SelectItem value="">Tất cả</SelectItem>
                    {EXAM_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Độ khó</Label>
                <Select value={difficulty ?? ''} onValueChange={(value) => onDifficultyChange(value || undefined)}>
                  <SelectTrigger className="h-11 rounded-xl border-border/50 bg-muted/30">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/60 bg-background/95 shadow-lg">
                    <SelectItem value="">Tất cả</SelectItem>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedTypes.includes('video') && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Chất lượng video</Label>
              <Select value={videoQuality ?? ''} onValueChange={(value) => onVideoQualityChange(value || undefined)}>
                <SelectTrigger className="h-11 rounded-xl border-border/50 bg-muted/30">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60 bg-background/95 shadow-lg">
                  <SelectItem value="">Tất cả</SelectItem>
                  {VIDEO_QUALITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Tag Cloud Section */}
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-muted/20 to-muted/40 p-4">
          <LibraryTagCloud
            tags={mockTags}
            selectedTags={selectedTags}
            onTagSelect={onTagSelect}
            onTagDeselect={onTagDeselect}
            onClearAll={onClearTags}
            maxVisible={15}
            showSearch={true}
            showCounts={true}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Switch
              id="library-only-active"
              checked={onlyActive}
              onCheckedChange={onOnlyActiveChange}
            />
            <Label htmlFor="library-only-active" className="text-sm text-muted-foreground">
              Chỉ hiển thị nội dung đã duyệt
            </Label>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{selectedTypes.length} loại được chọn</span>
            {subject && (
              <Badge variant="outline" className="rounded-full border-dashed bg-background text-muted-foreground">
                Môn: {subject}
              </Badge>
            )}
            {grade && (
              <Badge variant="outline" className="rounded-full border-dashed bg-background text-muted-foreground">
                Lớp: {grade}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LibraryFilterPanel;
