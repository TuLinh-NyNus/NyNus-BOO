'use client';

import { motion } from "framer-motion";
import { Search, X, Filter, SortAsc, SortDesc } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/form/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form/select";
import { Input } from "@/components/ui/form/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'floating';
}

export interface SearchFilters {
  query: string;
  category?: string;
  level?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const categories = [
  { value: '', label: 'Tất cả danh mục' },
  { value: 'Toán 10', label: 'Toán lớp 10' },
  { value: 'Toán 11', label: 'Toán lớp 11' },
  { value: 'Toán 12', label: 'Toán lớp 12' },
  { value: 'Vật lý', label: 'Vật lý' },
  { value: 'Hóa học', label: 'Hóa học' },
  { value: 'Ngoại ngữ', label: 'Ngoại ngữ' }
];

const levels = [
  { value: '', label: 'Tất cả cấp độ' },
  { value: 'Cơ bản', label: 'Cơ bản' },
  { value: 'Trung cấp', label: 'Trung cấp' },
  { value: 'Nâng cao', label: 'Nâng cao' }
];

const sortOptions = [
  { value: 'number', label: 'Theo thứ tự' },
  { value: 'title', label: 'Theo tên' },
  { value: 'duration', label: 'Theo thời lượng' },
  { value: 'createdAt', label: 'Mới nhất' }
];

/**
 * SearchBar Component
 * Thanh tìm kiếm với filters và sorting cho courses
 */
export function SearchBar({ 
  onSearch, 
  onFilter, 
  placeholder = "Tìm kiếm khóa học...", 
  showFilters = false,
  className,
  variant = 'default'
}: SearchBarProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    level: '',
    sortBy: 'number',
    sortOrder: 'asc'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const newFilters = { ...filters, query: searchQuery };
      setFilters(newFilters);
      if (onFilter) {
        onFilter(newFilters);
      }
      if (onSearch && searchQuery !== filters.query) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch, onFilter, filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const newFilters = { ...filters, query: '' };
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
    if (onSearch) {
      onSearch('');
    }
  };

  const toggleSortOrder = () => {
    const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    handleFilterChange('sortOrder', newOrder);
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl";
      case 'floating':
        return "bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl";
      default:
        return "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "w-full",
        getVariantStyles(),
        className
      )}
    >
      <div className="p-4">
        {/* Main search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 py-3 w-full border-0 bg-transparent focus:ring-2 focus:ring-purple-500/20 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        {showFilters && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
              {showAdvancedFilters && <span className="ml-1">▼</span>}
              {!showAdvancedFilters && <span className="ml-1">▶</span>}
            </Button>

            {/* Quick sort toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSortOrder}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {filters.sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4 mr-2" />
              ) : (
                <SortDesc className="w-4 h-4 mr-2" />
              )}
              {filters.sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            </Button>
          </div>
        )}

        {/* Advanced filters */}
        {showFilters && showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Danh mục
                </label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cấp độ
                </label>
                <Select
                  value={filters.level || ''}
                  onValueChange={(value) => handleFilterChange('level', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort by filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sắp xếp theo
                </label>
                <Select
                  value={filters.sortBy || 'number'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn cách sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
