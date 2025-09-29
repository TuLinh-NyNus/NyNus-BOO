/**
 * Role Hierarchy Management
 * Quản lý hệ thống phân cấp vai trò với visualization support
 */

import { UserRole } from "@/lib/mockdata/core-types";

// Import labels and colors from mockdata for compatibility
const USER_ROLE_LABELS: Record<UserRole, string> = {
  GUEST: "Khách",
  STUDENT: "Học viên",
  TUTOR: "Gia sư",
  TEACHER: "Giáo viên",
  ADMIN: "Quản trị viên",
};

const USER_ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "destructive",
  TEACHER: "default",
  TUTOR: "secondary",
  STUDENT: "outline",
  GUEST: "secondary",
};

/**
 * Role hierarchy levels
 * Cấp độ phân cấp vai trò
 */
export const ROLE_LEVELS: Record<UserRole, number> = {
  GUEST: 0,
  STUDENT: 1,
  TUTOR: 2,
  TEACHER: 3,
  ADMIN: 4,
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
 * Interface cho node trong role hierarchy
 */
export interface RoleHierarchyNode {
  role: UserRole;
  level: number;
  label: string;
  color: string;
  permissions: RolePermission[];
  children: RoleHierarchyNode[];
  parent?: RoleHierarchyNode;
  promotionPaths: UserRole[];
  restrictions: string[];
  description: string;
  userCount?: number;
}

/**
 * Role permissions mapping
 * Mapping permissions cho từng role
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermission[]> = {
  GUEST: [
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
  STUDENT: [
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
  TUTOR: [
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
  TEACHER: [
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
      description: "Có thể quản lý học viên trong khóa học",
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
  ADMIN: [
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
 * Mô tả chi tiết cho từng role
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  GUEST: "Người dùng chưa đăng ký, chỉ có thể xem nội dung công khai và đăng ký tài khoản.",
  STUDENT: "Học viên đã đăng ký, có thể tham gia khóa học, nộp bài tập và xem tiến độ học tập.",
  TUTOR: "Trợ giảng hỗ trợ học viên, có thể chấm bài và tạo tài liệu học tập bổ sung.",
  TEACHER: "Giảng viên tạo và quản lý khóa học, chấm điểm và theo dõi tiến độ học viên.",
  ADMIN: "Quản trị viên có quyền truy cập toàn bộ hệ thống và quản lý tất cả người dùng.",
};

/**
 * Role restrictions
 * Các hạn chế cho từng role
 */
export const ROLE_RESTRICTIONS: Record<UserRole, string[]> = {
  GUEST: [
    "Không thể truy cập nội dung premium",
    "Không thể tương tác với hệ thống",
    "Phiên làm việc có thời hạn",
  ],
  STUDENT: [
    "Chỉ có thể truy cập khóa học đã đăng ký",
    "Không thể tạo nội dung giảng dạy",
    "Không thể xem thông tin học viên khác",
  ],
  TUTOR: [
    "Chỉ có thể hỗ trợ trong khóa học được phân công",
    "Không thể thay đổi cấu trúc khóa học",
    "Cần sự phê duyệt từ giảng viên",
  ],
  TEACHER: [
    "Chỉ có thể quản lý khóa học của mình",
    "Không thể truy cập dữ liệu hệ thống",
    "Cần tuân thủ chính sách nội dung",
  ],
  ADMIN: [
    "Chịu trách nhiệm về tất cả hoạt động",
    "Phải tuân thủ chính sách bảo mật",
    "Cần xác thực đa yếu tố cho các thao tác quan trọng",
  ],
};

/**
 * Get promotion paths for a role
 * Lấy đường dẫn thăng tiến cho role
 */
export function getPromotionPaths(role: UserRole): UserRole[] {
  const currentLevel = ROLE_LEVELS[role];
  const availableRoles = Object.keys(ROLE_LEVELS) as UserRole[];

  return availableRoles.filter((targetRole) => {
    const targetLevel = ROLE_LEVELS[targetRole];
    return targetLevel > currentLevel && targetLevel <= currentLevel + 2; // Chỉ có thể thăng tiến tối đa 2 cấp
  });
}

/**
 * Check if role can be promoted to target role
 * Kiểm tra xem role có thể thăng tiến lên target role không
 */
export function canPromoteToRole(fromRole: UserRole, toRole: UserRole): boolean {
  const fromLevel = ROLE_LEVELS[fromRole];
  const toLevel = ROLE_LEVELS[toRole];

  return toLevel > fromLevel && toLevel <= fromLevel + 2;
}

/**
 * Get role hierarchy tree structure
 * Lấy cấu trúc cây phân cấp role
 */
export function getRoleHierarchyTree(): RoleHierarchyNode {
  const roles = Object.keys(ROLE_LEVELS) as UserRole[];
  const sortedRoles = roles.sort((a, b) => ROLE_LEVELS[a] - ROLE_LEVELS[b]);

  const createNode = (role: UserRole, parent?: RoleHierarchyNode): RoleHierarchyNode => {
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
  const root = createNode(UserRole.GUEST);

  // Build tree structure
  const nodes: Partial<Record<UserRole, RoleHierarchyNode>> = { GUEST: root };

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
 * Lấy tất cả roles theo thứ tự phân cấp
 */
export function getAllRolesInOrder(): UserRole[] {
  const roles = Object.keys(ROLE_LEVELS) as UserRole[];
  return roles.sort((a, b) => ROLE_LEVELS[a] - ROLE_LEVELS[b]);
}

/**
 * Get role by level
 * Lấy role theo level
 */
export function getRoleByLevel(level: number): UserRole | undefined {
  const roles = Object.keys(ROLE_LEVELS) as UserRole[];
  return roles.find((role) => ROLE_LEVELS[role] === level);
}

/**
 * Get permissions by category
 * Lấy permissions theo category
 */
export function getPermissionsByCategory(role: UserRole): Record<string, RolePermission[]> {
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
