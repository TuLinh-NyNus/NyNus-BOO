/**
 * Protobuf Converters
 * Utilities để convert protobuf objects thành local types
 */

import type { User } from '@/types/user';
import { UserRole, UserStatus } from '@/generated/common/common_pb';
import type { UserRole as UserRoleType, UserStatus as UserStatusType } from '@/types/user/base';

// Define protobuf object interfaces
interface ProtobufUser {
  getId?(): string;
  getEmail?(): string;
  getName?(): string;
  getRole?(): number; // Protobuf enum returns number
  getLevel?(): string | number; // Accept both string and number
  getStatus?(): number; // Protobuf enum returns number
  getAvatar?(): string;
  getEmailVerified?(): boolean;
  getCreatedAt?(): string | number;
  getUpdatedAt?(): string | number;
  // Fallback properties for direct access
  id?: string;
  email?: string;
  name?: string;
  role?: number; // Protobuf enum is number
  level?: string | number; // Accept both string and number
  status?: number; // Protobuf enum is number
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
  const role = protobufUser.getRole?.() || protobufUser.role || UserRole.USER_ROLE_STUDENT;
  const status = protobufUser.getStatus?.() || protobufUser.status || UserStatus.USER_STATUS_ACTIVE;
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
    role: typeof role === 'number' ? role as UserRoleType : UserRole.USER_ROLE_STUDENT,
    status: typeof status === 'number' ? status as UserStatusType : UserStatus.USER_STATUS_ACTIVE,
    level: typeof level === 'string' ? parseInt(level) || 1 : level,
    avatar,
    emailVerified,
    createdAt,
    updatedAt,
    isActive: status === UserStatus.USER_STATUS_ACTIVE,
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

interface ProtobufVerifyEmailResponse {
  getResponse?(): { getSuccess?(): boolean; getMessage?(): string } | undefined;
  getVerified?(): boolean;
  // Fallback properties
  response?: { success?: boolean; message?: string; getSuccess?(): boolean; getMessage?(): string };
  verified?: boolean;
}

/**
 * Convert protobuf VerifyEmailResponse thành local format
 */
export function convertProtobufVerifyEmailResponse(protobufResponse: ProtobufVerifyEmailResponse): {
  success: boolean;
  message: string;
  verified: boolean;
} {
  if (!protobufResponse) {
    return {
      success: false,
      message: 'Invalid response',
      verified: false
    };
  }

  const response = protobufResponse.getResponse?.() || protobufResponse.response;
  let success = false;
  let message = '';

  if (response) {
    if (typeof response.getSuccess === 'function') {
      success = response.getSuccess() || false;
    } else if ('success' in response) {
      success = (response as { success?: boolean }).success || false;
    }

    if (typeof response.getMessage === 'function') {
      message = response.getMessage() || '';
    } else if ('message' in response) {
      message = (response as { message?: string }).message || '';
    }
  }

  const verified = protobufResponse.getVerified?.() || protobufResponse.verified || false;

  return {
    success,
    message,
    verified
  };
}

interface ProtobufSendVerificationEmailResponse {
  getResponse?(): { getSuccess?(): boolean; getMessage?(): string } | undefined;
  getMessage?(): string;
  // Fallback properties
  response?: { success?: boolean; message?: string; getSuccess?(): boolean; getMessage?(): string };
  message?: string;
}

/**
 * Convert protobuf SendVerificationEmailResponse thành local format
 */
export function convertProtobufSendVerificationEmailResponse(protobufResponse: ProtobufSendVerificationEmailResponse): {
  success: boolean;
  message: string;
} {
  if (!protobufResponse) {
    return {
      success: false,
      message: 'Invalid response'
    };
  }

  const response = protobufResponse.getResponse?.() || protobufResponse.response;
  let success = false;
  let message = '';

  if (response) {
    if (typeof response.getSuccess === 'function') {
      success = response.getSuccess() || false;
    } else if ('success' in response) {
      success = (response as { success?: boolean }).success || false;
    }

    if (typeof response.getMessage === 'function') {
      message = response.getMessage() || '';
    } else if ('message' in response) {
      message = (response as { message?: string }).message || '';
    }
  }

  // Fallback to direct message from response
  if (!message) {
    message = protobufResponse.getMessage?.() || protobufResponse.message || '';
  }

  return {
    success,
    message
  };
}

/**
 * Helper function để ensure UserRole compatibility
 */
export function normalizeUserRole(role: string | number): number {
  if (typeof role === 'string') {
    switch (role.toLowerCase()) {
      case 'guest': return UserRole.USER_ROLE_GUEST;
      case 'student': return UserRole.USER_ROLE_STUDENT;
      case 'tutor': return UserRole.USER_ROLE_TUTOR;
      case 'teacher': return UserRole.USER_ROLE_TEACHER;
      case 'admin': return UserRole.USER_ROLE_ADMIN;
      default: return UserRole.USER_ROLE_STUDENT;
    }
  }
  return role || UserRole.USER_ROLE_STUDENT;
}

/**
 * Helper function để ensure UserStatus compatibility
 */
export function normalizeUserStatus(status: string | number): number {
  if (typeof status === 'string') {
    switch (status.toLowerCase()) {
      case 'active': return UserStatus.USER_STATUS_ACTIVE;
      case 'inactive': return UserStatus.USER_STATUS_INACTIVE;
      case 'pending': return UserStatus.USER_STATUS_SUSPENDED; // Map pending to suspended for now
      case 'suspended': return UserStatus.USER_STATUS_SUSPENDED;
      case 'deleted': return UserStatus.USER_STATUS_INACTIVE; // Map deleted to inactive for now
      default: return UserStatus.USER_STATUS_ACTIVE;
    }
  }
  return status || UserStatus.USER_STATUS_ACTIVE;
}
