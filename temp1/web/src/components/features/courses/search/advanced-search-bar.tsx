'use client';

import { motion } from "framer-motion";
import { Search, Filter, ChevronDown, ArrowUpDown } from "lucide-react";
import { useState } from "react";

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui";
import { Input } from "@/components/ui/form/input";
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

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce((count, filters) => 
      count + (filters?.length || 0), 0
    );
  };

  const getCurrentSortLabel = () => {
    return sortOptions.find(option => 
      option.value.field === selectedSort.field && 
      option.value.direction === selectedSort.direction
    )?.label || 'Tăng dần';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={cn(
        "w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search Input */}
          <div className="flex-1 relative">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={handleInputChange}
                className="pl-12 pr-4 py-3 w-full bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 focus:outline-none text-base"
              />
            </form>
          </div>

          {/* Filters and Sort */}
          <div className="flex gap-3 items-center">
            {/* Filter Dropdown */}
            <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 h-auto"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Bộ lọc</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 bg-slate-800 border-slate-700 text-white"
              >
                {/* Level Filters */}
                <div className="p-3 border-b border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Lớp học</h4>
                  <div className="space-y-2">
                    {filterOptions.level.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.level?.includes(option.value) || false}
                          onChange={() => toggleFilter('level', option.value)}
                          className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Subject Filters */}
                <div className="p-3 border-b border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Chủ đề</h4>
                  <div className="space-y-2">
                    {filterOptions.subject.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.subject?.includes(option.value) || false}
                          onChange={() => toggleFilter('subject', option.value)}
                          className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filters */}
                <div className="p-3">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Độ khó</h4>
                  <div className="space-y-2">
                    {filterOptions.difficulty.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.difficulty?.includes(option.value) || false}
                          onChange={() => toggleFilter('difficulty', option.value)}
                          className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 h-auto"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="text-sm">{getCurrentSortLabel()}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-slate-800 border-slate-700 text-white"
              >
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={`${option.value.field}-${option.value.direction}`}
                    onClick={() => handleSortChange(option.value)}
                    className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
