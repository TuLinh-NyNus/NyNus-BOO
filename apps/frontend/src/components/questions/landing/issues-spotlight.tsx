/**
 * Issues Spotlight
 * Nêu bật các vấn đề cần quan tâm và cho phép lọc nhanh
 */

'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Tag, MessageSquareWarning, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionFilterService } from '@/services/grpc/question-filter.service';
import { logger } from '@/lib/logger';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssueStats = async () => {
      try {
        setLoading(true);

        // Fetch statistics for each issue type using real gRPC service
        const [noSolutionData, noTagsData, lowFeedbackData, lowUsageData] = await Promise.all([
          // Questions without solution
          QuestionFilterService.listQuestionsByFilter({
            content_filter: { has_solution: false },
            pagination: { page: 1, limit: 1 }
          }),
          // Questions without tags
          QuestionFilterService.listQuestionsByFilter({
            metadata_filter: { has_tags: false },
            pagination: { page: 1, limit: 1 }
          }),
          // Questions with low feedback (< 3.0)
          QuestionFilterService.listQuestionsByFilter({
            metadata_filter: { feedback_max: 3.0 },
            pagination: { page: 1, limit: 1 }
          }),
          // Questions with low usage (< 2 times)
          QuestionFilterService.listQuestionsByFilter({
            metadata_filter: { usage_count_max: 2 },
            pagination: { page: 1, limit: 1 }
          })
        ]);

        const issueCards: IssueCard[] = [
          {
            key: 'no-solution',
            title: 'Thiếu lời giải',
            description: 'Các câu hỏi chưa có lời giải chi tiết',
            count: noSolutionData.total_count || 0,
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
            count: noTagsData.total_count || 0,
            icon: <Tag className="h-5 w-5" />,
            onClick: () => {
              const url = new URL(window.location.origin + '/questions/browse');
              url.searchParams.set('hasTags', 'false');
              window.location.href = url.toString();
            },
          },
          {
            key: 'low-feedback',
            title: 'Feedback thấp',
            description: 'Điểm đánh giá dưới ngưỡng khuyến nghị',
            count: lowFeedbackData.total_count || 0,
            icon: <MessageSquareWarning className="h-5 w-5" />,
            onClick: () => {
              const url = new URL(window.location.origin + '/questions/browse');
              url.searchParams.set('feedbackMax', '3');
              window.location.href = url.toString();
            },
          },
          {
            key: 'low-usage',
            title: 'Ít được sử dụng',
            description: 'Câu hỏi chưa được dùng nhiều trong đề',
            count: lowUsageData.total_count || 0,
            icon: <EyeOff className="h-5 w-5" />,
            onClick: () => {
              const url = new URL(window.location.origin + '/questions/browse');
              url.searchParams.set('usageMax', '2');
              window.location.href = url.toString();
            },
          },
        ];

        setIssues(issueCards);
      } catch (error) {
        logger.error('[IssuesSpotlight] Failed to fetch issue statistics', {
          operation: 'fetchIssueStats',
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Failed to fetch statistics',
          stack: error instanceof Error ? error.stack : undefined,
        });

        // Fallback to empty state on error
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueStats();
  }, []);

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm animate-pulse">
            <div className="h-12 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

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

