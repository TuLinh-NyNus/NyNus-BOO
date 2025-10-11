/**
 * Role Hierarchy Management
 * Quản lý hệ thống phân cấp vai trò với visualization support
 */

// FIXED: Use protobuf UserRole instead of mockdata
import { UserRole, type UserRole as UserRoleType } from "@/types/user/roles";

/**
 * Role labels in Vietnamese
 * Nhãn hiển thị cho các vai trò
 */
export const USER_ROLE_LABELS: Record<UserRoleType, string> = {
  [UserRole.USER_ROLE_UNSPECIFIED]: "Không xác định",
  [UserRole.USER_ROLE_GUEST]: "Khách",
  [UserRole.USER_ROLE_STUDENT]: "Học viên",
  [UserRole.USER_ROLE_TUTOR]: "Gia sư",
  [UserRole.USER_ROLE_TEACHER]: "Giáo viên",
  [UserRole.USER_ROLE_ADMIN]: "Quản trị viên",
} as const;

/**
 * Role badge colors for UI
 * Màu sắc badge cho các vai trò
 */
export const USER_ROLE_COLORS: Record<UserRoleType, string> = {
  [UserRole.USER_ROLE_UNSPECIFIED]: "secondary",
  [UserRole.USER_ROLE_ADMIN]: "destructive",
  [UserRole.USER_ROLE_TEACHER]: "default",
  [UserRole.USER_ROLE_TUTOR]: "secondary",
  [UserRole.USER_ROLE_STUDENT]: "outline",
  [UserRole.USER_ROLE_GUEST]: "secondary",
} as const;

/**
 * All roles in hierarchy order (lowest to highest)
 * Tất cả vai trò theo thứ tự phân cấp
 */
export const ROLES_IN_ORDER: readonly UserRoleType[] = [
  UserRole.USER_ROLE_GUEST,
  UserRole.USER_ROLE_STUDENT,
  UserRole.USER_ROLE_TUTOR,
  UserRole.USER_ROLE_TEACHER,
  UserRole.USER_ROLE_ADMIN,
] as const;

/**
 * Maximum promotion levels allowed
 * Số cấp tối đa có thể thăng tiến
 */
export const MAX_PROMOTION_LEVELS = 2;

/**
 * Role hierarchy levels
 * FIXED: Match backend hierarchy (apps/backend/internal/constant/roles.go)
 * Hierarchy: GUEST(1) < STUDENT(2) < TUTOR(3) < TEACHER(4) < ADMIN(5)
 */
export const ROLE_LEVELS: Record<UserRoleType, number> = {
  [UserRole.USER_ROLE_UNSPECIFIED]: -1,
  [UserRole.USER_ROLE_GUEST]: 1,      // FIXED: 0 → 1
  [UserRole.USER_ROLE_STUDENT]: 2,    // FIXED: 1 → 2
  [UserRole.USER_ROLE_TUTOR]: 3,      // FIXED: 2 → 3
  [UserRole.USER_ROLE_TEACHER]: 4,    // FIXED: 3 → 4
  [UserRole.USER_ROLE_ADMIN]: 5,      // FIXED: 4 → 5
} as const;

/**
 * Role permissions interface
 * Interface cho permissions của role
 */
export interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: "user" | "content" | "system" | "security" | "admin";
  level: "read" | "write" | "delete" | "admin";
}

/**
 * Role hierarchy node interface
 * FIXED: Use protobuf UserRoleType
 */
export interface RoleHierarchyNode {
  role: UserRoleType;
  level: number;
  label: string;
  color: string;
  permissions: RolePermission[];
  children: RoleHierarchyNode[];
  parent?: RoleHierarchyNode;
  promotionPaths: UserRoleType[];
  restrictions: string[];
  description: string;
  userCount?: number;
}

/**
 * Role permissions mapping
 * FIXED: Use protobuf UserRole enum values
 */
export const ROLE_PERMISSIONS: Record<UserRoleType, RolePermission[]> = {
  [UserRole.USER_ROLE_UNSPECIFIED]: [],
  [UserRole.USER_ROLE_GUEST]: [
    {
      id: "view_public_content",
      name: "Xem nội dung công khai",
      description: "Có thể xem các khóa học và tài liệu công khai",
      category: "content",
      level: "read",
    },
    {
      id: "register_account",
      name: "Đăng ký tài khoản",
      description: "Có thể tạo tài khoản mới trong hệ thống",
      category: "user",
      level: "write",
    },
  ],
  [UserRole.USER_ROLE_STUDENT]: [
    {
      id: "view_public_content",
      name: "Xem nội dung công khai",
      description: "Có thể xem các khóa học và tài liệu công khai",
      category: "content",
      level: "read",
    },
    {
      id: "access_enrolled_courses",
      name: "Truy cập khóa học đã đăng ký",
      description: "Có thể truy cập và học các khóa học đã đăng ký",
      category: "content",
      level: "read",
    },
    {
      id: "submit_assignments",
      name: "Nộp bài tập",
      description: "Có thể nộp bài tập và bài kiểm tra",
      category: "content",
      level: "write",
    },
    {
      id: "view_progress",
      name: "Xem tiến độ học tập",
      description: "Có thể xem tiến độ và kết quả học tập của mình",
      category: "user",
      level: "read",
    },
  ],
  [UserRole.USER_ROLE_TUTOR]: [
    {
      id: "view_public_content",
      name: "Xem nội dung công khai",
      description: "Có thể xem các khóa học và tài liệu công khai",
      category: "content",
      level: "read",
    },
    {
      id: "access_enrolled_courses",
      name: "Truy cập khóa học đã đăng ký",
      description: "Có thể truy cập và học các khóa học đã đăng ký",
      category: "content",
      level: "read",
    },
    {
      id: "assist_students",
      name: "Hỗ trợ học viên",
      description: "Có thể hỗ trợ và tư vấn cho học viên",
      category: "user",
      level: "write",
    },
    {
      id: "grade_assignments",
      name: "Chấm bài tập",
      description: "Có thể chấm điểm bài tập của học viên",
      category: "content",
      level: "write",
    },
    {
      id: "create_study_materials",
      name: "Tạo tài liệu học tập",
      description: "Có thể tạo và chia sẻ tài liệu học tập",
      category: "content",
      level: "write",
    },
  ],
  [UserRole.USER_ROLE_TEACHER]: [
    {
      id: "view_public_content",
      name: "Xem nội dung công khai",
      description: "Có thể xem các khóa học và tài liệu công khai",
      category: "content",
      level: "read",
    },
    {
      id: "create_courses",
      name: "Tạo khóa học",
      description: "Có thể tạo và quản lý khóa học",
      category: "content",
      level: "write",
    },
    {
      id: "manage_students",
      name: "Quản lý học viên",
      description: "Có thể xem và quản lý thông tin học viên",
      category: "user",
      level: "write",
    },
    {
      id: "create_assessments",
      name: "Tạo bài kiểm tra",
      description: "Có thể tạo và quản lý bài kiểm tra",
      category: "content",
      level: "write",
    },
    {
      id: "view_analytics",
      name: "Xem báo cáo phân tích",
      description: "Có thể xem báo cáo về khóa học và học viên",
      category: "system",
      level: "read",
    },
    {
      id: "manage_tutors",
      name: "Quản lý trợ giảng",
      description: "Có thể quản lý và phân công trợ giảng",
      category: "user",
      level: "write",
    },
  ],
  [UserRole.USER_ROLE_ADMIN]: [
    {
      id: "full_system_access",
      name: "Truy cập toàn hệ thống",
      description: "Có quyền truy cập và quản lý toàn bộ hệ thống",
      category: "admin",
      level: "admin",
    },
    {
      id: "manage_users",
      name: "Quản lý người dùng",
      description: "Có thể tạo, sửa, xóa tài khoản người dùng",
      category: "user",
      level: "admin",
    },
    {
      id: "manage_roles",
      name: "Quản lý vai trò",
      description: "Có thể thay đổi vai trò của người dùng",
      category: "security",
      level: "admin",
    },
    {
      id: "system_configuration",
      name: "Cấu hình hệ thống",
      description: "Có thể thay đổi cấu hình hệ thống",
      category: "system",
      level: "admin",
    },
    {
      id: "security_management",
      name: "Quản lý bảo mật",
      description: "Có thể quản lý các cài đặt bảo mật",
      category: "security",
      level: "admin",
    },
    {
      id: "audit_logs",
      name: "Xem nhật ký kiểm toán",
      description: "Có thể xem và phân tích nhật ký hệ thống",
      category: "security",
      level: "read",
    },
  ],
};

/**
 * Role descriptions
 * FIXED: Use protobuf UserRole enum values
 */
export const ROLE_DESCRIPTIONS: Record<UserRoleType, string> = {
  [UserRole.USER_ROLE_UNSPECIFIED]: "Vai trò không xác định.",
  [UserRole.USER_ROLE_GUEST]: "Người dùng chưa đăng ký, chỉ có thể xem nội dung công khai và đăng ký tài khoản.",
  [UserRole.USER_ROLE_STUDENT]: "Học viên đã đăng ký, có thể tham gia khóa học, nộp bài tập và xem tiến độ học tập.",
  [UserRole.USER_ROLE_TUTOR]: "Trợ giảng hỗ trợ học viên, có thể chấm bài và tạo tài liệu học tập bổ sung.",
  [UserRole.USER_ROLE_TEACHER]: "Giảng viên tạo và quản lý khóa học, chấm điểm và theo dõi tiến độ học viên.",
  [UserRole.USER_ROLE_ADMIN]: "Quản trị viên có quyền truy cập toàn bộ hệ thống và quản lý tất cả người dùng.",
};

/**
 * Role restrictions
 * FIXED: Use protobuf UserRole enum values
 */
export const ROLE_RESTRICTIONS: Record<UserRoleType, string[]> = {
  [UserRole.USER_ROLE_UNSPECIFIED]: [
    "Không có quyền truy cập",
    "Cần xác định vai trò",
  ],
  [UserRole.USER_ROLE_GUEST]: [
    "Không thể truy cập nội dung premium",
    "Không thể tương tác với hệ thống",
    "Phiên làm việc có thời hạn",
  ],
  [UserRole.USER_ROLE_STUDENT]: [
    "Chỉ có thể truy cập khóa học đã đăng ký",
    "Không thể tạo nội dung giảng dạy",
    "Không thể xem thông tin học viên khác",
  ],
  [UserRole.USER_ROLE_TUTOR]: [
    "Chỉ có thể hỗ trợ trong khóa học được phân công",
    "Không thể thay đổi cấu trúc khóa học",
    "Cần sự phê duyệt từ giảng viên",
  ],
  [UserRole.USER_ROLE_TEACHER]: [
    "Chỉ có thể quản lý khóa học của mình",
    "Không thể truy cập dữ liệu hệ thống",
    "Cần tuân thủ chính sách nội dung",
  ],
  [UserRole.USER_ROLE_ADMIN]: [
    "Chịu trách nhiệm về tất cả hoạt động",
    "Phải tuân thủ chính sách bảo mật",
    "Cần xác thực đa yếu tố cho các thao tác quan trọng",
  ],
};

/**
 * Get promotion paths for a role
 *
 * Business Logic:
 * - User can only be promoted up to MAX_PROMOTION_LEVELS (2) levels higher
 * - Example: STUDENT (level 2) can be promoted to TUTOR (3) or TEACHER (4), but not ADMIN (5)
 *
 * @param role - Current user role
 * @returns Array of roles that user can be promoted to
 *
 * @example
 * ```typescript
 * const paths = getPromotionPaths(UserRole.USER_ROLE_STUDENT);
 * // Returns: [USER_ROLE_TUTOR, USER_ROLE_TEACHER]
 * ```
 */
export function getPromotionPaths(role: UserRoleType): UserRoleType[] {
  const currentLevel = ROLE_LEVELS[role];

  return ROLES_IN_ORDER.filter((targetRole) => {
    const targetLevel = ROLE_LEVELS[targetRole];
    return targetLevel > currentLevel && targetLevel <= currentLevel + MAX_PROMOTION_LEVELS;
  });
}

/**
 * Check if role can be promoted to target role
 *
 * Business Logic:
 * - Promotion is only allowed if target role is higher
 * - Maximum promotion gap is MAX_PROMOTION_LEVELS (2) levels
 *
 * @param fromRole - Current role
 * @param toRole - Target role to promote to
 * @returns true if promotion is allowed
 *
 * @example
 * ```typescript
 * canPromoteToRole(UserRole.USER_ROLE_STUDENT, UserRole.USER_ROLE_TEACHER); // true
 * canPromoteToRole(UserRole.USER_ROLE_STUDENT, UserRole.USER_ROLE_ADMIN); // false (too many levels)
 * ```
 */
export function canPromoteToRole(fromRole: UserRoleType, toRole: UserRoleType): boolean {
  const fromLevel = ROLE_LEVELS[fromRole];
  const toLevel = ROLE_LEVELS[toRole];

  return toLevel > fromLevel && toLevel <= fromLevel + MAX_PROMOTION_LEVELS;
}

/**
 * Get role hierarchy tree structure
 *
 * Business Logic:
 * - Builds a tree structure with GUEST as root
 * - Each role has children representing higher roles
 * - Includes permissions, restrictions, and promotion paths
 *
 * @returns Root node of role hierarchy tree (GUEST role)
 *
 * @example
 * ```typescript
 * const tree = getRoleHierarchyTree();
 * console.log(tree.role); // USER_ROLE_GUEST
 * console.log(tree.children[0].role); // USER_ROLE_STUDENT
 * ```
 */
export function getRoleHierarchyTree(): RoleHierarchyNode {
  const sortedRoles = [...ROLES_IN_ORDER]; // Use shared constant

  const createNode = (role: UserRoleType, parent?: RoleHierarchyNode): RoleHierarchyNode => {
    const node: RoleHierarchyNode = {
      role,
      level: ROLE_LEVELS[role],
      label: USER_ROLE_LABELS[role],
      color: USER_ROLE_COLORS[role],
      permissions: ROLE_PERMISSIONS[role],
      children: [],
      parent,
      promotionPaths: getPromotionPaths(role),
      restrictions: ROLE_RESTRICTIONS[role],
      description: ROLE_DESCRIPTIONS[role],
    };

    return node;
  };

  // Create root node (GUEST)
  const root = createNode(UserRole.USER_ROLE_GUEST);

  // Build tree structure
  const nodes: Partial<Record<UserRoleType, RoleHierarchyNode>> = { [UserRole.USER_ROLE_GUEST]: root };

  for (let i = 1; i < sortedRoles.length; i++) {
    const role = sortedRoles[i];
    const parentRole = sortedRoles[i - 1];
    const parent = nodes[parentRole];

    if (parent) {
      const node = createNode(role, parent);
      parent.children.push(node);
      nodes[role] = node;
    }
  }

  return root;
}

/**
 * Get all roles in hierarchy order
 *
 * @returns Array of all roles sorted from lowest to highest level
 *
 * @example
 * ```typescript
 * const roles = getAllRolesInOrder();
 * // Returns: [GUEST, STUDENT, TUTOR, TEACHER, ADMIN]
 * ```
 */
export function getAllRolesInOrder(): readonly UserRoleType[] {
  return ROLES_IN_ORDER; // Use shared constant
}

/**
 * Get role by level number
 *
 * @param level - Role level number (1-5)
 * @returns Role matching the level, or undefined if not found
 *
 * @example
 * ```typescript
 * getRoleByLevel(1); // Returns: USER_ROLE_GUEST
 * getRoleByLevel(5); // Returns: USER_ROLE_ADMIN
 * getRoleByLevel(99); // Returns: undefined
 * ```
 */
export function getRoleByLevel(level: number): UserRoleType | undefined {
  return ROLES_IN_ORDER.find((role) => ROLE_LEVELS[role] === level);
}

/**
 * Get permissions grouped by category
 *
 * Business Logic:
 * - Groups all permissions for a role by their category
 * - Categories: user, content, system, security, admin
 * - Useful for displaying permissions in organized UI
 *
 * @param role - User role to get permissions for
 * @returns Object with permissions grouped by category
 *
 * @example
 * ```typescript
 * const grouped = getPermissionsByCategory(UserRole.USER_ROLE_TEACHER);
 * console.log(grouped.content); // All content-related permissions
 * console.log(grouped.user); // All user-related permissions
 * ```
 */
export function getPermissionsByCategory(role: UserRoleType): Record<string, RolePermission[]> {
  const permissions = ROLE_PERMISSIONS[role];
  const grouped: Record<string, RolePermission[]> = {};

  permissions.forEach((permission) => {
    if (!grouped[permission.category]) {
      grouped[permission.category] = [];
    }
    grouped[permission.category].push(permission);
  });

  return grouped;
}
