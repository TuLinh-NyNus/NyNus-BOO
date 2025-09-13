/**
 * Mobile Filter Sheet
 * Bottom sheet filter interface optimized cho mobile devices
 * 
 * Features:
 * - Swipe to dismiss
 * - Touch-optimized controls
 * - Sticky apply button
 * - Animated transitions
 * 
 * @author NyNus Development Team
 * @created 2025-01-19
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedFilterSection } from './unified-filter-section';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  initialFilters?: any;
}

export function MobileFilterSheet({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = { types: [], chips: [] }
}: MobileFilterSheetProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Reset filters when opening
  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  // Handle touch events for swipe to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 100) {
      onClose();
    }
    setCurrentY(0);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const hasChanges = filters.types.length > 0; // || filters.chips.length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-50',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white dark:bg-[hsl(223_28%_11%)]',
          'rounded-t-3xl',
          'shadow-2xl',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{
          transform: `translateY(${isOpen ? currentY : '100%'}px)`,
          maxHeight: '85vh'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-border dark:border-[hsl(221_27%_28%)]">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-[hsl(243_75%_65%)]" />
            <h3 className="text-lg font-semibold text-foreground dark:text-[hsl(220_14%_98%)]">
              Bộ lọc tìm kiếm
            </h3>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg',
              'hover:bg-muted dark:hover:bg-[hsl(224_24%_18%)]',
              'transition-colors'
            )}
            aria-label="Đóng bộ lọc"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          <div className="p-4">
            <UnifiedFilterSection
              onFiltersChange={setFilters}
              className="[&_h2]:text-base [&_h2]:mb-3"
            />
          </div>
        </div>

        {/* Sticky Footer with Apply Button */}
        <div className={cn(
          'sticky bottom-0',
          'p-4',
          'bg-white dark:bg-[hsl(223_28%_11%)]',
          'border-t border-border dark:border-[hsl(221_27%_28%)]',
          'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'
        )}>
          <div className="flex gap-3">
            <button
              onClick={() => setFilters({ types: [], chips: [] })}
              className={cn(
                'flex-1 px-4 py-3 rounded-xl',
                'border border-border dark:border-[hsl(221_27%_28%)]',
                'bg-white dark:bg-[hsl(223_28%_11%)]',
                'text-sm font-medium',
                'hover:bg-muted dark:hover:bg-[hsl(224_24%_18%)]',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              disabled={!hasChanges}
            >
              Xóa tất cả
            </button>
            <button
              onClick={handleApply}
              className={cn(
                'flex-1 px-4 py-3 rounded-xl',
                'bg-gradient-to-r from-[hsl(243_75%_65%)] to-[hsl(188_85%_65%)]',
                'text-white font-medium',
                'shadow-md hover:shadow-lg',
                'transition-all duration-200',
                'hover:scale-105',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              {hasChanges && <Check className="h-4 w-4" />}
              Áp dụng{hasChanges && ` (${filters.types.length})`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileFilterSheet;
