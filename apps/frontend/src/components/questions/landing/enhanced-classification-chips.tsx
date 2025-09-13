/**
 * Enhanced Classification Chips
 * Chips phân loại được tổ chức theo nhóm với clear all
 * 
 * Improvements:
 * - Tổ chức theo nhóm: Types, Difficulty, Grades, Subjects
 * - Clear all và selected count
 * - Gradient colors từ theme
 * - Better hover states
 * - Scroll horizontal trên mobile
 */

'use client';

import { useState, useMemo } from 'react';
import { Check, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Chip {
  id: string;
  label: string;
  group: 'type' | 'difficulty' | 'grade' | 'subject';
  queryParams: Record<string, string>;
  gradient?: string;
  color?: string;
}

interface ChipGroup {
  label: string;
  chips: Chip[];
}

interface EnhancedClassificationChipsProps {
  className?: string;
  showGroupLabels?: boolean;
  allowMultiSelect?: boolean;
}

export function EnhancedClassificationChips({ 
  className,
  showGroupLabels = true,
  allowMultiSelect = true
}: EnhancedClassificationChipsProps) {
  const router = useRouter();
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());

  const chipGroups = useMemo<ChipGroup[]>(() => {
    const chips: Chip[] = [
      // Loại câu hỏi - Indigo/Violet gradients
      { 
        id: 'type-mc', 
        label: 'Trắc nghiệm', 
        group: 'type',
        queryParams: { type: 'MC' },
        gradient: 'linear-gradient(135deg, #3730A3, #4F46E5, #6366F1)',
        color: 'text-white'
      },
      { 
        id: 'type-tf', 
        label: 'Đúng/Sai', 
        group: 'type',
        queryParams: { type: 'TF' },
        gradient: 'linear-gradient(135deg, #5B21B6, #7C3AED, #8B5CF6)',
        color: 'text-white'
      },
      { 
        id: 'type-sa', 
        label: 'Tự luận ngắn', 
        group: 'type',
        queryParams: { type: 'SA' },
        gradient: 'linear-gradient(135deg, #6D28D9, #8B5CF6, #A78BFA)',
        color: 'text-white'
      },
      { 
        id: 'type-es', 
        label: 'Tự luận', 
        group: 'type',
        queryParams: { type: 'ES' },
        gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA, #C4B5FD)',
        color: 'text-white'
      },

      // Độ khó - Pink/Red gradients  
      { 
        id: 'diff-easy', 
        label: 'Dễ', 
        group: 'difficulty',
        queryParams: { difficulty: 'EASY' },
        gradient: 'linear-gradient(135deg, #059669, #10B981, #34D399)',
        color: 'text-white'
      },
      { 
        id: 'diff-medium', 
        label: 'Trung bình', 
        group: 'difficulty',
        queryParams: { difficulty: 'MEDIUM' },
        gradient: 'linear-gradient(135deg, #D97706, #F59E0B, #FCD34D)',
        color: 'text-white'
      },
      { 
        id: 'diff-hard', 
        label: 'Khó', 
        group: 'difficulty',
        queryParams: { difficulty: 'HARD' },
        gradient: 'linear-gradient(135deg, #BE185D, #EC4899, #F472B6)',
        color: 'text-white'
      },

      // Lớp - Cyan/Teal/Blue gradients
      { 
        id: 'grade-10', 
        label: 'Lớp 10', 
        group: 'grade',
        queryParams: { grade: 'lop-10' },
        gradient: 'linear-gradient(135deg, #134E4A, #0F766E, #06B6D4)',
        color: 'text-white'
      },
      { 
        id: 'grade-11', 
        label: 'Lớp 11', 
        group: 'grade',
        queryParams: { grade: 'lop-11' },
        gradient: 'linear-gradient(135deg, #115E59, #0D9488, #14B8A6)',
        color: 'text-white'
      },
      { 
        id: 'grade-12', 
        label: 'Lớp 12', 
        group: 'grade',
        queryParams: { grade: 'lop-12' },
        gradient: 'linear-gradient(135deg, #1E40AF, #2563EB, #3B82F6)',
        color: 'text-white'
      },

      // Môn học - Purple gradient
      { 
        id: 'subject-math', 
        label: 'Toán học', 
        group: 'subject',
        queryParams: { subject: 'toan-12' },
        gradient: 'linear-gradient(135deg, #86198F, #C026D3, #D946EF)',
        color: 'text-white'
      },
    ];

    // Group chips
    const groups: ChipGroup[] = [
      {
        label: 'Loại câu hỏi',
        chips: chips.filter(c => c.group === 'type')
      },
      {
        label: 'Độ khó',
        chips: chips.filter(c => c.group === 'difficulty')
      },
      {
        label: 'Khối lớp',
        chips: chips.filter(c => c.group === 'grade')
      },
      {
        label: 'Môn học',
        chips: chips.filter(c => c.group === 'subject')
      }
    ];

    return groups;
  }, []);

  const handleChipClick = (chip: Chip) => {
    if (allowMultiSelect) {
      const newSelected = new Set(selectedChips);
      if (newSelected.has(chip.id)) {
        newSelected.delete(chip.id);
      } else {
        newSelected.add(chip.id);
      }
      setSelectedChips(newSelected);
    } else {
      // Single select - navigate immediately
      const url = new URL(window.location.origin + '/questions/browse');
      Object.entries(chip.queryParams).forEach(([k, v]) => {
        url.searchParams.set(k, v);
      });
      router.push(url.toString());
    }
  };

  const handleApplyFilters = () => {
    if (selectedChips.size === 0) return;
    
    const url = new URL(window.location.origin + '/questions/browse');
    const allChips = chipGroups.flatMap(g => g.chips);
    
    selectedChips.forEach(chipId => {
      const chip = allChips.find(c => c.id === chipId);
      if (chip) {
        Object.entries(chip.queryParams).forEach(([k, v]) => {
          url.searchParams.set(k, v);
        });
      }
    });
    
    router.push(url.toString());
  };

  const handleClearAll = () => {
    setSelectedChips(new Set());
  };

  const selectedCount = selectedChips.size;

  return (
    <div className={cn('w-full', className)}>
      {/* Header with count and actions */}
      {allowMultiSelect && selectedCount > 0 && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[hsl(243_75%_65%)]" />
            <span className="text-sm font-medium text-foreground dark:text-[hsl(220_14%_98%)]">
              Đã chọn: {selectedCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className={cn(
                'px-3 py-1.5 rounded-lg',
                'text-xs font-medium',
                'border border-border dark:border-[hsl(221_27%_28%)]',
                'bg-white dark:bg-[hsl(223_28%_11%)]',
                'text-muted-foreground dark:text-[hsl(220_15%_72%)]',
                'hover:bg-muted dark:hover:bg-[hsl(224_24%_18%)]',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[hsl(243_75%_65%)]/50'
              )}
            >
              Xóa tất cả
            </button>
            <button
              onClick={handleApplyFilters}
              className={cn(
                'px-4 py-1.5 rounded-lg',
                'text-xs font-medium',
                'bg-gradient-to-r from-[hsl(243_75%_65%)] to-[hsl(188_85%_65%)]',
                'text-white',
                'shadow-sm hover:shadow-md',
                'transition-all duration-200',
                'hover:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-[hsl(243_75%_65%)]/50'
              )}
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {/* Chip Groups */}
      <div className="space-y-3">
        {chipGroups.map((group) => (
          <div key={group.label} className="">
            {/* Group Label */}
            {showGroupLabels && (
              <h4 className="text-[11px] font-semibold text-muted-foreground dark:text-[hsl(220_15%_72%)] uppercase tracking-widest mb-2.5 opacity-80">
                {group.label}
              </h4>
            )}
            
            {/* Chips - Horizontal scroll on mobile */}
            <div className="flex flex-wrap gap-2 lg:gap-2.5">
              {group.chips.map((chip) => {
                const isSelected = selectedChips.has(chip.id);
                
                return (
                  <button
                    key={chip.id}
                    onClick={() => handleChipClick(chip)}
                    className={cn(
                    'relative px-4 py-2.5 rounded-xl min-h-[44px] inline-flex items-center justify-center',
                      'text-xs font-medium',
                      'border',
                      'transition-all duration-200',
                      'hover:scale-105',
                      'focus:outline-none focus:ring-2 focus:ring-[hsl(243_75%_65%)] focus:ring-offset-2 focus:ring-offset-background',
                      isSelected ? [
                        'border-transparent',
                        'shadow-lg',
                        'ring-2 ring-[hsl(243_75%_65%)]/30'
                      ] : [
                        'border-border dark:border-[hsl(221_27%_28%)]/50',
                        'bg-white dark:bg-[hsl(223_28%_11%)]',
                        'text-foreground dark:text-[hsl(220_14%_98%)]',
                        'hover:border-[hsl(243_75%_65%)]/50',
                        'shadow-sm hover:shadow-md'
                      ]
                    )}
                    style={isSelected ? {
                      background: chip.gradient,
                    } : undefined}
                    aria-pressed={isSelected}
                    aria-label={`${chip.label} filter`}
                  >
                    {/* Chip Content */}
                    <span className={isSelected ? chip.color : ''}>
                      {chip.label}
                    </span>
                    
                    {/* Selected Indicator */}
                    {isSelected && allowMultiSelect && (
                      <Check className="ml-1.5 inline-block h-3 w-3" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EnhancedClassificationChips;