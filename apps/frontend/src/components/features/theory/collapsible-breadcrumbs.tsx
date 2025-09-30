/**
 * Collapsible Breadcrumbs Component
 * Component breadcrumb có thể thu gọn được tối ưu cho mobile
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  badge?: string;
}

export interface CollapsibleBreadcrumbsProps {
  /** Current path để generate breadcrumbs */
  path: string;
  
  /** Custom breadcrumb items (override auto-generation) */
  items?: BreadcrumbItem[];
  
  /** Maximum items to show before collapsing */
  maxItems?: number;
  
  /** Show collapsed state by default */
  showCollapsed?: boolean;
  
  /** Enable touch-friendly interactions */
  enableTouch?: boolean;
  
  /** Show home icon */
  showHome?: boolean;
  
  /** Custom separator */
  separator?: React.ReactNode;
  
  /** Handler cho navigation */
  onNavigate?: (path: string) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_MAX_ITEMS = 3;
const DEFAULT_SEPARATOR = <ChevronRight className="h-3 w-3 text-muted-foreground" />;

// ===== MAIN COMPONENT =====

export function CollapsibleBreadcrumbs({
  path,
  items: customItems,
  maxItems = DEFAULT_MAX_ITEMS,
  showCollapsed = true,
  enableTouch = true,
  showHome = true,
  separator = DEFAULT_SEPARATOR,
  onNavigate,
  className
}: CollapsibleBreadcrumbsProps) {
  
  // ===== STATE =====
  
  const [isExpanded, setIsExpanded] = useState(!showCollapsed);

  // ===== COMPUTED VALUES =====
  
  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    if (customItems) return customItems;

    // Auto-generate từ path
    const pathSegments = path.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Add home item
    if (showHome) {
      items.push({
        label: 'Trang chủ',
        path: '/theory',
        icon: Home
      });
    }

    // Build breadcrumbs từ path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Decode và format segment
      const decodedSegment = decodeURIComponent(segment);
      let label = decodedSegment;
      
      // Format special segments
      if (decodedSegment.startsWith('LỚP-')) {
        label = decodedSegment.replace('LỚP-', 'Lớp ');
      } else if (decodedSegment.startsWith('CHƯƠNG-')) {
        label = decodedSegment.replace('CHƯƠNG-', 'Chương ');
      }

      items.push({
        label,
        path: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });

    return items;
  }, [path, customItems, showHome]);

  const shouldCollapse = breadcrumbItems.length > maxItems;
  const visibleItems = useMemo(() => {
    if (!shouldCollapse || isExpanded) {
      return breadcrumbItems;
    }

    // Show first item, ellipsis, and last few items
    const firstItem = breadcrumbItems[0];
    const lastItems = breadcrumbItems.slice(-2);
    
    return [firstItem, ...lastItems];
  }, [breadcrumbItems, shouldCollapse, isExpanded]);

  const hiddenItemsCount = breadcrumbItems.length - visibleItems.length;

  // ===== HANDLERS =====

  const handleItemClick = useCallback((item: BreadcrumbItem) => {
    if (!item.isActive && onNavigate) {
      onNavigate(item.path);
    }
  }, [onNavigate]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // ===== RENDER HELPERS =====

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number) => {
    const Icon = item.icon;
    const isLast = index === visibleItems.length - 1;
    const isClickable = !item.isActive && onNavigate;

    return (
      <React.Fragment key={`${item.path}-${index}`}>
        <Button
          variant={item.isActive ? "default" : "ghost"}
          size="sm"
          onClick={() => handleItemClick(item)}
          disabled={!isClickable}
          className={cn(
            "h-auto py-1 px-2 text-xs",
            {
              "touch-target": enableTouch,
              "cursor-default": !isClickable,
              "hover:bg-transparent": !isClickable
            }
          )}
        >
          <div className="flex items-center gap-1">
            {Icon && <Icon className="h-3 w-3" />}
            <span className="truncate max-w-[100px] sm:max-w-[150px]">
              {item.label}
            </span>
            {item.badge && (
              <Badge variant="secondary" className="text-xs ml-1">
                {item.badge}
              </Badge>
            )}
          </div>
        </Button>

        {!isLast && (
          <span className="flex-shrink-0">
            {separator}
          </span>
        )}
      </React.Fragment>
    );
  };

  const renderCollapseButton = () => {
    if (!shouldCollapse) return null;

    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleExpanded}
          className={cn(
            "h-auto py-1 px-2 text-xs",
            {
              "touch-target": enableTouch
            }
          )}
        >
          <div className="flex items-center gap-1">
            <MoreHorizontal className="h-3 w-3" />
            {!isExpanded && hiddenItemsCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{hiddenItemsCount}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </Button>
        <span className="flex-shrink-0">
          {separator}
        </span>
      </>
    );
  };

  // ===== RENDER =====

  return (
    <nav 
      className={cn(
        "collapsible-breadcrumbs",
        "flex items-center gap-1 overflow-x-auto",
        "scrollbar-hide", // Hide scrollbar on mobile
        className
      )}
      aria-label="Breadcrumb navigation"
    >
      <div className="flex items-center gap-1 min-w-0">
        {/* Render visible items */}
        {visibleItems.map((item, index) => {
          // Insert collapse button after first item if needed
          if (index === 1 && shouldCollapse && !isExpanded) {
            return (
              <React.Fragment key={`collapse-${index}`}>
                {renderCollapseButton()}
                {renderBreadcrumbItem(item, index)}
              </React.Fragment>
            );
          }
          
          return renderBreadcrumbItem(item, index);
        })}

        {/* Collapse button at the end if expanded */}
        {shouldCollapse && isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpanded}
            className={cn(
              "h-auto py-1 px-2 text-xs ml-2",
              {
                "touch-target": enableTouch
              }
            )}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Mobile scroll indicator */}
      <div className="md:hidden flex-shrink-0 w-4 bg-gradient-to-l from-background to-transparent" />
    </nav>
  );
}

// ===== VARIANTS =====

/**
 * Compact Collapsible Breadcrumbs
 * Phiên bản compact cho mobile
 */
export function CompactCollapsibleBreadcrumbs(props: CollapsibleBreadcrumbsProps) {
  return (
    <CollapsibleBreadcrumbs
      {...props}
      maxItems={2}
      showCollapsed={true}
      enableTouch={true}
      className={cn("compact-breadcrumbs", props.className)}
    />
  );
}

/**
 * Full Collapsible Breadcrumbs
 * Phiên bản đầy đủ cho desktop
 */
export function FullCollapsibleBreadcrumbs(props: CollapsibleBreadcrumbsProps) {
  return (
    <CollapsibleBreadcrumbs
      {...props}
      maxItems={5}
      showCollapsed={false}
      enableTouch={false}
      className={cn("full-breadcrumbs", props.className)}
    />
  );
}

/**
 * Mobile Collapsible Breadcrumbs
 * Phiên bản tối ưu cho mobile
 */
export function MobileCollapsibleBreadcrumbs(props: CollapsibleBreadcrumbsProps) {
  return (
    <CollapsibleBreadcrumbs
      {...props}
      maxItems={2}
      showCollapsed={true}
      enableTouch={true}
      showHome={false} // Ẩn home trên mobile để tiết kiệm space
      className={cn("mobile-breadcrumbs text-xs", props.className)}
    />
  );
}
