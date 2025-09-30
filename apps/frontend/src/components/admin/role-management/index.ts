/**
 * Role Management Components Index
 * Export tất cả role management components
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// Export core role management components
export { PermissionEditor } from './permission-editor';
export { PermissionMatrix } from './permission-matrix';
export { PermissionTemplates } from './permission-templates';
export { RoleHierarchyTree } from './role-hierarchy-tree';
export { RolePermissionsPanel } from './role-permissions-panel';

// Export types from mockdata
export type {
  RolePermission,
  PermissionCategory,
  PermissionLevel,
  RoleHierarchyNode,
  RoleRelationship,
  PromotionPath,
  PermissionTemplate,
  PermissionMatrixResponse,
  RoleHierarchyResponse
} from '@/lib/mockdata/role-management';
