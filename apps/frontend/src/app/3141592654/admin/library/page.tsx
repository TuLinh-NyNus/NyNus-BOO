'use client';

/**
 * Admin Library Management Page
 * Quản lý toàn bộ tài nguyên Library (Books, Exams, Videos)
 * với chức năng duyệt nội dung, phân quyền và thống kê
 */

import { useMemo, useState, useCallback } from 'react';
import {
  BookOpen,
  FileText,
  PlayCircle,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Star,
  Bookmark,
  MoreVertical,
  Upload,
  Archive,
  AlertTriangle,
  TrendingUp,
  Users,
  FileCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/feedback/use-toast';
import { cn } from '@/lib/utils';

import { useLibraryItems } from '@/hooks/library/use-library-items';
import { LibraryService, type LibraryItemView } from '@/services/grpc/library.service';

// Constants
const TYPE_OPTIONS = [
  { label: 'Tất cả loại', value: 'all' },
  { label: 'Sách', value: 'book', icon: BookOpen, color: 'text-blue-500' },
  { label: 'Đề thi', value: 'exam', icon: FileText, color: 'text-purple-500' },
  { label: 'Video', value: 'video', icon: PlayCircle, color: 'text-pink-500' },
];

const STATUS_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ duyệt', value: 'pending', color: 'amber' },
  { label: 'Đã duyệt', value: 'approved', color: 'green' },
  { label: 'Từ chối', value: 'rejected', color: 'red' },
  { label: 'Đã lưu trữ', value: 'archived', color: 'gray' },
];

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'created_at:desc' },
  { label: 'Cũ nhất', value: 'created_at:asc' },
  { label: 'Tải nhiều nhất', value: 'download_count:desc' },
  { label: 'Đánh giá cao', value: 'rating:desc' },
  { label: 'Tên A-Z', value: 'title:asc' },
];

// Stats Card Component
function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={cn('p-6 backdrop-blur-sm bg-background/95 border-border/60', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{value}</div>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Item Card Component
function LibraryItemCard({
  item,
  onApprove,
  onReject,
  onArchive,
  onPreview,
  loading,
}: {
  item: LibraryItemView;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onPreview: (item: LibraryItemView) => void;
  loading: boolean;
}) {
  const TypeIcon = item.type === 'book' ? BookOpen : item.type === 'exam' ? FileText : PlayCircle;
  
  const statusConfig = {
    pending: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    approved: { label: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Từ chối', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    archived: { label: 'Lưu trữ', color: 'bg-slate-200 text-slate-700 border-slate-300' },
  };

  const status = statusConfig[item.uploadStatus] || statusConfig.pending;

  return (
    <Card className="group overflow-hidden border-border/60 bg-background/90 backdrop-blur transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-inner">
              <TypeIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground line-clamp-2 transition group-hover:text-primary">
                {item.title || 'Chưa đặt tên'}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full text-xs">
                  {item.metadata.subject || 'Chưa phân loại'}
                </Badge>
                {item.metadata.grade && (
                  <Badge variant="outline" className="rounded-full border-dashed text-xs">
                    Lớp {item.metadata.grade}
                  </Badge>
                )}
                <Badge className={cn('border text-xs font-medium', status.color)}>
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onPreview(item)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {item.uploadStatus === 'pending' && (
                <>
                  <DropdownMenuItem onClick={() => onApprove(item.id)} disabled={loading}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Duyệt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReject(item.id)} disabled={loading}>
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Từ chối
                  </DropdownMenuItem>
                </>
              )}
              {item.uploadStatus === 'approved' && (
                <DropdownMenuItem onClick={() => onArchive(item.id)} disabled={loading}>
                  <Archive className="mr-2 h-4 w-4" />
                  Lưu trữ
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description || 'Chưa có mô tả'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-foreground">{item.averageRating.toFixed(1)}</span>
            <span>({item.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{item.downloadCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bookmark className="h-4 w-4" />
            <span>{item.requiredRole || 'STUDENT'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <div className="text-xs text-muted-foreground">
            Tạo bởi: <span className="font-medium text-foreground">{item.uploadedBy || 'N/A'}</span>
          </div>
          {item.uploadStatus === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(item.id)}
                disabled={loading}
                className="h-8 gap-1 text-xs"
              >
                <XCircle className="h-3 w-3" />
                Từ chối
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove(item.id)}
                disabled={loading}
                className="h-8 gap-1 text-xs"
              >
                <CheckCircle className="h-3 w-3" />
                Duyệt
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function AdminLibraryPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('created_at:desc');
  const [actionLoading, setActionLoading] = useState(false);

  // Parse sort
  const [sortField, sortOrder] = sortBy.split(':') as [string, 'asc' | 'desc'];

  // Prepare filters
  const filters = useMemo(() => {
    const filter: any = {};
    
    if (typeFilter !== 'all') {
      filter.types = [typeFilter];
    }
    
    // Status filter không map trực tiếp vào LibraryFilter vì không có field status
    // Sẽ cần filter sau khi fetch data
    
    return filter;
  }, [typeFilter]);

  // Fetch data
  const { items, loading, error, totalCount, refresh } = useLibraryItems({
    pagination: { page: 1, limit: 100 },
    search,
    sortBy: sortField as any,
    sortOrder,
    filter: filters,
  });

  // Filter by status client-side
  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return items;
    return items.filter((item) => item.uploadStatus === statusFilter);
  }, [items, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((i) => i.uploadStatus === 'pending').length,
      approved: items.filter((i) => i.uploadStatus === 'approved').length,
      rejected: items.filter((i) => i.uploadStatus === 'rejected').length,
    };
  }, [items]);

  // Actions
  const handleApprove = useCallback(
    async (id: string) => {
      setActionLoading(true);
      try {
        const result = await LibraryService.approveItem(id, 'approved');
        if (result.success) {
          toast({
            title: 'Đã duyệt',
            description: 'Nội dung đã được duyệt thành công',
          });
          await refresh();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể duyệt nội dung',
          variant: 'destructive',
        });
      } finally {
        setActionLoading(false);
      }
    },
    [toast, refresh]
  );

  const handleReject = useCallback(
    async (id: string) => {
      setActionLoading(true);
      try {
        const result = await LibraryService.approveItem(id, 'rejected');
        if (result.success) {
          toast({
            title: 'Đã từ chối',
            description: 'Nội dung đã bị từ chối',
          });
          await refresh();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể từ chối nội dung',
          variant: 'destructive',
        });
      } finally {
        setActionLoading(false);
      }
    },
    [toast, refresh]
  );

  const handleArchive = useCallback(
    async (id: string) => {
      setActionLoading(true);
      try {
        const result = await LibraryService.approveItem(id, 'archived');
        if (result.success) {
          toast({
            title: 'Đã lưu trữ',
            description: 'Nội dung đã được chuyển vào lưu trữ',
          });
          await refresh();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể lưu trữ nội dung',
          variant: 'destructive',
        });
      } finally {
        setActionLoading(false);
      }
    },
    [toast, refresh]
  );

  const handlePreview = useCallback((item: LibraryItemView) => {
    // TODO: Open preview modal
    console.log('Preview item:', item);
    toast({
      title: 'Xem chi tiết',
      description: 'Chức năng xem chi tiết đang phát triển',
    });
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Thư viện</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Duyệt và quản lý tất cả tài nguyên học tập
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Làm mới
          </Button>
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Tải lên
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={FileCheck} label="Tổng tài nguyên" value={stats.total} />
        <StatsCard
          icon={Clock}
          label="Chờ duyệt"
          value={stats.pending}
          className="border-amber-200/50"
        />
        <StatsCard
          icon={CheckCircle}
          label="Đã duyệt"
          value={stats.approved}
          className="border-emerald-200/50"
        />
        <StatsCard
          icon={XCircle}
          label="Từ chối"
          value={stats.rejected}
          className="border-rose-200/50"
        />
      </div>

      {/* Filters */}
      <Card className="p-6 backdrop-blur-sm bg-background/95 border-border/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, môn học, tags..."
                className="pl-10 h-11 rounded-xl border-border/50 bg-muted/30"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                Loại
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-11 w-full sm:w-[140px] rounded-xl border-border/50 bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                Trạng thái
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 w-full sm:w-[140px] rounded-xl border-border/50 bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                Sắp xếp
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 w-full sm:w-[160px] rounded-xl border-border/50 bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Hiển thị {filteredItems.length} / {stats.total} tài nguyên
          </span>
          {statusFilter !== 'all' && (
            <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')} className="h-7 text-xs">
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </Card>

      {/* Content */}
      {loading && !items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-48 w-full" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={refresh} variant="outline" size="sm">
            Thử lại
          </Button>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-12 text-center">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Không có kết quả</h3>
          <p className="text-sm text-muted-foreground">
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <LibraryItemCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
              onArchive={handleArchive}
              onPreview={handlePreview}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

