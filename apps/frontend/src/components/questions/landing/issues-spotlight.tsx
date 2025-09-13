/**
 * Issues Spotlight
 * Nêu bật các vấn đề cần quan tâm và cho phép lọc nhanh
 */

'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Tag, MessageSquareWarning, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IssuesSpotlightProps {
  className?: string;
}

interface IssueCard {
  key: 'no-solution' | 'no-tags' | 'low-feedback' | 'low-usage';
  title: string;
  description: string;
  count?: number;
  icon: React.ReactNode;
  onClick?: () => void;
}

export function IssuesSpotlight({ className }: IssuesSpotlightProps) {
  const [issues, setIssues] = useState<IssueCard[]>([]);

  useEffect(() => {
    // TODO: Kết nối API ListQuestionsByFilter để lấy filterSummary thực
    // Tạm mock số liệu để hiển thị giao diện
    const mock: IssueCard[] = [
      {
        key: 'no-solution',
        title: 'Thiếu lời giải',
        description: 'Các câu hỏi chưa có lời giải chi tiết',
        count: 124,
        icon: <AlertCircle className="h-5 w-5" />,
        onClick: () => {
          const url = new URL(window.location.origin + '/questions/browse');
          url.searchParams.set('hasSolution', 'false');
          window.location.href = url.toString();
        },
      },
      {
        key: 'no-tags',
        title: 'Chưa gắn tags',
        description: 'Câu hỏi thiếu thẻ tags để phân loại',
        count: 89,
        icon: <Tag className="h-5 w-5" />,
        onClick: () => {
          const url = new URL(window.location.origin + '/questions/browse');
          url.searchParams.set('tags', '');
          window.location.href = url.toString();
        },
      },
      {
        key: 'low-feedback',
        title: 'Feedback thấp',
        description: 'Điểm đánh giá dưới ngưỡng khuyến nghị',
        count: 46,
        icon: <MessageSquareWarning className="h-5 w-5" />,
        onClick: () => {
          const url = new URL(window.location.origin + '/questions/browse');
          url.searchParams.set('feedbackMax', '2');
          window.location.href = url.toString();
        },
      },
      {
        key: 'low-usage',
        title: 'Ít được sử dụng',
        description: 'Câu hỏi chưa được dùng nhiều trong đề',
        count: 312,
        icon: <EyeOff className="h-5 w-5" />,
        onClick: () => {
          const url = new URL(window.location.origin + '/questions/browse');
          url.searchParams.set('usageMax', '1');
          window.location.href = url.toString();
        },
      },
    ];

    setIssues(mock);
  }, []);

  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {issues.map((issue) => (
        <button
          key={issue.key}
          onClick={issue.onClick}
          className="group flex items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/40 dark:bg-[hsl(var(--color-card))] dark:border-[hsl(var(--color-border))] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
        >
          <div className="rounded-md bg-primary/10 p-2 text-primary dark:bg-[hsl(var(--color-primary))]/15 dark:text-[hsl(var(--color-primary))]">
            {issue.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground dark:text-[hsl(var(--color-foreground))]">{issue.title}</h3>
              {typeof issue.count === 'number' && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-[hsl(var(--color-warning))]/20 dark:text-[hsl(var(--color-warning))]">
                  {issue.count}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground dark:text-[hsl(var(--color-text-muted))]">{issue.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default IssuesSpotlight;
