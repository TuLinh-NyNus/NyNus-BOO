/**
 * Enhanced Combined Search Bar
 * Thanh tìm kiếm hợp nhất với UX cải tiến
 * 
 * Improvements:
 * - Một thanh tìm kiếm duy nhất với dropdown chế độ
 * - Thuật ngữ thuần Việt
 * - Focus ring và contrast tốt hơn  
 * - Tìm kiếm nâng cao là link phụ
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SearchMode = 'text' | 'topic';

interface EnhancedSearchBarProps {
  className?: string;
  initialMode?: SearchMode;
  placeholder?: string;
}

export function EnhancedSearchBar({ 
  className, 
  initialMode = 'text',
  placeholder
}: EnhancedSearchBarProps) {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>(initialMode);
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || isSearching) return;
    
    setIsSearching(true);
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (mode === 'text') {
      router.push(`/questions/search?q=${encodeURIComponent(q)}&fields=content,solution,tags`);
    } else {
      router.push(`/questions/browse?topic=${encodeURIComponent(q)}`);
    }
    
    setIsSearching(false);
  };

  const clearQuery = () => {
    setQuery('');
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return mode === 'text' 
      ? 'Tìm kiếm nội dung, lời giải, tags... (vd: "phương trình bậc hai")'
      : 'Nhập ID (vd: 12T-CH3-L2 hoặc 12T-CH*-L*)';
  };

  const getModeLabel = () => {
    return mode === 'text' ? 'Văn bản' : 'ID';
  };

  return (
    <div className={cn('w-full max-w-3xl mx-auto', className)}>
      <form onSubmit={onSubmit} className="relative">
        <div className="relative group">
          {/* Search Icon */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
          
          {/* Mode Selector Dropdown */}
          <div className="absolute left-14 top-1/2 -translate-y-1/2 z-10" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]',
                'text-white shadow-sm',
                'hover:shadow-md transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2'
              )}
              aria-label="Chọn chế độ tìm kiếm"
              aria-expanded={isDropdownOpen}
            >
              <span>{getModeLabel()}</span>
              <ChevronDown className={cn(
                'h-3.5 w-3.5 transition-transform duration-200',
                isDropdownOpen && 'rotate-180'
              )} />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className={cn(
                'absolute top-full left-0 mt-2 w-40',
                'bg-white dark:bg-[hsl(223_28%_13%)]',
                'border border-border dark:border-[hsl(221_27%_28%)]',
                'rounded-lg shadow-lg',
                'py-1 z-50'
              )}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('text');
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm',
                    'hover:bg-muted dark:hover:bg-[hsl(224_24%_18%)]',
                    'transition-colors',
                    mode === 'text' && 'bg-primary/10 dark:bg-[var(--color-primary)]/20 text-primary dark:text-[var(--color-primary)]'
                  )}
                >
                  Tìm theo văn bản
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('topic');
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm',
                    'hover:bg-muted dark:hover:bg-[hsl(224_24%_18%)]',
                    'transition-colors',
                    mode === 'topic' && 'bg-primary/10 dark:bg-[var(--color-primary)]/20 text-primary dark:text-[var(--color-primary)]'
                  )}
                >
                  Tìm theo ID
                </button>
              </div>
            )}
          </div>

          {/* Input Field */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder()}
            className={cn(
              'w-full pl-48 pr-32 py-4 text-base',
              'rounded-2xl border-2',
              'bg-white dark:bg-[hsl(223_28%_11%)]',
              'border-border dark:border-[hsl(221_27%_28%)]',
              'text-foreground',
              'placeholder:text-muted-foreground/70',
              'shadow-sm',
              'transition-all duration-200',
              'focus:border-[var(--color-primary)]',
              'focus:ring-4 focus:ring-[var(--color-primary)]/20',
              'focus:shadow-lg',
              'group-hover:border-[var(--color-primary)]/50'
            )}
            aria-label="Nhập nội dung tìm kiếm"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className={cn(
                'absolute right-28 top-1/2 -translate-y-1/2',
                'p-1.5 rounded-lg',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-muted dark:hover:bg-[hsl(224_24%_18%)]',
                'transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'
              )}
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2',
              'px-5 py-2.5 rounded-xl',
              'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]',
              'text-white font-medium',
              'shadow-md hover:shadow-lg',
              'transition-all duration-200',
              'hover:scale-105',
              'focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'inline-flex items-center gap-2'
            )}
            disabled={!query.trim() || isSearching}
            aria-label="Thực hiện tìm kiếm"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tìm...
              </>
            ) : (
              'Tìm kiếm'
            )}
          </button>
        </div>
      </form>

      {/* Helper Text & Advanced Search Link */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground/80">
          {mode === 'text' 
            ? 'Mẹo: Dùng dấu ngoặc kép "..." để tìm chính xác'
            : 'Mẹo: Dùng * thay cho bất kỳ ký tự nào (wildcard)'
          }
        </span>
        <button
          type="button"
          onClick={() => router.push('/questions/search?advanced=true')}
          className={cn(
            'text-[var(--color-primary)] hover:text-[var(--color-primary)]/80',
            'underline-offset-2 hover:underline',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 rounded px-1'
          )}
        >
          Tìm kiếm nâng cao →
        </button>
      </div>
    </div>
  );
}

export default EnhancedSearchBar;