/**
 * Theory Home Page
 * Landing page cho theory section
 */

import { Metadata } from 'next';
import { TheoryHomePage } from '@/components/theory/TheoryHomePage';

export const metadata: Metadata = {
  title: "Lý thuyết Toán học - NyNus",
  description: "Khám phá thư viện lý thuyết toán học với hệ thống LaTeX rendering và navigation thông minh. Học từ lớp 10 đến lớp 12 với nội dung chất lượng cao.",
  keywords: ["toán học", "lý thuyết", "học tập", "LaTeX", "lớp 10", "lớp 11", "lớp 12", "NyNus"],
  openGraph: {
    title: "Lý thuyết Toán học - NyNus",
    description: "Khám phá thư viện lý thuyết toán học với hệ thống LaTeX rendering và navigation thông minh",
    type: "website"
  }
};

/**
 * Theory Home Page
 * Server component cho theory landing page
 */
export default function TheoryPage() {
  return <TheoryHomePage />;
}
