'use client';

/**
 * Library Analytics Dashboard Component
 * Hiển thị thống kê nội dung phổ biến, trending, usage analytics
 */

import { Download, Star, TrendingUp, Eye, Clock, Award } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Types
export interface LibraryItemStats {
  id: string;
  title: string;
  kind: 'book' | 'exam' | 'video';
  subject?: string;
  grade?: string;
  downloadCount: number;
  averageRating: number;
  reviewCount: number;
  viewCount?: number;
  thumbnailUrl?: string;
  uploadedAt?: string;
}

export interface AnalyticsSummary {
  totalItems: number;
  totalDownloads: number;
  totalViews: number;
  averageRating: number;
  activeUsers: number;
  trendingGrowth: number; // percentage
}

export interface AnalyticsDashboardProps {
  summary: AnalyticsSummary;
  mostDownloaded: LibraryItemStats[];
  highestRated: LibraryItemStats[];
  recentlyAdded: LibraryItemStats[];
  className?: string;
}

/**
 * Format number with K/M suffix
 */
function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Gần đây';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
}

/**
 * Summary Stat Card
 */
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  className?: string;
}

function StatCard({ icon: Icon, label, value, subtext, trend, className }: StatCardProps) {
  return (
    <Card className={cn('border-border/50 bg-gradient-to-br from-background to-muted/30', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {(subtext || trend !== undefined) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {subtext && <span>{subtext}</span>}
            {trend !== undefined && (
              <Badge 
                variant={trend >= 0 ? 'default' : 'destructive'} 
                className="gap-1 text-[10px] h-4 px-1.5"
              >
                <TrendingUp className={cn('h-3 w-3', trend < 0 && 'rotate-180')} />
                {Math.abs(trend)}%
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Item Stats Row
 */
interface ItemStatsRowProps {
  item: LibraryItemStats;
  rank: number;
  showRating?: boolean;
  showDownloads?: boolean;
  showViews?: boolean;
  showTime?: boolean;
}

function ItemStatsRow({ 
  item, 
  rank, 
  showRating = true, 
  showDownloads = true,
  showViews = false,
  showTime = false,
}: ItemStatsRowProps) {
  const kindColors = {
    book: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    exam: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    video: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-3 transition-colors hover:bg-muted/40">
      {/* Rank Badge */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold',
        rank === 1 && 'bg-yellow-500 text-white',
        rank === 2 && 'bg-gray-400 text-white',
        rank === 3 && 'bg-orange-600 text-white',
        rank > 3 && 'bg-muted text-muted-foreground'
      )}>
        {rank <= 3 ? <Award className="h-4 w-4" /> : rank}
      </div>

      {/* Thumbnail */}
      {item.thumbnailUrl && (
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
          <img 
            src={item.thumbnailUrl} 
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-foreground">
          {item.title}
        </h4>
        <div className="mt-1 flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className={cn('h-5 px-2', kindColors[item.kind])}>
            {item.kind === 'book' ? 'Sách' : item.kind === 'exam' ? 'Đề thi' : 'Video'}
          </Badge>
          {item.subject && (
            <span className="text-muted-foreground">{item.subject}</span>
          )}
          {item.grade && (
            <span className="text-muted-foreground">• Lớp {item.grade}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        {showRating && (
          <div className="flex items-center gap-1 text-xs font-medium text-foreground">
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
            <span>{item.averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({item.reviewCount})</span>
          </div>
        )}
        {showDownloads && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            <span>{formatCount(item.downloadCount)}</span>
          </div>
        )}
        {showViews && item.viewCount !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span>{formatCount(item.viewCount)}</span>
          </div>
        )}
        {showTime && item.uploadedAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatRelativeTime(item.uploadedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function LibraryAnalyticsDashboard({
  summary,
  mostDownloaded,
  highestRated,
  recentlyAdded,
  className,
}: AnalyticsDashboardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={Download}
          label="Tổng tải xuống"
          value={formatCount(summary.totalDownloads)}
          trend={summary.trendingGrowth}
        />
        <StatCard
          icon={Eye}
          label="Lượt xem"
          value={formatCount(summary.totalViews)}
          subtext="30 ngày qua"
        />
        <StatCard
          icon={Star}
          label="Đánh giá trung bình"
          value={summary.averageRating.toFixed(1)}
          subtext="trên 5 sao"
        />
        <StatCard
          icon={TrendingUp}
          label="Nội dung"
          value={formatCount(summary.totalItems)}
          subtext="tài liệu"
        />
        <StatCard
          icon={Award}
          label="Người dùng hoạt động"
          value={formatCount(summary.activeUsers)}
          subtext="7 ngày qua"
        />
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Downloaded */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle>Tải xuống nhiều nhất</CardTitle>
            </div>
            <CardDescription>Top 5 tài liệu được tải xuống nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mostDownloaded.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu
              </div>
            ) : (
              mostDownloaded.map((item, index) => (
                <ItemStatsRow
                  key={item.id}
                  item={item}
                  rank={index + 1}
                  showRating={true}
                  showDownloads={true}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Highest Rated */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <CardTitle>Đánh giá cao nhất</CardTitle>
            </div>
            <CardDescription>Top 5 tài liệu được đánh giá tốt nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {highestRated.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu
              </div>
            ) : (
              highestRated.map((item, index) => (
                <ItemStatsRow
                  key={item.id}
                  item={item}
                  rank={index + 1}
                  showRating={true}
                  showDownloads={true}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recently Added */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Mới thêm gần đây</CardTitle>
          </div>
          <CardDescription>Tài liệu mới được tải lên trong 7 ngày qua</CardDescription>
        </CardHeader>
        <CardContent>
          {recentlyAdded.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Chưa có tài liệu mới
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentlyAdded.map((item, index) => (
                <ItemStatsRow
                  key={item.id}
                  item={item}
                  rank={index + 1}
                  showRating={false}
                  showDownloads={false}
                  showTime={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Progress */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Phân bố nội dung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Sách', count: Math.floor(summary.totalItems * 0.5), color: 'bg-blue-500' },
            { label: 'Đề thi', count: Math.floor(summary.totalItems * 0.3), color: 'bg-purple-500' },
            { label: 'Video', count: Math.floor(summary.totalItems * 0.2), color: 'bg-pink-500' },
          ].map(({ label, count, color }) => {
            const percentage = (count / summary.totalItems) * 100;
            return (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={percentage} className={cn('h-2', color)} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default LibraryAnalyticsDashboard;

