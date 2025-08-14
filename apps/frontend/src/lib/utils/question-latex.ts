/**
 * Question LaTeX Utilities
 * Enhanced KaTeX configuration và utilities cho question rendering
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import katex from 'katex';

/**
 * KaTeX configuration cho question rendering
 */
export const QUESTION_KATEX_CONFIG = {
  // Cấu hình cơ bản
  throwOnError: false,
  strict: false,
  trust: true,
  
  // Macros cho mathematical expressions trong questions
  macros: {
    // Fractions và basic math
    '\\frac': '\\frac{#1}{#2}',
    '\\dfrac': '\\dfrac{#1}{#2}',
    '\\tfrac': '\\tfrac{#1}{#2}',
    
    // Trigonometric functions
    '\\sin': '\\sin',
    '\\cos': '\\cos',
    '\\tan': '\\tan',
    '\\cot': '\\cot',
    '\\sec': '\\sec',
    '\\csc': '\\csc',
    
    // Logarithms
    '\\log': '\\log',
    '\\ln': '\\ln',
    '\\lg': '\\lg',
    
    // Limits và calculus
    '\\lim': '\\lim',
    '\\int': '\\int',
    '\\sum': '\\sum',
    '\\prod': '\\prod',
    
    // Sets và logic
    '\\in': '\\in',
    '\\notin': '\\notin',
    '\\subset': '\\subset',
    '\\supset': '\\supset',
    '\\cap': '\\cap',
    '\\cup': '\\cup',
    
    // Arrows
    '\\to': '\\to',
    '\\rightarrow': '\\rightarrow',
    '\\leftarrow': '\\leftarrow',
    '\\leftrightarrow': '\\leftrightarrow',
    
    // Vietnamese math notation
    '\\dang': '\\text{dạng}',
    '\\khi': '\\text{khi}',
    '\\voi': '\\text{với}',
    '\\la': '\\text{là}',
  }
} as const;

/**
 * Render inline math expression
 */
export function renderInlineMath(math: string): string {
  try {
    return katex.renderToString(math.trim(), {
      ...QUESTION_KATEX_CONFIG,
      displayMode: false
    });
  } catch (error) {
    console.warn('KaTeX inline math rendering error:', error);
    return `<span class="math-error inline">$${math}$</span>`;
  }
}

/**
 * Render display math expression
 */
export function renderDisplayMath(math: string): string {
  try {
    return katex.renderToString(math.trim(), {
      ...QUESTION_KATEX_CONFIG,
      displayMode: true
    });
  } catch (error) {
    console.warn('KaTeX display math rendering error:', error);
    return `<span class="math-error display">$$${math}$$</span>`;
  }
}

/**
 * Process mixed content với LaTeX expressions
 */
export function processQuestionContent(content: string): string {
  if (!content) return '';
  
  let processedContent = content;
  
  // Handle display math $$...$$
  processedContent = processedContent.replace(
    /\$\$([^$]+)\$\$/g, 
    (match, math) => renderDisplayMath(math)
  );
  
  // Handle inline math $...$
  processedContent = processedContent.replace(
    /\$([^$]+)\$/g, 
    (match, math) => renderInlineMath(math)
  );
  
  return processedContent;
}

/**
 * Validate LaTeX expression
 */
export function validateLatexExpression(latex: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    katex.renderToString(latex, {
      ...QUESTION_KATEX_CONFIG,
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

/**
 * Extract math expressions từ content
 */
export function extractMathExpressions(content: string): {
  inline: string[];
  display: string[];
} {
  const inline: string[] = [];
  const display: string[] = [];
  
  // Extract display math
  content.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
    display.push(math.trim());
    return match;
  });
  
  // Extract inline math (excluding already processed display math)
  const contentWithoutDisplay = content.replace(/\$\$([^$]+)\$\$/g, '');
  contentWithoutDisplay.replace(/\$([^$]+)\$/g, (match, math) => {
    inline.push(math.trim());
    return match;
  });
  
  return { inline, display };
}

/**
 * Clean LaTeX content cho display
 */
export function cleanLatexContent(content: string): string {
  return content
    .trim()
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Clean up common LaTeX artifacts
    .replace(/\\\\+/g, '\\\\')
    // Remove empty math expressions
    .replace(/\$\s*\$/g, '')
    .replace(/\$\$\s*\$\$/g, '');
}
