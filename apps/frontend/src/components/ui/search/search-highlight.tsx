/**
 * Search Highlight Component
 * Component để highlight search terms trong text content
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useMemo } from 'react';
import { highlightText, HighlightOptions, DEFAULT_HIGHLIGHT_OPTIONS } from '@/lib/utils/text-highlight';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface SearchHighlightProps {
  /** Text content để highlight */
  text: string;
  /** Search terms để highlight */
  searchTerms: string | string[];
  /** Highlight options */
  options?: HighlightOptions;
  /** Additional CSS classes */
  className?: string;
  /** Custom highlight styles */
  highlightStyle?: React.CSSProperties;
  /** Wrapper element type */
  as?: React.ElementType;
  /** Max length để truncate text */
  maxLength?: number;
  /** Show ellipsis khi truncated */
  showEllipsis?: boolean;
}

// ===== COMPONENT =====

/**
 * Search Highlight Component
 * Highlights search terms trong text với customizable styling
 */
export function SearchHighlight({
  text,
  searchTerms,
  options = {},
  className = '',
  highlightStyle,
  as: Component = 'span',
  maxLength,
  showEllipsis = true
}: SearchHighlightProps) {
  // ===== MEMOIZED VALUES =====

  /**
   * Memoized highlight result
   */
  const highlightResult = useMemo(() => {
    if (!text || !searchTerms) {
      return {
        originalText: text,
        highlightedHtml: text,
        matches: [],
        hasMatches: false
      };
    }

    // Truncate text nếu cần
    let processedText = text;
    if (maxLength && text.length > maxLength) {
      processedText = text.substring(0, maxLength);
      if (showEllipsis) {
        processedText += '...';
      }
    }

    return highlightText(processedText, searchTerms, {
      ...DEFAULT_HIGHLIGHT_OPTIONS,
      ...options
    });
  }, [text, searchTerms, options, maxLength, showEllipsis]);

  // ===== RENDER =====

  // Nếu không có matches, return plain text
  if (!highlightResult.hasMatches) {
    return (
      <Component className={className}>
        {highlightResult.originalText}
      </Component>
    );
  }

  // Render highlighted HTML
  return (
    <Component 
      className={cn('search-highlight-container', className)}
      dangerouslySetInnerHTML={{ __html: highlightResult.highlightedHtml }}
      style={highlightStyle}
    />
  );
}

// ===== SPECIALIZED COMPONENTS =====

/**
 * LaTeX-aware Search Highlight
 * Highlight component đặc biệt cho LaTeX content
 */
export function LaTeXSearchHighlight({
  text,
  searchTerms,
  className = '',
  ...props
}: Omit<SearchHighlightProps, 'options'>) {
  return (
    <SearchHighlight
      text={text}
      searchTerms={searchTerms}
      options={{
        latexAware: true,
        escapeHtml: false,
        highlightClass: 'latex-search-highlight'
      }}
      className={cn('latex-highlight-container', className)}
      {...props}
    />
  );
}

/**
 * Multi-term Search Highlight
 * Highlight component cho multiple search terms
 */
export function MultiTermSearchHighlight({
  text,
  searchTerms,
  className = '',
  ...props
}: SearchHighlightProps) {
  return (
    <SearchHighlight
      text={text}
      searchTerms={searchTerms}
      options={{
        multiTerm: true,
        highlightClass: 'multi-term-highlight'
      }}
      className={cn('multi-term-highlight-container', className)}
      {...props}
    />
  );
}

/**
 * Compact Search Highlight
 * Highlight component cho compact display
 */
export function CompactSearchHighlight({
  text,
  searchTerms,
  maxLength = 100,
  className = '',
  ...props
}: SearchHighlightProps) {
  return (
    <SearchHighlight
      text={text}
      searchTerms={searchTerms}
      maxLength={maxLength}
      options={{
        highlightClass: 'compact-search-highlight'
      }}
      className={cn('compact-highlight-container text-sm', className)}
      {...props}
    />
  );
}

// ===== HOOK =====

/**
 * useSearchHighlight Hook
 * Hook để get highlight result without rendering
 */
export function useSearchHighlight(
  text: string,
  searchTerms: string | string[],
  options: HighlightOptions = {}
) {
  return useMemo(() => {
    if (!text || !searchTerms) {
      return {
        originalText: text,
        highlightedHtml: text,
        matches: [],
        hasMatches: false
      };
    }

    return highlightText(text, searchTerms, {
      ...DEFAULT_HIGHLIGHT_OPTIONS,
      ...options
    });
  }, [text, searchTerms, options]);
}
