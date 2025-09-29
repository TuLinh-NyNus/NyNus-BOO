/**
 * Shared Store Patterns
 * 
 * Common patterns and interfaces used across multiple Zustand stores
 * Eliminates duplication and ensures consistency
 */

// ===== SELECTION STATE PATTERN =====

export interface SelectionState<T = string> {
  selectedIds: Set<T>;
  isAllSelected: boolean;
  lastSelectedId: T | null;
}

export interface SelectionActions<T = string> {
  selectItem: (id: T) => void;
  deselectItem: (id: T) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleSelection: (id: T) => void;
  toggleSelectAll: () => void;
  isSelected: (id: T) => boolean;
}

export const createInitialSelectionState = <T = string>(): SelectionState<T> => ({
  selectedIds: new Set<T>(),
  isAllSelected: false,
  lastSelectedId: null,
});

// ===== CACHE ENTRY PATTERN =====

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  isStale?: boolean;
}

export interface CacheState<T> {
  cache: Map<string, CacheEntry<T>>;
  cacheSize: number;
  maxCacheSize: number;
}

export interface CacheActions<T> {
  getCacheEntry: (key: string) => CacheEntry<T> | undefined;
  setCacheEntry: (key: string, data: T, ttl?: number) => void;
  removeCacheEntry: (key: string) => void;
  clearCache: () => void;
  isCacheValid: (key: string) => boolean;
}

export const createInitialCacheState = <T>(maxSize: number = 100): CacheState<T> => ({
  cache: new Map<string, CacheEntry<T>>(),
  cacheSize: 0,
  maxCacheSize: maxSize,
});

// ===== PAGINATION STATE PATTERN =====

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  updatePagination: (total: number) => void;
}

export const createInitialPaginationState = (): PaginationState => ({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
});

// ===== LOADING STATE PATTERN =====

export interface LoadingState {
  isLoading: boolean;
  isLoadingMore: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface LoadingActions {
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;
}

export const createInitialLoadingState = (): LoadingState => ({
  isLoading: false,
  isLoadingMore: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
});

// ===== ERROR STATE PATTERN =====

export interface ErrorState {
  error: string | null;
  fieldErrors: Record<string, string>;
}

export interface ErrorActions {
  setError: (error: string | null) => void;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
}

export const createInitialErrorState = (): ErrorState => ({
  error: null,
  fieldErrors: {},
});

// ===== STATISTICS PATTERN =====

export interface StatisticsState {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  recentCount: number;
  lastUpdated: string | null;
}

export const createInitialStatisticsState = (): StatisticsState => ({
  totalCount: 0,
  activeCount: 0,
  inactiveCount: 0,
  recentCount: 0,
  lastUpdated: null,
});

// ===== COMBINED STORE PATTERN =====

export interface BaseStoreState<T> extends 
  SelectionState<string>,
  CacheState<T>,
  PaginationState,
  LoadingState,
  ErrorState {
  items: T[];
  selectedItem: T | null;
  draftItem: T | null;
  viewMode: 'list' | 'grid' | 'table';
  isDetailPanelOpen: boolean;
  statistics: StatisticsState;
}

export interface BaseStoreActions<T> extends
  SelectionActions<string>,
  CacheActions<T>,
  PaginationActions,
  LoadingActions,
  ErrorActions {
  setItems: (items: T[]) => void;
  addItem: (item: T) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
  removeItem: (id: string) => void;
  setSelectedItem: (item: T | null) => void;
  setDraftItem: (item: T | null) => void;
  setViewMode: (mode: 'list' | 'grid' | 'table') => void;
  toggleDetailPanel: () => void;
  updateStatistics: (stats: Partial<StatisticsState>) => void;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Create initial state for a base store
 */
export function createInitialBaseState<T>(maxCacheSize: number = 100): BaseStoreState<T> {
  return {
    items: [],
    selectedItem: null,
    draftItem: null,
    viewMode: 'list',
    isDetailPanelOpen: false,
    statistics: createInitialStatisticsState(),
    ...createInitialSelectionState<string>(),
    ...createInitialCacheState<T>(maxCacheSize),
    ...createInitialPaginationState(),
    ...createInitialLoadingState(),
    ...createInitialErrorState(),
  };
}

/**
 * Calculate pagination values
 */
export function calculatePagination(currentPage: number, pageSize: number, totalItems: number): PaginationState {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}

/**
 * Check if cache entry is valid
 */
export function isCacheEntryValid<T>(entry: CacheEntry<T>): boolean {
  if (!entry) return false;
  if (entry.isStale) return false;
  if (entry.expiresAt && Date.now() > entry.expiresAt) return false;
  return true;
}

/**
 * Create cache entry with TTL
 */
export function createCacheEntry<T>(data: T, ttlMs?: number): CacheEntry<T> {
  const timestamp = Date.now();
  return {
    data,
    timestamp,
    expiresAt: ttlMs ? timestamp + ttlMs : undefined,
    isStale: false,
  };
}
