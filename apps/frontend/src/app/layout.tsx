import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { MainLayout } from "@/components/layout";
import { defaultThemePreloader } from "@/lib/theme-preloader";
import { BrowserExtensionCleanup } from "@/components/common/browser-extension-cleanup";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { GA4Script } from "@/components/analytics/ga4-script";
import { CookieConsent } from "@/components/common/cookie-consent";

const inter = Inter({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
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

        {/* Google Analytics 4 - tracks user behavior */}
        <GA4Script />

        {/* ✅ Browser extension cleanup đã được di chuyển sang safe component */}
      </head>
      <body
        className={`${inter.variable} font-sans antialiased nynus-gradient-bg text-foreground`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <AppProviders>
            <MainLayout>
              {children}
            </MainLayout>
            {/* ✅ Safe cleanup component thay thế cho dangerous script */}
            <BrowserExtensionCleanup />
            
            {/* Cookie Consent Banner - GDPR compliant */}
            <CookieConsent 
              position="bottom"
              showPrivacyLink={true}
              privacyPolicyUrl="/privacy"
            />
          </AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}

