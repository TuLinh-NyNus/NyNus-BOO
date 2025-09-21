/**
 * Protobuf Converters
 * Utilities để convert protobuf objects thành local types
 */

import type { User } from '@/lib/types/user';
import { UserRole, UserStatus } from '@/generated/common/common_pb';

// Define protobuf object interfaces
interface ProtobufUser {
  getId?(): string;
  getEmail?(): string;
  getName?(): string;
  getRole?(): string;
  getLevel?(): string | number; // Accept both string and number
  getStatus?(): string;
  getAvatar?(): string;
  getEmailVerified?(): boolean;
  getCreatedAt?(): string | number;
  getUpdatedAt?(): string | number;
  // Fallback properties for direct access
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  level?: string | number; // Accept both string and number
  status?: string;
  avatar?: string;
  emailVerified?: boolean;
  createdAt?: string | number;
  updatedAt?: string | number;
}

/**
 * Convert protobuf User object thành local User type
 */
export function convertProtobufUserToLocal(protobufUser: ProtobufUser): User {
  if (!protobufUser) {
    throw new Error('Protobuf user object is required');
  }

  // Extract data từ protobuf object
  const id = protobufUser.getId?.() || protobufUser.id || '';
  const email = protobufUser.getEmail?.() || protobufUser.email || '';
  const name = protobufUser.getName?.() || protobufUser.name || '';
  const role = protobufUser.getRole?.() || protobufUser.role || UserRole.STUDENT;
  const status = protobufUser.getStatus?.() || protobufUser.status || UserStatus.ACTIVE;
  const levelValue = protobufUser.getLevel?.() || protobufUser.level || 1;
  const level = typeof levelValue === 'string' ? parseInt(levelValue) || 1 : levelValue;
  const avatar = protobufUser.getAvatar?.() || protobufUser.avatar || '';
  const emailVerified = protobufUser.getEmailVerified?.() || protobufUser.emailVerified || false;
  
  // Handle timestamps
  const createdAtValue = protobufUser.getCreatedAt?.() || protobufUser.createdAt;
  const updatedAtValue = protobufUser.getUpdatedAt?.() || protobufUser.updatedAt;
  
  const createdAt = createdAtValue ? new Date(createdAtValue) : new Date();
  const updatedAt = updatedAtValue ? new Date(updatedAtValue) : new Date();

  // Split name thành firstName và lastName
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Create local User object
  const localUser: User = {
    id,
    email,
    firstName,
    lastName,
    name,
    role: role as UserRole,
    status: status as UserStatus,
    level: typeof level === 'string' ? parseInt(level) || 1 : level,
    avatar,
    emailVerified,
    createdAt,
    updatedAt,
    isActive: status === UserStatus.ACTIVE,
  };

  return localUser;
}

interface ProtobufLoginResponse {
  getUser?(): ProtobufUser | undefined; // Accept undefined
  getAccessToken?(): string;
  getRefreshToken?(): string;
  getSuccess?(): boolean;
  getMessage?(): string;
  // Fallback properties
  user?: ProtobufUser;
  accessToken?: string;
  refreshToken?: string;
  success?: boolean;
  message?: string;
}

/**
 * Convert protobuf LoginResponse thành local format
 */
export function convertProtobufLoginResponse(protobufResponse: ProtobufLoginResponse): {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
} {
  if (!protobufResponse) {
    return {
      success: false,
      message: 'Invalid response'
    };
  }

  const success = protobufResponse.getSuccess?.() || protobufResponse.success || false;
  const message = protobufResponse.getMessage?.() || protobufResponse.message || '';
  const accessToken = protobufResponse.getAccessToken?.() || protobufResponse.accessToken || '';
  const refreshToken = protobufResponse.getRefreshToken?.() || protobufResponse.refreshToken || '';
  
  let user: User | undefined;
  const protobufUser = protobufResponse.getUser?.() || protobufResponse.user;
  if (protobufUser) {
    user = convertProtobufUserToLocal(protobufUser);
  }

  return {
    success,
    message,
    user,
    accessToken,
    refreshToken
  };
}

/**
 * Convert protobuf RegisterResponse thành local format
 */
export function convertProtobufRegisterResponse(protobufResponse: ProtobufLoginResponse): {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
} {
  return convertProtobufLoginResponse(protobufResponse); // Same structure
}

interface ProtobufForgotPasswordResponse {
  getSuccess?(): boolean;
  getMessage?(): string;
  // Fallback properties
  success?: boolean;
  message?: string;
}

/**
 * Convert protobuf ForgotPasswordResponse thành local format
 */
export function convertProtobufForgotPasswordResponse(protobufResponse: ProtobufForgotPasswordResponse): {
  success: boolean;
  message: string;
} {
  if (!protobufResponse) {
    return {
      success: false,
      message: 'Invalid response'
    };
  }

  return {
    success: protobufResponse.getSuccess?.() || protobufResponse.success || false,
    message: protobufResponse.getMessage?.() || protobufResponse.message || ''
  };
}

interface ProtobufResetPasswordResponse {
  getSuccess?(): boolean;
  getMessage?(): string;
  // Fallback properties
  success?: boolean;
  message?: string;
}

/**
 * Convert protobuf ResetPasswordResponse thành local format
 */
export function convertProtobufResetPasswordResponse(protobufResponse: ProtobufResetPasswordResponse): {
  success: boolean;
  message: string;
} {
  return convertProtobufForgotPasswordResponse(protobufResponse); // Same structure
}

/**
 * Helper function để ensure UserRole compatibility
 */
export function normalizeUserRole(role: string | UserRole): UserRole {
  if (typeof role === 'string') {
    switch (role.toLowerCase()) {
      case 'guest': return UserRole.GUEST;
      case 'student': return UserRole.STUDENT;
      case 'tutor': return UserRole.TUTOR;
      case 'teacher': return UserRole.TEACHER;
      case 'admin': return UserRole.ADMIN;
      default: return UserRole.STUDENT;
    }
  }
  return role || UserRole.STUDENT;
}

/**
 * Helper function để ensure UserStatus compatibility
 */
export function normalizeUserStatus(status: string | UserStatus): UserStatus {
  if (typeof status === 'string') {
    switch (status.toLowerCase()) {
      case 'active': return UserStatus.ACTIVE;
      case 'inactive': return UserStatus.INACTIVE;
      case 'pending': return UserStatus.PENDING;
      case 'suspended': return UserStatus.SUSPENDED;
      case 'deleted': return UserStatus.DELETED;
      default: return UserStatus.ACTIVE;
    }
  }
  return status || UserStatus.ACTIVE;
}
