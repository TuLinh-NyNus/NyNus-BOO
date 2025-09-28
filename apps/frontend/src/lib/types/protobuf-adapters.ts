/**
 * Protobuf Type Adapters
 * Bridges between protobuf generated types and local application types
 */

// Import protobuf generated types
import {
  UserRole as ProtobufUserRole,
  UserStatus as ProtobufUserStatus,
  type UserRoleMap,
  type UserStatusMap
} from '@/generated/common/common_pb';

// Import local types
import {
  UserRole as LocalUserRole,
  UserStatus as LocalUserStatus
} from '@/lib/mockdata/shared/core-types';

// Re-export protobuf types for external use
export type ProtobufUserRoleType = UserRoleMap[keyof UserRoleMap];
export type ProtobufUserStatusType = UserStatusMap[keyof UserStatusMap];
export { ProtobufUserRole, ProtobufUserStatus };

/**
 * Convert protobuf UserRole to local UserRole
 */
export function convertProtobufRoleToLocal(protobufRole: ProtobufUserRoleType): LocalUserRole {
  switch (protobufRole) {
    case ProtobufUserRole.USER_ROLE_GUEST:
      return LocalUserRole.GUEST;
    case ProtobufUserRole.USER_ROLE_STUDENT:
      return LocalUserRole.STUDENT;
    case ProtobufUserRole.USER_ROLE_TUTOR:
      return LocalUserRole.TUTOR;
    case ProtobufUserRole.USER_ROLE_TEACHER:
      return LocalUserRole.TEACHER;
    case ProtobufUserRole.USER_ROLE_ADMIN:
      return LocalUserRole.ADMIN;
    default:
      return LocalUserRole.STUDENT;
  }
}

/**
 * Convert local UserRole to protobuf UserRole
 */
export function convertLocalRoleToProtobuf(localRole: LocalUserRole): ProtobufUserRole {
  switch (localRole) {
    case LocalUserRole.GUEST:
      return ProtobufUserRole.USER_ROLE_GUEST;
    case LocalUserRole.STUDENT:
      return ProtobufUserRole.USER_ROLE_STUDENT;
    case LocalUserRole.TUTOR:
      return ProtobufUserRole.USER_ROLE_TUTOR;
    case LocalUserRole.TEACHER:
      return ProtobufUserRole.USER_ROLE_TEACHER;
    case LocalUserRole.ADMIN:
      return ProtobufUserRole.USER_ROLE_ADMIN;
    default:
      return ProtobufUserRole.USER_ROLE_STUDENT;
  }
}

/**
 * Convert protobuf UserStatus to local UserStatus
 */
export function convertProtobufStatusToLocal(protobufStatus: ProtobufUserStatus): LocalUserStatus {
  switch (protobufStatus) {
    case ProtobufUserStatus.USER_STATUS_ACTIVE:
      return LocalUserStatus.ACTIVE;
    case ProtobufUserStatus.USER_STATUS_INACTIVE:
      return LocalUserStatus.INACTIVE;
    case ProtobufUserStatus.USER_STATUS_SUSPENDED:
      return LocalUserStatus.SUSPENDED;
    default:
      return LocalUserStatus.ACTIVE;
  }
}

/**
 * Convert local UserStatus to protobuf UserStatus
 */
export function convertLocalStatusToProtobuf(localStatus: LocalUserStatus): ProtobufUserStatus {
  switch (localStatus) {
    case LocalUserStatus.ACTIVE:
      return ProtobufUserStatus.USER_STATUS_ACTIVE;
    case LocalUserStatus.INACTIVE:
      return ProtobufUserStatus.USER_STATUS_INACTIVE;
    case LocalUserStatus.SUSPENDED:
      return ProtobufUserStatus.USER_STATUS_SUSPENDED;
    case LocalUserStatus.PENDING_VERIFICATION:
      return ProtobufUserStatus.USER_STATUS_INACTIVE; // Map to inactive for now
    default:
      return ProtobufUserStatus.USER_STATUS_ACTIVE;
  }
}

/**
 * Type guards
 */
export function isProtobufUserRole(value: unknown): value is ProtobufUserRole {
  return typeof value === 'number' && value >= 0 && value <= 5;
}

export function isLocalUserRole(value: unknown): value is LocalUserRole {
  return typeof value === 'string' && Object.values(LocalUserRole).includes(value);
}

export function isProtobufUserStatus(value: unknown): value is ProtobufUserStatus {
  return typeof value === 'number' && value >= 0 && value <= 3;
}

export function isLocalUserStatus(value: unknown): value is LocalUserStatus {
  return typeof value === 'string' && Object.values(LocalUserStatus).includes(value);
}

/**
 * Safe conversion functions that handle unknown values
 */
export function safeConvertProtobufRole(value: unknown): LocalUserRole {
  if (isProtobufUserRole(value)) {
    return convertProtobufRoleToLocal(value);
  }
  return LocalUserRole.STUDENT;
}

export function safeConvertProtobufStatus(value: unknown): LocalUserStatus {
  if (isProtobufUserStatus(value)) {
    return convertProtobufStatusToLocal(value);
  }
  return LocalUserStatus.ACTIVE;
}

/**
 * Export type aliases for convenience
 */
export type { ProtobufUserRole, ProtobufUserStatus, LocalUserRole, LocalUserStatus };
