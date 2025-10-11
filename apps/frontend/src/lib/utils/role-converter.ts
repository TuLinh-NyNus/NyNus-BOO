/**
 * Role Converter Utility
 * =====================
 * Chuyển đổi giữa protobuf role enum và string role format
 * 
 * Business Logic:
 * - Backend sử dụng protobuf UserRole enum (số)
 * - Frontend middleware và UI sử dụng string format
 * - Cần chuyển đổi 2 chiều giữa 2 formats
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { UserRole } from '@/generated/common/common_pb';

/**
 * Role mapping constants
 * Khớp với backend hierarchy (apps/backend/internal/constant/roles.go)
 * Hierarchy: GUEST(1) < STUDENT(2) < TUTOR(3) < TEACHER(4) < ADMIN(5)
 */
export const ROLE_NUMBER_TO_STRING_MAP = {
  [UserRole.USER_ROLE_UNSPECIFIED]: 'GUEST',
  [UserRole.USER_ROLE_GUEST]: 'GUEST',
  [UserRole.USER_ROLE_STUDENT]: 'STUDENT',
  [UserRole.USER_ROLE_TUTOR]: 'TUTOR',
  [UserRole.USER_ROLE_TEACHER]: 'TEACHER',
  [UserRole.USER_ROLE_ADMIN]: 'ADMIN',
} as const;

export const ROLE_STRING_TO_NUMBER_MAP = {
  'GUEST': UserRole.USER_ROLE_GUEST,
  'STUDENT': UserRole.USER_ROLE_STUDENT,
  'TUTOR': UserRole.USER_ROLE_TUTOR,
  'TEACHER': UserRole.USER_ROLE_TEACHER,
  'ADMIN': UserRole.USER_ROLE_ADMIN,
} as const;

export type RoleString = keyof typeof ROLE_STRING_TO_NUMBER_MAP;

/**
 * Chuyển đổi protobuf role number sang string format
 * 
 * Business Logic:
 * - Sử dụng khi nhận role từ backend gRPC response
 * - Default fallback là 'STUDENT' nếu role không hợp lệ
 * 
 * @param roleNumber - Protobuf UserRole enum value (1-5)
 * @returns Role string (GUEST, STUDENT, TUTOR, TEACHER, ADMIN)
 * 
 * @example
 * ```typescript
 * const roleString = convertProtobufRoleToString(2); // Returns 'STUDENT'
 * const roleString = convertProtobufRoleToString(5); // Returns 'ADMIN'
 * const roleString = convertProtobufRoleToString(999); // Returns 'STUDENT' (fallback)
 * ```
 */
export function convertProtobufRoleToString(roleNumber: number): RoleString {
  const roleString = ROLE_NUMBER_TO_STRING_MAP[roleNumber as keyof typeof ROLE_NUMBER_TO_STRING_MAP];
  return roleString || 'STUDENT'; // Default fallback
}

/**
 * Chuyển đổi role string sang protobuf number
 * 
 * Business Logic:
 * - Sử dụng khi gửi role lên backend gRPC
 * - Default fallback là USER_ROLE_STUDENT nếu role không hợp lệ
 * 
 * @param roleString - Role string (GUEST, STUDENT, TUTOR, TEACHER, ADMIN)
 * @returns Protobuf UserRole enum value (1-5)
 * 
 * @example
 * ```typescript
 * const roleNumber = convertStringRoleToProtobuf('STUDENT'); // Returns 2
 * const roleNumber = convertStringRoleToProtobuf('ADMIN'); // Returns 5
 * const roleNumber = convertStringRoleToProtobuf('INVALID'); // Returns 2 (fallback)
 * ```
 */
export function convertStringRoleToProtobuf(roleString: string): number {
  const roleNumber = ROLE_STRING_TO_NUMBER_MAP[roleString as RoleString];
  return roleNumber || UserRole.USER_ROLE_STUDENT; // Default fallback
}

/**
 * Kiểm tra role string có hợp lệ không
 * 
 * @param roleString - Role string cần kiểm tra
 * @returns true nếu role hợp lệ, false nếu không
 * 
 * @example
 * ```typescript
 * isValidRoleString('STUDENT'); // Returns true
 * isValidRoleString('INVALID'); // Returns false
 * ```
 */
export function isValidRoleString(roleString: string): roleString is RoleString {
  return roleString in ROLE_STRING_TO_NUMBER_MAP;
}

/**
 * Kiểm tra role number có hợp lệ không
 * 
 * @param roleNumber - Role number cần kiểm tra
 * @returns true nếu role hợp lệ, false nếu không
 * 
 * @example
 * ```typescript
 * isValidRoleNumber(2); // Returns true (STUDENT)
 * isValidRoleNumber(999); // Returns false
 * ```
 */
export function isValidRoleNumber(roleNumber: number): boolean {
  return roleNumber in ROLE_NUMBER_TO_STRING_MAP;
}

