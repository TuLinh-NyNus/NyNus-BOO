'use client';

/**
 * Admin Library Analytics Page  
 * Hiển thị phân tích và thống kê chi tiết về Library system
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/feedback/use-toast';
import { 
  LibraryAnalyticsDashboard, 
  type AnalyticsSummary, 
  type LibraryItemStats 
} from '@/components/library/analytics-dashboard';

// Mock data - TODO: Replace with API calls
const MOCK_SUMMARY: AnalyticsSummary = {
  totalItems: 1247,
  totalDownloads: 45632,
  totalViews: 123456,
  averageRating: 4.3,
  activeUsers: 2891,
  trendingGrowth: 12.5,
};

const MOCK_MOST_DOWNLOADED: LibraryItemStats[] = [
  {
    id: '1',
    title: 'Bộ đề thi THPT Quốc gia 2024 - Môn Toán',
    kind: 'exam',
    subject: 'Toán học',
    grade: '12',
    downloadCount: 3245,
    averageRating: 4.8,
    reviewCount: 156,
    viewCount: 8932,
    thumbnailUrl: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    title: 'Sách giáo khoa Vật lý 11 - Nâng cao',
    kind: 'book',
    subject: 'Vật lý',
    grade: '11',
    downloadCount: 2891,
    averageRating: 4.6,
    reviewCount: 98,
    viewCount: 7234,
    thumbnailUrl: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    title: 'Video bài giảng Hóa hữu cơ - Cơ bản',
    kind: 'video',
    subject: 'Hóa học',
    grade: '11',
    downloadCount: 2567,
    averageRating: 4.7,
    reviewCount: 123,
    viewCount: 9876,
    thumbnailUrl: 'https://via.placeholder.com/150',
  },
  {
    id: '4',
    title: 'Đề thi thử THPT - Đại học Sư phạm Hà Nội',
    kind: 'exam',
    subject: 'Toán học',
    grade: '12',
    downloadCount: 2234,
    averageRating: 4.5,
    reviewCount: 87,
    viewCount: 6543,
  },
  {
    id: '5',
    title: 'Tài liệu ôn tập Sinh học - Phần di truyền',
    kind: 'book',
    subject: 'Sinh học',
    grade: '12',
    downloadCount: 1987,
    averageRating: 4.4,
    reviewCount: 76,
    viewCount: 5432,
  },
];

const MOCK_HIGHEST_RATED: LibraryItemStats[] = [
  {
    id: '6',
    title: 'Bài giảng Toán học 12 - Giải tích nâng cao',
    kind: 'video',
    subject: 'Toán học',
    grade: '12',
    downloadCount: 1543,
    averageRating: 4.9,
    reviewCount: 234,
    viewCount: 4567,
    thumbnailUrl: 'https://via.placeholder.com/150',
  },
  {
    id: '7',
    title: 'Đề thi HSG Quốc gia - Vật lý 2023',
    kind: 'exam',
    subject: 'Vật lý',
    grade: '12',
    downloadCount: 1234,
    averageRating: 4.8,
    reviewCount: 189,
    viewCount: 3456,
  },
  {
    id: '8',
    title: 'Sách bài tập Hóa học 11 - Có lời giải',
    kind: 'book',
    subject: 'Hóa học',
    grade: '11',
    downloadCount: 1876,
    averageRating: 4.8,
    reviewCount: 145,
    viewCount: 4321,
    thumbnailUrl: 'https://via.placeholder.com/150',
  },
  {
    id: '9',
    title: 'Video luyện giải đề Toán THPT',
    kind: 'video',
    subject: 'Toán học',
    grade: '12',
    downloadCount: 1678,
    averageRating: 4.7,
    reviewCount: 167,
    viewCount: 5234,
  },
  {
    id: '10',
    title: 'Đề thi tuyển sinh Đại học Y Hà Nội',
    kind: 'exam',
    subject: 'Sinh học',
    grade: '12',
    downloadCount: 1432,
    averageRating: 4.7,
    reviewCount: 134,
    viewCount: 3987,
  },
];

const MOCK_RECENTLY_ADDED: LibraryItemStats[] = [
  {
    id: '11',
    title: 'Đề thi thử lần 1 - THPT Chu Văn An 2024',
    kind: 'exam',
    subject: 'Toán học',
    grade: '12',
    downloadCount: 234,
    averageRating: 4.2,
    reviewCount: 12,
    uploadedAt: new Date().toISOString(),
  },
  {
    id: '12',
    title: 'Bài giảng Vật lý 12 - Dao động cơ',
    kind: 'video',
    subject: 'Vật lý',
    grade: '12',
    downloadCount: 187,
    averageRating: 4.1,
    reviewCount: 8,
    uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '13',
    title: 'Sách Hóa học hữu cơ - Tập 2',
    kind: 'book',
    subject: 'Hóa học',
    grade: '11',
    downloadCount: 156,
    averageRating: 4.3,
    reviewCount: 15,
    uploadedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '14',
    title: 'Đề thi HSG tỉnh Hà Nội - Sinh học',
    kind: 'exam',
    subject: 'Sinh học',
    grade: '11',
    downloadCount: 123,
    averageRating: 4.0,
    reviewCount: 7,
    uploadedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
  {
    id: '15',
    title: 'Video ôn tập Văn học - Ngữ văn 12',
    kind: 'video',
    subject: 'Ngữ văn',
    grade: '12',
    downloadCount: 198,
    averageRating: 4.4,
    reviewCount: 11,
    uploadedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
  },
  {
    id: '16',
    title: 'Tài liệu ôn thi Địa lý 12 - Phần Việt Nam',
    kind: 'book',
    subject: 'Địa lý',
    grade: '12',
    downloadCount: 167,
    averageRating: 4.2,
    reviewCount: 9,
    uploadedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
  },
];

export default function AdminLibraryAnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AnalyticsSummary>(MOCK_SUMMARY);
  const [mostDownloaded, setMostDownloaded] = useState<LibraryItemStats[]>(MOCK_MOST_DOWNLOADED);
  const [highestRated, setHighestRated] = useState<LibraryItemStats[]>(MOCK_HIGHEST_RATED);
  const [recentlyAdded, setRecentlyAdded] = useState<LibraryItemStats[]>(MOCK_RECENTLY_ADDED);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate data refresh
      setSummary({
        ...MOCK_SUMMARY,
        totalDownloads: MOCK_SUMMARY.totalDownloads + Math.floor(Math.random() * 100),
        totalViews: MOCK_SUMMARY.totalViews + Math.floor(Math.random() * 500),
        activeUsers: MOCK_SUMMARY.activeUsers + Math.floor(Math.random() * 50),
      });
      
      toast({
        title: 'Làm mới thành công',
        description: 'Dữ liệu analytics đã được cập nhật',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Data is already mocked, no need to load
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/3141592654/admin/library">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Library Analytics
              </h1>
              <p className="mt-1 text-muted-foreground">
                Phân tích chi tiết về nội dung, người dùng và xu hướng
              </p>
            </div>
          </div>
        </div>

        <Button onClick={loadData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-base">💡 Thông tin</CardTitle>
          <CardDescription>
            Dashboard này hiển thị dữ liệu mock. Để kết nối với backend thực, cần implement:
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>API endpoint <code className="text-xs">/api/library/analytics/summary</code></li>
              <li>API endpoint <code className="text-xs">/api/library/analytics/top-downloaded</code></li>
              <li>API endpoint <code className="text-xs">/api/library/analytics/top-rated</code></li>
              <li>API endpoint <code className="text-xs">/api/library/analytics/recent</code></li>
            </ul>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Analytics Dashboard */}
      <LibraryAnalyticsDashboard
        summary={summary}
        mostDownloaded={mostDownloaded}
        highestRated={highestRated}
        recentlyAdded={recentlyAdded}
      />
    </div>
  );
}

