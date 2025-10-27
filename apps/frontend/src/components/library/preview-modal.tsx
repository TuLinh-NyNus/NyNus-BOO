'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, Download, ShieldCheck, ShieldOff, Star } from 'lucide-react';
import { Int32Value } from 'google-protobuf/google/protobuf/wrappers_pb';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { LibraryItemView, LibraryUploadState } from '@/services/grpc/library.service';
import { LibraryFilePreview } from './file-preview';

interface PreviewModalProps {
  open: boolean;
  item?: LibraryItemView | null;
  onClose: () => void;
  onRate?: (rating: number, review?: string) => Promise<void>;
  onBookmark?: (nextState: boolean) => Promise<void>;
  onDownload?: () => Promise<void>;
  onApprove?: (status: LibraryUploadState) => Promise<void>;
  bookmarking?: boolean;
  downloading?: boolean;
  ratingLoading?: boolean;
  approving?: boolean;
}

function formatDate(value?: string) {
  if (!value) return 'Đang cập nhật';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Đang cập nhật';
  return parsed.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatRequiredLevel(level?: number) {
  if (level === undefined || level === null) return 'Không giới hạn';
  const intValue = new Int32Value();
  intValue.setValue(level);
  return intValue.getValue().toString();
}

export function LibraryPreviewModal({
  open,
  item,
  onClose,
  onRate,
  onBookmark,
  onDownload,
  onApprove,
  bookmarking,
  downloading,
  ratingLoading,
  approving,
}: PreviewModalProps) {
  const [localBookmark, setLocalBookmark] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');

  useEffect(() => {
    setLocalBookmark(false);
    setReview('');
    if (item) {
      setRating(Math.max(1, Math.round(item.averageRating || 5)));
    }
  }, [item]);

  const metadataDisplay = useMemo(() => {
    if (!item) return [];
    switch (item.metadata.kind) {
      case 'book':
        return [
          { label: 'Loại sách', value: item.metadata.bookType || 'Chưa cập nhật' },
          { label: 'Tác giả', value: item.metadata.author || 'NyNus biên soạn' },
          { label: 'Nhà xuất bản', value: item.metadata.publisher || 'Đang cập nhật' },
          {
            label: 'Năm xuất bản',
            value: item.metadata.publicationYear ? String(item.metadata.publicationYear) : 'Đang cập nhật',
          },
          { label: 'ISBN', value: item.metadata.isbn || 'Chưa có' },
        ];
      case 'exam':
        return [
          { label: 'Loại đề', value: item.metadata.examType || 'Đề tham khảo' },
          { label: 'Độ khó', value: item.metadata.difficulty || 'Đang cập nhật' },
          {
            label: 'Thời lượng',
            value: item.metadata.examDuration ? `${item.metadata.examDuration} phút` : 'Đang cập nhật',
          },
          {
            label: 'Số câu hỏi',
            value: item.metadata.questionCount ? `${item.metadata.questionCount} câu` : 'Đang cập nhật',
          },
          { label: 'Khu vực', value: item.metadata.province || 'Toàn quốc' },
        ];
      case 'video':
        return [
          { label: 'Giảng viên', value: item.metadata.instructorName || 'Giảng viên NyNus' },
          { label: 'Chất lượng', value: item.metadata.quality || 'HD' },
          {
            label: 'Thời lượng',
            value: item.metadata.duration ? `${Math.round(item.metadata.duration / 60)} phút` : 'Đang cập nhật',
          },
          { label: 'Liên kết YouTube', value: item.metadata.youtubeUrl || 'Đang cập nhật' },
        ];
      default:
        return [];
    }
  }, [item]);

  const handleBookmark = async () => {
    if (!onBookmark) return;
    const next = !localBookmark;
    try {
      await onBookmark(next);
      setLocalBookmark(next);
    } catch {
      // Toast hiển thị ở component cha
    }
  };

  const handleRate = async () => {
    if (!item || !onRate) return;
    await onRate(rating, review.trim() || undefined);
    setReview('');
  };

  const handleApprove = async (status: LibraryUploadState) => {
    if (!onApprove) return;
    await onApprove(status);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl gap-6 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background to-muted/40 px-0 pb-0 pt-6 shadow-xl shadow-primary/10 sm:px-0">
        <DialogHeader className="px-6">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            {item?.title || 'Đang tải nội dung'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {item?.description || 'Thông tin chi tiết sẽ được hiển thị ngay khi hoàn tất tải xuống.'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          {item ? (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="rounded-full border-dashed bg-background">
                Môn: {item.metadata.subject || 'Chưa cập nhật'}
              </Badge>
              <Badge variant="outline" className="rounded-full border-dashed bg-background">
                Lớp: {item.metadata.grade || 'Tất cả'}
              </Badge>
              <Badge variant="outline" className="rounded-full border-dashed bg-background">
                Vai trò tối thiểu: {item.requiredRole || 'STUDENT'}
              </Badge>
              <Badge variant="outline" className="rounded-full border-dashed bg-background">
                Thẻ: {item.tags.join(', ') || 'Không có'}
              </Badge>
            </div>
          ) : (
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
          )}
        </div>

        <Separator className="bg-border/60" />

        <div className="grid gap-6 px-6 pb-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          {/* File Preview Section */}
          <div className="md:col-span-2">
            {item && (
              <LibraryFilePreview
                fileUrl={item.fileUrl}
                thumbnailUrl={item.thumbnailUrl}
                youtubeUrl={item.metadata.kind === 'video' ? item.metadata.youtubeUrl : undefined}
                fileType={item.fileType}
                kind={item.metadata.kind}
                title={item.title}
                className="mb-6"
              />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Thông tin tổng quan</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {metadataDisplay.map(({ label, value }) => (
                  <div
                    key={`meta-${label}`}
                    className="rounded-xl border border-border/40 bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
                  >
                    <div className="font-medium text-foreground">{label}</div>
                    <div>{value}</div>
                  </div>
                ))}
                {!item && (
                  <>
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
              <div className="mb-3 flex items-center gap-3 text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-medium">Quyền truy cập</span>
              </div>
              <ul className="space-y-2 text-xs">
                <li>• Vai trò tối thiểu: <span className="font-semibold text-foreground">{item?.requiredRole || 'STUDENT'}</span></li>
                <li>• Mức độ yêu cầu: <span className="font-semibold text-foreground">{formatRequiredLevel(item?.requiredLevel)}</span></li>
                <li>• Nhóm người dùng mục tiêu: {item?.targetRoles.join(', ') || 'Tất cả'}</li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <Badge variant="secondary">{item?.uploadStatus || 'pending'}</Badge>
                <span>• Cập nhật: {formatDate(item?.updatedAt)}</span>
                <span>• Tạo lúc: {formatDate(item?.createdAt)}</span>
              </div>
            </div>

            {onApprove && (
              <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldOff className="h-4 w-4 text-primary" />
                  Kiểm duyệt nhanh
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove('approved')}
                    disabled={approving}
                  >
                    Duyệt nội dung
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove('pending')}
                    disabled={approving}
                  >
                    Đưa về chờ duyệt
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApprove('rejected')}
                    disabled={approving}
                  >
                    Từ chối
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove('archived')}
                    disabled={approving}
                  >
                    Lưu trữ
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Đánh giá trung bình</p>
                  <div className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
                    <Star className="h-5 w-5 text-amber-500" />
                    <span>{item?.averageRating.toFixed(1) ?? '0.0'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item?.reviewCount ?? 0} lượt đánh giá • {item?.downloadCount ?? 0} lượt tải
                  </p>
                </div>
                <Button
                  variant={localBookmark ? 'default' : 'outline'}
                  size="icon"
                  onClick={handleBookmark}
                  disabled={bookmarking}
                  className={cn(
                    'rounded-full',
                    localBookmark ? 'bg-primary text-primary-foreground shadow shadow-primary/30' : 'text-muted-foreground',
                  )}
                >
                  {localBookmark ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </Button>
              </div>
              <Separator className="my-4 bg-border/40" />
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Đánh giá của bạn</p>
                <div className="flex items-center gap-1">
                  {([1, 2, 3, 4, 5] as const).map((value) => (
                    <Button
                      key={`rating-${value}`}
                      variant={value <= rating ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setRating(value)}
                      className={cn(
                        'rounded-full transition',
                        value <= rating ? 'bg-amber-500 text-amber-50 shadow shadow-amber-400/40' : 'text-muted-foreground',
                      )}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  placeholder="Chia sẻ cảm nhận hoặc góp ý của bạn..."
                  className="min-h-[90px] rounded-xl border-border/50 bg-background/60 text-sm"
                />
                <Button
                  className="w-full"
                  onClick={handleRate}
                  disabled={!onRate || ratingLoading}
                >
                  Gửi đánh giá
                </Button>
              </div>
            </div>

            <Button
              variant="default"
              size="lg"
              className="w-full gap-2"
              onClick={onDownload}
              disabled={!onDownload || downloading}
            >
              <Download className="h-5 w-5" />
              Tải xuống tài liệu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LibraryPreviewModal;
