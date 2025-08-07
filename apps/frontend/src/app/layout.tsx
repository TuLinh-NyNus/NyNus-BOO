import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { MainLayout } from "@/components/layout";

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
      <body
        className={`${inter.variable} font-sans antialiased nynus-gradient-bg`}
        suppressHydrationWarning={true}
      >
        <AppProviders>
          <MainLayout>
            {children}
          </MainLayout>
        </AppProviders>
      </body>
    </html>
  );
}

