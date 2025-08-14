/**
 * LaTeX Rendering Utilities
 * Comprehensive LaTeX rendering với KaTeX integration
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import katex from 'katex';
import 'katex/dist/katex.min.css';

// ===== TYPES =====

export interface LaTeXRenderOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
  errorColor?: string;
  macros?: Record<string, string>;
  strict?: boolean;
  trust?: boolean;
  maxSize?: number;
  maxExpand?: number;
}

export interface LaTeXParseResult {
  isValid: boolean;
  html?: string;
  error?: string;
  expressions: LaTeXExpression[];
}

export interface LaTeXExpression {
  type: 'inline' | 'display' | 'text';
  content: string;
  startIndex: number;
  endIndex: number;
  isValid?: boolean;
  error?: string;
}

export interface LaTeXRenderResult {
  success: boolean;
  html: string;
  error?: string;
  renderTime: number;
}

// ===== CONSTANTS =====

export const DEFAULT_LATEX_OPTIONS: LaTeXRenderOptions = {
  displayMode: false,
  throwOnError: false,
  errorColor: '#cc0000',
  strict: false,
  trust: false,
  maxSize: 10,
  maxExpand: 1000,
  macros: {
    // Common Vietnamese math macros
    '\\vn': '\\text{#1}',
    '\\viet': '\\text{#1}',
    '\\dap': '\\Rightarrow',
    '\\kq': '\\boxed{#1}'
  }
};

// LaTeX delimiters cho parsing
export const LATEX_DELIMITERS = {
  inline: {
    start: ['$', '\\('],
    end: ['$', '\\)']
  },
  display: {
    start: ['$$', '\\['],
    end: ['$$', '\\]']
  }
};

// ===== PARSING FUNCTIONS =====

/**
 * Parse LaTeX expressions từ text content
 */
export function parseLatexExpressions(content: string): LaTeXExpression[] {
  const expressions: LaTeXExpression[] = [];
  let currentIndex = 0;
  
  while (currentIndex < content.length) {
    // Tìm display math trước ($$...$$)
    const displayStart = content.indexOf('$$', currentIndex);
    const displayEnd = displayStart !== -1 ? content.indexOf('$$', displayStart + 2) : -1;
    
    // Tìm inline math ($...$)
    const inlineStart = content.indexOf('$', currentIndex);
    const inlineEnd = inlineStart !== -1 && inlineStart !== displayStart ? 
      content.indexOf('$', inlineStart + 1) : -1;
    
    // Tìm LaTeX brackets
    const bracketDisplayStart = content.indexOf('\\[', currentIndex);
    const bracketDisplayEnd = bracketDisplayStart !== -1 ? 
      content.indexOf('\\]', bracketDisplayStart + 2) : -1;
    
    const bracketInlineStart = content.indexOf('\\(', currentIndex);
    const bracketInlineEnd = bracketInlineStart !== -1 ? 
      content.indexOf('\\)', bracketInlineStart + 2) : -1;
    
    // Tìm expression gần nhất
    const candidates = [
      { type: 'display' as const, start: displayStart, end: displayEnd + 2, delim: '$$' },
      { type: 'inline' as const, start: inlineStart, end: inlineEnd + 1, delim: '$' },
      { type: 'display' as const, start: bracketDisplayStart, end: bracketDisplayEnd + 2, delim: '\\[' },
      { type: 'inline' as const, start: bracketInlineStart, end: bracketInlineEnd + 2, delim: '\\(' }
    ].filter(c => c.start !== -1 && c.end !== -1 && c.start >= currentIndex);
    
    if (candidates.length === 0) {
      // Không còn LaTeX expressions, thêm text còn lại
      if (currentIndex < content.length) {
        expressions.push({
          type: 'text',
          content: content.substring(currentIndex),
          startIndex: currentIndex,
          endIndex: content.length
        });
      }
      break;
    }
    
    // Chọn expression gần nhất
    const nearest = candidates.reduce((prev, curr) => 
      curr.start < prev.start ? curr : prev
    );
    
    // Thêm text trước expression (nếu có)
    if (nearest.start > currentIndex) {
      expressions.push({
        type: 'text',
        content: content.substring(currentIndex, nearest.start),
        startIndex: currentIndex,
        endIndex: nearest.start
      });
    }
    
    // Thêm LaTeX expression
    const latexContent = nearest.delim === '$$' ? 
      content.substring(nearest.start + 2, nearest.end - 2) :
      nearest.delim === '$' ?
      content.substring(nearest.start + 1, nearest.end - 1) :
      nearest.delim === '\\[' ?
      content.substring(nearest.start + 2, nearest.end - 2) :
      content.substring(nearest.start + 2, nearest.end - 2);
    
    expressions.push({
      type: nearest.type,
      content: latexContent,
      startIndex: nearest.start,
      endIndex: nearest.end
    });
    
    currentIndex = nearest.end;
  }
  
  return expressions;
}

/**
 * Validate LaTeX expression
 */
export function validateLatexExpression(latex: string): { isValid: boolean; error?: string } {
  try {
    katex.renderToString(latex, { 
      ...DEFAULT_LATEX_OPTIONS,
      throwOnError: true 
    });
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Unknown LaTeX error' 
    };
  }
}

// ===== RENDERING FUNCTIONS =====

/**
 * Render single LaTeX expression
 */
export function renderLatexExpression(
  latex: string, 
  options: LaTeXRenderOptions = {}
): LaTeXRenderResult {
  const startTime = performance.now();
  const renderOptions = { ...DEFAULT_LATEX_OPTIONS, ...options };
  
  try {
    const html = katex.renderToString(latex, renderOptions);
    const renderTime = performance.now() - startTime;
    
    return {
      success: true,
      html,
      renderTime
    };
  } catch (error) {
    const renderTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown rendering error';
    
    // Fallback rendering với error styling
    const fallbackHtml = `<span class="latex-error" style="color: ${renderOptions.errorColor}; font-family: monospace;">${latex}</span>`;
    
    return {
      success: false,
      html: fallbackHtml,
      error: errorMessage,
      renderTime
    };
  }
}

/**
 * Render mixed content với LaTeX expressions
 */
export function renderMixedContent(
  content: string,
  options: LaTeXRenderOptions = {}
): LaTeXParseResult {
  const expressions = parseLatexExpressions(content);
  let html = '';
  let hasError = false;
  const errors: string[] = [];
  
  for (const expr of expressions) {
    if (expr.type === 'text') {
      // Escape HTML trong text content
      html += escapeHtml(expr.content);
    } else {
      // Render LaTeX expression
      const renderOptions = {
        ...options,
        displayMode: expr.type === 'display'
      };
      
      const result = renderLatexExpression(expr.content, renderOptions);
      html += result.html;
      
      if (!result.success) {
        hasError = true;
        errors.push(result.error || 'Unknown error');
        expr.isValid = false;
        expr.error = result.error;
      } else {
        expr.isValid = true;
      }
    }
  }
  
  return {
    isValid: !hasError,
    html,
    error: errors.length > 0 ? errors.join('; ') : undefined,
    expressions
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Escape HTML characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Extract LaTeX expressions từ content
 */
export function extractLatexExpressions(content: string): string[] {
  const expressions = parseLatexExpressions(content);
  return expressions
    .filter(expr => expr.type !== 'text')
    .map(expr => expr.content);
}

/**
 * Check if content contains LaTeX
 */
export function hasLatexContent(content: string): boolean {
  return /\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\)|\$\$.*?\$\$/.test(content);
}

/**
 * Clean LaTeX content cho search/indexing
 */
export function cleanLatexForSearch(content: string): string {
  const expressions = parseLatexExpressions(content);
  return expressions
    .map(expr => expr.type === 'text' ? expr.content : ` ${expr.content} `)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get LaTeX rendering statistics
 */
export function getLatexStats(content: string): {
  totalExpressions: number;
  inlineCount: number;
  displayCount: number;
  textLength: number;
  latexLength: number;
} {
  const expressions = parseLatexExpressions(content);
  
  return {
    totalExpressions: expressions.filter(e => e.type !== 'text').length,
    inlineCount: expressions.filter(e => e.type === 'inline').length,
    displayCount: expressions.filter(e => e.type === 'display').length,
    textLength: expressions.filter(e => e.type === 'text').reduce((sum, e) => sum + e.content.length, 0),
    latexLength: expressions.filter(e => e.type !== 'text').reduce((sum, e) => sum + e.content.length, 0)
  };
}

// ===== PERFORMANCE OPTIMIZATION =====

/**
 * Memoized rendering cache
 */
const renderCache = new Map<string, LaTeXRenderResult>();
const MAX_CACHE_SIZE = 1000;

/**
 * Render với caching
 */
export function renderLatexWithCache(
  latex: string,
  options: LaTeXRenderOptions = {}
): LaTeXRenderResult {
  const cacheKey = `${latex}:${JSON.stringify(options)}`;
  
  if (renderCache.has(cacheKey)) {
    return renderCache.get(cacheKey)!;
  }
  
  const result = renderLatexExpression(latex, options);
  
  // Manage cache size
  if (renderCache.size >= MAX_CACHE_SIZE) {
    const firstKey = renderCache.keys().next().value;
    if (firstKey) {
      renderCache.delete(firstKey);
    }
  }
  
  renderCache.set(cacheKey, result);
  return result;
}

/**
 * Clear rendering cache
 */
export function clearLatexCache(): void {
  renderCache.clear();
}
