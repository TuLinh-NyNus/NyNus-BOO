/**
 * Admin Navigation Configuration
 * Static navigation configuration cho admin sidebar
 */

import {
  LayoutDashboard,
  Users,
  FileQuestion,
  BookOpen,
  BarChart3,
  Bell,
  Shield,
  Settings,
  HelpCircle,
  List,
  Plus,
  Key,
  FileText,
  Clock,
  Lock,
  TrendingUp,
  Map,
  FolderOpen
} from 'lucide-react';
import { NavigationItem, NavigationSection } from '@/types/admin/sidebar';

/**
 * Main Navigation Items
 * Navigation items chính cho admin sidebar
 */
export const ADMIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/3141592654/admin',
    icon: 'LayoutDashboard',
    permissions: ['admin.dashboard']
  },
  {
    id: 'users',
    name: 'Người dùng',
    href: '/3141592654/admin/users',
    icon: 'Users',
    badge: '1.2k',
    permissions: ['users.read']
  },
  {
    id: 'questions',
    name: 'Câu hỏi',
    href: '/3141592654/admin/questions',
    icon: 'FileQuestion',
    badge: '856',
    permissions: ['questions.read'],
    children: [
      {
        id: 'questions-list',
        name: 'Danh sách',
        href: '/3141592654/admin/questions',
        icon: 'List',
        permissions: ['questions.read']
      },
      {
        id: 'questions-create',
        name: 'Tạo mới',
        href: '/3141592654/admin/questions/create',
        icon: 'Plus',
        permissions: ['questions.create']
      },
      {
        id: 'questions-input-latex',
        name: 'Nhập LaTeX',
        href: '/3141592654/admin/questions/inputques',
        icon: 'FileText',
        permissions: ['questions.create']
      },
      {
        id: 'questions-input-auto',
        name: 'Nhập tự động',
        href: '/3141592654/admin/questions/inputauto',
        icon: 'Upload',
        permissions: ['questions.create']
      },
      {
        id: 'questions-database',
        name: 'Kho câu hỏi',
        href: '/3141592654/admin/questions/database',
        icon: 'Database',
        permissions: ['questions.read']
      },
      {
        id: 'questions-saved',
        name: 'Đã lưu',
        href: '/3141592654/admin/questions/saved',
        icon: 'Bookmark',
        permissions: ['questions.read']
      },
      {
        id: 'questions-map-id',
        name: 'Map ID',
        href: '/3141592654/admin/questions/map-id',
        icon: 'Map',
        permissions: ['questions.read']
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Thống kê',
    href: '/3141592654/admin/analytics',
    icon: 'BarChart3',
    permissions: ['analytics.read']
  },
  {
    id: 'books',
    name: 'Sách',
    href: '/3141592654/admin/books',
    icon: 'BookOpen',
    badge: '234',
    permissions: ['books.read']
  },
  {
    id: 'faq',
    name: 'FAQ',
    href: '/3141592654/admin/faq',
    icon: 'HelpCircle',
    permissions: ['faq.read']
  }
];

/**
 * Management Navigation Items
 * Navigation items cho management section
 */
export const MANAGEMENT_NAVIGATION: NavigationItem[] = [
  {
    id: 'roles',
    name: 'Phân quyền',
    href: '/3141592654/admin/roles',
    icon: 'Shield',
    permissions: ['roles.read']
  },
  {
    id: 'permissions',
    name: 'Quyền hạn',
    href: '/3141592654/admin/permissions',
    icon: 'Key',
    permissions: ['permissions.read']
  },
  {
    id: 'audit',
    name: 'Kiểm toán',
    href: '/3141592654/admin/audit',
    icon: 'FileText',
    permissions: ['audit.read']
  },
  {
    id: 'sessions',
    name: 'Phiên làm việc',
    href: '/3141592654/admin/sessions',
    icon: 'Clock',
    badge: '45',
    permissions: ['sessions.read']
  }
];

/**
 * System Navigation Items
 * Navigation items cho system section
 */
export const SYSTEM_NAVIGATION: NavigationItem[] = [
  {
    id: 'notifications',
    name: 'Thông báo',
    href: '/3141592654/admin/notifications',
    icon: 'Bell',
    badge: 3,
    permissions: ['notifications.read']
  },
  {
    id: 'security',
    name: 'Bảo mật',
    href: '/3141592654/admin/security',
    icon: 'Lock',
    permissions: ['security.read']
  }
];

/**
 * Advanced Navigation Items
 * Navigation items cho advanced features
 */
export const ADVANCED_NAVIGATION: NavigationItem[] = [
  {
    id: 'level-progression',
    name: 'Cấp độ',
    href: '/3141592654/admin/level-progression',
    icon: 'TrendingUp',
    permissions: ['level.read']
  },
  {
    id: 'mapcode',
    name: 'Mapcode',
    href: '/3141592654/admin/mapcode',
    icon: 'Map',
    permissions: ['mapcode.read']
  },
  {
    id: 'resources',
    name: 'Tài nguyên',
    href: '/3141592654/admin/resources',
    icon: 'FolderOpen',
    permissions: ['resources.read']
  }
];

/**
 * Bottom Navigation Items
 * Navigation items ở bottom của sidebar
 */
export const BOTTOM_NAVIGATION: NavigationItem[] = [
  {
    id: 'settings',
    name: 'Cài đặt',
    href: '/3141592654/admin/settings',
    icon: 'Settings',
    permissions: ['settings.read']
  }
];

/**
 * Complete Navigation Structure
 * Cấu trúc navigation hoàn chỉnh với sections
 */
export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    id: 'main',
    items: ADMIN_NAVIGATION
  },
  {
    id: 'management',
    title: 'Quản lý',
    items: MANAGEMENT_NAVIGATION
  },
  {
    id: 'system',
    title: 'Hệ thống',
    items: SYSTEM_NAVIGATION
  },
  {
    id: 'advanced',
    title: 'Nâng cao',
    items: ADVANCED_NAVIGATION
  }
];

/**
 * Icon Component Mapping
 * Mapping từ icon string sang React component
 */
export const ICON_COMPONENTS = {
  LayoutDashboard,
  Users,
  FileQuestion,
  BookOpen,
  BarChart3,
  Bell,
  Shield,
  Settings,
  HelpCircle,
  List,
  Plus,
  Key,
  FileText,
  Clock,
  Lock,
  TrendingUp,
  Map,
  FolderOpen
} as const;

/**
 * Get Icon Component
 * Function để lấy icon component từ string
 */
export function getIconComponent(iconName: string) {
  return ICON_COMPONENTS[iconName as keyof typeof ICON_COMPONENTS] || LayoutDashboard;
}

/**
 * Navigation Utilities
 * Utility functions cho navigation
 */
export const NavigationUtils = {
  /**
   * Find navigation item by ID
   * Tìm navigation item theo ID
   */
  findItemById: (itemId: string, sections: NavigationSection[] = NAVIGATION_SECTIONS): NavigationItem | null => {
    const findInItems = (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (item.id === itemId) {
          return item;
        }
        if (item.children) {
          const found = findInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    for (const section of sections) {
      const found = findInItems(section.items);
      if (found) return found;
    }
    return null;
  },

  /**
   * Find navigation item by href
   * Tìm navigation item theo href
   */
  findItemByHref: (href: string, sections: NavigationSection[] = NAVIGATION_SECTIONS): NavigationItem | null => {
    const findInItems = (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (item.href === href) {
          return item;
        }
        if (item.children) {
          const found = findInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    for (const section of sections) {
      const found = findInItems(section.items);
      if (found) return found;
    }
    return null;
  },

  /**
   * Get all navigation items as flat array
   * Lấy tất cả navigation items dạng flat array
   */
  getAllItems: (sections: NavigationSection[] = NAVIGATION_SECTIONS): NavigationItem[] => {
    const flattenItems = (items: NavigationItem[]): NavigationItem[] => {
      const result: NavigationItem[] = [];
      for (const item of items) {
        result.push(item);
        if (item.children) {
          result.push(...flattenItems(item.children));
        }
      }
      return result;
    };

    const allItems: NavigationItem[] = [];
    for (const section of sections) {
      allItems.push(...flattenItems(section.items));
    }
    return allItems;
  },

  /**
   * Check if path matches navigation item
   * Kiểm tra xem path có match với navigation item không
   */
  isPathActive: (pathname: string, itemHref: string): boolean => {
    // Exact match
    if (pathname === itemHref) {
      return true;
    }

    // Check if pathname starts with itemHref (for parent items)
    if (pathname.startsWith(itemHref) && pathname !== itemHref) {
      // Make sure it's a proper path segment match
      const remainingPath = pathname.slice(itemHref.length);
      return remainingPath.startsWith('/');
    }

    return false;
  },

  /**
   * Get active navigation item
   * Lấy navigation item đang active
   */
  getActiveItem: (pathname: string, sections: NavigationSection[] = NAVIGATION_SECTIONS): NavigationItem | null => {
    const allItems = NavigationUtils.getAllItems(sections);
    
    // Find exact match first
    const exactMatch = allItems.find(item => item.href === pathname);
    if (exactMatch) return exactMatch;

    // Find best partial match (longest matching path)
    let bestMatch: NavigationItem | null = null;
    let longestMatch = 0;

    for (const item of allItems) {
      if (NavigationUtils.isPathActive(pathname, item.href)) {
        if (item.href.length > longestMatch) {
          longestMatch = item.href.length;
          bestMatch = item;
        }
      }
    }

    return bestMatch;
  }
};

export default NavigationUtils;
