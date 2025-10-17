import { Metadata } from 'next';
import { ReactNode } from 'react';

/**
 * Leaderboard Section Metadata
 * SEO metadata cho Leaderboard coming soon page
 */
export const metadata: Metadata = {
  title: "Leaderboard - Coming Soon | NyNus Exam Bank System",
  description: "Bảng xếp hạng toàn diện với xếp hạng toàn cầu, bảng xếp hạng theo môn, cuộc thi định kỳ và showcase thành tích. Dự kiến ra mắt Q2 2025.",
  keywords: [
    "Leaderboard",
    "bảng xếp hạng",
    "xếp hạng học sinh",
    "cạnh tranh",
    "NyNus",
    "coming soon",
    "tính năng mới"
  ],
  openGraph: {
    title: "Leaderboard - Coming Soon | NyNus",
    description: "Bảng xếp hạng toàn diện, tạo động lực cạnh tranh lành mạnh và ghi nhận thành tích",
    type: "website",
    siteName: "NyNus Exam Bank System",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard - Coming Soon | NyNus",
    description: "Bảng xếp hạng toàn diện, tạo động lực cạnh tranh lành mạnh và ghi nhận thành tích",
  },
  alternates: {
    canonical: "/leaderboard",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

