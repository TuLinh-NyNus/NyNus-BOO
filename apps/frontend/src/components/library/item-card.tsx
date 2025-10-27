'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck, Download, PlayCircle, FileText, BookOpen, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/overlay/tooltip';
import { cn } from '@/lib/utils';
import type { LibraryItemView, LibraryMetadata } from '@/services/grpc/library.service';

interface LibraryItemCardProps {
  item: LibraryItemView;
  onPreview: (item: LibraryItemView) => void;
  onBookmark?: (item: LibraryItemView, nextState: boolean) => Promise<void>;
  bookmarking?: boolean;
  defaultBookmarked?: boolean;
}

const TYPE_ICON: Record<LibraryMetadata['kind'], JSX.Element> = {
  book: <BookOpen className="h-6 w-6 text-primary" />,
  exam: <FileText className="h-6 w-6 text-primary" />,
  video: <PlayCircle className="h-6 w-6 text-primary" />,
};

function renderMetaRows(item: LibraryItemView) {
  const { metadata } = item;

  switch (metadata.kind) {
    case 'book':
      return (
        <>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{metadata.author || 'Không rõ tác giả'}</span>
            {' • '}
            {metadata.publisher || 'Nxb cập nhật'}
          </div>
          <div className="text-xs text-muted-foreground">
            {metadata.bookType ? metadata.bookType.toUpperCase() : 'Tài liệu'}
            {metadata.publicationYear ? ` • ${metadata.publicationYear}` : ''}
            {metadata.pageCount ? ` • ${metadata.pageCount} trang` : ''}
          </div>
        </>
      );
    case 'exam':
      return (
        <>
          <div className="text-sm text-muted-foreground">
            {metadata.examType ? metadata.examType.toUpperCase() : 'Đề thi'}
            {metadata.difficulty ? ` • ${metadata.difficulty.toUpperCase()}` : ''}
          </div>
          <div className="text-xs text-muted-foreground">
            {metadata.province || 'Cả nước'}
            {metadata.school ? ` • ${metadata.school}` : ''}
            {metadata.examDuration ? ` • ${metadata.examDuration} phút` : ''}
          </div>
        </>
      );
    case 'video':
      return (
        <>
          <div className="text-sm text-muted-foreground">
            {metadata.instructorName || 'Giảng viên NyNus'}
          </div>
          <div className="text-xs text-muted-foreground">
            {metadata.quality || 'HD'}
            {metadata.duration ? ` • ${Math.round(metadata.duration / 60)} phút` : ''}
          </div>
        </>
      );
    default:
      return null;
  }
}

function formatUploadStatus(status: LibraryItemView['uploadStatus']): { label: string; tone: string } {
  switch (status) {
    case 'approved':
      return { label: 'Đã duyệt', tone: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
    case 'pending':
      return { label: 'Chờ duyệt', tone: 'bg-amber-100 text-amber-700 border border-amber-200' };
    case 'rejected':
      return { label: 'Từ chối', tone: 'bg-rose-100 text-rose-700 border border-rose-200' };
    case 'archived':
      return { label: 'Đã lưu trữ', tone: 'bg-slate-200 text-slate-700 border border-slate-300' };
    default:
      return { label: status, tone: 'bg-slate-200 text-slate-700 border border-slate-300' };
  }
}

function formatFileSize(size?: string) {
  if (!size) return '---';
  const numeric = Number(size);
  if (Number.isNaN(numeric)) return size;
  if (numeric >= 1024 * 1024) {
    return `${(numeric / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (numeric >= 1024) {
    return `${(numeric / 1024).toFixed(1)} KB`;
  }
  return `${numeric} B`;
}

export function LibraryItemCard({
  item,
  onPreview,
  onBookmark,
  bookmarking,
  defaultBookmarked = false,
}: LibraryItemCardProps) {
  const [bookmarked, setBookmarked] = useState<boolean>(defaultBookmarked);

  const statusTone = formatUploadStatus(item.uploadStatus);

  const handleBookmark = async () => {
    if (!onBookmark) return;
    const nextState = !bookmarked;
    try {
      await onBookmark(item, nextState);
      setBookmarked(nextState);
    } catch {
      // lỗi hiển thị bởi parent thông qua toast; giữ trạng thái cũ
    }
  };

  return (
    <Card className="group flex h-full flex-col border border-border/60 bg-background/80 backdrop-blur transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary">
            {item.metadata.kind === 'book'
              ? 'SÁCH'
              : item.metadata.kind === 'exam'
                ? 'ĐỀ THI'
                : 'VIDEO'}
          </Badge>
          <Badge className={cn('text-xs font-medium', statusTone.tone)}>
            {statusTone.label}
          </Badge>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-inner">
            {TYPE_ICON[item.metadata.kind]}
          </div>
          <div className="space-y-1 overflow-hidden">
            <h3 className="line-clamp-2 text-lg font-semibold text-foreground transition group-hover:text-primary">
              {item.title || 'Tài liệu chưa đặt tên'}
            </h3>
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Badge variant="secondary" className="rounded-full bg-secondary/70 text-secondary-foreground">
                {item.metadata.subject || 'Chủ đề khác'}
              </Badge>
              {item.metadata.grade && (
                <Badge variant="outline" className="rounded-full border-dashed text-muted-foreground">
                  Lớp {item.metadata.grade}
                </Badge>
              )}
              <Badge variant="outline" className="rounded-full border-dashed text-muted-foreground">
                Vai trò: {item.requiredRole || 'STUDENT'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground line-clamp-2">
          {item.description || 'Tài liệu đang được cập nhật mô tả chi tiết.'}
        </div>
        {renderMetaRows(item)}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-foreground">{item.averageRating.toFixed(1)}</span>
            <span>({item.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{item.downloadCount}</span>
            <span>lượt tải</span>
          </div>
          {item.fileSize && (
            <TooltipProvider disableHoverableContent>
              <Tooltip>
                <TooltipTrigger className="text-xs text-muted-foreground hover:text-foreground">
                  {formatFileSize(item.fileSize)}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Kích thước tệp</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {item.tags.length > 0 ? item.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-full border-primary/30 bg-primary/5 text-primary">
              #{tag}
            </Badge>
          )) : (
            <span className="text-muted-foreground">Chưa có thẻ nội dung</span>
          )}
          {item.tags.length > 4 && (
            <Badge variant="outline" className="rounded-full border-dashed text-muted-foreground">
              +{item.tags.length - 4}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-6 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBookmark}
          disabled={bookmarking}
          aria-label={bookmarked ? 'Gỡ bookmark' : 'Thêm bookmark'}
          className={cn(
            'transition',
            bookmarked
              ? 'text-primary shadow-inner shadow-primary/20'
              : 'text-muted-foreground hover:text-primary',
          )}
        >
          {bookmarking ? (
            <Skeleton className="h-4 w-4 rounded-full" />
          ) : bookmarked ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </Button>
        <Button variant="default" className="gap-2" onClick={() => onPreview(item)}>
          Xem chi tiết
        </Button>
      </CardFooter>
    </Card>
  );
}

export default LibraryItemCard;
