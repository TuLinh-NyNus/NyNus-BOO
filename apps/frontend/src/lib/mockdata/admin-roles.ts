/**
 * Admin Roles & Permissions Mock Data
 * Mockdata cho admin roles và permissions management
 */

import { MockDataUtils } from './utils';

/**
 * Permission Interface
 * Interface cho permissions
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'content' | 'system' | 'analytics' | 'security';
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  isSystemPermission: boolean;
}

/**
 * Role Interface
 * Interface cho roles
 */
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number; // 1-10, higher = more privileged
  permissions: string[]; // Permission IDs
  userCount: number;
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mock Permissions
 * Mock data cho permissions
 */
export const mockPermissions: Permission[] = [
  // User Management Permissions
  {
    id: 'perm-001',
    name: 'users.create',
    description: 'Tạo tài khoản người dùng mới',
    category: 'users',
    resource: 'users',
    action: 'create',
    isSystemPermission: false
  },
  {
    id: 'perm-002',
    name: 'users.read',
    description: 'Xem thông tin người dùng',
    category: 'users',
    resource: 'users',
    action: 'read',
    isSystemPermission: false
  },
  {
    id: 'perm-003',
    name: 'users.update',
    description: 'Cập nhật thông tin người dùng',
    category: 'users',
    resource: 'users',
    action: 'update',
    isSystemPermission: false
  },
  {
    id: 'perm-004',
    name: 'users.delete',
    description: 'Xóa tài khoản người dùng',
    category: 'users',
    resource: 'users',
    action: 'delete',
    isSystemPermission: false
  },
  {
    id: 'perm-005',
    name: 'users.manage',
    description: 'Quản lý toàn bộ người dùng',
    category: 'users',
    resource: 'users',
    action: 'manage',
    isSystemPermission: true
  },

  // Content Management Permissions
  {
    id: 'perm-006',
    name: 'questions.create',
    description: 'Tạo câu hỏi mới',
    category: 'content',
    resource: 'questions',
    action: 'create',
    isSystemPermission: false
  },
  {
    id: 'perm-007',
    name: 'questions.read',
    description: 'Xem câu hỏi',
    category: 'content',
    resource: 'questions',
    action: 'read',
    isSystemPermission: false
  },
  {
    id: 'perm-008',
    name: 'questions.update',
    description: 'Cập nhật câu hỏi',
    category: 'content',
    resource: 'questions',
    action: 'update',
    isSystemPermission: false
  },
  {
    id: 'perm-009',
    name: 'questions.delete',
    description: 'Xóa câu hỏi',
    category: 'content',
    resource: 'questions',
    action: 'delete',
    isSystemPermission: false
  },

  // System Permissions
  {
    id: 'perm-010',
    name: 'system.settings',
    description: 'Quản lý cài đặt hệ thống',
    category: 'system',
    resource: 'settings',
    action: 'manage',
    isSystemPermission: true
  },
  {
    id: 'perm-011',
    name: 'system.audit',
    description: 'Xem audit logs',
    category: 'system',
    resource: 'audit',
    action: 'read',
    isSystemPermission: true
  },

  // Analytics Permissions
  {
    id: 'perm-012',
    name: 'analytics.read',
    description: 'Xem báo cáo thống kê',
    category: 'analytics',
    resource: 'analytics',
    action: 'read',
    isSystemPermission: false
  },

  // Security Permissions
  {
    id: 'perm-013',
    name: 'security.manage',
    description: 'Quản lý bảo mật hệ thống',
    category: 'security',
    resource: 'security',
    action: 'manage',
    isSystemPermission: true
  }
];

/**
 * Mock Roles
 * Mock data cho roles
 */
export const mockRoles: Role[] = [
  {
    id: 'role-001',
    name: 'ADMIN',
    displayName: 'Quản trị viên',
    description: 'Quyền quản trị toàn bộ hệ thống',
    level: 10,
    permissions: mockPermissions.map(p => p.id), // All permissions
    userCount: 3,
    isSystemRole: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T08:30:00Z')
  },
  {
    id: 'role-002',
    name: 'TEACHER',
    displayName: 'Giáo viên',
    description: 'Quyền quản lý nội dung và học viên',
    level: 7,
    permissions: [
      'perm-002', 'perm-003', // users read, update
      'perm-006', 'perm-007', 'perm-008', 'perm-009', // questions full
      'perm-012' // analytics read
    ],
    userCount: 45,
    isSystemRole: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-10T10:15:00Z')
  },
  {
    id: 'role-003',
    name: 'TUTOR',
    displayName: 'Gia sư',
    description: 'Quyền hỗ trợ học viên và tạo câu hỏi',
    level: 5,
    permissions: [
      'perm-002', // users read
      'perm-006', 'perm-007', 'perm-008', // questions create, read, update
      'perm-012' // analytics read
    ],
    userCount: 128,
    isSystemRole: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-08T14:20:00Z')
  },
  {
    id: 'role-004',
    name: 'STUDENT',
    displayName: 'Học viên',
    description: 'Quyền truy cập nội dung học tập',
    level: 2,
    permissions: [
      'perm-007' // questions read only
    ],
    userCount: 15234,
    isSystemRole: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T09:45:00Z')
  },
  {
    id: 'role-005',
    name: 'GUEST',
    displayName: 'Khách',
    description: 'Quyền truy cập hạn chế',
    level: 1,
    permissions: [], // No permissions
    userCount: 567,
    isSystemRole: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-12T16:30:00Z')
  }
];

/**
 * Mock Service cho roles và permissions
 * Mock service cho roles và permissions management
 */
export const adminRolesMockService = {
  /**
   * Get all roles
   * Lấy tất cả roles
   */
  getRoles: (): Promise<Role[]> => {
    return MockDataUtils.simulateApiCall(mockRoles, 300);
  },

  /**
   * Get all permissions
   * Lấy tất cả permissions
   */
  getPermissions: (): Promise<Permission[]> => {
    return MockDataUtils.simulateApiCall(mockPermissions, 200);
  },

  /**
   * Get role by ID
   * Lấy role theo ID
   */
  getRoleById: (roleId: string): Promise<Role | null> => {
    const role = mockRoles.find(r => r.id === roleId) || null;
    return MockDataUtils.simulateApiCall(role, 150);
  },

  /**
   * Get permissions by role
   * Lấy permissions theo role
   */
  getPermissionsByRole: (roleId: string): Promise<Permission[]> => {
    const role = mockRoles.find(r => r.id === roleId);
    if (!role) return MockDataUtils.simulateApiCall([], 150);
    
    const permissions = mockPermissions.filter(p => role.permissions.includes(p.id));
    return MockDataUtils.simulateApiCall(permissions, 200);
  },

  /**
   * Get permissions by category
   * Lấy permissions theo category
   */
  getPermissionsByCategory: (category: Permission['category']): Promise<Permission[]> => {
    const permissions = mockPermissions.filter(p => p.category === category);
    return MockDataUtils.simulateApiCall(permissions, 150);
  }
};

/**
 * Get role hierarchy
 * Lấy role hierarchy
 */
export function getRoleHierarchy(): Role[] {
  return [...mockRoles].sort((a, b) => b.level - a.level);
}

/**
 * Get permission categories
 * Lấy permission categories
 */
export function getPermissionCategories(): Array<{
  category: Permission['category'];
  label: string;
  permissions: Permission[];
}> {
  const categories: Permission['category'][] = ['users', 'content', 'system', 'analytics', 'security'];
  const categoryLabels = {
    users: 'Quản lý người dùng',
    content: 'Quản lý nội dung',
    system: 'Hệ thống',
    analytics: 'Thống kê',
    security: 'Bảo mật'
  };

  return categories.map(category => ({
    category,
    label: categoryLabels[category],
    permissions: mockPermissions.filter(p => p.category === category)
  }));
}

/**
 * Check if role has permission
 * Kiểm tra role có permission không
 */
export function roleHasPermission(roleId: string, permissionId: string): boolean {
  const role = mockRoles.find(r => r.id === roleId);
  return role ? role.permissions.includes(permissionId) : false;
}
