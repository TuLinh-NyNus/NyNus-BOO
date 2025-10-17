import { Metadata } from 'next';
import { ReactNode } from 'react';

/**
 * Dashboard Section Metadata
 * SEO metadata cho dashboard section
 */
export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard - NyNus',
    default: 'Dashboard - NyNus'
  },
  description: 'Bảng điều khiển cá nhân - Theo dõi tiến độ học tập, thống kê kết quả và quản lý hoạt động học tập của bạn.',
  keywords: [
    'dashboard',
    'bảng điều khiển',
    'tiến độ học tập',
    'thống kê',
    'kết quả học tập',
    'NyNus',
    'học tập cá nhân',
    'quản lý học tập'
  ],
  openGraph: {
    title: 'Dashboard - NyNus',
    description: 'Theo dõi tiến độ học tập và quản lý hoạt động học tập cá nhân',
    type: 'website',
    siteName: 'NyNus',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard - NyNus',
    description: 'Theo dõi tiến độ học tập và quản lý hoạt động học tập cá nhân',
  },
  robots: {
    index: false, // Dashboard pages should not be indexed
    follow: false,
  },
};

/**
 * Dashboard Layout Component
 * Layout wrapper cho dashboard section
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

