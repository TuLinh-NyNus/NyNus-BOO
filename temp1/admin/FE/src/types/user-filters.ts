/**
 * Advanced User Filters Types
 * Types cho advanced user filtering system
 */

/**
 * User roles enum
 * Enum cho user roles
 */
export type UserRole = "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";

/**
 * User status enum
 * Enum cho user status
 */
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

/**
 * User level range
 * Range cho user level
 */
export interface UserLevelRange {
  min?: number;
  max?: number;
}

/**
 * Date range interface
 * Interface cho date range
 */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Sort configuration
 * Cấu hình sort
 */
export interface SortConfig {
  field: "name" | "email" | "role" | "status" | "level" | "createdAt" | "lastLoginAt";
  direction: "asc" | "desc";
}

/**
 * Advanced user filter criteria
 * Tiêu chí lọc user nâng cao
 */
export interface AdvancedUserFilters {
  // Basic filters
  search?: string;
  roles?: UserRole[];
  statuses?: UserStatus[];

  // Advanced filters
  levelRange?: UserLevelRange;
  registrationDateRange?: DateRange;
  lastLoginDateRange?: DateRange;
  emailVerified?: boolean;
  hasActiveSession?: boolean;

  // Risk and activity filters
  riskScoreRange?: {
    min?: number;
    max?: number;
  };
  resourceAccessRange?: {
    min?: number;
    max?: number;
  };

  // Sorting
  sort?: SortConfig;

  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Filter preset interface
 * Interface cho filter preset
 */
export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: AdvancedUserFilters;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Saved filter configuration
 * Cấu hình filter đã lưu
 */
export interface SavedFilterConfig {
  id: string;
  name: string;
  description?: string;
  filters: AdvancedUserFilters;
  isPublic?: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  lastUsedAt?: Date;
}

/**
 * Filter validation result
 * Kết quả validation filter
 */
export interface FilterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Filter statistics
 * Thống kê filter
 */
export interface FilterStatistics {
  totalFiltered: number;
  totalAvailable: number;
  filterEfficiency: number; // Percentage of results filtered
  mostUsedFilters: string[];
  averageFilterTime: number;
}

/**
 * Filter UI state
 * State UI cho filter
 */
export interface FilterUIState {
  isExpanded: boolean;
  activeTab: "basic" | "advanced" | "presets" | "saved";
  showPresets: boolean;
  showSavedFilters: boolean;
  isApplying: boolean;
  hasUnsavedChanges: boolean;
}

/**
 * Default filter presets
 * Presets mặc định cho filter
 */
export const DEFAULT_FILTER_PRESETS: FilterPreset[] = [
  {
    id: "active-students",
    name: "Học viên đang hoạt động",
    description: "Học viên có trạng thái hoạt động và đã đăng nhập trong 30 ngày qua",
    filters: {
      roles: ["STUDENT"],
      statuses: ["ACTIVE"],
      emailVerified: true,
      hasActiveSession: true,
      lastLoginDateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        to: new Date(),
      },
    },
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "new-registrations",
    name: "Đăng ký mới",
    description: "Người dùng đăng ký trong 7 ngày qua",
    filters: {
      registrationDateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        to: new Date(),
      },
      sort: {
        field: "createdAt",
        direction: "desc",
      },
    },
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "suspended-users",
    name: "Tài khoản tạm ngưng",
    description: "Tất cả tài khoản đang bị tạm ngưng",
    filters: {
      statuses: ["SUSPENDED"],
      sort: {
        field: "lastLoginAt",
        direction: "desc",
      },
    },
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "high-level-users",
    name: "Người dùng cấp cao",
    description: "Người dùng có level từ 5 trở lên",
    filters: {
      levelRange: {
        min: 5,
      },
      statuses: ["ACTIVE"],
      sort: {
        field: "level",
        direction: "desc",
      },
    },
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "unverified-emails",
    name: "Email chưa xác thực",
    description: "Người dùng chưa xác thực email",
    filters: {
      emailVerified: false,
      statuses: ["PENDING_VERIFICATION"],
      sort: {
        field: "createdAt",
        direction: "asc",
      },
    },
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "high-risk-users",
    name: "Người dùng rủi ro cao",
    description: "Người dùng có điểm rủi ro cao (>= 7)",
    filters: {
      riskScoreRange: {
        min: 7,
      },
      statuses: ["ACTIVE"],
      sort: {
        field: "lastLoginAt",
        direction: "desc",
      },
    },
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Filter field labels
 * Labels cho các field filter
 */
export const FILTER_FIELD_LABELS: Record<string, string> = {
  search: "Tìm kiếm",
  roles: "Vai trò",
  statuses: "Trạng thái",
  levelRange: "Cấp độ",
  registrationDateRange: "Ngày đăng ký",
  lastLoginDateRange: "Đăng nhập cuối",
  emailVerified: "Email đã xác thực",
  hasActiveSession: "Có phiên hoạt động",
  riskScoreRange: "Điểm rủi ro",
  resourceAccessRange: "Lượt truy cập",
};

/**
 * Role labels
 * Labels cho roles
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  GUEST: "Khách",
  STUDENT: "Học viên",
  TUTOR: "Gia sư",
  TEACHER: "Giáo viên",
  ADMIN: "Quản trị viên",
};

/**
 * Status labels
 * Labels cho statuses
 */
export const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Hoạt động",
  SUSPENDED: "Tạm ngưng",
  PENDING_VERIFICATION: "Chờ xác thực",
};

/**
 * Sort field labels
 * Labels cho sort fields
 */
export const SORT_FIELD_LABELS: Record<string, string> = {
  name: "Tên",
  email: "Email",
  role: "Vai trò",
  status: "Trạng thái",
  level: "Cấp độ",
  createdAt: "Ngày tạo",
  lastLoginAt: "Đăng nhập cuối",
};

/**
 * Filter validation rules
 * Rules validation cho filter
 */
export const FILTER_VALIDATION_RULES = {
  levelRange: {
    min: 0,
    max: 100,
  },
  riskScoreRange: {
    min: 0,
    max: 10,
  },
  resourceAccessRange: {
    min: 0,
    max: 10000,
  },
  dateRange: {
    maxDays: 365, // Maximum 1 year range
  },
  search: {
    minLength: 2,
    maxLength: 100,
  },
} as const;
