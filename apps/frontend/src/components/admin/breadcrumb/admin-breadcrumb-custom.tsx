/**
 * Admin Breadcrumb Custom
 * Custom breadcrumb component với override mechanism cho special pages
 */

'use client';

import React, { useMemo } from 'react';
import { AdminBreadcrumbCustomProps, BreadcrumbItem, PageMetadata } from '@/types/admin/breadcrumb';
import { AdminBreadcrumb } from './admin-breadcrumb';

/**
 * Page Metadata Mapping
 * Mapping cho special pages với custom breadcrumb configuration
 */
export const PAGE_METADATA: Record<string, PageMetadata> = {
  // User management special pages
  '/3141592654/admin/users/create': {
    path: '/3141592654/admin/users/create',
    title: 'Tạo người dùng mới',
    description: 'Tạo tài khoản người dùng mới trong hệ thống',
    icon: 'UserPlus',
    parent: '/3141592654/admin/users',
    customBreadcrumbs: [
      { label: 'Dashboard', href: '/3141592654/admin', icon: 'Home' },
      { label: 'Quản lý người dùng', href: '/3141592654/admin/users' },
      { label: 'Tạo mới', isActive: true }
    ]
  },

  // Question management special pages
  '/3141592654/admin/questions/create': {
    path: '/3141592654/admin/questions/create',
    title: 'Tạo câu hỏi mới',
    description: 'Tạo câu hỏi mới cho ngân hàng câu hỏi',
    icon: 'Plus',
    parent: '/3141592654/admin/questions',
    customBreadcrumbs: [
      { label: 'Dashboard', href: '/3141592654/admin', icon: 'Home' },
      { label: 'Quản lý câu hỏi', href: '/3141592654/admin/questions' },
      { label: 'Tạo mới', isActive: true }
    ]
  },

  // Settings special pages
  '/3141592654/admin/settings/security': {
    path: '/3141592654/admin/settings/security',
    title: 'Cài đặt bảo mật',
    description: 'Cấu hình các thiết lập bảo mật hệ thống',
    icon: 'Shield',
    parent: '/3141592654/admin/settings',
    customBreadcrumbs: [
      { label: 'Dashboard', href: '/3141592654/admin', icon: 'Home' },
      { label: 'Cài đặt', href: '/3141592654/admin/settings' },
      { label: 'Bảo mật', isActive: true }
    ]
  },

  '/3141592654/admin/settings/notifications': {
    path: '/3141592654/admin/settings/notifications',
    title: 'Cài đặt thông báo',
    description: 'Cấu hình hệ thống thông báo',
    icon: 'Bell',
    parent: '/3141592654/admin/settings',
    customBreadcrumbs: [
      { label: 'Dashboard', href: '/3141592654/admin', icon: 'Home' },
      { label: 'Cài đặt', href: '/3141592654/admin/settings' },
      { label: 'Thông báo', isActive: true }
    ]
  },

  // Analytics special pages
  '/3141592654/admin/analytics/reports': {
    path: '/3141592654/admin/analytics/reports',
    title: 'Báo cáo chi tiết',
    description: 'Xem các báo cáo thống kê chi tiết',
    icon: 'FileText',
    parent: '/3141592654/admin/analytics',
    customBreadcrumbs: [
      { label: 'Dashboard', href: '/3141592654/admin', icon: 'Home' },
      { label: 'Thống kê', href: '/3141592654/admin/analytics' },
      { label: 'Báo cáo', isActive: true }
    ]
  },

  // Role management special pages
  '/3141592654/admin/roles/permissions': {
    path: '/3141592654/admin/roles/permissions',
    title: 'Quản lý quyền hạn',
    description: 'Cấu hình quyền hạn cho các vai trò',
    icon: 'Key',
    parent: '/3141592654/admin/roles',
    customBreadcrumbs: [
      { label: 'Dashboard', href: '/3141592654/admin', icon: 'Home' },
      { label: 'Phân quyền', href: '/3141592654/admin/roles' },
      { label: 'Quyền hạn', isActive: true }
    ]
  }
};

/**
 * Dynamic Page Patterns
 * Patterns cho dynamic pages (với ID parameters)
 */
export const DYNAMIC_PAGE_PATTERNS = [
  {
    pattern: /^\/3141592654\/admin\/users\/([^\/]+)$/,
    generator: (matches: RegExpMatchArray): PageMetadata => ({
      path: matches[0],
      title: 'Chi tiết người dùng',
      description: `Thông tin chi tiết người dùng ${matches[1]}`,
      icon: 'User',
      parent: '/3141592654/admin/users',
      customBreadcrumbs: [
        { label: 'Dashboard', href: '/3141592654/admin', icon: 'Home' },
        { label: 'Quản lý người dùng', href: '/3141592654/admin/users' },
        { label: 'Chi tiết', isActive: true }
      ]
    })
  },
  {
    pattern: /^\/3141592654\/admin\/users\/([^\/]+)\/edit$/,
    generator: (matches: RegExpMatchArray): PageMetadata => ({
      path: matches[0],
      title: 'Chỉnh sửa người dùng',
      description: `Chỉnh sửa thông tin người dùng ${matches[1]}`,
      icon: 'Edit',
      parent: '/3141592654/admin/users',
      customBreadcrumbs: [
        { label: 'Dashboard', href: '/3141592654/admin', icon: 'Home' },
        { label: 'Quản lý người dùng', href: '/3141592654/admin/users' },
        { label: 'Chi tiết', href: `/3141592654/admin/users/${matches[1]}` },
        { label: 'Chỉnh sửa', isActive: true }
      ]
    })
  },
  {
    pattern: /^\/3141592654\/admin\/questions\/([^\/]+)$/,
    generator: (matches: RegExpMatchArray): PageMetadata => ({
      path: matches[0],
      title: 'Chi tiết câu hỏi',
      description: `Thông tin chi tiết câu hỏi ${matches[1]}`,
      icon: 'FileQuestion',
      parent: '/3141592654/admin/questions',
      customBreadcrumbs: [
        { label: 'Dashboard', href: '/3141592654/admin', icon: 'Home' },
        { label: 'Quản lý câu hỏi', href: '/3141592654/admin/questions' },
        { label: 'Chi tiết', isActive: true }
      ]
    })
  },
  {
    pattern: /^\/3141592654\/admin\/questions\/([^\/]+)\/edit$/,
    generator: (matches: RegExpMatchArray): PageMetadata => ({
      path: matches[0],
      title: 'Chỉnh sửa câu hỏi',
      description: `Chỉnh sửa câu hỏi ${matches[1]}`,
      icon: 'Edit',
      parent: '/3141592654/admin/questions',
      customBreadcrumbs: [
        { label: 'Dashboard', href: '/3141592654/admin', icon: 'Home' },
        { label: 'Quản lý câu hỏi', href: '/3141592654/admin/questions' },
        { label: 'Chi tiết', href: `/3141592654/admin/questions/${matches[1]}` },
        { label: 'Chỉnh sửa', isActive: true }
      ]
    })
  }
];

/**
 * Get page metadata
 * Lấy metadata cho page từ pathname
 */
export function getPageMetadata(pathname: string): PageMetadata | null {
  // Check exact matches first
  if (PAGE_METADATA[pathname]) {
    return PAGE_METADATA[pathname];
  }

  // Check dynamic patterns
  for (const pattern of DYNAMIC_PAGE_PATTERNS) {
    const matches = pathname.match(pattern.pattern);
    if (matches) {
      return pattern.generator(matches);
    }
  }

  return null;
}

/**
 * Admin Breadcrumb Custom Component
 * Component với custom breadcrumb support
 */
export function AdminBreadcrumbCustom({
  items: providedItems,
  className,
  showHome = true,
  separator
}: AdminBreadcrumbCustomProps) {
  /**
   * Get custom breadcrumb items
   * Lấy custom breadcrumb items từ page metadata
   */
  const customItems = useMemo((): BreadcrumbItem[] | undefined => {
    // If items are provided, use them
    if (providedItems && providedItems.length > 0) {
      return providedItems;
    }

    // Get current pathname
    if (typeof window === 'undefined') {
      return undefined;
    }

    const pathname = window.location.pathname;
    const metadata = getPageMetadata(pathname);

    // Return custom breadcrumbs if available
    return metadata?.customBreadcrumbs;
  }, [providedItems]);

  return (
    <AdminBreadcrumb
      items={customItems}
      className={className}
      showHome={showHome}
      separator={separator}
    />
  );
}

/**
 * Use Page Metadata Hook
 * Hook để lấy page metadata
 */
export function usePageMetadata(pathname?: string): PageMetadata | null {
  return useMemo(() => {
    const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    return getPageMetadata(currentPath);
  }, [pathname]);
}

/**
 * Breadcrumb Override Hook
 * Hook để override breadcrumb cho specific pages
 */
export function useBreadcrumbOverride(
  pathname?: string
): { 
  hasOverride: boolean; 
  metadata: PageMetadata | null; 
  breadcrumbs: BreadcrumbItem[] | null; 
} {
  const metadata = usePageMetadata(pathname);
  
  return useMemo(() => ({
    hasOverride: !!metadata,
    metadata,
    breadcrumbs: metadata?.customBreadcrumbs || null
  }), [metadata]);
}

/**
 * Register custom page metadata
 * Function để register custom page metadata
 */
export function registerPageMetadata(path: string, metadata: PageMetadata): void {
  PAGE_METADATA[path] = metadata;
}

/**
 * Register dynamic pattern
 * Function để register dynamic page pattern
 */
export function registerDynamicPattern(
  pattern: RegExp, 
  generator: (matches: RegExpMatchArray) => PageMetadata
): void {
  DYNAMIC_PAGE_PATTERNS.push({ pattern, generator });
}
