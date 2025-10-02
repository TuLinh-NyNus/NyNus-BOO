import React from "react";
import AdminDashboardClient from "./admin-client";

// Disable static generation for admin page - requires client-side data
export const dynamic = 'force-dynamic';

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
