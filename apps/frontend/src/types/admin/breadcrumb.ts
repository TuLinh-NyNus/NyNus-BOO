/**
 * Admin Breadcrumb Types
 * Type definitions cho admin breadcrumb components
 */

import { ReactNode } from 'react';

/**
 * Breadcrumb Item Interface
 * Interface cho breadcrumb items
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
  icon?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Admin Breadcrumb Props
 * Props cho AdminBreadcrumb component
 */
export interface AdminBreadcrumbProps {
  className?: string;
  items?: BreadcrumbItem[];
  showHome?: boolean;
  homeIcon?: string;
  separator?: ReactNode;
  maxItems?: number;
  showOverflow?: boolean;
}

/**
 * Breadcrumb Item Props
 * Props cho BreadcrumbItem component
 */
export interface BreadcrumbItemProps {
  item: BreadcrumbItem;
  isLast?: boolean;
  separator?: ReactNode;
  className?: string;
  onClick?: (item: BreadcrumbItem) => void;
}

/**
 * Breadcrumb Separator Props
 * Props cho BreadcrumbSeparator component
 */
export interface BreadcrumbSeparatorProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Custom Breadcrumb Props
 * Props cho AdminBreadcrumbCustom component
 */
export interface AdminBreadcrumbCustomProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: ReactNode;
}

/**
 * Breadcrumb Generation Options
 * Options cho breadcrumb generation
 */
export interface BreadcrumbGenerationOptions {
  showHome: boolean;
  homeLabel: string;
  homeHref: string;
  homeIcon?: string;
  maxItems?: number;
  customLabels?: Record<string, string>;
  excludeSegments?: string[];
  includeQuery?: boolean;
}

/**
 * Default Breadcrumb Generation Options
 * Default options cho breadcrumb generation
 */
export const DEFAULT_BREADCRUMB_OPTIONS: BreadcrumbGenerationOptions = {
  showHome: true,
  homeLabel: 'Dashboard',
  homeHref: '/3141592654/admin',
  homeIcon: 'Home',
  maxItems: 5,
  customLabels: {},
  excludeSegments: ['3141592654'],
  includeQuery: false
};

/**
 * Breadcrumb State Interface
 * Interface cho breadcrumb state
 */
export interface BreadcrumbState {
  items: BreadcrumbItem[];
  currentPath: string;
  isLoading: boolean;
  customItems: BreadcrumbItem[] | null;
}

/**
 * Breadcrumb Actions Interface
 * Interface cho breadcrumb actions
 */
export interface BreadcrumbActions {
  setItems: (items: BreadcrumbItem[]) => void;
  setCurrentPath: (path: string) => void;
  setLoading: (loading: boolean) => void;
  setCustomItems: (items: BreadcrumbItem[] | null) => void;
  generateFromPath: (pathname: string, options?: Partial<BreadcrumbGenerationOptions>) => void;
  addItem: (item: BreadcrumbItem) => void;
  removeItem: (index: number) => void;
  clearItems: () => void;
}

/**
 * Use Breadcrumb Hook Return
 * Return type cho useBreadcrumb hook
 */
export interface UseBreadcrumbReturn {
  state: BreadcrumbState;
  actions: BreadcrumbActions;
  generateItems: (pathname: string) => BreadcrumbItem[];
}

/**
 * Breadcrumb Configuration
 * Configuration cho admin breadcrumb
 */
export interface AdminBreadcrumbConfig {
  generation: BreadcrumbGenerationOptions;
  display: {
    showIcons: boolean;
    showSeparators: boolean;
    maxItems: number;
    showOverflow: boolean;
    overflowPosition: 'start' | 'middle' | 'end';
  };
  styling: {
    variant: 'default' | 'minimal' | 'pills';
    size: 'sm' | 'md' | 'lg';
    spacing: 'tight' | 'normal' | 'loose';
  };
  behavior: {
    clickable: boolean;
    showTooltips: boolean;
    truncateLabels: boolean;
    maxLabelLength: number;
  };
}

/**
 * Default Breadcrumb Configuration
 * Default config cho admin breadcrumb
 */
export const DEFAULT_ADMIN_BREADCRUMB_CONFIG: AdminBreadcrumbConfig = {
  generation: DEFAULT_BREADCRUMB_OPTIONS,
  display: {
    showIcons: true,
    showSeparators: true,
    maxItems: 5,
    showOverflow: true,
    overflowPosition: 'middle'
  },
  styling: {
    variant: 'default',
    size: 'md',
    spacing: 'normal'
  },
  behavior: {
    clickable: true,
    showTooltips: false,
    truncateLabels: true,
    maxLabelLength: 30
  }
};

/**
 * Page Metadata Interface
 * Interface cho page metadata (for breadcrumbs)
 */
export interface PageMetadata {
  path: string;
  title: string;
  description?: string;
  icon?: string;
  parent?: string;
  customBreadcrumbs?: BreadcrumbItem[];
  breadcrumbOptions?: Partial<BreadcrumbGenerationOptions>;
}

/**
 * Breadcrumb Context Value
 * Context value cho BreadcrumbProvider
 */
export interface BreadcrumbContextValue {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
  setCustomItems: (items: BreadcrumbItem[] | null) => void;
  generateFromPath: (pathname: string) => void;
  config: AdminBreadcrumbConfig;
}

/**
 * Breadcrumb Provider Props
 * Props cho BreadcrumbProvider
 */
export interface BreadcrumbProviderProps {
  children: ReactNode;
  config?: Partial<AdminBreadcrumbConfig>;
  pageMetadata?: Record<string, PageMetadata>;
}

/**
 * Breadcrumb Label Mapping
 * Type cho breadcrumb label mapping
 */
export type BreadcrumbLabelMapping = Record<string, string>;

/**
 * Default Breadcrumb Labels
 * Default labels cho breadcrumb segments
 */
export const DEFAULT_BREADCRUMB_LABELS: BreadcrumbLabelMapping = {
  'admin': 'Dashboard',
  'users': 'Quản lý người dùng',
  'questions': 'Quản lý câu hỏi',
  'create': 'Tạo mới',
  'edit': 'Chỉnh sửa',
  'view': 'Xem chi tiết',
  'analytics': 'Thống kê',
  'settings': 'Cài đặt',
  'roles': 'Phân quyền',
  'permissions': 'Quyền hạn',
  'audit': 'Kiểm toán',
  'security': 'Bảo mật',
  'sessions': 'Phiên làm việc',
  'notifications': 'Thông báo',
  'books': 'Sách',
  'faq': 'FAQ',
  'resources': 'Tài nguyên',
  'level-progression': 'Cấp độ',
  'mapcode': 'Mapcode'
};

/**
 * Breadcrumb Generation Function Type
 * Type cho breadcrumb generation function
 */
export type BreadcrumbGenerationFunction = (
  pathname: string,
  options?: Partial<BreadcrumbGenerationOptions>
) => BreadcrumbItem[];

/**
 * Breadcrumb Utilities Interface
 * Interface cho breadcrumb utilities
 */
export interface BreadcrumbUtils {
  generateItems: BreadcrumbGenerationFunction;
  getLabelFromSegment: (segment: string, customLabels?: BreadcrumbLabelMapping) => string;
  isValidSegment: (segment: string, excludeSegments?: string[]) => boolean;
  truncateLabel: (label: string, maxLength: number) => string;
  formatPath: (segments: string[]) => string;
}
