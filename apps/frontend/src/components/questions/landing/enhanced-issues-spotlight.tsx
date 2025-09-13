/**
 * Enhanced Issues Spotlight
 * Hiển thị vấn đề cần quan tâm với thiết kế gradient đẹp
 * 
 * Improvements:
 * - Gradient backgrounds từ theme-dark
 * - Better contrast badges
 * - Hover effects và animations
 * - Icon colors theo severity
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { AlertCircle, Tag, MessageSquareWarning, TrendingDown, Eye, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IssueCard {
  key: 'no-solution' | 'no-tags' | 'low-feedback' | 'low-usage';
  title: string;
  description: string;
  count?: number;
  icon: React.ReactNode;
  severity: 'critical' | 'warning' | 'info';
  gradient: string;
  iconColor: string;
  badgeColor: string;
  onClick?: () => void;
}

interface EnhancedIssuesSpotlightProps {
  className?: string;
  showDescription?: boolean;
}

export function EnhancedIssuesSpotlight({ 
  className,
  showDescription = true 
}: EnhancedIssuesSpotlightProps) {
  const [issues, setIssues] = useState<IssueCard[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const hoveredCardRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Mock data với gradient colors từ theme-dark.css
    const mockIssues: IssueCard[] = [
      {
        key: 'no-solution',
        title: 'Thiếu lời giải',
        description: 'Câu hỏi chưa có lời giải chi tiết',
        count: 124,
        severity: 'critical',
        gradient: 'linear-gradient(135deg, #9D174D, #DB2777, #EC4899)', // Pink gradient
        iconColor: 'text-[#EC4899]',
        badgeColor: 'bg-[#9D174D] text-white',
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
        description: 'Cần phân loại thêm',
        count: 89,
        severity: 'warning',
        gradient: 'linear-gradient(135deg, #86198F, #C026D3, #D946EF)', // Fuchsia gradient
        iconColor: 'text-[#D946EF]',
        badgeColor: 'bg-[#86198F] text-white',
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
        description: 'Đánh giá chưa tốt',
        count: 46,
        severity: 'warning',
        gradient: 'linear-gradient(135deg, #115E59, #0D9488, #14B8A6)', // Teal gradient
        iconColor: 'text-[#14B8A6]',
        badgeColor: 'bg-[#115E59] text-white',
        icon: <MessageSquareWarning className="h-5 w-5" />,
        onClick: () => {
          const url = new URL(window.location.origin + '/questions/browse');
          url.searchParams.set('feedbackMax', '2');
          window.location.href = url.toString();
        },
      },
      {
        key: 'low-usage',
        title: 'Ít được dùng',
        description: 'Cần xem xét lại',
        count: 312,
        severity: 'info',
        gradient: 'linear-gradient(135deg, #1E40AF, #2563EB, #3B82F6)', // Blue gradient
        iconColor: 'text-[#3B82F6]',
        badgeColor: 'bg-[#1E40AF] text-white',
        icon: <TrendingDown className="h-5 w-5" />,
        onClick: () => {
          const url = new URL(window.location.origin + '/questions/browse');
          url.searchParams.set('usageMax', '1');
          window.location.href = url.toString();
        },
      },
    ];

    setIssues(mockIssues);
  }, []);

  const getSeverityPulse = (severity: string) => {
    switch(severity) {
      case 'critical': return 'animate-pulse';
      case 'warning': return '';
      default: return '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Section Header */}
      <div className="text-center mb-4">
        <h3 className="text-sm font-medium text-muted-foreground dark:text-[hsl(220_15%_72%)] uppercase tracking-wider">
          Vấn đề cần quan tâm
        </h3>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {issues.map((issue) => (
          <button
            key={issue.key}
            onClick={issue.onClick}
            onMouseEnter={() => {
              setHoveredCard(issue.key);
              hoveredCardRef.current = issue.key;
              
              // Clear any existing timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              
              // Show preview after 500ms hover
              timeoutRef.current = setTimeout(() => {
                if (hoveredCardRef.current === issue.key) {
                  setShowPreview(issue.key);
                }
              }, 500);
            }}
            onMouseLeave={() => {
              setHoveredCard(null);
              setShowPreview(null);
              hoveredCardRef.current = null;
              
              // Clear timeout on leave
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            }}
            className={cn(
              'group relative overflow-hidden',
              'rounded-2xl p-4',
              'border border-border/50 dark:border-[hsl(221_27%_28%)]/30',
              'bg-white dark:bg-[hsl(223_28%_11%)]',
              'shadow-sm hover:shadow-xl',
              'transition-all duration-300',
              'hover:scale-[1.02]',
              'focus:outline-none focus:ring-4 focus:ring-[hsl(243_75%_65%)]/30'
            )}
            aria-label={`${issue.title}: ${issue.count} câu hỏi. Nhấn để lọc`}
            title={`Lọc ${issue.count} câu hỏi ${issue.title.toLowerCase()}`}
          >
            {/* Gradient Background Overlay */}
            <div 
              className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100',
                'transition-opacity duration-300'
              )}
              style={{ 
                background: issue.gradient,
                opacity: hoveredCard === issue.key ? 0.08 : 0
              }}
            />

            {/* Content Container */}
            <div className="relative z-10">
              {/* Top Row: Icon and Badge */}
              <div className="flex items-start justify-between mb-3">
                {/* Icon with gradient background */}
                <div 
                  className={cn(
                    'p-2.5 rounded-xl',
                    'transition-all duration-300',
                    'group-hover:scale-110',
                    getSeverityPulse(issue.severity)
                  )}
                  style={{ 
                    background: issue.gradient,
                    opacity: 0.12
                  }}
                >
                  <div className={cn(issue.iconColor)}>
                    {issue.icon}
                  </div>
                </div>

                {/* Count Badge */}
                {typeof issue.count === 'number' && (
                  <span 
                    className={cn(
                      'px-2.5 py-1 rounded-full',
                      'text-xs font-bold',
                      'shadow-sm',
                      'transition-all duration-300',
                      'group-hover:scale-110',
                      issue.badgeColor
                    )}
                  >
                    {issue.count}
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className={cn(
                'text-sm font-semibold text-left',
                'text-foreground dark:text-[hsl(220_14%_98%)]',
                'mb-1',
                'transition-colors duration-300',
                'group-hover:text-[hsl(243_75%_65%)]'
              )}>
                {issue.title}
              </h4>

              {/* Description */}
              {showDescription && (
                <p className={cn(
                  'text-xs text-left',
                  'text-muted-foreground dark:text-[hsl(220_15%_72%)]',
                  'line-clamp-1'
                )}>
                  {issue.description}
                </p>
              )}

              {/* Hover Indicator */}
              <div className={cn(
                'absolute bottom-2 right-2',
                'text-xs font-medium',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity duration-300',
                issue.iconColor
              )}>
                Xem →
              </div>
            </div>

            {/* Question Preview Tooltip */}
            {showPreview === issue.key && (
              <div className={cn(
                'absolute top-full left-0 right-0 mt-2 z-50',
                'p-4 rounded-xl',
                'bg-white dark:bg-[hsl(223_28%_11%)]',
                'border border-border dark:border-[hsl(221_27%_28%)]',
                'shadow-2xl',
                'animate-in fade-in-0 slide-in-from-top-1',
                'max-w-sm'
              )}>
                <div className="space-y-3">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[hsl(243_75%_65%)]" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Xem trước
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {issue.count} câu hỏi
                    </span>
                  </div>

                  {/* Sample Questions */}
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-muted/50 dark:bg-[hsl(224_24%_18%)]/50">
                      <p className="text-xs font-medium mb-1">Ví dụ 1:</p>
                      <p className="text-xs text-muted-foreground">
                        Giải phương trình: x² + 2x - 3 = 0
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 dark:bg-[hsl(224_24%_18%)]/50">
                      <p className="text-xs font-medium mb-1">Ví dụ 2:</p>
                      <p className="text-xs text-muted-foreground">
                        Tính đạo hàm của hàm số y = sin(x)cos(x)
                      </p>
                    </div>
                  </div>

                  {/* View All Link */}
                  <div className="pt-2 border-t border-border dark:border-[hsl(221_27%_28%)]/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Nhấn để xem tất cả
                      </span>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EnhancedIssuesSpotlight;