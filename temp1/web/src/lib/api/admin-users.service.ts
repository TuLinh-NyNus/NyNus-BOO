import { apiClient } from './client';

// Types
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'GUEST';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  maxConcurrentIPs: number;
  profile?: {
    bio?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    completionRate: number;
  };
  stats?: {
    totalCourses: number;
    totalEnrollments: number;
    totalExamResults: number;
  };
}

export interface AdminUserListResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search?: string;
    role?: string;
    isActive?: boolean;
    createdFrom?: string;
    createdTo?: string;
    sortBy: string;
    sortOrder: string;
  };
}

export interface AdminUserFilterParams {
  search?: string;
  role?: string;
  isActive?: boolean;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminCreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'GUEST';
  isActive?: boolean;
  adminNotes?: string;
}

export interface AdminUpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'GUEST';
  isActive?: boolean;
  adminNotes?: string;
}

export interface AdminResetPasswordRequest {
  newPassword?: string;
  forcePasswordChange?: boolean;
}

export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: {
    ADMIN: number;
    INSTRUCTOR: number;
    STUDENT: number;
    GUEST: number;
  };
  recentRegistrations: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  userGrowth: {
    date: string;
    count: number;
  }[];
}

export interface SystemStatsResponse {
  users: UserStatsResponse;
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
  };
  questions: {
    total: number;
    published: number;
  };
}

/**
 * Admin Users Service
 */
export const adminUsersService = {
  /**
   * Lấy danh sách users với filter và pagination
   */
  getUsers: async (params?: AdminUserFilterParams): Promise<AdminUserListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.createdFrom) searchParams.append('createdFrom', params.createdFrom);
    if (params?.createdTo) searchParams.append('createdTo', params.createdTo);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    return apiClient.get<AdminUserListResponse>(`/admin/users?${searchParams.toString()}`);
  },

  /**
   * Lấy thông tin chi tiết một user
   */
  getUserById: async (id: string): Promise<AdminUser> => {
    return apiClient.get<AdminUser>(`/admin/users/${id}`);
  },

  /**
   * Tạo user mới
   */
  createUser: async (data: AdminCreateUserRequest): Promise<AdminUser> => {
    return apiClient.post<AdminUser>('/admin/users', data);
  },

  /**
   * Cập nhật thông tin user
   */
  updateUser: async (id: string, data: AdminUpdateUserRequest): Promise<AdminUser> => {
    return apiClient.put<AdminUser>(`/admin/users/${id}`, data);
  },

  /**
   * Xóa user (soft delete)
   */
  deleteUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/admin/users/${id}`);
  },

  /**
   * Reset password cho user
   */
  resetUserPassword: async (id: string, data: AdminResetPasswordRequest): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(`/admin/users/${id}/reset-password`, data);
  },
};

/**
 * Admin Stats Service
 */
export const adminStatsService = {
  /**
   * Lấy thống kê users
   */
  getUserStats: async (): Promise<UserStatsResponse> => {
    return apiClient.get<UserStatsResponse>('/admin/stats/users');
  },

  /**
   * Lấy thống kê tổng quan hệ thống
   */
  getSystemStats: async (): Promise<SystemStatsResponse> => {
    return apiClient.get<SystemStatsResponse>('/admin/stats/system');
  },

  /**
   * Lấy top active users
   */
  getTopActiveUsers: async (limit?: number): Promise<AdminUser[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiClient.get<AdminUser[]>(`/admin/stats/top-users${params}`);
  },

  /**
   * Lấy thống kê hoạt động
   */
  getActivityStats: async (days?: number): Promise<{ type: string; count: number }[]> => {
    const params = days ? `?days=${days}` : '';
    return apiClient.get<{ type: string; count: number }[]>(`/admin/stats/activity${params}`);
  },
};
