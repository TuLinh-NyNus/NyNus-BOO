'use client';

import { motion } from "framer-motion";
import { Search, Filter, ChevronDown, ArrowUpDown, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/form/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/overlay/dropdown-menu";
import { Input } from "@/components/ui/form/input";
import { Badge } from "@/components/ui/display/badge";
import { cn } from "@/lib/utils";

interface AdvancedSearchBarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: SearchFilters) => void;
  onSortChange?: (sort: SortOption) => void;
  className?: string;
}

export interface SearchFilters {
  level?: string[];
  subject?: string[];
  difficulty?: string[];
}

export interface SortOption {
  field: 'name' | 'date' | 'popularity' | 'rating';
  direction: 'asc' | 'desc';
}

const sortOptions = [
  { label: 'Tên A-Z', value: { field: 'name' as const, direction: 'asc' as const } },
  { label: 'Tên Z-A', value: { field: 'name' as const, direction: 'desc' as const } },
  { label: 'Mới nhất', value: { field: 'date' as const, direction: 'desc' as const } },
  { label: 'Cũ nhất', value: { field: 'date' as const, direction: 'asc' as const } },
  { label: 'Phổ biến nhất', value: { field: 'popularity' as const, direction: 'desc' as const } },
  { label: 'Đánh giá cao', value: { field: 'rating' as const, direction: 'desc' as const } },
];

const filterOptions = {
  level: [
    { label: 'Lớp 10', value: '10' },
    { label: 'Lớp 11', value: '11' },
    { label: 'Lớp 12', value: '12' },
  ],
  subject: [
    { label: 'Đại số', value: 'algebra' },
    { label: 'Hình học', value: 'geometry' },
    { label: 'Giải tích', value: 'calculus' },
    { label: 'Xác suất thống kê', value: 'statistics' },
  ],
  difficulty: [
    { label: 'Cơ bản', value: 'basic' },
    { label: 'Trung bình', value: 'intermediate' },
    { label: 'Nâng cao', value: 'advanced' },
  ],
};

/**
 * AdvancedSearchBar Component
 * Thanh tìm kiếm nâng cao với filters và sorting
 */
export function AdvancedSearchBar({ 
  onSearch, 
  onFilterChange, 
  onSortChange, 
  className 
}: AdvancedSearchBarProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({});
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0].value);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (sort: SortOption): void => {
    setSelectedSort(sort);
    if (onSortChange) {
      onSortChange(sort);
    }
  };

  const toggleFilter = (category: keyof SearchFilters, value: string) => {
    const currentFilters = selectedFilters[category] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(f => f !== value)
      : [...currentFilters, value];
    
    const updatedFilters = {
      ...selectedFilters,
      [category]: newFilters.length > 0 ? newFilters : undefined
    };
    
    setSelectedFilters(updatedFilters);
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce((count, filters) => {
      return count + (filters?.length || 0);
    }, 0);
  };

  const getCurrentSortLabel = () => {
    return sortOptions.find(option => 
      option.value.field === selectedSort.field && 
      option.value.direction === selectedSort.direction
    )?.label || 'Sắp xếp';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-6",
        className
      )}
    >
      {/* Search Input */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Tìm kiếm khóa học, bài giảng..."
            value={searchQuery}
            onChange={handleInputChange}
            className="pl-12 pr-4 py-4 w-full text-lg border-0 bg-slate-50/50 dark:bg-slate-700/50 focus:ring-2 focus:ring-purple-500/20 rounded-xl"
          />
        </div>
      </form>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Dropdown */}
        <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              {/* Level Filter */}
              <div>
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Lớp học
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.level.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedFilters.level?.includes(option.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter('level', option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subject Filter */}
              <div>
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Chủ đề
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.subject.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedFilters.subject?.includes(option.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter('subject', option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Độ khó
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.difficulty.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedFilters.difficulty?.includes(option.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter('difficulty', option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {getActiveFiltersCount() > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {getCurrentSortLabel()}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {sortOptions.map((option, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  "cursor-pointer",
                  selectedSort.field === option.value.field && 
                  selectedSort.direction === option.value.direction &&
                  "bg-purple-50 dark:bg-purple-900/20"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 ml-auto">
            {Object.entries(selectedFilters).map(([category, values]) =>
              values?.map((value: string) => {
                const option = filterOptions[category as keyof typeof filterOptions]
                  ?.find(opt => opt.value === value);
                return option ? (
                  <Badge
                    key={`${category}-${value}`}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    {option.label}
                    <button
                      onClick={() => toggleFilter(category as keyof SearchFilters, value)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ) : null;
              })
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
