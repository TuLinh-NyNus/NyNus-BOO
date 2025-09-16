/**
 * User Types
 * Interfaces và enums cho user management
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | string;
  level?: string;
  avatar?: string;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
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
