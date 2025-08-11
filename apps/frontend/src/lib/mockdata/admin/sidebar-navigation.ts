/**
 * Admin Sidebar Mock Data
 * Mockdata cho admin sidebar navigation
 */

import { MockDataUtils } from '../utils';

/**
 * Navigation Item Interface
 * Interface cho navigation items
 */
export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  badge?: string | number;
  permissions?: string[];
  isActive?: boolean;
  children?: NavigationItem[];
}

/**
 * Navigation Section Interface
 * Interface cho navigation sections
 */
export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
}

/**
 * User Permissions Interface
 * Interface cho user permissions
 */
export interface UserPermissions {
  userId: string;
  permissions: string[];
  role: string;
}

/**
 * Main Navigation Items
 * Navigation items chính cho admin sidebar
 */
export const mockMainNavigation: NavigationItem[] = [
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
export const mockManagementNavigation: NavigationItem[] = [
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
export const mockSystemNavigation: NavigationItem[] = [
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
  },
  {
    id: 'settings',
    name: 'Cài đặt',
    href: '/3141592654/admin/settings',
    icon: 'Settings',
    permissions: ['settings.read']
  }
];

/**
 * Advanced Navigation Items
 * Navigation items cho advanced features
 */
export const mockAdvancedNavigation: NavigationItem[] = [
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
 * Complete Navigation Structure
 * Cấu trúc navigation hoàn chỉnh
 */
export const mockNavigationSections: NavigationSection[] = [
  {
    id: 'main',
    items: mockMainNavigation
  },
  {
    id: 'management',
    title: 'Quản lý',
    items: mockManagementNavigation
  },
  {
    id: 'system',
    title: 'Hệ thống',
    items: mockSystemNavigation
  },
  {
    id: 'advanced',
    title: 'Nâng cao',
    items: mockAdvancedNavigation
  }
];

/**
 * Mock User Permissions
 * Mock permissions cho current user
 */
export const mockUserPermissions: UserPermissions = {
  userId: 'admin-001',
  role: 'ADMIN',
  permissions: [
    // Dashboard permissions
    'admin.dashboard',
    
    // User management permissions
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    
    // Question management permissions
    'questions.read',
    'questions.create',
    'questions.update',
    'questions.delete',
    
    // Analytics permissions
    'analytics.read',
    
    // Content permissions
    'books.read',
    'books.create',
    'books.update',
    'faq.read',
    'faq.create',
    'faq.update',
    
    // Role and permission management
    'roles.read',
    'roles.create',
    'roles.update',
    'permissions.read',
    
    // System permissions
    'audit.read',
    'sessions.read',
    'notifications.read',
    'security.read',
    'settings.read',
    'settings.update',
    
    // Advanced permissions
    'level.read',
    'mapcode.read',
    'resources.read'
  ]
};

/**
 * Admin Sidebar Mock Service
 * Service để mock các API calls cho sidebar
 */
export const adminSidebarMockService = {
  /**
   * Get navigation items
   * Lấy navigation items
   */
  getNavigationItems: (): Promise<NavigationSection[]> => {
    return MockDataUtils.simulateApiCall(mockNavigationSections, 200);
  },

  /**
   * Get user permissions
   * Lấy permissions của user
   */
  getUserPermissions: (): Promise<UserPermissions> => {
    return MockDataUtils.simulateApiCall(mockUserPermissions, 150);
  },

  /**
   * Check user permission
   * Kiểm tra user có permission không
   */
  hasPermission: (permission: string): Promise<boolean> => {
    const hasPermission = mockUserPermissions.permissions.includes(permission);
    return MockDataUtils.simulateApiCall(hasPermission, 100);
  },

  /**
   * Get filtered navigation
   * Lấy navigation đã filter theo permissions
   */
  getFilteredNavigation: (): Promise<NavigationSection[]> => {
    const userPermissions = mockUserPermissions.permissions;
    
    const filteredSections = mockNavigationSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // If no permissions required, show item
        if (!item.permissions || item.permissions.length === 0) {
          return true;
        }
        
        // Check if user has any of the required permissions
        return item.permissions.some(permission => 
          userPermissions.includes(permission)
        );
      })
    })).filter(section => section.items.length > 0);

    return MockDataUtils.simulateApiCall(filteredSections, 250);
  },

  /**
   * Update navigation badge
   * Cập nhật badge cho navigation item
   */
  updateNavigationBadge: (itemId: string, badge: string | number): Promise<{ success: boolean }> => {
    // Find and update badge in mock data
    const findAndUpdateBadge = (items: NavigationItem[]): boolean => {
      for (const item of items) {
        if (item.id === itemId) {
          item.badge = badge;
          return true;
        }
        if (item.children && findAndUpdateBadge(item.children)) {
          return true;
        }
      }
      return false;
    };

    let updated = false;
    for (const section of mockNavigationSections) {
      if (findAndUpdateBadge(section.items)) {
        updated = true;
        break;
      }
    }

    return MockDataUtils.simulateApiCall({ success: updated }, 150);
  }
};

/**
 * Navigation utilities
 * Utilities cho navigation
 */
export const NavigationUtils = {
  /**
   * Find navigation item by ID
   * Tìm navigation item theo ID
   */
  findItemById: (itemId: string, sections: NavigationSection[] = mockNavigationSections): NavigationItem | null => {
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
  findItemByHref: (href: string, sections: NavigationSection[] = mockNavigationSections): NavigationItem | null => {
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
  getAllItems: (sections: NavigationSection[] = mockNavigationSections): NavigationItem[] => {
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
  }
};
