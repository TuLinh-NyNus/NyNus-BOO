/**
 * Unified Filter Section
 * Component hợp nhất Classification Chips và Question Types thành một giao diện thống nhất
 * 
 * Features:
 * - Tabs để switch giữa filter types
 * - Animated transitions
 * - Selected count và clear all
 * - Mobile-optimized với horizontal scroll
 * 
 * @author NyNus Development Team
 * @created 2025-01-19
 */

'use client';

import { useState } from 'react';
import { Filter, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { EnhancedClassificationChips } from './enhanced-classification-chips';
import { EnhancedQuestionTypeFilter } from './enhanced-question-type-filter';

type FilterTab = 'all' | 'type' | 'classification';

interface UnifiedFilterSectionProps {
  className?: string;
  onFiltersChange?: (filters: any) => void;
}

export function UnifiedFilterSection({ 
  className,
  onFiltersChange 
}: UnifiedFilterSectionProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedFilters, setSelectedFilters] = useState({
    types: [] as string[],
    chips: [] as string[] // Kept for compatibility but not used
  });

  const tabs = [
    { id: 'all' as FilterTab, label: 'Tất cả bộ lọc', count: selectedFilters.types.length },
    { id: 'type' as FilterTab, label: 'Loại câu hỏi', count: selectedFilters.types.length },
    // { id: 'classification' as FilterTab, label: 'Phân loại', count: selectedFilters.chips.length }
  ].filter(Boolean);

  const handleClearAll = () => {
    setSelectedFilters({ types: [], chips: [] });
    if (onFiltersChange) {
      onFiltersChange({ types: [], chips: [] });
    }
  };

  const handleTypeChange = (types: string[]) => {
    const newFilters = { ...selectedFilters, types };
    setSelectedFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const hasActiveFilters = selectedFilters.types.length > 0; // || selectedFilters.chips.length > 0;

  return (
    <div className={cn('w-full', className)}>
      {/* Header with Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground dark:text-[hsl(220_14%_98%)]">
            Tìm kiếm theo bộ lọc
          </h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'text-sm font-medium',
                'border border-border dark:border-[hsl(221_27%_28%)]',
                'bg-white dark:bg-[hsl(223_28%_11%)]',
                'hover:bg-muted dark:hover:bg-[hsl(224_24%_18%)]',
                'transition-all duration-200',
                'group'
              )}
            >
              <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Xóa tất cả ({selectedFilters.types.length})
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/50 dark:bg-[hsl(224_24%_18%)]/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg',
                'text-sm font-medium',
                'transition-all duration-200',
                'relative',
                activeTab === tab.id ? [
                  'bg-white dark:bg-[hsl(223_28%_11%)]',
                  'text-foreground dark:text-[hsl(220_14%_98%)]',
                  'shadow-sm'
                ] : [
                  'text-muted-foreground dark:text-[hsl(220_15%_72%)]',
                  'hover:text-foreground dark:hover:text-[hsl(220_14%_98%)]'
                ]
              )}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-xs',
                  activeTab === tab.id 
                    ? 'bg-[hsl(243_75%_65%)] text-white'
                    : 'bg-muted dark:bg-[hsl(224_24%_18%)] text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Content */}
      <div className="relative">
        {/* All Filters View */}
        {activeTab === 'all' && (
          <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-2">
            {/* Question Types Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-[hsl(243_75%_65%)] to-[hsl(267_84%_72%)] rounded-full" />
                <h3 className="text-base font-semibold text-foreground dark:text-[hsl(220_14%_98%)]">
                  Loại câu hỏi
                </h3>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <EnhancedQuestionTypeFilter
                showHeader={false}
                allowMultiple={true}
                onSelectionChange={handleTypeChange}
              />
            </div>

            {/* Classification Section - TEMPORARILY HIDDEN */}
            {/* <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-[hsl(188_85%_65%)] to-[hsl(243_75%_65%)] rounded-full" />
                <h3 className="text-base font-semibold text-foreground dark:text-[hsl(220_14%_98%)]">
                  Phân loại chi tiết
                </h3>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <EnhancedClassificationChips
                allowMultiSelect={true}
                showGroupLabels={true}
              />
            </div> */}
          </div>
        )}

        {/* Question Types Only */}
        {activeTab === 'type' && (
          <div className="animate-in fade-in-0 slide-in-from-right-2">
            <EnhancedQuestionTypeFilter
              showHeader={false}
              allowMultiple={true}
              onSelectionChange={handleTypeChange}
            />
          </div>
        )}

        {/* Classification Only - TEMPORARILY HIDDEN */}
        {/* {activeTab === 'classification' && (
          <div className="animate-in fade-in-0 slide-in-from-left-2">
            <EnhancedClassificationChips
              allowMultiSelect={true}
              showGroupLabels={true}
            />
          </div>
        )} */}
      </div>

      {/* Quick Stats Bar */}
      {hasActiveFilters && (
        <div className={cn(
          'mt-6 p-4 rounded-xl',
          'bg-gradient-to-r from-[hsl(243_75%_65%)]/5 to-[hsl(188_85%_65%)]/5',
          'border border-[hsl(243_75%_65%)]/20',
          'flex items-center justify-between'
        )}>
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-[hsl(243_75%_65%)]" />
            <div>
              <p className="text-sm font-medium text-foreground dark:text-[hsl(220_14%_98%)]">
                Bộ lọc đang áp dụng
              </p>
              <p className="text-xs text-muted-foreground dark:text-[hsl(220_15%_72%)]">
                Khoảng ~2,450 câu hỏi phù hợp
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              // Navigate with filters
              const url = new URL(window.location.origin + '/questions/browse');
              // Add filter params
              router.push(url.toString());
            }}
            className={cn(
              'px-6 py-2.5 rounded-xl',
              'bg-gradient-to-r from-[hsl(243_75%_65%)] to-[hsl(188_85%_65%)]',
              'text-white font-medium',
              'shadow-md hover:shadow-lg',
              'transition-all duration-200',
              'hover:scale-105'
            )}
          >
            Xem kết quả
          </button>
        </div>
      )}
    </div>
  );
}

export default UnifiedFilterSection;
