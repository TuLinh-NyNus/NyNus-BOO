/**
 * Breadcrumb Labels và Generation Logic
 * Utilities cho breadcrumb generation và label mapping
 */

import { BreadcrumbItem, BreadcrumbGenerationOptions, DEFAULT_BREADCRUMB_OPTIONS } from '@/types/admin/breadcrumb';

/**
 * Breadcrumb Labels Mapping
 * Mapping từ path segments sang Vietnamese labels
 */
export const BREADCRUMB_LABELS: Record<string, string> = {
  // Main sections
  'admin': 'Dashboard',
  'dashboard': 'Dashboard',
  
  // User management
  'users': 'Quản lý người dùng',
  'user': 'Người dùng',
  
  // Question management
  'questions': 'Quản lý câu hỏi',
  'question': 'Câu hỏi',
  
  // Content management
  'books': 'Quản lý sách',
  'book': 'Sách',
  'faq': 'Câu hỏi thường gặp',
  'resources': 'Tài nguyên',
  'resource': 'Tài nguyên',
  
  // Analytics và reports
  'analytics': 'Thống kê',
  'reports': 'Báo cáo',
  'report': 'Báo cáo',
  
  // System management
  'roles': 'Phân quyền',
  'role': 'Vai trò',
  'permissions': 'Quyền hạn',
  'permission': 'Quyền hạn',
  'audit': 'Kiểm toán',
  'security': 'Bảo mật',
  'sessions': 'Phiên làm việc',
  'session': 'Phiên làm việc',
  'notifications': 'Thông báo',
  'notification': 'Thông báo',
  'settings': 'Cài đặt',
  'setting': 'Cài đặt',
  
  // Advanced features
  'level-progression': 'Cấp độ',
  'level': 'Cấp độ',
  'mapcode': 'Mapcode',
  'progression': 'Tiến độ',
  
  // Actions
  'create': 'Tạo mới',
  'new': 'Tạo mới',
  'add': 'Thêm mới',
  'edit': 'Chỉnh sửa',
  'update': 'Cập nhật',
  'view': 'Xem chi tiết',
  'detail': 'Chi tiết',
  'details': 'Chi tiết',
  'delete': 'Xóa',
  'remove': 'Xóa',
  'import': 'Nhập dữ liệu',
  'export': 'Xuất dữ liệu',
  'backup': 'Sao lưu',
  'restore': 'Khôi phục',
  
  // Status
  'active': 'Đang hoạt động',
  'inactive': 'Không hoạt động',
  'pending': 'Đang chờ',
  'approved': 'Đã duyệt',
  'rejected': 'Đã từ chối',
  'draft': 'Bản nháp',
  'published': 'Đã xuất bản',
  
  // Common terms
  'list': 'Danh sách',
  'search': 'Tìm kiếm',
  'filter': 'Lọc',
  'sort': 'Sắp xếp',
  'config': 'Cấu hình',
  'configuration': 'Cấu hình',
  'profile': 'Hồ sơ',
  'account': 'Tài khoản',
  'password': 'Mật khẩu',
  'email': 'Email',
  'phone': 'Số điện thoại',
  'address': 'Địa chỉ',
  'info': 'Thông tin',
  'information': 'Thông tin'
};

/**
 * Generate breadcrumb items từ pathname
 * Function chính để generate breadcrumb items từ current pathname
 */
export function generateBreadcrumbItems(
  pathname: string,
  options: Partial<BreadcrumbGenerationOptions> = {}
): BreadcrumbItem[] {
  const config = { ...DEFAULT_BREADCRUMB_OPTIONS, ...options };
  const items: BreadcrumbItem[] = [];

  // Add home breadcrumb if enabled
  if (config.showHome) {
    items.push({
      label: config.homeLabel,
      href: config.homeHref,
      icon: config.homeIcon,
      isActive: pathname === config.homeHref
    });
  }

  // Parse pathname segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Find admin section start
  const adminIndex = segments.findIndex(segment => segment === '3141592654');
  if (adminIndex === -1) return items;

  // Get admin path segments (skip '3141592654' and 'admin')
  const adminSegments = segments.slice(adminIndex + 2);
  
  // Filter out excluded segments
  const filteredSegments = adminSegments.filter(segment => 
    !config.excludeSegments?.includes(segment)
  );

  // Build breadcrumb items
  let currentPath = config.homeHref;

  filteredSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === filteredSegments.length - 1;

    // Get label from mapping or custom labels
    const label = getLabelFromSegment(segment, config.customLabels);

    // Skip if label is empty or invalid
    if (!label || !isValidSegment(segment, config.excludeSegments)) {
      return;
    }

    // Skip segment 'dashboard' nếu nó trùng với home label để tránh duplicate
    if (segment === 'dashboard' && config.showHome && config.homeLabel === 'Dashboard') {
      return;
    }

    items.push({
      label,
      href: currentPath,
      isActive: isLast,
      metadata: {
        segment,
        index,
        isLast
      }
    });
  });

  // Apply max items limit
  if (config.maxItems && items.length > config.maxItems) {
    const homeItems = config.showHome ? [items[0]] : [];
    const endItems = items.slice(-(config.maxItems - homeItems.length));
    return [...homeItems, ...endItems];
  }

  return items;
}

/**
 * Get label từ segment
 * Lấy label từ segment với fallback logic
 */
export function getLabelFromSegment(
  segment: string,
  customLabels?: Record<string, string>
): string {
  // Check custom labels first
  if (customLabels && customLabels[segment]) {
    return customLabels[segment];
  }

  // Check default labels
  if (BREADCRUMB_LABELS[segment]) {
    return BREADCRUMB_LABELS[segment];
  }

  // Check if segment is a UUID or ID pattern
  if (isUUIDPattern(segment) || isIDPattern(segment)) {
    return 'Chi tiết';
  }

  // Fallback: capitalize first letter và replace dashes/underscores
  return segment
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if segment is valid
 * Kiểm tra xem segment có hợp lệ không
 */
export function isValidSegment(
  segment: string,
  excludeSegments?: string[]
): boolean {
  // Check exclude list
  if (excludeSegments && excludeSegments.includes(segment)) {
    return false;
  }

  // Check if segment is empty or only special characters
  if (!segment || /^[^a-zA-Z0-9]+$/.test(segment)) {
    return false;
  }

  return true;
}

/**
 * Check if segment is UUID pattern
 * Kiểm tra xem segment có phải là UUID không
 */
function isUUIDPattern(segment: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(segment);
}

/**
 * Check if segment is ID pattern
 * Kiểm tra xem segment có phải là ID pattern không
 */
function isIDPattern(segment: string): boolean {
  // Check for common ID patterns
  return /^(id-|user-|question-|book-|role-)\d+$/.test(segment) ||
         /^\d+$/.test(segment) ||
         /^[a-zA-Z]+-\d+$/.test(segment);
}

/**
 * Truncate label if too long
 * Cắt ngắn label nếu quá dài
 */
export function truncateLabel(label: string, maxLength: number): string {
  if (label.length <= maxLength) {
    return label;
  }

  return label.substring(0, maxLength - 3) + '...';
}

/**
 * Format path từ segments
 * Format path từ array of segments
 */
export function formatPath(segments: string[]): string {
  return '/' + segments.filter(Boolean).join('/');
}

/**
 * Get breadcrumb context
 * Lấy context information cho breadcrumb
 */
export function getBreadcrumbContext(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const adminIndex = segments.findIndex(segment => segment === '3141592654');
  
  if (adminIndex === -1) {
    return {
      isAdminPath: false,
      section: null,
      subsection: null,
      action: null
    };
  }

  const adminSegments = segments.slice(adminIndex + 2);
  
  return {
    isAdminPath: true,
    section: adminSegments[0] || null,
    subsection: adminSegments[1] || null,
    action: adminSegments[2] || null,
    segments: adminSegments
  };
}

/**
 * Breadcrumb utilities object
 * Object chứa tất cả utility functions
 */
export const BreadcrumbUtils = {
  generateItems: generateBreadcrumbItems,
  getLabelFromSegment,
  isValidSegment,
  truncateLabel,
  formatPath,
  getBreadcrumbContext,
  
  // Convenience methods
  isUUID: isUUIDPattern,
  isID: isIDPattern,
  
  // Constants
  LABELS: BREADCRUMB_LABELS,
  DEFAULT_OPTIONS: DEFAULT_BREADCRUMB_OPTIONS
} as const;

export default BreadcrumbUtils;
