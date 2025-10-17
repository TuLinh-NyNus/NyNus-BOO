import { Metadata } from 'next';
import { ReactNode } from 'react';

/**
 * AI Tutor Section Metadata
 * SEO metadata cho AI Tutor coming soon page
 */
export const metadata: Metadata = {
  title: "AI Tutor - Coming Soon | NyNus Exam Bank System",
  description: "Trợ lý học tập thông minh được hỗ trợ bởi AI với lộ trình cá nhân hóa, phản hồi thời gian thực và độ khó thích ứng. Dự kiến ra mắt Q1 2025.",
  keywords: [
    "AI Tutor",
    "trợ lý học tập AI",
    "học tập cá nhân hóa",
    "AI giáo dục",
    "NyNus",
    "coming soon",
    "tính năng mới"
  ],
  openGraph: {
    title: "AI Tutor - Coming Soon | NyNus",
    description: "Trợ lý học tập thông minh được hỗ trợ bởi AI, giúp bạn học tập hiệu quả hơn",
    type: "website",
    siteName: "NyNus Exam Bank System",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tutor - Coming Soon | NyNus",
    description: "Trợ lý học tập thông minh được hỗ trợ bởi AI, giúp bạn học tập hiệu quả hơn",
  },
  alternates: {
    canonical: "/ai-tutor",
  },
};

export default function AITutorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

