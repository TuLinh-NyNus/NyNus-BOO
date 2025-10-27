import { Fragment } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import type { LibraryItemView } from '@/services/grpc/library.service';

import { LibraryItemCard } from './item-card';
import { LibraryEmptyState } from './empty-state';

interface LibraryItemGridProps {
  items: LibraryItemView[];
  loading: boolean;
  onPreview: (item: LibraryItemView) => void;
  onBookmark?: (item: LibraryItemView, nextState: boolean) => Promise<void>;
}

const SKELETON_ITEMS = Array.from({ length: 6 }).map((_, index) => index);

export function LibraryItemGrid({
  items,
  loading,
  onPreview,
  onBookmark,
}: LibraryItemGridProps) {
  if (!loading && items.length === 0) {
    return <LibraryEmptyState type="no-filter" />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {loading
        ? SKELETON_ITEMS.map((index) => (
            <div
              key={`library-skeleton-${index}`}
              className="flex h-full flex-col rounded-3xl border border-border/40 bg-background/70 p-6 shadow-inner"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="mt-6 flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="w-full space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                  <Skeleton className="h-4 w-2/3 rounded-lg" />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-5/6 rounded-lg" />
              </div>
              <div className="mt-6 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
              </div>
            </div>
          ))
        : items.map((item) => (
            <Fragment key={item.id}>
              <LibraryItemCard
                item={item}
                onPreview={onPreview}
                onBookmark={onBookmark}
              />
            </Fragment>
          ))}
    </div>
  );
}

export default LibraryItemGrid;
