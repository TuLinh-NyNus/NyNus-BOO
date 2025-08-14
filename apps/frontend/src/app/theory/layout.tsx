/**
 * Theory Layout
 * Layout chính cho theory content pages
 */

import type { Metadata } from "next";
import { TheoryLayoutClient } from '@/components/theory/TheoryLayoutClient';

export const metadata: Metadata = {
  title: "Lý thuyết Toán học - NyNus",
  description: "Học lý thuyết toán học với hệ thống LaTeX rendering và navigation thông minh",
  keywords: ["toán học", "lý thuyết", "học tập", "LaTeX", "NyNus"],
};

interface TheoryLayoutProps {
  children: React.ReactNode;
}

/**
 * Theory Layout Component
 * Server component cho theory layout với metadata
 */
export default function TheoryLayout({ children }: TheoryLayoutProps) {
  return <TheoryLayoutClient>{children}</TheoryLayoutClient>;
}
