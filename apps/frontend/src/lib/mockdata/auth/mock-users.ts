/**
 * Auth Mock Users
 * Mock users data cho authentication context
 */

import { type User } from '@/types/user';
import { UserRole, UserStatus } from '@/generated/common/common_pb';

// Mock user data cho admin - extracted từ auth-context.tsx
export const mockAdminUser: User = {
  id: 'admin-001',
  email: 'admin@nynus.edu.vn',
  firstName: 'Admin',
  lastName: 'NyNus',
  role: UserRole.USER_ROLE_ADMIN,
  avatar: '/avatars/admin.svg',
  isActive: true,
  lastLoginAt: new Date(),
  // Required fields for enhanced User interface
  status: UserStatus.USER_STATUS_ACTIVE,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Re-export User interface
export type { User };
