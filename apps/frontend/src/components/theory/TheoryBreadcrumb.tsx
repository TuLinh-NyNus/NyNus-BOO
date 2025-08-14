/**
 * Enhanced Theory Breadcrumb Component
 * Dynamic breadcrumb generation với dropdown navigation và mobile optimization
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

/**
 * Enhanced Theory Breadcrumb Component
 * Generates breadcrumb với dropdown navigation cho long paths
 */
export function TheoryBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbItems = generateBreadcrumbItems(pathname);
  const [showDropdown, setShowDropdown] = useState(false);

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  // Determine if we need to collapse breadcrumb (mobile or long paths)
  const shouldCollapse = breadcrumbItems.length > 4;
  const visibleItems = shouldCollapse
    ? [breadcrumbItems[0], breadcrumbItems[breadcrumbItems.length - 1]]
    : breadcrumbItems;
  const hiddenItems = shouldCollapse
    ? breadcrumbItems.slice(1, -1)
    : [];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm">
      {/* Desktop: Full breadcrumb */}
      <div className="hidden md:flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <BreadcrumbItem item={item} index={index} />
          </React.Fragment>
        ))}
      </div>

      {/* Mobile: Collapsed breadcrumb với dropdown */}
      <div className="flex md:hidden items-center space-x-1 w-full">
        {/* Home item */}
        <BreadcrumbItem item={visibleItems[0]} index={0} />

        {/* Dropdown cho hidden items */}
        {hiddenItems.length > 0 && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {hiddenItems.map((item, index) => (
                  <DropdownMenuItem key={index} asChild>
                    {item.href ? (
                      <Link href={item.href} className="w-full">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="w-full">{item.label}</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* Current/last item */}
        {visibleItems.length > 1 && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <BreadcrumbItem
              item={visibleItems[visibleItems.length - 1]}
              index={visibleItems.length - 1}
            />
          </>
        )}
      </div>
    </nav>
  );
}

/**
 * Individual Breadcrumb Item Component
 */
interface BreadcrumbItemProps {
  item: BreadcrumbItem;
  index: number;
}

function BreadcrumbItem({ item, index }: BreadcrumbItemProps) {
  return item.href && !item.isActive ? (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-1 hover:text-primary transition-colors",
        "text-muted-foreground hover:text-foreground",
        "truncate max-w-32 sm:max-w-none"
      )}
    >
      {index === 0 && <Home className="h-4 w-4 flex-shrink-0" />}
      <span className="truncate">{item.label}</span>
    </Link>
  ) : (
    <span
      className={cn(
        "flex items-center gap-1",
        item.isActive ? "text-foreground font-medium" : "text-muted-foreground",
        "truncate max-w-32 sm:max-w-none"
      )}
    >
      {index === 0 && <Home className="h-4 w-4 flex-shrink-0" />}
      <span className="truncate">{item.label}</span>
    </span>
  );
}

/**
 * Generate breadcrumb items from pathname
 */
function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  // Always start with home
  items.push({
    label: 'Trang chủ',
    href: '/'
  });

  // If not on theory pages, return early
  if (!pathname.startsWith('/theory')) {
    return items;
  }

  // Add theory root
  items.push({
    label: 'Lý thuyết',
    href: '/theory'
  });

  // Parse theory path segments
  const segments = pathname.split('/').filter(Boolean).slice(1); // Remove 'theory'
  
  if (segments.length === 0) {
    // On theory home page
    items[items.length - 1].isActive = true;
    return items;
  }

  let currentPath = '/theory';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    const label = formatSegmentLabel(segment, index);
    
    items.push({
      label,
      href: isLast ? undefined : currentPath,
      isActive: isLast
    });
  });

  return items;
}

/**
 * Format segment label for display
 */
function formatSegmentLabel(segment: string, index: number): string {
  // First, decode URL-encoded characters
  let decodedSegment = segment;
  try {
    decodedSegment = decodeURIComponent(segment);
  } catch (error) {
    // If decoding fails, use original segment
    console.warn('Failed to decode URL segment:', segment, error);
  }

  // Handle English grade slugs (grade-10, grade-11, grade-12)
  if (index === 0 && decodedSegment.startsWith('grade-')) {
    const gradeNumber = decodedSegment.replace('grade-', '');
    return `Grade ${gradeNumber}`;
  }

  // Convert kebab-case to readable format
  const formatted = decodedSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Add context based on position
  switch (index) {
    case 0:
      // Grade level
      if (formatted.toLowerCase().includes('lop')) {
        return formatted.replace(/lop/i, 'Lớp');
      }
      return formatted;

    case 1:
      // Chapter
      if (formatted.toLowerCase().includes('chuong')) {
        return formatted.replace(/chuong/i, 'Chương');
      }
      return formatted;

    case 2:
      // Lesson/File
      if (formatted.toLowerCase().includes('bai')) {
        return formatted.replace(/bai/i, 'Bài');
      }
      return formatted;

    default:
      return formatted;
  }
}

/**
 * Get breadcrumb schema for SEO
 */
export function getBreadcrumbSchema(pathname: string) {
  const items = generateBreadcrumbItems(pathname);
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `${process.env.NEXT_PUBLIC_BASE_URL}${item.href}` : undefined
    }))
  };
}
