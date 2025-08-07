/**
 * useAdvancedUserFilters Hook
 * Hook cho advanced user filtering với multi-criteria support
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  AdvancedUserFilters,
  FilterPreset,
  SavedFilterConfig,
  FilterValidationResult,
  FilterStatistics,
  FilterUIState,
  DEFAULT_FILTER_PRESETS,
  FILTER_VALIDATION_RULES,
} from "../types/user-filters";

/**
 * Hook options interface
 * Interface cho hook options
 */
interface UseAdvancedUserFiltersOptions {
  enableUrlPersistence?: boolean;
  enableLocalStorage?: boolean;
  debounceDelay?: number;
  onFiltersChange?: (filters: AdvancedUserFilters) => void;
  onError?: (error: string) => void;
}

/**
 * Hook return interface
 * Interface cho hook return
 */
interface UseAdvancedUserFiltersReturn {
  // Current filters
  filters: AdvancedUserFilters;
  activeFiltersCount: number;
  hasActiveFilters: boolean;

  // Filter presets
  presets: FilterPreset[];
  savedFilters: SavedFilterConfig[];

  // UI state
  uiState: FilterUIState;

  // Filter actions
  updateFilters: (newFilters: Partial<AdvancedUserFilters>) => void;
  clearFilters: () => void;
  resetFilters: () => void;

  // Preset actions
  applyPreset: (presetId: string) => void;
  saveAsPreset: (name: string, description?: string) => void;
  deletePreset: (presetId: string) => void;

  // Saved filter actions
  applySavedFilter: (filterId: string) => void;
  saveCurrentFilters: (name: string, description?: string, isPublic?: boolean) => void;
  deleteSavedFilter: (filterId: string) => void;

  // Validation
  validateFilters: (filters: AdvancedUserFilters) => FilterValidationResult;

  // Statistics
  getFilterStatistics: () => FilterStatistics;

  // UI actions
  updateUIState: (newState: Partial<FilterUIState>) => void;
  toggleFilterPanel: () => void;

  // URL and storage
  exportFiltersToUrl: () => string;
  importFiltersFromUrl: (url: string) => void;
  exportFiltersToJson: () => string;
  importFiltersFromJson: (json: string) => void;
}

/**
 * Default filters
 * Filters mặc định
 */
const DEFAULT_FILTERS: AdvancedUserFilters = {
  page: 1,
  limit: 25,
  sort: {
    field: "createdAt",
    direction: "desc",
  },
};

/**
 * Default UI state
 * UI state mặc định
 */
const DEFAULT_UI_STATE: FilterUIState = {
  isExpanded: false,
  activeTab: "basic",
  showPresets: false,
  showSavedFilters: false,
  isApplying: false,
  hasUnsavedChanges: false,
};

/**
 * Main useAdvancedUserFilters hook
 * Hook chính cho advanced user filtering
 */
export function useAdvancedUserFilters(
  options: UseAdvancedUserFiltersOptions = {}
): UseAdvancedUserFiltersReturn {
  const {
    enableUrlPersistence = true,
    enableLocalStorage = true,
    debounceDelay = 300,
    onFiltersChange,
    onError,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [filters, setFilters] = useState<AdvancedUserFilters>(DEFAULT_FILTERS);
  const [presets, setPresets] = useState<FilterPreset[]>(DEFAULT_FILTER_PRESETS);
  const [savedFilters, setSavedFilters] = useState<SavedFilterConfig[]>([]);
  const [uiState, setUIState] = useState<FilterUIState>(DEFAULT_UI_STATE);

  /**
   * Calculate active filters count
   * Tính số lượng filters đang hoạt động
   */
  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.search?.trim()) count++;
    if (filters.roles?.length) count++;
    if (filters.statuses?.length) count++;
    if (filters.levelRange?.min !== undefined || filters.levelRange?.max !== undefined) count++;
    if (filters.registrationDateRange?.from || filters.registrationDateRange?.to) count++;
    if (filters.lastLoginDateRange?.from || filters.lastLoginDateRange?.to) count++;
    if (filters.emailVerified !== undefined) count++;
    if (filters.hasActiveSession !== undefined) count++;
    if (filters.riskScoreRange?.min !== undefined || filters.riskScoreRange?.max !== undefined)
      count++;
    if (
      filters.resourceAccessRange?.min !== undefined ||
      filters.resourceAccessRange?.max !== undefined
    )
      count++;

    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  /**
   * Validate filters
   * Validate filters
   */
  const validateFilters = useCallback(
    (filtersToValidate: AdvancedUserFilters): FilterValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate search
      if (filtersToValidate.search) {
        if (filtersToValidate.search.length < FILTER_VALIDATION_RULES.search.minLength) {
          errors.push(`Tìm kiếm phải có ít nhất ${FILTER_VALIDATION_RULES.search.minLength} ký tự`);
        }
        if (filtersToValidate.search.length > FILTER_VALIDATION_RULES.search.maxLength) {
          errors.push(
            `Tìm kiếm không được vượt quá ${FILTER_VALIDATION_RULES.search.maxLength} ký tự`
          );
        }
      }

      // Validate level range
      if (filtersToValidate.levelRange) {
        const { min, max } = filtersToValidate.levelRange;
        if (
          min !== undefined &&
          (min < FILTER_VALIDATION_RULES.levelRange.min ||
            min > FILTER_VALIDATION_RULES.levelRange.max)
        ) {
          errors.push(
            `Cấp độ tối thiểu phải từ ${FILTER_VALIDATION_RULES.levelRange.min} đến ${FILTER_VALIDATION_RULES.levelRange.max}`
          );
        }
        if (
          max !== undefined &&
          (max < FILTER_VALIDATION_RULES.levelRange.min ||
            max > FILTER_VALIDATION_RULES.levelRange.max)
        ) {
          errors.push(
            `Cấp độ tối đa phải từ ${FILTER_VALIDATION_RULES.levelRange.min} đến ${FILTER_VALIDATION_RULES.levelRange.max}`
          );
        }
        if (min !== undefined && max !== undefined && min > max) {
          errors.push("Cấp độ tối thiểu không được lớn hơn cấp độ tối đa");
        }
      }

      // Validate risk score range
      if (filtersToValidate.riskScoreRange) {
        const { min, max } = filtersToValidate.riskScoreRange;
        if (
          min !== undefined &&
          (min < FILTER_VALIDATION_RULES.riskScoreRange.min ||
            min > FILTER_VALIDATION_RULES.riskScoreRange.max)
        ) {
          errors.push(
            `Điểm rủi ro tối thiểu phải từ ${FILTER_VALIDATION_RULES.riskScoreRange.min} đến ${FILTER_VALIDATION_RULES.riskScoreRange.max}`
          );
        }
        if (
          max !== undefined &&
          (max < FILTER_VALIDATION_RULES.riskScoreRange.min ||
            max > FILTER_VALIDATION_RULES.riskScoreRange.max)
        ) {
          errors.push(
            `Điểm rủi ro tối đa phải từ ${FILTER_VALIDATION_RULES.riskScoreRange.min} đến ${FILTER_VALIDATION_RULES.riskScoreRange.max}`
          );
        }
        if (min !== undefined && max !== undefined && min > max) {
          errors.push("Điểm rủi ro tối thiểu không được lớn hơn điểm rủi ro tối đa");
        }
      }

      // Validate date ranges
      if (filtersToValidate.registrationDateRange) {
        const { from, to } = filtersToValidate.registrationDateRange;
        if (from && to && from > to) {
          errors.push("Ngày bắt đầu đăng ký không được sau ngày kết thúc");
        }
        if (from && to) {
          const daysDiff = Math.abs(to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff > FILTER_VALIDATION_RULES.dateRange.maxDays) {
            warnings.push(
              `Khoảng thời gian đăng ký quá dài (>${FILTER_VALIDATION_RULES.dateRange.maxDays} ngày). Có thể ảnh hưởng đến hiệu suất.`
            );
          }
        }
      }

      if (filtersToValidate.lastLoginDateRange) {
        const { from, to } = filtersToValidate.lastLoginDateRange;
        if (from && to && from > to) {
          errors.push("Ngày bắt đầu đăng nhập cuối không được sau ngày kết thúc");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    []
  );

  /**
   * Update filters
   * Cập nhật filters
   */
  const updateFilters = useCallback(
    (newFilters: Partial<AdvancedUserFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      // Validate filters
      const validation = validateFilters(updatedFilters);
      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          if (onError) {
            onError(error);
          } else {
            toast.error(error);
          }
        });
        return;
      }

      // Show warnings
      validation.warnings.forEach((warning) => {
        toast.warning(warning);
      });

      setFilters(updatedFilters);
      setUIState((prev) => ({ ...prev, hasUnsavedChanges: true }));

      // Trigger callback
      if (onFiltersChange) {
        onFiltersChange(updatedFilters);
      }
    },
    [filters, validateFilters, onFiltersChange, onError]
  );

  /**
   * Clear all filters
   * Xóa tất cả filters
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setUIState((prev) => ({ ...prev, hasUnsavedChanges: false }));

    if (onFiltersChange) {
      onFiltersChange(DEFAULT_FILTERS);
    }
  }, [onFiltersChange]);

  /**
   * Reset filters to default
   * Reset filters về mặc định
   */
  const resetFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  /**
   * Apply preset
   * Áp dụng preset
   */
  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) {
        toast.error("Không tìm thấy preset");
        return;
      }

      setFilters({ ...DEFAULT_FILTERS, ...preset.filters });
      setUIState((prev) => ({ ...prev, hasUnsavedChanges: false }));

      if (onFiltersChange) {
        onFiltersChange({ ...DEFAULT_FILTERS, ...preset.filters });
      }

      toast.success(`Đã áp dụng preset: ${preset.name}`);
    },
    [presets, onFiltersChange]
  );

  /**
   * Save as preset
   * Lưu thành preset
   */
  const saveAsPreset = useCallback(
    (name: string, description?: string) => {
      const newPreset: FilterPreset = {
        id: `preset-${Date.now()}`,
        name,
        description,
        filters: { ...filters },
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setPresets((prev) => [...prev, newPreset]);
      setUIState((prev) => ({ ...prev, hasUnsavedChanges: false }));

      toast.success(`Đã lưu preset: ${name}`);
    },
    [filters]
  );

  /**
   * Delete preset
   * Xóa preset
   */
  const deletePreset = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) {
        toast.error("Không tìm thấy preset");
        return;
      }

      if (preset.isDefault) {
        toast.error("Không thể xóa preset mặc định");
        return;
      }

      setPresets((prev) => prev.filter((p) => p.id !== presetId));
      toast.success(`Đã xóa preset: ${preset.name}`);
    },
    [presets]
  );

  /**
   * Apply saved filter
   * Áp dụng saved filter
   */
  const applySavedFilter = useCallback(
    (filterId: string) => {
      const savedFilter = savedFilters.find((f) => f.id === filterId);
      if (!savedFilter) {
        toast.error("Không tìm thấy filter đã lưu");
        return;
      }

      setFilters({ ...DEFAULT_FILTERS, ...savedFilter.filters });
      setUIState((prev) => ({ ...prev, hasUnsavedChanges: false }));

      if (onFiltersChange) {
        onFiltersChange({ ...DEFAULT_FILTERS, ...savedFilter.filters });
      }

      toast.success(`Đã áp dụng filter: ${savedFilter.name}`);
    },
    [savedFilters, onFiltersChange]
  );

  /**
   * Save current filters
   * Lưu filters hiện tại
   */
  const saveCurrentFilters = useCallback(
    (name: string, description?: string, isPublic = false) => {
      const newSavedFilter: SavedFilterConfig = {
        id: `filter-${Date.now()}`,
        name,
        description,
        filters: { ...filters },
        isPublic,
        createdBy: "current-user", // Should be replaced with actual user ID
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
      };

      setSavedFilters((prev) => [...prev, newSavedFilter]);
      setUIState((prev) => ({ ...prev, hasUnsavedChanges: false }));

      toast.success(`Đã lưu filter: ${name}`);
    },
    [filters]
  );

  /**
   * Delete saved filter
   * Xóa saved filter
   */
  const deleteSavedFilter = useCallback(
    (filterId: string) => {
      const savedFilter = savedFilters.find((f) => f.id === filterId);
      if (!savedFilter) {
        toast.error("Không tìm thấy filter đã lưu");
        return;
      }

      setSavedFilters((prev) => prev.filter((f) => f.id !== filterId));
      toast.success(`Đã xóa filter: ${savedFilter.name}`);
    },
    [savedFilters]
  );

  /**
   * Get filter statistics
   * Lấy thống kê filter
   */
  const getFilterStatistics = useCallback((): FilterStatistics => {
    return {
      totalFiltered: 0, // Should be calculated based on actual data
      totalAvailable: 0, // Should be calculated based on actual data
      filterEfficiency: 0,
      mostUsedFilters: [],
      averageFilterTime: 0,
    };
  }, []);

  /**
   * Update UI state
   * Cập nhật UI state
   */
  const updateUIState = useCallback((newState: Partial<FilterUIState>) => {
    setUIState((prev) => ({ ...prev, ...newState }));
  }, []);

  /**
   * Toggle filter panel
   * Toggle filter panel
   */
  const toggleFilterPanel = useCallback(() => {
    setUIState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }));
  }, []);

  /**
   * Export filters to URL
   * Export filters ra URL
   */
  const exportFiltersToUrl = useCallback((): string => {
    const params = new URLSearchParams();

    // Add filters to URL params
    if (filters.search) params.set("search", filters.search);
    if (filters.roles?.length) params.set("roles", filters.roles.join(","));
    if (filters.statuses?.length) params.set("statuses", filters.statuses.join(","));
    // Add other filters as needed

    return params.toString();
  }, [filters]);

  /**
   * Import filters from URL
   * Import filters từ URL
   */
  const importFiltersFromUrl = useCallback(
    (url: string) => {
      try {
        const params = new URLSearchParams(url);
        const importedFilters: Partial<AdvancedUserFilters> = {};

        // Parse URL params back to filters
        if (params.get("search")) importedFilters.search = params.get("search") || undefined;
        if (params.get("roles")) importedFilters.roles = params.get("roles")?.split(",") as any;
        if (params.get("statuses"))
          importedFilters.statuses = params.get("statuses")?.split(",") as any;

        updateFilters(importedFilters);
      } catch (error) {
        toast.error("Không thể import filters từ URL");
      }
    },
    [updateFilters]
  );

  /**
   * Export filters to JSON
   * Export filters ra JSON
   */
  const exportFiltersToJson = useCallback((): string => {
    return JSON.stringify(filters, null, 2);
  }, [filters]);

  /**
   * Import filters from JSON
   * Import filters từ JSON
   */
  const importFiltersFromJson = useCallback(
    (json: string) => {
      try {
        const importedFilters = JSON.parse(json);
        updateFilters(importedFilters);
      } catch (error) {
        toast.error("Không thể import filters từ JSON");
      }
    },
    [updateFilters]
  );

  /**
   * Load filters from URL on mount
   * Load filters từ URL khi mount
   */
  useEffect(() => {
    if (enableUrlPersistence && searchParams.toString()) {
      importFiltersFromUrl(searchParams.toString());
    }
  }, [enableUrlPersistence, searchParams, importFiltersFromUrl]);

  /**
   * Update URL when filters change
   * Cập nhật URL khi filters thay đổi
   */
  useEffect(() => {
    if (enableUrlPersistence && hasActiveFilters) {
      const urlParams = exportFiltersToUrl();
      if (urlParams) {
        router.replace(`?${urlParams}`, { scroll: false });
      }
    }
  }, [enableUrlPersistence, hasActiveFilters, filters, exportFiltersToUrl, router]);

  return {
    // Current filters
    filters,
    activeFiltersCount,
    hasActiveFilters,

    // Filter presets
    presets,
    savedFilters,

    // UI state
    uiState,

    // Filter actions
    updateFilters,
    clearFilters,
    resetFilters,

    // Preset actions
    applyPreset,
    saveAsPreset,
    deletePreset,

    // Saved filter actions
    applySavedFilter,
    saveCurrentFilters,
    deleteSavedFilter,

    // Validation
    validateFilters,

    // Statistics
    getFilterStatistics,

    // UI actions
    updateUIState,
    toggleFilterPanel,

    // URL and storage
    exportFiltersToUrl,
    importFiltersFromUrl,
    exportFiltersToJson,
    importFiltersFromJson,
  };
}
