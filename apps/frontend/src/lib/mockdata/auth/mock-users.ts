/**
 * Auth Mock Users
 * Mock users data cho authentication context
 */

// Interface cho User từ auth context
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

// Mock user data cho admin - extracted từ auth-context.tsx
export const mockAdminUser: User = {
  id: 'admin-001',
  email: 'admin@nynus.edu.vn',
  firstName: 'Admin',
  lastName: 'NyNus',
  role: 'admin',
  avatar: '/avatars/admin.svg',
  isActive: true,
  lastLoginAt: new Date()
};

// Export User interface để sử dụng ở auth-context
export type { User };
