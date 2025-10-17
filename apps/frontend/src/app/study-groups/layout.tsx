import { Metadata } from 'next';
import { ReactNode } from 'react';

/**
 * Study Groups Section Metadata
 * SEO metadata cho Study Groups coming soon page
 */
export const metadata: Metadata = {
  title: "Study Groups - Coming Soon | NyNus Exam Bank System",
  description: "Nền tảng học tập cộng tác với tạo nhóm học tập, học tập cộng tác, chia sẻ tài nguyên và buổi học với giáo viên. Dự kiến ra mắt Q3 2025.",
  keywords: [
    "Study Groups",
    "nhóm học tập",
    "học tập cộng tác",
    "chia sẻ tài nguyên",
    "NyNus",
    "coming soon",
    "tính năng mới"
  ],
  openGraph: {
    title: "Study Groups - Coming Soon | NyNus",
    description: "Nền tảng học tập cộng tác, kết nối học sinh và giáo viên để học tập hiệu quả hơn",
    type: "website",
    siteName: "NyNus Exam Bank System",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Groups - Coming Soon | NyNus",
    description: "Nền tảng học tập cộng tác, kết nối học sinh và giáo viên để học tập hiệu quả hơn",
  },
  alternates: {
    canonical: "/study-groups",
  },
};

export default function StudyGroupsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

