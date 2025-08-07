/**
 * Admin Path Utilities
 * Utilities để quản lý admin paths với secret path
 */

/**
 * Get the secret path from environment variables
 * Lấy secret path từ environment variables
 */
export function getSecretPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH || "3141592654";
}

/**
 * Convert admin path to secret path
 * Chuyển đổi admin path sang secret path
 *
 * @param adminPath - Admin path (e.g., "/admin", "/admin/users")
 * @returns Secret path (e.g., "/3141592654", "/3141592654/users")
 */
export function toSecretPath(adminPath: string): string {
  const secretPath = getSecretPath();

  // Remove leading slash if present
  const cleanPath = adminPath.startsWith("/") ? adminPath.slice(1) : adminPath;

  // Handle root admin path
  if (cleanPath === "admin") {
    return `/${secretPath}`;
  }

  // Handle admin sub-paths
  if (cleanPath.startsWith("admin/")) {
    const subPath = cleanPath.replace("admin/", "");
    return `/${secretPath}/${subPath}`;
  }

  // If not an admin path, return as is
  return adminPath;
}

/**
 * Convert secret path back to admin path
 * Chuyển đổi secret path về admin path
 *
 * @param secretPath - Secret path (e.g., "/3141592654", "/3141592654/users")
 * @returns Admin path (e.g., "/admin", "/admin/users")
 */
export function fromSecretPath(secretPath: string): string {
  const secret = getSecretPath();

  // Remove leading slash if present
  const cleanPath = secretPath.startsWith("/") ? secretPath.slice(1) : secretPath;

  // Handle root secret path
  if (cleanPath === secret) {
    return "/admin";
  }

  // Handle secret sub-paths
  if (cleanPath.startsWith(`${secret}/`)) {
    const subPath = cleanPath.replace(`${secret}/`, "");
    return `/admin/${subPath}`;
  }

  // If not a secret path, return as is
  return secretPath;
}

/**
 * Check if current path is using secret path
 * Kiểm tra path hiện tại có sử dụng secret path không
 *
 * @param pathname - Current pathname
 * @returns True if using secret path
 */
export function isUsingSecretPath(pathname: string): boolean {
  const secretPath = getSecretPath();
  return pathname.startsWith(`/${secretPath}`);
}

/**
 * Get the display path for admin routes
 * Lấy display path cho admin routes (luôn hiển thị secret path)
 *
 * @param adminPath - Admin path
 * @returns Display path (secret path)
 */
export function getDisplayPath(adminPath: string): string {
  return toSecretPath(adminPath);
}

/**
 * Admin navigation configuration with secret paths
 * Cấu hình navigation admin với secret paths
 */
export const ADMIN_NAVIGATION = {
  main: [
    {
      name: "Dashboard",
      href: "/admin",
      icon: "LayoutDashboard",
    },
    {
      name: "Người dùng",
      href: "/admin/users",
      icon: "Users",
    },
    {
      name: "Phân quyền",
      href: "/admin/permissions",
      icon: "Shield",
    },
    {
      name: "Level & Audit",
      href: "/admin/level-progression",
      icon: "TrendingUp",
    },
    {
      name: "Khóa học",
      href: "/admin/courses",
      icon: "BookOpen",
    },
    {
      name: "Câu hỏi",
      href: "/admin/questions",
      icon: "HelpCircle",
      children: [
        {
          name: "Danh sách",
          href: "/admin/questions",
          icon: "List",
        },
        {
          name: "Tạo mới",
          href: "/admin/questions/create",
          icon: "Plus",
        },
        {
          name: "MapCode",
          href: "/admin/mapcode",
          icon: "Map",
        },
      ],
    },
    {
      name: "Bài kiểm tra",
      href: "/admin/exams",
      icon: "FileQuestion",
    },
    {
      name: "Giáo viên",
      href: "/admin/teachers",
      icon: "GraduationCap",
    },
    {
      name: "Thống kê",
      href: "/admin/analytics",
      icon: "BarChart3",
    },
    {
      name: "Thông báo",
      href: "/admin/notifications",
      icon: "Bell",
    },
    {
      name: "Bảo mật",
      href: "/admin/security",
      icon: "Shield",
    },
    {
      name: "Cài đặt",
      href: "/admin/settings",
      icon: "Settings",
    },
  ],
  bottom: [
    {
      name: "Trợ giúp",
      href: "/admin/help",
      icon: "HelpCircle",
    },
  ],
} as const;

/**
 * Get navigation items with secret paths
 * Lấy navigation items với secret paths
 */
export function getNavigationWithSecretPaths() {
  return {
    main: ADMIN_NAVIGATION.main.map((item) => ({
      ...item,
      href: toSecretPath(item.href),
    })),
    bottom: ADMIN_NAVIGATION.bottom.map((item) => ({
      ...item,
      href: toSecretPath(item.href),
    })),
  };
}
