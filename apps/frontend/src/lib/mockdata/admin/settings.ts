// Mock data for settings - Admin management
import { AdminSettings, MockPagination, MockApiResponse } from '../shared/core-types';

// Mock settings data với realistic configuration
export const mockSettings: AdminSettings[] = [
  // System Settings
  {
    id: 'setting-001',
    category: 'System',
    key: 'site_name',
    value: 'NyNus - Hệ thống học tập trực tuyến',
    type: 'string',
    description: 'Tên của website hiển thị trên title và header',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-10T00:00:00Z')
  },
  {
    id: 'setting-002',
    category: 'System',
    key: 'site_description',
    value: 'Nền tảng học tập trực tuyến hàng đầu Việt Nam với hàng nghìn khóa học chất lượng cao',
    type: 'string',
    description: 'Mô tả website cho SEO và social media',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-08T00:00:00Z')
  },
  {
    id: 'setting-003',
    category: 'System',
    key: 'maintenance_mode',
    value: 'false',
    type: 'boolean',
    description: 'Bật/tắt chế độ bảo trì website',
    isPublic: false,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-15T00:00:00Z')
  },
  {
    id: 'setting-004',
    category: 'System',
    key: 'max_upload_size',
    value: '50',
    type: 'number',
    description: 'Kích thước tối đa file upload (MB)',
    isPublic: false,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-12T00:00:00Z')
  },

  // Authentication Settings
  {
    id: 'setting-005',
    category: 'Authentication',
    key: 'session_timeout',
    value: '3600',
    type: 'number',
    description: 'Thời gian timeout session (giây)',
    isPublic: false,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-14T00:00:00Z')
  },
  {
    id: 'setting-006',
    category: 'Authentication',
    key: 'password_min_length',
    value: '8',
    type: 'number',
    description: 'Độ dài tối thiểu của mật khẩu',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-05T00:00:00Z')
  },
  {
    id: 'setting-007',
    category: 'Authentication',
    key: 'max_login_attempts',
    value: '5',
    type: 'number',
    description: 'Số lần đăng nhập sai tối đa trước khi khóa tài khoản',
    isPublic: false,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-11T00:00:00Z')
  },
  {
    id: 'setting-008',
    category: 'Authentication',
    key: 'enable_2fa',
    value: 'true',
    type: 'boolean',
    description: 'Bật/tắt xác thực 2 yếu tố',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-09T00:00:00Z')
  },

  // Email Settings
  {
    id: 'setting-009',
    category: 'Email',
    key: 'smtp_host',
    value: 'smtp.gmail.com',
    type: 'string',
    description: 'SMTP server host',
    isPublic: false,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-07T00:00:00Z')
  },
  {
    id: 'setting-010',
    category: 'Email',
    key: 'smtp_port',
    value: '587',
    type: 'number',
    description: 'SMTP server port',
    isPublic: false,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-07T00:00:00Z')
  },
  {
    id: 'setting-011',
    category: 'Email',
    key: 'from_email',
    value: 'noreply@nynus.edu.vn',
    type: 'string',
    description: 'Email gửi đi mặc định',
    isPublic: false,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-06T00:00:00Z')
  },
  {
    id: 'setting-012',
    category: 'Email',
    key: 'from_name',
    value: 'NyNus Education',
    type: 'string',
    description: 'Tên hiển thị khi gửi email',
    isPublic: false,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-06T00:00:00Z')
  },

  // Learning Settings
  {
    id: 'setting-013',
    category: 'Learning',
    key: 'default_video_quality',
    value: '720p',
    type: 'string',
    description: 'Chất lượng video mặc định',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-13T00:00:00Z')
  },
  {
    id: 'setting-014',
    category: 'Learning',
    key: 'auto_play_next',
    value: 'true',
    type: 'boolean',
    description: 'Tự động phát video tiếp theo',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-10T00:00:00Z')
  },
  {
    id: 'setting-015',
    category: 'Learning',
    key: 'quiz_time_limit',
    value: '1800',
    type: 'number',
    description: 'Thời gian làm bài quiz mặc định (giây)',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-08T00:00:00Z')
  },
  {
    id: 'setting-016',
    category: 'Learning',
    key: 'passing_score',
    value: '70',
    type: 'number',
    description: 'Điểm đạt tối thiểu (%)',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-04T00:00:00Z')
  },

  // Payment Settings
  {
    id: 'setting-017',
    category: 'Payment',
    key: 'currency',
    value: 'VND',
    type: 'string',
    description: 'Đơn vị tiền tệ',
    isPublic: true,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 'setting-018',
    category: 'Payment',
    key: 'tax_rate',
    value: '10',
    type: 'number',
    description: 'Thuế VAT (%)',
    isPublic: true,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 'setting-019',
    category: 'Payment',
    key: 'refund_period',
    value: '7',
    type: 'number',
    description: 'Thời gian được hoàn tiền (ngày)',
    isPublic: true,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-03T00:00:00Z')
  },

  // Notification Settings
  {
    id: 'setting-020',
    category: 'Notification',
    key: 'email_notifications',
    value: 'true',
    type: 'boolean',
    description: 'Bật/tắt thông báo qua email',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-12T00:00:00Z')
  },
  {
    id: 'setting-021',
    category: 'Notification',
    key: 'push_notifications',
    value: 'true',
    type: 'boolean',
    description: 'Bật/tắt push notifications',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-11T00:00:00Z')
  },
  {
    id: 'setting-022',
    category: 'Notification',
    key: 'notification_frequency',
    value: 'daily',
    type: 'string',
    description: 'Tần suất gửi thông báo tổng hợp',
    isPublic: true,
    updatedBy: 'admin-001',
    updatedAt: new Date('2025-01-09T00:00:00Z')
  },

  // SEO Settings
  {
    id: 'setting-023',
    category: 'SEO',
    key: 'meta_keywords',
    value: 'học trực tuyến, khóa học online, giáo dục, NyNus, THPT, đại học',
    type: 'string',
    description: 'Meta keywords cho SEO',
    isPublic: true,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-05T00:00:00Z')
  },
  {
    id: 'setting-024',
    category: 'SEO',
    key: 'google_analytics_id',
    value: 'GA-XXXXXXXXX',
    type: 'string',
    description: 'Google Analytics tracking ID',
    isPublic: false,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-02T00:00:00Z')
  },
  {
    id: 'setting-025',
    category: 'SEO',
    key: 'facebook_pixel_id',
    value: 'FB-XXXXXXXXX',
    type: 'string',
    description: 'Facebook Pixel ID',
    isPublic: false,
    updatedBy: 'admin-002',
    updatedAt: new Date('2025-01-02T00:00:00Z')
  }
];

// Settings statistics
export const mockSettingsStats = {
  totalSettings: 25,
  publicSettings: 15,
  privateSettings: 10,
  settingsByCategory: {
    'System': 4,
    'Authentication': 4,
    'Email': 4,
    'Learning': 4,
    'Payment': 3,
    'Notification': 3,
    'SEO': 3
  },
  recentlyUpdated: [
    { id: 'setting-003', key: 'maintenance_mode', updatedAt: new Date('2025-01-15T00:00:00Z') },
    { id: 'setting-005', key: 'session_timeout', updatedAt: new Date('2025-01-14T00:00:00Z') },
    { id: 'setting-013', key: 'default_video_quality', updatedAt: new Date('2025-01-13T00:00:00Z') },
    { id: 'setting-004', key: 'max_upload_size', updatedAt: new Date('2025-01-12T00:00:00Z') },
    { id: 'setting-020', key: 'email_notifications', updatedAt: new Date('2025-01-12T00:00:00Z') }
  ]
};

// Helper functions for settings management
export function getSettingById(id: string): AdminSettings | undefined {
  return mockSettings.find(setting => setting.id === id);
}

export function getSettingByKey(key: string): AdminSettings | undefined {
  return mockSettings.find(setting => setting.key === key);
}

export function getSettingsByCategory(category: string): AdminSettings[] {
  return mockSettings.filter(setting => setting.category === category);
}

export function getPublicSettings(): AdminSettings[] {
  return mockSettings.filter(setting => setting.isPublic);
}

export function getPrivateSettings(): AdminSettings[] {
  return mockSettings.filter(setting => !setting.isPublic);
}

export function getSettingsByType(type: 'string' | 'number' | 'boolean' | 'json'): AdminSettings[] {
  return mockSettings.filter(setting => setting.type === type);
}

export function searchSettings(query: string): AdminSettings[] {
  const searchTerm = query.toLowerCase();
  return mockSettings.filter(setting => 
    setting.key.toLowerCase().includes(searchTerm) ||
    setting.description.toLowerCase().includes(searchTerm) ||
    setting.category.toLowerCase().includes(searchTerm)
  );
}

// Helper function to get setting value with type conversion
export function getSettingValue(key: string): string | number | boolean | object | null {
  const setting = getSettingByKey(key);
  if (!setting) return null;

  switch (setting.type) {
    case 'number':
      return parseFloat(setting.value);
    case 'boolean':
      return setting.value === 'true';
    case 'json':
      try {
        return JSON.parse(setting.value);
      } catch {
        return setting.value;
      }
    default:
      return setting.value;
  }
}

// Mock API responses
export function getMockSettingsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    category?: string;
    type?: 'string' | 'number' | 'boolean' | 'json';
    isPublic?: boolean;
    search?: string;
  }
): MockApiResponse<{ settings: AdminSettings[]; pagination: MockPagination }> {
  let filteredSettings = [...mockSettings];

  // Apply filters
  if (filters?.category) {
    filteredSettings = filteredSettings.filter(s => s.category === filters.category);
  }
  if (filters?.type) {
    filteredSettings = filteredSettings.filter(s => s.type === filters.type);
  }
  if (filters?.isPublic !== undefined) {
    filteredSettings = filteredSettings.filter(s => s.isPublic === filters.isPublic);
  }
  if (filters?.search) {
    filteredSettings = searchSettings(filters.search);
  }

  // Sort by category, then by key
  filteredSettings.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.key.localeCompare(b.key);
  });

  // Apply pagination
  const total = filteredSettings.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedSettings = filteredSettings.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      settings: paginatedSettings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  };
}

export function getMockSettingsStatsResponse(): MockApiResponse<typeof mockSettingsStats> {
  return {
    success: true,
    data: mockSettingsStats,
    message: 'Settings statistics retrieved successfully'
  };
}
