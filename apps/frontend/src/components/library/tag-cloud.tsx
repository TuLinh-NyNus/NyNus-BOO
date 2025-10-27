'use client';

/**
 * Library Tag Cloud Component
 * Tag cloud filter với tag search và color visualization
 */

import { useState, useMemo } from 'react';
import { X, Hash, Search, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Types
export interface Tag {
  id: string;
  name: string;
  color?: string;
  count?: number;
  trending?: boolean;
}

export interface TagCloudProps {
  tags: Tag[];
  selectedTags?: string[];
  onTagSelect?: (tagId: string) => void;
  onTagDeselect?: (tagId: string) => void;
  onClearAll?: () => void;
  maxVisible?: number;
  showSearch?: boolean;
  showCounts?: boolean;
  className?: string;
}

/**
 * Get tag size class based on count (for weighted tag cloud)
 */
function getTagSizeClass(count?: number, maxCount?: number): string {
  if (!count || !maxCount) return 'text-xs';
  
  const ratio = count / maxCount;
  if (ratio > 0.7) return 'text-base font-semibold';
  if (ratio > 0.4) return 'text-sm font-medium';
  return 'text-xs';
}

/**
 * Default tag colors
 */
const DEFAULT_TAG_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
];

export function LibraryTagCloud({
  tags,
  selectedTags = [],
  onTagSelect,
  onTagDeselect,
  onClearAll,
  maxVisible = 50,
  showSearch = true,
  showCounts = true,
  className,
}: TagCloudProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Calculate max count for sizing
  const maxCount = useMemo(() => {
    return Math.max(...tags.map(t => t.count || 0), 1);
  }, [tags]);

  // Filter tags by search
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    
    const query = searchQuery.toLowerCase();
    return tags.filter(tag => tag.name.toLowerCase().includes(query));
  }, [tags, searchQuery]);

  // Sort tags (selected first, then by count, then alphabetically)
  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((a, b) => {
      const aSelected = selectedTags.includes(a.id);
      const bSelected = selectedTags.includes(b.id);
      
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      
      if ((a.count || 0) !== (b.count || 0)) {
        return (b.count || 0) - (a.count || 0);
      }
      
      return a.name.localeCompare(b.name, 'vi');
    });
  }, [filteredTags, selectedTags]);

  // Visible tags
  const visibleTags = showAll ? sortedTags : sortedTags.slice(0, maxVisible);
  const hasMore = sortedTags.length > maxVisible;

  // Handle tag click
  const handleTagClick = (tag: Tag) => {
    const isSelected = selectedTags.includes(tag.id);
    
    if (isSelected) {
      onTagDeselect?.(tag.id);
    } else {
      onTagSelect?.(tag.id);
    }
  };

  // Get tag color class
  const getTagColorClass = (tag: Tag, index: number): string => {
    if (tag.color) {
      // Custom color from backend
      return tag.color;
    }
    
    // Use default color palette
    return DEFAULT_TAG_COLORS[index % DEFAULT_TAG_COLORS.length];
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Hash className="h-4 w-4 text-primary" />
          <span>Thẻ phổ biến</span>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedTags.length}
            </Badge>
          )}
        </div>
        
        {selectedTags.length > 0 && onClearAll && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            Xóa hết
          </Button>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm thẻ..."
            className="h-9 pl-9 text-sm"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Tag Cloud */}
      <div className="flex flex-wrap gap-2">
        {visibleTags.length === 0 && (
          <div className="w-full py-8 text-center">
            <Hash className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Không tìm thấy thẻ phù hợp' : 'Chưa có thẻ nào'}
            </p>
          </div>
        )}
        
        {visibleTags.map((tag, index) => {
          const isSelected = selectedTags.includes(tag.id);
          const sizeClass = getTagSizeClass(tag.count, maxCount);
          const colorClass = getTagColorClass(tag, index);
          
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all',
                'hover:scale-105 hover:shadow-sm',
                sizeClass,
                isSelected 
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md' 
                  : 'hover:shadow-md',
                colorClass
              )}
            >
              {tag.trending && (
                <TrendingUp className="h-3 w-3" />
              )}
              <span>#{tag.name}</span>
              {showCounts && tag.count !== undefined && (
                <Badge 
                  variant="secondary" 
                  className="ml-0.5 h-4 px-1.5 text-[10px] bg-black/10 dark:bg-white/10"
                >
                  {tag.count}
                </Badge>
              )}
              {isSelected && (
                <X className="h-3 w-3 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Show More/Less */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="h-8 text-xs"
          >
            {showAll ? 'Thu gọn' : `Xem thêm ${sortedTags.length - maxVisible} thẻ`}
          </Button>
        </div>
      )}

      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Đã chọn {selectedTags.length} thẻ:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              if (!tag) return null;
              
              return (
                <Badge
                  key={tagId}
                  variant="secondary"
                  className="gap-1 text-xs"
                >
                  #{tag.name}
                  <button
                    type="button"
                    onClick={() => onTagDeselect?.(tagId)}
                    className="ml-0.5 rounded-full hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryTagCloud;

