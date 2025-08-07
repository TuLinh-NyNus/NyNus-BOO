"use client";

import { toSecretPath, fromSecretPath } from "@/lib/admin-paths";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Admin Breadcrumb Component
 * Component breadcrumb cho admin với secret path support
 */

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

/**
 * Generate breadcrumb items from pathname
 * Tạo breadcrumb items từ pathname
 */
function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  // Convert secret path to admin path for processing
  const adminPath = fromSecretPath(pathname);

  // Split path into segments
  const segments = adminPath.split("/").filter(Boolean);

  // Start with home item
  const items: BreadcrumbItem[] = [
    {
      label: "Dashboard",
      href: toSecretPath("/admin"),
      isActive: adminPath === "/admin",
    },
  ];

  // If we're on the dashboard, return just the home item
  if (adminPath === "/admin") {
    return items;
  }

  // Build breadcrumb items from path segments
  let currentPath = "";

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    const fullPath = `/admin${currentPath}`;

    // Generate label from segment
    const label = generateLabelFromSegment(segment);

    items.push({
      label,
      href: toSecretPath(fullPath),
      isActive: fullPath === adminPath,
    });
  }

  return items;
}

/**
 * Generate human-readable label from path segment
 * Tạo label dễ đọc từ path segment
 */
function generateLabelFromSegment(segment: string): string {
  const labelMap: Record<string, string> = {
    users: "Người dùng",
    courses: "Khóa học",
    exams: "Bài kiểm tra",
    teachers: "Giáo viên",
    analytics: "Thống kê",
    notifications: "Thông báo",
    security: "Bảo mật",
    settings: "Cài đặt",
    help: "Trợ giúp",
    profile: "Hồ sơ",
    sessions: "Phiên làm việc",
    audit: "Kiểm toán",
    resources: "Tài nguyên",
    create: "Tạo mới",
    edit: "Chỉnh sửa",
    view: "Xem chi tiết",
  };

  // Return mapped label or capitalize segment
  return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbItems = generateBreadcrumbItems(pathname);

  // Don't show breadcrumb if only one item (dashboard)
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="admin-breadcrumb flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Home className="h-4 w-4" />

      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-1">
          {index > 0 && <ChevronRight className="h-4 w-4" />}

          {item.isActive ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

/**
 * Admin Breadcrumb with custom items
 * Breadcrumb với custom items
 */
interface AdminBreadcrumbCustomProps {
  items: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
}

export function AdminBreadcrumbCustom({ items }: AdminBreadcrumbCustomProps) {
  return (
    <nav className="admin-breadcrumb flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Home className="h-4 w-4" />

      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center space-x-1">
          {index > 0 && <ChevronRight className="h-4 w-4" />}

          {item.isActive || !item.href ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              href={toSecretPath(item.href)}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

/**
 * Hook to get current breadcrumb items
 * Hook để lấy breadcrumb items hiện tại
 */
export function useBreadcrumb() {
  const pathname = usePathname();
  return generateBreadcrumbItems(pathname);
}
