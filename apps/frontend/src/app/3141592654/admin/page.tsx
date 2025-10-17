import React from "react";
import { Metadata } from "next";
import AdminDashboardClient from "./admin-client";

// Disable static generation for admin page - requires client-side data
export const dynamic = 'force-dynamic';

/**
 * Admin Dashboard Metadata
 * SEO metadata cho admin dashboard
 */
export const metadata: Metadata = {
  title: 'Admin Dashboard - NyNus',
  description: 'Bảng điều khiển quản trị hệ thống - Quản lý người dùng, câu hỏi, đề thi và theo dõi hoạt động hệ thống.',
  keywords: [
    'admin',
    'quản trị',
    'dashboard',
    'quản lý hệ thống',
    'NyNus admin',
    'hệ thống quản lý',
    'giáo dục'
  ],
  robots: {
    index: false, // Admin pages should never be indexed
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

/**
 * Admin Dashboard Page - Server Component Wrapper
 * Trang quản trị chính của hệ thống NyNus
 *
 * Features:
 * - Thống kê tổng quan hệ thống
 * - Quản lý người dùng
 * - Theo dõi hoạt động
 * - Cấu hình hệ thống
 */
export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
