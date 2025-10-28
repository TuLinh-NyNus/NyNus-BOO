 
'use client';

import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

import { useDebounce } from '@/hooks/performance/useDebounce';
import {
  useLibraryItems,
  type LibrarySortField,
  type LibrarySortOrder,
} from '@/hooks/library/use-library-items';
import { useLibraryItem } from '@/hooks/library/use-library-item';
import { useLibraryActions } from '@/hooks/library/use-library-actions';
import { LibraryFilterPanel, LibraryItemGrid, LibraryPreviewModal, LibraryUploadModal } from '@/components/library';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/feedback/use-toast';
import type { LibraryItemKind } from '@/services/grpc/library.service';

const DEFAULT_TYPES: LibraryItemKind[] = ['book', 'exam', 'video'];
const DEFAULT_PAGE_SIZE = 12;

export default function PublicLibraryPage() {
  const { toast } = useToast();
  const [selectedTypes, setSelectedTypes] = useState<LibraryItemKind[]>(DEFAULT_TYPES);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState<string>();
  const [grade, setGrade] = useState<string>();
  const [bookType, setBookType] = useState<string>();
  const [examType, setExamType] = useState<string>();
  const [videoQuality, setVideoQuality] = useState<string>();
  const [difficulty, setDifficulty] = useState<string>();
  const [requiredRole, setRequiredRole] = useState<string>();
  const [onlyActive, setOnlyActive] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<LibrarySortField>('created_at');
  const [sortOrder, setSortOrder] = useState<LibrarySortOrder>('desc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [selectedItemId, setSelectedItemId] = useState<string>();

  const debouncedSearch = useDebounce(search, 400);

  const { items, totalCount, totalPages, loading, error, isFallback, refresh } = useLibraryItems({
    pagination: { page, limit: pageSize },
    search: debouncedSearch,
    sortBy,
    sortOrder,
    filter: {
      types: selectedTypes,
      subjects: subject ? [subject] : undefined,
      grades: grade ? [grade] : undefined,
      bookType,
      examType,
      videoQuality,
      difficultyLevel: difficulty,
      requiredRole,
      onlyActive,
    },
  });

  const { item: selectedItem, refresh: refreshSelected } = useLibraryItem(selectedItemId);

  const actions = useLibraryActions();

  const paginationLabel = useMemo(() => {
    if (totalCount === 0) return 'Không có nội dung nào';
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalCount);
    return `Hiển thị ${start}-${end} trong tổng ${totalCount} tài liệu`;
  }, [page, pageSize, totalCount]);

  const handleToggleType = (kind: LibraryItemKind) => {
    setSelectedTypes((prev) => {
      if (prev.includes(kind)) {
        const next = prev.filter((value) => value !== kind);
        return next.length > 0 ? next : [kind];
      }
      return [...prev, kind];
    });
  };

  const handleOpenPreview = (id: string) => {
    setSelectedItemId(id);
  };

  const handleClosePreview = () => {
    setSelectedItemId(undefined);
  };

  const withToast = async <T extends { success?: boolean; message?: string; errors?: string[] }>(
    promise: Promise<T>,
    successMessage: string,
  ): Promise<T> => {
    try {
      const result = await promise;
      if (result?.success === false) {
        const reason = result.errors?.[0] ?? result.message ?? 'Không thể thực hiện thao tác.';
        throw new Error(reason);
      }
      toast({
        title: 'Thành công',
        description: successMessage,
      });
      refresh();
      refreshSelected();
      return result;
    } catch (err) {
      toast({
        title: 'Đã xảy ra lỗi',
        description: err instanceof Error ? err.message : 'Không thể thực hiện thao tác.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const activePreviewItem = selectedItem || items.find((entry) => entry.id === selectedItemId);

  return (
    <div className="bg-gradient-to-b from-background via-background to-muted/20">
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-primary/8 via-background to-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/10 text-primary">
                Thư viện học liệu NyNus
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Tài nguyên tháo gỡ mọi bài học
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                Hơn 5.000 tài liệu, đề thi và video được chọn lọc bởi đội ngũ NyNus. Bộ lọc thông minh giúp bạn tìm
                đúng nội dung trong vài giây.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <Badge variant="secondary">Sách - PDF</Badge>
                <Badge variant="secondary">Đề thi THPT</Badge>
                <Badge variant="secondary">Video bài giảng</Badge>
                <Badge variant="secondary">Gợi ý theo vai trò</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-border/50 bg-background/80 p-6 shadow-lg shadow-primary/10 backdrop-blur sm:w-80">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Đóng góp tri thức</p>
                  <p className="text-xs text-muted-foreground">Tải lên tài liệu để đội ngũ giáo viên duyệt và chia sẻ với cộng đồng.</p>
                </div>
              </div>
              <LibraryUploadModal onCreated={refresh} />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <LibraryFilterPanel
          search={search}
          onSearchChange={setSearch}
          selectedTypes={selectedTypes}
          onToggleType={handleToggleType}
          subject={subject}
          onSubjectChange={setSubject}
          grade={grade}
          onGradeChange={setGrade}
          bookType={bookType}
          onBookTypeChange={setBookType}
          examType={examType}
          onExamTypeChange={setExamType}
          videoQuality={videoQuality}
          onVideoQualityChange={setVideoQuality}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          requiredRole={requiredRole}
          onRequiredRoleChange={setRequiredRole}
          onlyActive={onlyActive}
          onOnlyActiveChange={setOnlyActive}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          onReset={() => {
            setSelectedTypes(DEFAULT_TYPES);
            setSearch('');
            setSubject(undefined);
            setGrade(undefined);
            setBookType(undefined);
            setExamType(undefined);
            setVideoQuality(undefined);
            setDifficulty(undefined);
            setRequiredRole(undefined);
            setOnlyActive(true);
            setSortBy('created_at');
            setSortOrder('desc');
            setPage(1);
          }}
        />

        {error && (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-50 px-6 py-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        <LibraryItemGrid
          items={items}
          loading={loading}
          onPreview={(item) => handleOpenPreview(item.id)}
          onBookmark={async (item, next) => {
            await withToast(
              actions.bookmark(item.id, next),
              next ? 'Đã thêm vào danh sách bookmark.' : 'Đã gỡ khỏi bookmark.',
            );
          }}
        />

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-muted/40 px-5 py-3 text-sm text-muted-foreground">
            <div>{paginationLabel}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1 || loading}
              >
                Trang trước
              </Button>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Trang {page} / {totalPages}
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-28 rounded-xl border-border/50 bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[12, 18, 24, 36].map((size) => (
                      <SelectItem key={`page-size-${size}`} value={String(size)}>
                        {size} / trang
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages || loading}
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </main>

      <LibraryPreviewModal
        open={Boolean(selectedItemId)}
        item={activePreviewItem}
        onClose={handleClosePreview}
        onBookmark={async (next) => {
          await withToast(
            actions.bookmark(selectedItemId as string, next),
            next ? 'Đã thêm vào bookmark.' : 'Đã gỡ khỏi bookmark.',
          );
        }}
        onDownload={async () => {
          await withToast(
            actions.download(selectedItemId as string).then((result) => {
              if (result.downloadUrl) {
                window.open(result.downloadUrl, '_blank', 'noopener');
              }
              return result;
            }),
            'Đang mở đường dẫn tải xuống.',
          );
        }}
        onRate={async (value, review) => {
          await withToast(
            actions.rate(selectedItemId as string, value, review),
            'Cảm ơn bạn đã đánh giá tài liệu.',
          );
        }}
        bookmarking={actions.state.loading}
        downloading={actions.state.loading}
        ratingLoading={actions.state.loading}
      />

      {isFallback && (
        <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-dashed border-primary/40 bg-primary/5 px-6 py-4 text-sm text-primary">
          Thư viện đang ở chế độ demo vì dịch vụ gRPC chưa được kích hoạt. Một số thao tác có thể không khả dụng.
        </div>
      )}
    </div>
  );
}
