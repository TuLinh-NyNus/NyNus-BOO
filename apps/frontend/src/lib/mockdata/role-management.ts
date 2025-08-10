/**
 * Role Management Mock Data
 * Mock data cho role management system với hierarchy và permissions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { UserRole } from './core-types';

/**
 * Interface cho role permission
 */
export interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: "user" | "content" | "system" | "security" | "admin";
  level: "read" | "write" | "delete" | "admin";
  resource?: string;
  action?: string;
}

/**
 * Interface cho permission category
 */
export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  permissions: RolePermission[];
}

/**
 * Interface cho permission level
 */
export interface PermissionLevel {
  id: string;
  name: string;
  description: string;
  priority: number;
}

/**
 * Interface cho role hierarchy node
 */
export interface RoleHierarchyNode {
  role: UserRole;
  level: number;
  children: UserRole[];
  parent?: UserRole;
  permissions: RolePermission[];
  userCount: number;
  canPromoteTo: UserRole[];
  canDemoteTo: UserRole[];
}

/**
 * Interface cho role relationship
 */
export interface RoleRelationship {
  parent: UserRole;
  child: UserRole;
  canPromote: boolean;
  canDemote: boolean;
  restrictions: string[];
}

/**
 * Interface cho promotion path
 */
export interface PromotionPath {
  from: UserRole;
  to: UserRole;
  requirements: string[];
  restrictions: string[];
  isDirectPath: boolean;
}

/**
 * Interface cho permission template
 */
export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  applicableRoles: UserRole[];
  isDefault: boolean;
  createdAt: string;
  createdBy?: string;
  usageCount: number;
}

/**
 * Interface cho permission matrix response
 */
export interface PermissionMatrixResponse {
  matrix: Record<UserRole, RolePermission[]>;
  categories: PermissionCategory[];
  levels: PermissionLevel[];
  timestamp: string;
}

/**
 * Interface cho role hierarchy response
 */
export interface RoleHierarchyResponse {
  hierarchy: RoleHierarchyNode[];
  relationships: RoleRelationship[];
  promotionPaths: PromotionPath[];
  timestamp: string;
}

/**
 * Mock permission categories
 */
export const mockPermissionCategories: PermissionCategory[] = [
  {
    id: 'cat-user',
    name: 'User Management',
    description: 'Quản lý người dùng và tài khoản',
    icon: 'Users',
    permissions: [],
  },
  {
    id: 'cat-content',
    name: 'Content Management',
    description: 'Quản lý nội dung và câu hỏi',
    icon: 'FileText',
    permissions: [],
  },
  {
    id: 'cat-system',
    name: 'System Management',
    description: 'Quản lý hệ thống và cấu hình',
    icon: 'Settings',
    permissions: [],
  },
  {
    id: 'cat-security',
    name: 'Security Management',
    description: 'Quản lý bảo mật và quyền truy cập',
    icon: 'Lock',
    permissions: [],
  },
  {
    id: 'cat-admin',
    name: 'Admin Management',
    description: 'Quản lý admin và quyền cao nhất',
    icon: 'Shield',
    permissions: [],
  },
];

/**
 * Mock permission levels
 */
export const mockPermissionLevels: PermissionLevel[] = [
  {
    id: 'level-read',
    name: 'Read',
    description: 'Chỉ được xem và đọc',
    priority: 1,
  },
  {
    id: 'level-write',
    name: 'Write',
    description: 'Được tạo và chỉnh sửa',
    priority: 2,
  },
  {
    id: 'level-delete',
    name: 'Delete',
    description: 'Được xóa và quản lý',
    priority: 3,
  },
  {
    id: 'level-admin',
    name: 'Admin',
    description: 'Quyền quản trị đầy đủ',
    priority: 4,
  },
];

/**
 * Mock role permissions
 */
export const mockRolePermissions: RolePermission[] = [
  // User permissions
  {
    id: 'perm-user-read',
    name: 'user.read',
    description: 'Xem thông tin người dùng',
    category: 'user',
    level: 'read',
    resource: 'users',
    action: 'read',
  },
  {
    id: 'perm-user-write',
    name: 'user.write',
    description: 'Tạo và chỉnh sửa người dùng',
    category: 'user',
    level: 'write',
    resource: 'users',
    action: 'write',
  },
  {
    id: 'perm-user-delete',
    name: 'user.delete',
    description: 'Xóa người dùng',
    category: 'user',
    level: 'delete',
    resource: 'users',
    action: 'delete',
  },
  {
    id: 'perm-user-admin',
    name: 'user.admin',
    description: 'Quản trị người dùng đầy đủ',
    category: 'user',
    level: 'admin',
    resource: 'users',
    action: 'admin',
  },
  // Content permissions
  {
    id: 'perm-content-read',
    name: 'content.read',
    description: 'Xem nội dung và câu hỏi',
    category: 'content',
    level: 'read',
    resource: 'content',
    action: 'read',
  },
  {
    id: 'perm-content-write',
    name: 'content.write',
    description: 'Tạo và chỉnh sửa nội dung',
    category: 'content',
    level: 'write',
    resource: 'content',
    action: 'write',
  },
  {
    id: 'perm-content-delete',
    name: 'content.delete',
    description: 'Xóa nội dung',
    category: 'content',
    level: 'delete',
    resource: 'content',
    action: 'delete',
  },
  // System permissions
  {
    id: 'perm-system-read',
    name: 'system.read',
    description: 'Xem cấu hình hệ thống',
    category: 'system',
    level: 'read',
    resource: 'system',
    action: 'read',
  },
  {
    id: 'perm-system-write',
    name: 'system.write',
    description: 'Cấu hình hệ thống',
    category: 'system',
    level: 'write',
    resource: 'system',
    action: 'write',
  },
  // Security permissions
  {
    id: 'perm-security-read',
    name: 'security.read',
    description: 'Xem thông tin bảo mật',
    category: 'security',
    level: 'read',
    resource: 'security',
    action: 'read',
  },
  {
    id: 'perm-security-admin',
    name: 'security.admin',
    description: 'Quản trị bảo mật',
    category: 'security',
    level: 'admin',
    resource: 'security',
    action: 'admin',
  },
  // Admin permissions
  {
    id: 'perm-admin-full',
    name: 'admin.full',
    description: 'Quyền quản trị đầy đủ',
    category: 'admin',
    level: 'admin',
    resource: 'admin',
    action: 'admin',
  },
];

/**
 * Mock permission templates
 */
export const mockPermissionTemplates: PermissionTemplate[] = [
  {
    id: 'template-basic-user',
    name: 'Basic User Template',
    description: 'Template cơ bản cho user mới',
    permissions: mockRolePermissions.filter(p => p.level === 'read'),
    applicableRoles: [UserRole.STUDENT, UserRole.GUEST],
    isDefault: true,
    createdAt: '2024-07-01T00:00:00Z',
    createdBy: 'system',
    usageCount: 1500,
  },
  {
    id: 'template-content-creator',
    name: 'Content Creator Template',
    description: 'Template cho người tạo nội dung',
    permissions: mockRolePermissions.filter(p => p.category === 'content' && ['read', 'write'].includes(p.level)),
    applicableRoles: [UserRole.TUTOR, UserRole.TEACHER],
    isDefault: true,
    createdAt: '2024-07-01T00:00:00Z',
    createdBy: 'system',
    usageCount: 200,
  },
  {
    id: 'template-moderator',
    name: 'Moderator Template',
    description: 'Template cho moderator',
    permissions: mockRolePermissions.filter(p => ['user', 'content'].includes(p.category)),
    applicableRoles: [UserRole.TEACHER],
    isDefault: true,
    createdAt: '2024-07-01T00:00:00Z',
    createdBy: 'system',
    usageCount: 50,
  },
];

/**
 * Function để lấy role hierarchy
 */
export function getRoleHierarchy(): Promise<RoleHierarchyResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        hierarchy: mockRoleHierarchy,
        relationships: mockRoleRelationships,
        promotionPaths: mockPromotionPaths,
        timestamp: new Date().toISOString(),
      });
    }, 400);
  });
}

/**
 * Function để lấy permission matrix
 */
export function getPermissionMatrix(): Promise<PermissionMatrixResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const matrix = {} as Record<UserRole, RolePermission[]>;

      mockRoleHierarchy.forEach(node => {
        matrix[node.role] = node.permissions;
      });

      resolve({
        matrix,
        categories: mockPermissionCategories,
        levels: mockPermissionLevels,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
}

/**
 * Function để lấy permissions cho role
 */
export function getRolePermissions(role: UserRole): Promise<RolePermission[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const roleNode = mockRoleHierarchy.find(node => node.role === role);
      resolve(roleNode?.permissions || []);
    }, 300);
  });
}

/**
 * Function để update permissions cho role
 */
export function updateRolePermissions(
  role: UserRole,
  permissions: RolePermission[]
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const roleNode = mockRoleHierarchy.find(node => node.role === role);
      if (roleNode) {
        roleNode.permissions = permissions;
      }
      resolve();
    }, 800);
  });
}

/**
 * Function để lấy permission templates
 */
export function getPermissionTemplates(): Promise<PermissionTemplate[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPermissionTemplates);
    }, 350);
  });
}

/**
 * Function để apply permission template
 */
export function applyPermissionTemplate(
  templateId: string,
  targetRole: UserRole
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const template = mockPermissionTemplates.find(t => t.id === templateId);
      if (template) {
        template.usageCount++;
        // Apply template permissions to role
        const roleNode = mockRoleHierarchy.find(node => node.role === targetRole);
        if (roleNode) {
          roleNode.permissions = [...template.permissions];
        }
      }
      resolve();
    }, 600);
  });
}

/**
 * Function để tạo permission template mới
 */
export function createPermissionTemplate(
  name: string,
  description: string,
  permissions: RolePermission[],
  applicableRoles: UserRole[]
): Promise<PermissionTemplate> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTemplate: PermissionTemplate = {
        id: `template-${Date.now()}`,
        name,
        description,
        permissions,
        applicableRoles,
        isDefault: false,
        createdAt: new Date().toISOString(),
        createdBy: 'current-admin',
        usageCount: 0,
      };

      mockPermissionTemplates.push(newTemplate);
      resolve(newTemplate);
    }, 700);
  });
}

/**
 * Function để validate role promotion
 */
export function validateRolePromotion(
  fromRole: UserRole,
  toRole: UserRole
): Promise<{ isValid: boolean; reason?: string; requirements?: string[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const promotionPath = mockPromotionPaths.find(
        path => path.from === fromRole && path.to === toRole
      );

      if (promotionPath) {
        resolve({
          isValid: true,
          requirements: promotionPath.requirements,
        });
      } else {
        resolve({
          isValid: false,
          reason: 'Không có đường thăng cấp trực tiếp giữa các role này',
        });
      }
    }, 250);
  });
}

/**
 * Mock role hierarchy nodes
 */
export const mockRoleHierarchy: RoleHierarchyNode[] = [
  {
    role: UserRole.ADMIN,
    level: 5,
    children: [UserRole.TEACHER],
    permissions: mockRolePermissions,
    userCount: 3,
    canPromoteTo: [],
    canDemoteTo: [UserRole.TEACHER],
  },
  {
    role: UserRole.TEACHER,
    level: 4,
    children: [UserRole.TUTOR],
    parent: UserRole.ADMIN,
    permissions: mockRolePermissions.filter(p => p.category !== 'admin'),
    userCount: 25,
    canPromoteTo: [UserRole.ADMIN],
    canDemoteTo: [UserRole.TUTOR],
  },
  {
    role: UserRole.TUTOR,
    level: 3,
    children: [UserRole.STUDENT],
    parent: UserRole.TEACHER,
    permissions: mockRolePermissions.filter(p => !['admin', 'system'].includes(p.category)),
    userCount: 150,
    canPromoteTo: [UserRole.TEACHER],
    canDemoteTo: [UserRole.STUDENT],
  },
  {
    role: UserRole.STUDENT,
    level: 2,
    children: [UserRole.GUEST],
    parent: UserRole.TUTOR,
    permissions: mockRolePermissions.filter(p => p.level === 'read'),
    userCount: 5000,
    canPromoteTo: [UserRole.TUTOR],
    canDemoteTo: [UserRole.GUEST],
  },
  {
    role: UserRole.GUEST,
    level: 1,
    children: [],
    parent: UserRole.STUDENT,
    permissions: mockRolePermissions.filter(p => p.level === 'read' && p.category === 'content'),
    userCount: 1000,
    canPromoteTo: [UserRole.STUDENT],
    canDemoteTo: [],
  },
];

/**
 * Mock role relationships
 */
export const mockRoleRelationships: RoleRelationship[] = [
  {
    parent: UserRole.ADMIN,
    child: UserRole.TEACHER,
    canPromote: true,
    canDemote: true,
    restrictions: ['Cần approval từ super admin'],
  },
  {
    parent: UserRole.TEACHER,
    child: UserRole.TUTOR,
    canPromote: true,
    canDemote: true,
    restrictions: ['Cần kinh nghiệm tối thiểu 6 tháng'],
  },
  {
    parent: UserRole.TUTOR,
    child: UserRole.STUDENT,
    canPromote: true,
    canDemote: true,
    restrictions: ['Cần hoàn thành khóa đào tạo'],
  },
  {
    parent: UserRole.STUDENT,
    child: UserRole.GUEST,
    canPromote: true,
    canDemote: true,
    restrictions: ['Cần xác thực email'],
  },
];

/**
 * Mock promotion paths
 */
export const mockPromotionPaths: PromotionPath[] = [
  {
    from: UserRole.GUEST,
    to: UserRole.STUDENT,
    requirements: ['Email verification', 'Profile completion'],
    restrictions: [],
    isDirectPath: true,
  },
  {
    from: UserRole.STUDENT,
    to: UserRole.TUTOR,
    requirements: ['6 months experience', 'Training completion', 'Good performance'],
    restrictions: ['Must have clean record'],
    isDirectPath: true,
  },
  {
    from: UserRole.TUTOR,
    to: UserRole.TEACHER,
    requirements: ['1 year experience', 'Advanced training', 'Recommendation'],
    restrictions: ['Must have teaching qualification'],
    isDirectPath: true,
  },
  {
    from: UserRole.TEACHER,
    to: UserRole.ADMIN,
    requirements: ['2 years experience', 'Admin training', 'Super admin approval'],
    restrictions: ['Limited admin slots available'],
    isDirectPath: true,
  },
];
