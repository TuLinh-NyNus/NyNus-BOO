/**
 * Auth Mock Users
 * Mock users data cho authentication context
 */

import { type User } from '../../types/user/base';
// Import from protobuf generated types (primary)
import { UserRole, UserStatus } from '../../../generated/common/common_pb';
// Fallback manual types
// import { UserRole, UserStatus } from '../../types/user/roles';

// Mock user data cho admin - extracted từ auth-context.tsx
export const mockAdminUser: User = {
  id: 'admin-001',
  email: 'admin@nynus.edu.vn',
  firstName: 'Admin',
  lastName: 'NyNus',
  role: UserRole.ADMIN,
  avatar: '/avatars/admin.svg',
  isActive: true,
  lastLoginAt: new Date(),
  // Required fields for enhanced User interface
  status: UserStatus.ACTIVE,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Re-export User interface
export type { User };
