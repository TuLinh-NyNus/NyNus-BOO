/**
 * User Types
 * Interfaces và enums cho user management
 * 
 * @deprecated Use types from lib/types/user/base.ts and lib/types/user/roles.ts instead
 */

// Import from centralized types
import { UserRole, UserStatus } from './user/roles';
import type { User as BaseUser } from './user/base';

// Re-export for backward compatibility
export { UserRole, UserStatus };
export type User = BaseUser;

// Legacy UserRole enum - deprecated, use UserRole from roles.ts
/** @deprecated Use UserRole from './user/roles' instead */
export enum LegacyUserRole {
  ADMIN = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR", 
  STUDENT = "STUDENT"
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
