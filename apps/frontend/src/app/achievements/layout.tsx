import { Metadata } from 'next';
import { ReactNode } from 'react';

/**
 * Achievements Section Metadata
 * SEO metadata cho Achievements coming soon page
 */
export const metadata: Metadata = {
  title: "Achievements - Coming Soon | NyNus Exam Bank System",
  description: "Hệ thống thành tích và phần thưởng với bộ sưu tập huy hiệu, hệ thống điểm, tích hợp bảng xếp hạng và chia sẻ xã hội. Dự kiến ra mắt Q2 2025.",
  keywords: [
    "Achievements",
    "thành tích",
    "huy hiệu",
    "gamification",
    "NyNus",
    "coming soon",
    "tính năng mới"
  ],
  openGraph: {
    title: "Achievements - Coming Soon | NyNus",
    description: "Hệ thống thành tích và phần thưởng, tạo động lực học tập thông qua gamification",
    type: "website",
    siteName: "NyNus Exam Bank System",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Achievements - Coming Soon | NyNus",
    description: "Hệ thống thành tích và phần thưởng, tạo động lực học tập thông qua gamification",
  },
  alternates: {
    canonical: "/achievements",
  },
};

export default function AchievementsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

