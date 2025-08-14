/**
 * Text Highlighting Utilities
 * Utilities cho highlighting search terms trong text content
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { normalizeText } from './search-utils';

// ===== TYPES =====

export interface HighlightOptions {
  /** Case sensitive highlighting */
  caseSensitive?: boolean;
  /** CSS class cho highlighted text */
  highlightClass?: string;
  /** HTML tag để wrap highlighted text */
  highlightTag?: string;
  /** Highlight multiple terms */
  multiTerm?: boolean;
  /** Escape HTML trong text */
  escapeHtml?: boolean;
  /** LaTeX-aware highlighting (không highlight trong LaTeX syntax) */
  latexAware?: boolean;
}

export interface HighlightMatch {
  /** Original text */
  text: string;
  /** Start position */
  start: number;
  /** End position */
  end: number;
  /** Search term được match */
  term: string;
}

export interface HighlightResult {
  /** Original text */
  originalText: string;
  /** Highlighted HTML */
  highlightedHtml: string;
  /** Các matches được tìm thấy */
  matches: HighlightMatch[];
  /** Có matches hay không */
  hasMatches: boolean;
}

// ===== CONSTANTS =====

/** Default highlight options */
export const DEFAULT_HIGHLIGHT_OPTIONS: HighlightOptions = {
  caseSensitive: false,
  highlightClass: 'search-highlight',
  highlightTag: 'mark',
  multiTerm: true,
  escapeHtml: true,
  latexAware: true
};

/** LaTeX patterns để tránh highlighting */
export const LATEX_PATTERNS = [
  /\$\$[\s\S]*?\$\$/g,  // Display math: $$...$$
  /\$[^$]*?\$/g,        // Inline math: $...$
  /\\[a-zA-Z]+\{[^}]*\}/g, // LaTeX commands: \command{...}
  /\\[a-zA-Z]+/g,       // LaTeX commands: \command
];

// ===== UTILITY FUNCTIONS =====

/**
 * Escape HTML characters
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Find LaTeX regions trong text
 */
export function findLatexRegions(text: string): Array<{ start: number; end: number }> {
  const regions: Array<{ start: number; end: number }> = [];
  
  for (const pattern of LATEX_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      regions.push({
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }
  
  // Sort by start position
  regions.sort((a, b) => a.start - b.start);
  
  // Merge overlapping regions
  const mergedRegions: Array<{ start: number; end: number }> = [];
  for (const region of regions) {
    if (mergedRegions.length === 0) {
      mergedRegions.push(region);
    } else {
      const lastRegion = mergedRegions[mergedRegions.length - 1];
      if (region.start <= lastRegion.end) {
        // Overlapping, merge
        lastRegion.end = Math.max(lastRegion.end, region.end);
      } else {
        // Not overlapping, add new
        mergedRegions.push(region);
      }
    }
  }
  
  return mergedRegions;
}

/**
 * Check if position is trong LaTeX region
 */
export function isInLatexRegion(
  position: number, 
  latexRegions: Array<{ start: number; end: number }>
): boolean {
  return latexRegions.some(region => 
    position >= region.start && position < region.end
  );
}

/**
 * Find all matches của search terms trong text
 */
export function findAllMatches(
  text: string,
  searchTerms: string[],
  options: HighlightOptions = {}
): HighlightMatch[] {
  const { caseSensitive = false, latexAware = true } = options;
  const matches: HighlightMatch[] = [];
  
  // Find LaTeX regions nếu latexAware
  const latexRegions = latexAware ? findLatexRegions(text) : [];
  
  for (const term of searchTerms) {
    if (!term.trim()) continue;
    
    const normalizedText = normalizeText(text, caseSensitive);
    const normalizedTerm = normalizeText(term, caseSensitive);
    
    let startIndex = 0;
    while (true) {
      const index = normalizedText.indexOf(normalizedTerm, startIndex);
      if (index === -1) break;
      
      // Check if trong LaTeX region
      if (latexAware && isInLatexRegion(index, latexRegions)) {
        startIndex = index + 1;
        continue;
      }
      
      matches.push({
        text: text.substring(index, index + normalizedTerm.length),
        start: index,
        end: index + normalizedTerm.length,
        term: term
      });
      
      startIndex = index + 1;
    }
  }
  
  // Sort by start position
  matches.sort((a, b) => a.start - b.start);
  
  return matches;
}

/**
 * Merge overlapping matches
 */
export function mergeOverlappingMatches(matches: HighlightMatch[]): HighlightMatch[] {
  if (matches.length <= 1) return matches;
  
  const merged: HighlightMatch[] = [];
  let current = matches[0];
  
  for (let i = 1; i < matches.length; i++) {
    const next = matches[i];
    
    if (next.start <= current.end) {
      // Overlapping, merge
      current = {
        text: current.text, // Keep original text
        start: current.start,
        end: Math.max(current.end, next.end),
        term: current.term // Keep first term
      };
    } else {
      // Not overlapping, add current và move to next
      merged.push(current);
      current = next;
    }
  }
  
  merged.push(current);
  return merged;
}

/**
 * Highlight text với search terms
 */
export function highlightText(
  text: string,
  searchTerms: string | string[],
  options: HighlightOptions = {}
): HighlightResult {
  const mergedOptions = { ...DEFAULT_HIGHLIGHT_OPTIONS, ...options };
  const {
    highlightClass,
    highlightTag,
    multiTerm,
    escapeHtml: shouldEscapeHtml
  } = mergedOptions;
  
  // Normalize search terms
  const terms = Array.isArray(searchTerms) 
    ? searchTerms 
    : multiTerm 
      ? searchTerms.split(/\s+/).filter(term => term.length > 0)
      : [searchTerms];
  
  if (terms.length === 0 || !text) {
    return {
      originalText: text,
      highlightedHtml: shouldEscapeHtml ? escapeHtml(text) : text,
      matches: [],
      hasMatches: false
    };
  }
  
  // Find all matches
  const matches = findAllMatches(text, terms, mergedOptions);
  const mergedMatches = mergeOverlappingMatches(matches);
  
  if (mergedMatches.length === 0) {
    return {
      originalText: text,
      highlightedHtml: shouldEscapeHtml ? escapeHtml(text) : text,
      matches: [],
      hasMatches: false
    };
  }
  
  // Build highlighted HTML
  let highlightedHtml = '';
  let lastIndex = 0;
  
  for (const match of mergedMatches) {
    // Add text before match
    const beforeText = text.substring(lastIndex, match.start);
    highlightedHtml += shouldEscapeHtml ? escapeHtml(beforeText) : beforeText;
    
    // Add highlighted match
    const matchText = text.substring(match.start, match.end);
    const escapedMatchText = shouldEscapeHtml ? escapeHtml(matchText) : matchText;
    
    if (highlightClass) {
      highlightedHtml += `<${highlightTag} class="${highlightClass}">${escapedMatchText}</${highlightTag}>`;
    } else {
      highlightedHtml += `<${highlightTag}>${escapedMatchText}</${highlightTag}>`;
    }
    
    lastIndex = match.end;
  }
  
  // Add remaining text
  const remainingText = text.substring(lastIndex);
  highlightedHtml += shouldEscapeHtml ? escapeHtml(remainingText) : remainingText;
  
  return {
    originalText: text,
    highlightedHtml,
    matches: mergedMatches,
    hasMatches: true
  };
}

/**
 * Quick highlight function với default options
 */
export function quickHighlight(text: string, searchTerm: string): string {
  const result = highlightText(text, searchTerm);
  return result.highlightedHtml;
}

/**
 * LaTeX-safe highlight function
 */
export function highlightLatexSafe(text: string, searchTerm: string): string {
  const result = highlightText(text, searchTerm, {
    latexAware: true,
    escapeHtml: false // Assume text is already safe
  });
  return result.highlightedHtml;
}
