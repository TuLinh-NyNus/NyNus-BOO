/**
 * Admin Search Configuration
 * Search configuration và utilities cho admin header
 */

import { Search, Users, FileQuestion, BookOpen, Settings, BarChart3, Shield, Bell } from 'lucide-react';
import { SearchSuggestion, SearchCategory, SearchResult } from '@/types/admin/header';

/**
 * Search Categories
 * Categories cho search functionality
 */
export const SEARCH_CATEGORIES: SearchCategory[] = [
  {
    id: 'users',
    name: 'Người dùng',
    icon: 'Users',
    color: 'blue',
    searchPath: '/3141592654/admin/users'
  },
  {
    id: 'questions',
    name: 'Câu hỏi',
    icon: 'FileQuestion',
    color: 'green',
    searchPath: '/3141592654/admin/questions'
  },
  {
    id: 'books',
    name: 'Sách',
    icon: 'BookOpen',
    color: 'purple',
    searchPath: '/3141592654/admin/books'
  },
  {
    id: 'analytics',
    name: 'Thống kê',
    icon: 'BarChart3',
    color: 'orange',
    searchPath: '/3141592654/admin/analytics'
  },
  {
    id: 'settings',
    name: 'Cài đặt',
    icon: 'Settings',
    color: 'gray',
    searchPath: '/3141592654/admin/settings'
  }
];

/**
 * Quick Search Suggestions
 * Suggestions nhanh cho search
 */
export const QUICK_SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  {
    id: 'users-active',
    title: 'Người dùng đang hoạt động',
    description: 'Xem danh sách người dùng đang online',
    category: 'users',
    href: '/3141592654/admin/users?status=active',
    icon: 'Users'
  },
  {
    id: 'questions-pending',
    title: 'Câu hỏi chờ duyệt',
    description: 'Câu hỏi cần được xem xét và phê duyệt',
    category: 'questions',
    href: '/3141592654/admin/questions?status=pending',
    icon: 'FileQuestion'
  },
  {
    id: 'analytics-today',
    title: 'Thống kê hôm nay',
    description: 'Xem báo cáo hoạt động trong ngày',
    category: 'analytics',
    href: '/3141592654/admin/analytics?period=today',
    icon: 'BarChart3'
  },
  {
    id: 'books-popular',
    title: 'Sách phổ biến',
    description: 'Danh sách sách được đọc nhiều nhất',
    category: 'books',
    href: '/3141592654/admin/books?sort=popular',
    icon: 'BookOpen'
  },
  {
    id: 'security-logs',
    title: 'Nhật ký bảo mật',
    description: 'Xem các hoạt động bảo mật gần đây',
    category: 'settings',
    href: '/3141592654/admin/security/logs',
    icon: 'Shield'
  }
];

/**
 * Popular Searches
 * Các tìm kiếm phổ biến
 */
export const POPULAR_SEARCHES: string[] = [
  'người dùng mới',
  'câu hỏi khó',
  'thống kê tháng',
  'sách bestseller',
  'cài đặt email',
  'phân quyền admin',
  'backup dữ liệu',
  'performance report'
];

/**
 * Search Icon Mapping
 * Mapping từ icon string sang React component
 */
export const SEARCH_ICON_COMPONENTS = {
  Search,
  Users,
  FileQuestion,
  BookOpen,
  Settings,
  BarChart3,
  Shield,
  Bell
} as const;

/**
 * Get Search Icon Component
 * Function để lấy search icon component từ string
 */
export function getSearchIconComponent(iconName: string) {
  return SEARCH_ICON_COMPONENTS[iconName as keyof typeof SEARCH_ICON_COMPONENTS] || Search;
}

/**
 * Search Configuration
 * Configuration cho search functionality
 */
export const SEARCH_CONFIG = {
  // Search behavior
  minQueryLength: 2,
  maxSuggestions: 8,
  searchDelay: 300, // ms
  
  // UI settings
  showCategories: true,
  showPopularSearches: true,
  showQuickSuggestions: true,
  
  // Results settings
  maxResultsPerCategory: 5,
  highlightMatches: true,
  
  // Keyboard shortcuts
  shortcuts: {
    open: 'cmd+k',
    close: 'escape',
    navigate: 'arrow',
    select: 'enter'
  }
} as const;

/**
 * Search Utilities
 * Utility functions cho search functionality
 */
export const SearchUtils = {
  /**
   * Filter suggestions by query
   * Lọc suggestions theo query
   */
  filterSuggestions: (
    suggestions: SearchSuggestion[], 
    query: string, 
    maxResults: number = SEARCH_CONFIG.maxSuggestions
  ): SearchSuggestion[] => {
    if (!query || query.length < SEARCH_CONFIG.minQueryLength) {
      return suggestions.slice(0, maxResults);
    }

    const searchQuery = query.toLowerCase();
    
    return suggestions
      .filter(suggestion =>
        suggestion.title.toLowerCase().includes(searchQuery) ||
        (suggestion.description && suggestion.description.toLowerCase().includes(searchQuery))
      )
      .slice(0, maxResults);
  },

  /**
   * Get category by ID
   * Lấy category theo ID
   */
  getCategoryById: (categoryId: string): SearchCategory | null => {
    return SEARCH_CATEGORIES.find(category => category.id === categoryId) || null;
  },

  /**
   * Get suggestions by category
   * Lấy suggestions theo category
   */
  getSuggestionsByCategory: (categoryId: string): SearchSuggestion[] => {
    return QUICK_SEARCH_SUGGESTIONS.filter(suggestion => suggestion.category === categoryId);
  },

  /**
   * Highlight search matches
   * Highlight text matches trong search results
   */
  highlightMatches: (text: string, query: string): string => {
    if (!query || !SEARCH_CONFIG.highlightMatches) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  /**
   * Format search query
   * Format search query cho API calls
   */
  formatSearchQuery: (query: string): string => {
    return query.trim().toLowerCase();
  },

  /**
   * Get search URL
   * Tạo search URL cho category
   */
  getSearchUrl: (categoryId: string, query?: string): string => {
    const category = SearchUtils.getCategoryById(categoryId);
    if (!category) return '/3141592654/admin';

    const baseUrl = category.searchPath;
    if (query) {
      const encodedQuery = encodeURIComponent(query);
      return `${baseUrl}?search=${encodedQuery}`;
    }

    return baseUrl;
  },

  /**
   * Track search event
   * Track search events cho analytics
   */
  trackSearchEvent: (eventType: string, data: Record<string, unknown>): void => {
    // Implementation for search analytics
    console.log('Search Event:', eventType, data);
  },

  /**
   * Debounce search
   * Debounce search input
   */
  debounceSearch: <T extends unknown[]>(
    func: (...args: T) => void,
    delay: number = SEARCH_CONFIG.searchDelay
  ) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * Parse search shortcuts
   * Parse keyboard shortcuts
   */
  parseShortcut: (shortcut: string): { key: string; modifiers: string[] } => {
    const parts = shortcut.split('+');
    const key = parts.pop() || '';
    const modifiers = parts;
    
    return { key, modifiers };
  },

  /**
   * Check if shortcut matches event
   * Kiểm tra xem keyboard event có match với shortcut không
   */
  matchesShortcut: (event: KeyboardEvent, shortcut: string): boolean => {
    const { key, modifiers } = SearchUtils.parseShortcut(shortcut);
    
    const eventKey = event.key.toLowerCase();
    const targetKey = key.toLowerCase();
    
    if (eventKey !== targetKey) return false;
    
    const hasCmd = modifiers.includes('cmd') && (event.metaKey || event.ctrlKey);
    const hasShift = modifiers.includes('shift') && event.shiftKey;
    const hasAlt = modifiers.includes('alt') && event.altKey;
    
    return (!modifiers.includes('cmd') || hasCmd) &&
           (!modifiers.includes('shift') || hasShift) &&
           (!modifiers.includes('alt') || hasAlt);
  }
};

/**
 * Mock Search API
 * Mock API cho search functionality
 */
export const MockSearchAPI = {
  /**
   * Perform search
   * Thực hiện search và return results
   */
  search: async (query: string, category?: string): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const mockResults: SearchResult[] = [
      {
        id: 'user-1',
        title: 'Nguyễn Văn A',
        description: 'Học viên - Đã tham gia 2 tháng',
        category: 'users',
        href: '/3141592654/admin/users/user-1',
        icon: 'Users',
        metadata: {
          type: 'user',
          status: 'active',
          joinDate: '2024-05-15'
        }
      },
      {
        id: 'question-1',
        title: 'Câu hỏi về React Hooks',
        description: 'Câu hỏi multiple choice về useState và useEffect',
        category: 'questions',
        href: '/3141592654/admin/questions/question-1',
        icon: 'FileQuestion',
        metadata: {
          type: 'question',
          difficulty: 'medium',
          subject: 'React'
        }
      }
    ];

    // Filter by query
    const filteredResults = mockResults.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      (result.description && result.description.toLowerCase().includes(query.toLowerCase()))
    );

    // Filter by category if provided
    if (category) {
      return filteredResults.filter(result => result.category === category);
    }

    return filteredResults;
  },

  /**
   * Get search suggestions
   * Lấy search suggestions
   */
  getSuggestions: async (query: string): Promise<SearchSuggestion[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return SearchUtils.filterSuggestions(QUICK_SEARCH_SUGGESTIONS, query);
  }
};

export default SearchUtils;
