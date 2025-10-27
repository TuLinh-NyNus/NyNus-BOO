/**
 * Empty State Component
 * Hiển thị trạng thái rỗng với illustrations khi không có dữ liệu
 */

import { LucideIcon } from 'lucide-react';
import { BookOpen, FileText, PlayCircle, Search, Filter, Inbox } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type EmptyStateType =
  | 'no-results'
  | 'no-content'
  | 'no-search'
  | 'no-filter'
  | 'empty-library';

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EMPTY_STATE_CONFIGS: Record<EmptyStateType, EmptyStateConfig> = {
  'no-results': {
    icon: Search,
    title: 'Không tìm thấy kết quả',
    description: 'Không có tài liệu nào khớp với từ khóa tìm kiếm của bạn. Hãy thử tìm kiếm với từ khóa khác.',
  },
  'no-content': {
    icon: Inbox,
    title: 'Chưa có nội dung',
    description: 'Chưa có tài liệu nào trong thư viện. Hãy bắt đầu thêm tài liệu đầu tiên của bạn.',
  },
  'no-search': {
    icon: Search,
    title: 'Bắt đầu tìm kiếm',
    description: 'Nhập từ khóa vào ô tìm kiếm để khám phá hàng ngàn tài liệu học tập.',
  },
  'no-filter': {
    icon: Filter,
    title: 'Không có kết quả phù hợp',
    description: 'Không tìm thấy tài liệu nào với bộ lọc hiện tại. Thử điều chỉnh bộ lọc của bạn.',
  },
  'empty-library': {
    icon: BookOpen,
    title: 'Thư viện đang trống',
    description: 'Chưa có tài liệu nào trong thư viện. Hãy khám phá và thêm tài liệu yêu thích của bạn.',
  },
};

export interface LibraryEmptyStateProps {
  type: EmptyStateType;
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function LibraryEmptyState({
  type,
  className,
  onAction,
  actionLabel,
}: LibraryEmptyStateProps) {
  const config = EMPTY_STATE_CONFIGS[type];
  const Icon = config.icon;
  const action = onAction ? { label: actionLabel || 'Thử lại', onClick: onAction } : config.action;

  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center backdrop-blur-sm bg-background/90 border-border/60',
        className
      )}
    >
      {/* Decorative Background */}
      <div className="relative mb-8">
        {/* Outer Circle - Animated */}
        <div className="absolute inset-0 -m-6 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent animate-pulse" />
        
        {/* Middle Circle */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 shadow-inner">
          {/* Inner Circle with Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 backdrop-blur">
            <Icon className="h-8 w-8 text-primary/70" />
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-2 top-0 h-3 w-3 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="absolute -left-1 bottom-2 h-2 w-2 rounded-full bg-primary/20 animate-bounce" style={{ animationDelay: '0.4s' }} />
        <div className="absolute right-4 bottom-0 h-2 w-2 rounded-full bg-primary/25 animate-bounce" style={{ animationDelay: '0.6s' }} />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-semibold text-foreground mb-3">{config.title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{config.description}</p>

      {/* Action Button */}
      {action && (
        <Button onClick={action.onClick} variant="outline" className="gap-2">
          {action.label}
        </Button>
      )}

      {/* Decorative Illustration Elements */}
      <div className="mt-8 flex items-center gap-3 opacity-30">
        <BookOpen className="h-5 w-5 text-muted-foreground" />
        <FileText className="h-5 w-5 text-muted-foreground" />
        <PlayCircle className="h-5 w-5 text-muted-foreground" />
      </div>
    </Card>
  );
}

export default LibraryEmptyState;

