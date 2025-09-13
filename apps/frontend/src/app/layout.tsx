import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { MainLayout } from "@/components/layout";
import { defaultThemePreloader } from "@/lib/theme-preloader";
import { BrowserExtensionCleanup } from "@/components/common/browser-extension-cleanup";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NyNus - Hệ thống Ngân hàng Đề thi",
  description: "Hệ thống quản lý và tạo đề thi thông minh cho giáo dục",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Theme preloader script - runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: defaultThemePreloader.getPreloadScript(),
          }}
        />
        {/* ✅ Browser extension cleanup đã được di chuyển sang safe component */}
      </head>
      <body
        className={`${inter.variable} font-sans antialiased nynus-gradient-bg text-foreground`}
        suppressHydrationWarning
      >
        <AppProviders>
          <MainLayout>
            {children}
          </MainLayout>
          {/* ✅ Safe cleanup component thay thế cho dangerous script */}
          <BrowserExtensionCleanup />
        </AppProviders>
      </body>
    </html>
  );
}

