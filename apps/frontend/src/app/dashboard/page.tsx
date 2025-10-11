import React from "react";
import DashboardClient from "./dashboard-client";

// Disable static generation for dashboard page - requires client-side data
export const dynamic = 'force-dynamic';

/**
 * User Dashboard Page - Server Component Wrapper
 * Trang dashboard chính cho người dùng đã đăng nhập
 *
 * Features:
 * - Thống kê cá nhân
 * - Tiến độ học tập
 * - Khóa học đang theo dõi
 * - Thông báo và hoạt động gần đây
 */
export default function DashboardPage() {
  return <DashboardClient />;
}

