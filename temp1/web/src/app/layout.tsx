import dynamic from "next/dynamic";
import { Manrope, Nunito } from "next/font/google";
import React from "react";

import "./globals.css";
import "katex/dist/katex.min.css";
import "./nynus-latex-styles.css";
import "../styles/nynus-latex.css";


import { Toaster } from '@/components/ui';
import { AuthProvider } from '@/contexts/auth-context';
import { LogProvider } from '@/contexts/log-context';
import { QueryClientProvider } from '@/providers/query-client-provider';

// import { getServerAuthData } from '@/lib/auth/server-auth'; // Removed to enable static generation

import type { Metadata } from "next";

const MainLayout = dynamic(() => import("@/components/layout/main-layout"), {
  ssr: true,
});

const TokenManager = dynamic(() => import("@/components/features/auth/TokenManager"), {
  ssr: false, // Chỉ chạy ở client-side
});



const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "NyNus - Nền tảng học tập toán học tương tác",
  description: "Học toán thông minh với AI, nền tảng học tập cá nhân hóa với trí tuệ nhân tạo giúp học sinh đạt kết quả tốt hơn. Phân tích dữ liệu học tập và đề xuất lộ trình phù hợp cho từng học sinh.",
  keywords: "toán học, AI, học tập, trực tuyến, đề thi, luyện tập, trí tuệ nhân tạo, học sinh, giáo dục, cá nhân hóa",
  metadataBase: new URL('https://nynus.edu.vn'),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://nynus.edu.vn',
    title: 'NyNus - Nền tảng học tập toán học tương tác với AI',
    description: 'Học toán thông minh với AI, nền tảng cá nhân hóa giúp học sinh đạt kết quả tốt hơn',
    siteName: 'NyNus',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NyNus - Nền tảng học tập toán học tương tác với AI'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NyNus - Nền tảng học tập toán học tương tác với AI',
    description: 'Học toán thông minh với AI, nền tảng cá nhân hóa giúp học sinh đạt kết quả tốt hơn',
    images: ['/og-image.jpg']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth removed to enable static generation
  // Auth will be handled client-side by AuthProvider
  return (
    <html lang="vi" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Các script và style sẽ được thêm vào sau */}
        {/* Server auth data injection removed for static generation */}
      </head>
      <body className={`${manrope.variable} ${nunito.variable} font-sans min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-200 antialiased flex flex-col transition-colors duration-300`}>
        <LogProvider>
          <QueryClientProvider>
            <AuthProvider>
              <TokenManager />
              <MainLayout>
                {children}
              </MainLayout>
              <Toaster />
            </AuthProvider>
          </QueryClientProvider>
        </LogProvider>
      </body>
    </html>
  );
}
