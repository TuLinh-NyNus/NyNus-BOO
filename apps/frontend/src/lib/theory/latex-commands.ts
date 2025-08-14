/**
 * LaTeX Commands Mapping for Theory Content
 * Maps custom LaTeX commands to HTML/React components
 */

import katex from 'katex';

// Custom LaTeX commands mapping
export const LATEX_COMMANDS = {
  // Custom bullet point
  '\\\\iconMT': '•',
  
  // Text formatting commands
  '\\\\indam\\{([^}]+)\\}': '<strong class="theory-emphasis">$1</strong>',
  '\\\\indamm\\{([^}]+)\\}': '<strong class="theory-emphasis-colored">$1</strong>',
  '\\\\textbf\\{([^}]+)\\}': '<strong>$1</strong>',
  
  // Structure commands
  '\\\\section\\{([^}]+)\\}': '<h2 class="theory-section">$1</h2>',
  '\\\\subsection\\{([^}]+)\\}': '<h3 class="theory-subsection">$1</h3>',
  '\\\\subsubsection\\{([^}]+)\\}': '<h4 class="theory-subsubsection">$1</h4>',
  
  // Quote commands
  '\\\\lq\\\\lq': '"',
  '\\\\rq\\\\rq': '"',
} as const;

// Environment mappings (multiline)
export const LATEX_ENVIRONMENTS = {
  'boxkn': 'theory-box-knowledge',
  'boxdn': 'theory-box-definition', 
  'vd': 'theory-example',
  'khung4': 'theory-note',
  'itemize': 'theory-itemize',
} as const;

/**
 * Parse LaTeX content and convert to HTML
 */
export function parseLatexToHtml(content: string): string {
  let result = content;
  
  // Apply single-line command replacements
  Object.entries(LATEX_COMMANDS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'g');
    result = result.replace(regex, replacement);
  });
  
  // Handle environments
  Object.entries(LATEX_ENVIRONMENTS).forEach(([env, className]) => {
    const envRegex = new RegExp(`\\\\begin\\{${env}\\}([\\s\\S]*?)\\\\end\\{${env}\\}`, 'g');
    result = result.replace(envRegex, `<div class="${className}">$1</div>`);
  });
  
  // Handle itemize with custom bullets
  result = result.replace(/\\item\s*\[\s*\\iconMT\s*\]/g, '<li class="theory-item-custom">');
  result = result.replace(/\\item(?!\s*\[)/g, '<li>');
  
  // Handle math formulas with KaTeX
  result = renderMathInContent(result);
  
  // Clean up extra whitespace
  result = result.replace(/\n\s*\n/g, '\n').trim();
  
  return result;
}

/**
 * Render math formulas using KaTeX
 */
function renderMathInContent(content: string): string {
  // Handle display math $$...$$
  content = content.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false
      });
    } catch (error) {
      console.warn('KaTeX display math error:', error);
      return `<span class="math-error">$$${math}$$</span>`;
    }
  });
  
  // Handle inline math $...$
  content = content.replace(/\$([^$]+)\$/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false
      });
    } catch (error) {
      console.warn('KaTeX inline math error:', error);
      return `<span class="math-error">$${math}$</span>`;
    }
  });
  
  return content;
}

/**
 * Test KaTeX rendering
 */
export function testKatexRendering(): string {
  try {
    const testMath = 'x^2 + y^2 = z^2';
    return katex.renderToString(testMath, {
      displayMode: false,
      throwOnError: false
    });
  } catch (error) {
    console.error('KaTeX test failed:', error);
    return 'KaTeX test failed';
  }
}

/**
 * Extract title from LaTeX content
 */
export function extractTitle(content: string): string {
  const sectionMatch = content.match(/\\section\{([^}]+)\}/);
  return sectionMatch ? sectionMatch[1] : 'Untitled';
}

/**
 * Extract metadata from LaTeX content
 */
export interface LatexMetadata {
  title: string;
  sections: string[];
  hasmath: boolean;
  customCommands: string[];
}

export function extractMetadata(content: string): LatexMetadata {
  const title = extractTitle(content);
  
  // Extract all sections
  const sectionMatches = content.match(/\\(?:sub)*section\{([^}]+)\}/g) || [];
  const sections = sectionMatches.map(match => {
    const titleMatch = match.match(/\{([^}]+)\}/);
    return titleMatch ? titleMatch[1] : '';
  });
  
  // Check for math content
  const hasmath = /\$[^$]+\$/.test(content);
  
  // Find custom commands used
  const customCommands = Object.keys(LATEX_COMMANDS).filter(cmd => {
    const cleanCmd = cmd.replace(/\\\\/g, '\\');
    return content.includes(cleanCmd);
  });
  
  return {
    title,
    sections,
    hasmath,
    customCommands
  };
}
