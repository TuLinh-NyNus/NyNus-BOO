/**
 * Combined Search Bar (Text/Subcount)
 * Tìm kiếm hợp nhất với 2 chế độ: Văn bản và Subcount
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SearchMode = 'text' | 'subcount';

interface CombinedSearchBarProps {
  className?: string;
  initialMode?: SearchMode;
}

export function CombinedSearchBar({ className, initialMode = 'text' }: CombinedSearchBarProps) {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>(initialMode);
  const [query, setQuery] = useState('');
  const [subcount, setSubcount] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'text') {
      const q = query.trim();
      if (!q) return;
      router.push(`/questions/search?q=${encodeURIComponent(q)}&fields=content,solution,tags`);
    } else {
      const p = subcount.trim();
      if (!p) return;
      router.push(`/questions/browse?subcount=${encodeURIComponent(p)}`);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Toggle */}
      <div className="mx-auto mb-3 flex w-full max-w-3xl items-center gap-2 rounded-xl border bg-background p-1 dark:bg-[hsl(var(--color-surface))] dark:border-[hsl(var(--color-border))] shadow-sm">
        <button
          type="button"
          aria-pressed={mode === 'text'}
          onClick={() => setMode('text')}
          className={cn(
            'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors inline-flex items-center justify-center gap-2',
            mode === 'text'
              ? 'bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] shadow-lg ring-1 ring-[hsl(var(--color-ring))]'
              : 'border dark:border-[hsl(var(--color-border))] bg-muted/60 dark:bg-[hsl(var(--color-surface))]/60 hover:bg-muted dark:hover:bg-[hsl(var(--color-surface-hover))] text-foreground'
          )}
        >
          <Search className="h-4 w-4" />
          Tìm kiếm văn bản
        </button>
        <button
          type="button"
          aria-pressed={mode === 'subcount'}
          onClick={() => setMode('subcount')}
          className={cn(
            'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors inline-flex items-center justify-center gap-2',
            mode === 'subcount'
              ? 'bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] shadow-lg ring-1 ring-[hsl(var(--color-ring))]'
              : 'border dark:border-[hsl(var(--color-border))] bg-muted/60 dark:bg-[hsl(var(--color-surface))]/60 hover:bg-muted dark:hover:bg-[hsl(var(--color-surface-hover))] text-foreground'
          )}
        >
          <Hash className="h-4 w-4" />
          Tìm theo Subcount
        </button>
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="relative mx-auto w-full max-w-3xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          {mode === 'text' ? (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nội dung, lời giải, tags... (vd: phương trình bậc hai)"
              className="w-full rounded-xl border-2 border-border bg-background px-12 py-4 text-base shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-ring))] dark:bg-[hsl(var(--color-surface))] dark:border-[hsl(var(--color-border))] placeholder:text-muted-foreground/70"
            />
          ) : (
            <input
              value={subcount}
              onChange={(e) => setSubcount(e.target.value)}
              placeholder="VD: 12T-CH3-L2-A hoặc wildcard: 12T-CH*-L*-*"
              className="w-full rounded-xl border-2 border-border bg-background px-12 py-4 text-base shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-ring))] dark:bg-[hsl(var(--color-surface))] dark:border-[hsl(var(--color-border))] placeholder:text-muted-foreground/70"
            />
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--color-primary-foreground))] shadow-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {/* Gợi ý nhỏ dưới input */}
      <div className="mx-auto mt-2 flex max-w-3xl flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {mode === 'text' ? (
          <>
            <span>Gợi ý: &quot;định lý cos&quot;, &quot;tích phân xác định&quot;</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Tìm trong: nội dung, lời giải, tags</span>
          </>
        ) : (
          <>
            <span>Mẹo: Dùng * để thay thế (wildcard)</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Cấu trúc: [Khối][Môn][Chương][Bài][-Dạng]</span>
          </>
        )}
      </div>
    </div>
  );
}

export default CombinedSearchBar;
