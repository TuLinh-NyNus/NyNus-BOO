"use client";

import { Button } from "@/components/ui";
import { cn } from "@nynusboo/lib";
import { getNavigationWithSecretPaths, fromSecretPath } from "@/lib/admin-paths";
import {
  BarChart3,
  Bell,
  BookOpen,
  FileQuestion,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  List,
  LogOut,
  Map,
  Plus,
  Settings,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Icon mapping for navigation items
const iconMap = {
  LayoutDashboard,
  Users,
  BookOpen,
  FileQuestion,
  GraduationCap,
  BarChart3,
  Bell,
  Shield,
  TrendingUp,
  Settings,
  HelpCircle,
  List,
  Plus,
  Map,
} as const;

// Get navigation with secret paths
const navigationConfig = getNavigationWithSecretPaths();

const navigation = navigationConfig.main.map((item) => ({
  ...item,
  icon: iconMap[item.icon as keyof typeof iconMap],
}));

const bottomNavigation = navigationConfig.bottom.map((item) => ({
  ...item,
  icon: iconMap[item.icon as keyof typeof iconMap],
}));

export function AdminSidebar() {
  const pathname = usePathname();

  // Helper function to check if navigation item is active
  // Hàm helper để check navigation item có active không
  const isNavItemActive = (itemHref: string): boolean => {
    // Convert current pathname to admin path for comparison
    const adminPath = fromSecretPath(pathname);
    const itemAdminPath = fromSecretPath(itemHref);

    // Exact match for root admin path
    if (itemAdminPath === "/admin" && adminPath === "/admin") {
      return true;
    }

    // For sub-paths, check if current path starts with item path
    if (itemAdminPath !== "/admin" && adminPath.startsWith(itemAdminPath)) {
      return true;
    }

    return false;
  };

  return (
    <div className="admin-sidebar flex h-full w-64 flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">NyNus</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = isNavItemActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn("admin-nav-item", isActive && "active")}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t px-3 py-4">
        <div className="space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = isNavItemActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn("admin-nav-item", isActive && "active")}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}

          <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2 text-sm">
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}
