/**
 * Type Converters
 * Utilities to convert between enum-based and protobuf-based types
 * 
 * This is a temporary compatibility layer during type consolidation
 */

// Import both type systems
import { UserRole as ProtobufUserRole, UserStatus as ProtobufUserStatus } from '@/types/user/base';
import { UserRole as MockdataUserRole, UserStatus as MockdataUserStatus } from '@/lib/mockdata/core-types';

// ===== ROLE CONVERTERS =====

/**
 * Convert mockdata enum role to protobuf role
 */
export function convertEnumRoleToProtobuf(enumRole: MockdataUserRole): ProtobufUserRole {
  const mapping: Record<MockdataUserRole, ProtobufUserRole> = {
    [MockdataUserRole.GUEST]: ProtobufUserRole.USER_ROLE_GUEST,
    [MockdataUserRole.STUDENT]: ProtobufUserRole.USER_ROLE_STUDENT,
    [MockdataUserRole.TUTOR]: ProtobufUserRole.USER_ROLE_TUTOR,
    [MockdataUserRole.TEACHER]: ProtobufUserRole.USER_ROLE_TEACHER,
    [MockdataUserRole.ADMIN]: ProtobufUserRole.USER_ROLE_ADMIN,
  };
  
  return mapping[enumRole] || ProtobufUserRole.USER_ROLE_UNSPECIFIED;
}

/**
 * Convert protobuf role to mockdata enum role
 */
export function convertProtobufRoleToEnum(protobufRole: ProtobufUserRole): MockdataUserRole {
  const mapping: Record<ProtobufUserRole, MockdataUserRole> = {
    [ProtobufUserRole.USER_ROLE_UNSPECIFIED]: MockdataUserRole.GUEST,
    [ProtobufUserRole.USER_ROLE_GUEST]: MockdataUserRole.GUEST,
    [ProtobufUserRole.USER_ROLE_STUDENT]: MockdataUserRole.STUDENT,
    [ProtobufUserRole.USER_ROLE_TUTOR]: MockdataUserRole.TUTOR,
    [ProtobufUserRole.USER_ROLE_TEACHER]: MockdataUserRole.TEACHER,
    [ProtobufUserRole.USER_ROLE_ADMIN]: MockdataUserRole.ADMIN,
  };
  
  return mapping[protobufRole] || MockdataUserRole.GUEST;
}

// ===== STATUS CONVERTERS =====

/**
 * Convert mockdata enum status to protobuf status
 */
export function convertEnumStatusToProtobuf(enumStatus: MockdataUserStatus): ProtobufUserStatus {
  const mapping: Record<MockdataUserStatus, ProtobufUserStatus> = {
    [MockdataUserStatus.ACTIVE]: ProtobufUserStatus.USER_STATUS_ACTIVE,
    [MockdataUserStatus.INACTIVE]: ProtobufUserStatus.USER_STATUS_INACTIVE,
    [MockdataUserStatus.SUSPENDED]: ProtobufUserStatus.USER_STATUS_SUSPENDED,
    [MockdataUserStatus.PENDING_VERIFICATION]: ProtobufUserStatus.USER_STATUS_INACTIVE, // Map to inactive for now
  };
  
  return mapping[enumStatus] || ProtobufUserStatus.USER_STATUS_UNSPECIFIED;
}

/**
 * Convert protobuf status to mockdata enum status
 */
export function convertProtobufStatusToEnum(protobufStatus: ProtobufUserStatus): MockdataUserStatus {
  const mapping: Record<ProtobufUserStatus, MockdataUserStatus> = {
    [ProtobufUserStatus.USER_STATUS_UNSPECIFIED]: MockdataUserStatus.INACTIVE,
    [ProtobufUserStatus.USER_STATUS_ACTIVE]: MockdataUserStatus.ACTIVE,
    [ProtobufUserStatus.USER_STATUS_INACTIVE]: MockdataUserStatus.INACTIVE,
    [ProtobufUserStatus.USER_STATUS_SUSPENDED]: MockdataUserStatus.SUSPENDED,
  };
  
  return mapping[protobufStatus] || MockdataUserStatus.INACTIVE;
}

// ===== DISPLAY HELPERS =====

/**
 * Get role label from protobuf role
 */
export function getProtobufRoleLabel(protobufRole: ProtobufUserRole | number): string {
  const labels: Record<ProtobufUserRole, string> = {
    [ProtobufUserRole.USER_ROLE_UNSPECIFIED]: "Không xác định",
    [ProtobufUserRole.USER_ROLE_GUEST]: "Khách",
    [ProtobufUserRole.USER_ROLE_STUDENT]: "Học viên",
    [ProtobufUserRole.USER_ROLE_TUTOR]: "Trợ giảng",
    [ProtobufUserRole.USER_ROLE_TEACHER]: "Giảng viên",
    [ProtobufUserRole.USER_ROLE_ADMIN]: "Quản trị viên"
  };
  
  return labels[protobufRole as keyof typeof labels] || "Không xác định";
}

/**
 * Get status label from protobuf status
 */
export function getProtobufStatusLabel(protobufStatus: ProtobufUserStatus | number): string {
  const labels: Record<ProtobufUserStatus, string> = {
    [ProtobufUserStatus.USER_STATUS_UNSPECIFIED]: "Không xác định",
    [ProtobufUserStatus.USER_STATUS_ACTIVE]: "Hoạt động",
    [ProtobufUserStatus.USER_STATUS_INACTIVE]: "Không hoạt động",
    [ProtobufUserStatus.USER_STATUS_SUSPENDED]: "Tạm khóa"
  };
  
  return labels[protobufStatus as keyof typeof labels] || "Không xác định";
}

/**
 * Get role color from protobuf role
 */
export function getProtobufRoleColor(protobufRole: ProtobufUserRole | number): string {
  const colors: Record<ProtobufUserRole, string> = {
    [ProtobufUserRole.USER_ROLE_UNSPECIFIED]: "gray",
    [ProtobufUserRole.USER_ROLE_GUEST]: "gray",
    [ProtobufUserRole.USER_ROLE_STUDENT]: "blue",
    [ProtobufUserRole.USER_ROLE_TUTOR]: "green",
    [ProtobufUserRole.USER_ROLE_TEACHER]: "purple",
    [ProtobufUserRole.USER_ROLE_ADMIN]: "red"
  };
  
  return colors[protobufRole as keyof typeof colors] || "gray";
}

/**
 * Get status color from protobuf status
 */
export function getProtobufStatusColor(protobufStatus: ProtobufUserStatus | number): string {
  const colors: Record<ProtobufUserStatus, string> = {
    [ProtobufUserStatus.USER_STATUS_UNSPECIFIED]: "gray",
    [ProtobufUserStatus.USER_STATUS_ACTIVE]: "green",
    [ProtobufUserStatus.USER_STATUS_INACTIVE]: "gray",
    [ProtobufUserStatus.USER_STATUS_SUSPENDED]: "red"
  };
  
  return colors[protobufStatus as keyof typeof colors] || "gray";
}

// ===== COMPARISON HELPERS =====

/**
 * Check if protobuf role equals mockdata role
 */
export function isProtobufRoleEqual(protobufRole: ProtobufUserRole, mockdataRole: MockdataUserRole): boolean {
  return convertProtobufRoleToEnum(protobufRole) === mockdataRole;
}

/**
 * Check if protobuf status equals mockdata status
 */
export function isProtobufStatusEqual(protobufStatus: ProtobufUserStatus, mockdataStatus: MockdataUserStatus): boolean {
  return convertProtobufStatusToEnum(protobufStatus) === mockdataStatus;
}
