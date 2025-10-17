import { Metadata } from 'next';
import { ReactNode } from 'react';

/**
 * Learning Paths Section Metadata
 * SEO metadata cho Learning Paths coming soon page
 */
export const metadata: Metadata = {
  title: "Learning Paths - Coming Soon | NyNus Exam Bank System",
  description: "Lộ trình học tập được cá nhân hóa với theo dõi tiến độ, milestone achievements và đánh giá kỹ năng định kỳ. Dự kiến ra mắt Q1 2025.",
  keywords: [
    "Learning Paths",
    "lộ trình học tập",
    "học tập cá nhân hóa",
    "theo dõi tiến độ",
    "NyNus",
    "coming soon",
    "tính năng mới"
  ],
  openGraph: {
    title: "Learning Paths - Coming Soon | NyNus",
    description: "Lộ trình học tập được cá nhân hóa, giúp bạn đạt mục tiêu học tập hiệu quả",
    type: "website",
    siteName: "NyNus Exam Bank System",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learning Paths - Coming Soon | NyNus",
    description: "Lộ trình học tập được cá nhân hóa, giúp bạn đạt mục tiêu học tập hiệu quả",
  },
  alternates: {
    canonical: "/learning-paths",
  },
};

export default function LearningPathsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

