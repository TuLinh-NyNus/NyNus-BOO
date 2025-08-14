/**
 * Admin Header Types
 * Consolidated header types for admin interface
 */

import { AdminUser } from '../user';

// ===== CORE HEADER INTERFACES =====

/**
 * Admin Header Props
 * Props cho AdminHeader component
 */
export interface AdminHeaderProps {
  className?: string;
  showBreadcrumb?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  variant?: 'default' | 'minimal' | 'elevated';
}

// ===== NOTIFICATION INTERFACES =====

/**
 * Admin Notification Interface
 * Interface cho notifications trong header
 */
export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  href?: string;
  icon?: string;
  data?: Record<string, unknown>;
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

// ===== SEARCH INTERFACES =====

/**
 * Search Category Interface
 * Interface cho search categories
 */
export interface SearchCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  searchPath: string;
}

/**
 * Search Suggestion Interface
 * Interface cho search suggestions
 */
export interface SearchSuggestion {
  id: string;
  title: string;
  text?: string;
  type?: 'user' | 'course' | 'question' | 'page';
  url?: string;
  href?: string;
  icon?: string;
  description?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Search Result Interface
 * Interface cho search results
 */
export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type?: 'user' | 'course' | 'question' | 'page';
  url?: string;
  href?: string;
  category?: string;
  icon?: string;
  relevance?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Search Response Interface
 * Interface cho search API response
 */
export interface SearchResponse {
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  total: number;
  took: number; // milliseconds
  categories: {
    users: SearchResult[];
    courses: SearchResult[];
    questions: SearchResult[];
    pages: SearchResult[];
  };
}

// ===== COMPONENT PROPS =====

/**
 * Search Bar Props
 * Props cho SearchBar component
 */
export interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showShortcut?: boolean;
  variant?: 'default' | 'compact' | 'large';
}

/**
 * Search Dropdown Props
 * Props cho SearchDropdown component
 */
export interface SearchDropdownProps {
  query?: string;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  onClose: () => void;
  className?: string;
}

/**
 * User Menu Props
 * Props cho UserMenu component
 */
export interface UserMenuProps {
  className?: string;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  variant?: 'default' | 'compact';
}

/**
 * Notification Dropdown Props
 * Props cho NotificationDropdown component
 */
export interface NotificationDropdownProps {
  className?: string;
  onNotificationClick?: (notification: AdminNotification) => void;
  onMarkAllRead?: () => void;
  maxNotifications?: number;
}

/**
 * Admin Search Props
 * Props cho AdminSearch component
 */
export interface AdminSearchProps {
  className?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  maxSuggestions?: number;
  debounceMs?: number;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
}

/**
 * Search Suggestions Props
 * Props cho SearchSuggestions component
 */
export interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  isLoading?: boolean;
  onSelect: (suggestion: SearchSuggestion) => void;
  onClose: () => void;
  className?: string;
}

/**
 * Admin User Menu Props
 * Props cho AdminUserMenu component
 */
export interface AdminUserMenuProps {
  user: AdminUser;
  className?: string;
  showProfile?: boolean;
  showSettings?: boolean;
  showLogout?: boolean;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

/**
 * Theme Toggle Props
 * Props cho ThemeToggle component
 */
export interface ThemeToggleProps {
  className?: string;
  variant?: 'button' | 'dropdown';
  showLabel?: boolean;
}

/**
 * Admin Notifications Props
 * Props cho AdminNotifications component
 */
export interface AdminNotificationsProps {
  className?: string;
  maxNotifications?: number;
  showMarkAllAsRead?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onNotificationClick?: (notification: AdminNotification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

/**
 * Notification Item Props
 * Props cho NotificationItem component
 */
export interface NotificationItemProps {
  notification: AdminNotification;
  onClick?: (notification: AdminNotification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  className?: string;
}

// ===== STATE & ACTIONS =====

/**
 * Header Search State
 * State cho header search functionality
 */
export interface HeaderSearchState {
  query: string;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  isOpen: boolean;
  selectedIndex: number;
  recentSearches: string[];
}

/**
 * Header Search Actions
 * Actions cho header search
 */
export interface HeaderSearchActions {
  setQuery: (query: string) => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  setLoading: (loading: boolean) => void;
  setOpen: (open: boolean) => void;
  setSelectedIndex: (index: number) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  selectSuggestion: (suggestion: SearchSuggestion) => void;
  performSearch: (query: string) => void;
}

/**
 * Header Notifications State
 * State cho header notifications
 */
export interface HeaderNotificationsState {
  notifications: AdminNotification[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;
  lastFetch: Date | null;
}

/**
 * Header Notifications Actions
 * Actions cho header notifications
 */
export interface HeaderNotificationsActions {
  setNotifications: (notifications: AdminNotification[]) => void;
  addNotification: (notification: AdminNotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  setLoading: (loading: boolean) => void;
  setOpen: (open: boolean) => void;
  refreshNotifications: () => void;
}

/**
 * Header User State
 * State cho header user menu
 */
export interface HeaderUserState {
  user: AdminUser | null;
  isLoading: boolean;
  isMenuOpen: boolean;
}

/**
 * Header User Actions
 * Actions cho header user menu
 */
export interface HeaderUserActions {
  setUser: (user: AdminUser | null) => void;
  setLoading: (loading: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  updateProfile: (updates: Partial<AdminUser>) => void;
  logout: () => void;
}

// ===== HOOK RETURN TYPES =====

/**
 * Use Admin Search Hook Return
 * Return type cho useAdminSearch hook
 */
export interface UseAdminSearchReturn {
  state: HeaderSearchState;
  actions: HeaderSearchActions;
}

/**
 * Use Admin Notifications Hook Return
 * Return type cho useAdminNotifications hook
 */
export interface UseAdminNotificationsReturn {
  state: HeaderNotificationsState;
  actions: HeaderNotificationsActions;
}

/**
 * Use Admin User Hook Return
 * Return type cho useAdminUser hook
 */
export interface UseAdminUserReturn {
  state: HeaderUserState;
  actions: HeaderUserActions;
}

// ===== CONFIGURATION =====

/**
 * Header Configuration
 * Configuration cho admin header
 */
export interface AdminHeaderConfig {
  search: {
    enabled: boolean;
    placeholder: string;
    maxSuggestions: number;
    debounceMs: number;
  };
  notifications: {
    enabled: boolean;
    maxDisplay: number;
    autoRefresh: boolean;
    refreshInterval: number;
  };
  userMenu: {
    enabled: boolean;
    showProfile: boolean;
    showSettings: boolean;
    showLogout: boolean;
  };
  theme: {
    enabled: boolean;
    variant: 'button' | 'dropdown';
    showLabel: boolean;
  };
}

/**
 * Default Header Configuration
 * Default config cho admin header
 */
export const DEFAULT_ADMIN_HEADER_CONFIG: AdminHeaderConfig = {
  search: {
    enabled: true,
    placeholder: 'Tìm kiếm người dùng, khóa học...',
    maxSuggestions: 8,
    debounceMs: 300
  },
  notifications: {
    enabled: true,
    maxDisplay: 10,
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  },
  userMenu: {
    enabled: true,
    showProfile: true,
    showSettings: true,
    showLogout: true
  },
  theme: {
    enabled: true,
    variant: 'dropdown',
    showLabel: false
  }
};

// ===== CONSTANTS =====

/**
 * Notification Type Colors
 * Colors cho notification types
 */
export const NOTIFICATION_TYPE_COLORS = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red'
} as const;

/**
 * Notification Type Icons
 * Icons cho notification types
 */
export const NOTIFICATION_TYPE_ICONS = {
  info: 'Info',
  success: 'CheckCircle',
  warning: 'AlertTriangle',
  error: 'AlertCircle'
} as const;

/**
 * Search Type Icons
 * Icons cho search result types
 */
export const SEARCH_TYPE_ICONS = {
  user: 'User',
  course: 'BookOpen',
  question: 'FileQuestion',
  page: 'FileText'
} as const;
