"use client";

/**
 * MapCode Breadcrumb Component
 * Hiển thị breadcrumb navigation cho hierarchical path của MapCode
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import React from "react";
import { ChevronRight, Home } from "lucide-react";

interface MapCodeBreadcrumbProps {
  hierarchyPath: string;  // Full path như "Lớp 10 > NGÂN HÀNG CHÍNH > Mệnh đề > Nhận biết"
  className?: string;
  onNavigate?: (level: string, index: number) => void;
  showHomeIcon?: boolean;
}

/**
 * MapCode Breadcrumb Component
 * 
 * @example
 * ```tsx
 * <MapCodeBreadcrumb 
 *   hierarchyPath="Lớp 10 > NGÂN HÀNG CHÍNH > Mệnh đề và tập hợp > Nhận biết > Mệnh đề"
 *   onNavigate={(level, index) => console.log(`Clicked: ${level} at ${index}`)}
 * />
 * ```
 */
export function MapCodeBreadcrumb({ 
  hierarchyPath, 
  className = "",
  onNavigate,
  showHomeIcon = true
}: MapCodeBreadcrumbProps) {
  // Parse hierarchyPath
  const parts = hierarchyPath ? hierarchyPath.split(' > ').filter(Boolean) : [];
  
  if (parts.length === 0) {
    return null;
  }
  
  return (
    <nav 
      className={`mapcode-breadcrumb flex items-center flex-wrap gap-1 text-sm ${className}`} 
      aria-label="MapCode Breadcrumb Navigation"
    >
      {/* Home Icon (optional) */}
      {showHomeIcon && (
        <>
          <Home className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
          <ChevronRight className="h-3.5 w-3.5 text-gray-300 mx-1" aria-hidden="true" />
        </>
      )}
      
      {/* Breadcrumb Items */}
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {/* Breadcrumb Item */}
          {onNavigate ? (
            <button
              onClick={() => onNavigate(part, index)}
              className="text-gray-600 hover:text-blue-600 hover:underline transition-colors font-medium"
              title={part}
            >
              {part}
            </button>
          ) : (
            <span className="text-gray-700 font-medium" title={part}>
              {part}
            </span>
          )}
          
          {/* Separator (không hiện ở item cuối) */}
          {index < parts.length - 1 && (
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 mx-1" aria-hidden="true" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * Compact Breadcrumb - chỉ hiện Grade > Subject > Chapter
 */
interface MapCodeBreadcrumbCompactProps {
  hierarchyPath: string;
  className?: string;
  maxLevels?: number; // Số levels tối đa để hiển thị (default: 3)
}

export function MapCodeBreadcrumbCompact({ 
  hierarchyPath,
  className = "",
  maxLevels = 3
}: MapCodeBreadcrumbCompactProps) {
  const parts = hierarchyPath ? hierarchyPath.split(' > ').filter(Boolean) : [];
  
  if (parts.length === 0) {
    return null;
  }
  
  // Lấy N levels đầu tiên
  const displayParts = parts.slice(0, maxLevels);
  const hasMore = parts.length > maxLevels;
  
  return (
    <div className={`mapcode-breadcrumb-compact flex items-center gap-1 text-xs ${className}`}>
      {displayParts.map((part, index) => (
        <React.Fragment key={index}>
          <span className="text-gray-600" title={part}>
            {part}
          </span>
          {index < displayParts.length - 1 && (
            <ChevronRight className="h-3 w-3 text-gray-300" aria-hidden="true" />
          )}
        </React.Fragment>
      ))}
      
      {hasMore && (
        <span className="text-gray-400 ml-1" title={`+${parts.length - maxLevels} levels`}>
          ...
        </span>
      )}
    </div>
  );
}




