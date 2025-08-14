/**
 * LaTeX to React Converter
 * Converts LaTeX content to React components (no Pandoc needed!)
 */

import React from 'react';
import katex from 'katex';
import { LATEX_COMMANDS } from './latex-commands';

// Types for React component generation
export interface ReactParseResult {
  components: React.ReactNode[];
  errors: string[];
  warnings: string[];
}

export interface MathComponentProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * KaTeX Math Component
 */
export function MathComponent({ math, displayMode = false, className = '' }: MathComponentProps) {
  try {
    const html = katex.renderToString(math.trim(), {
      displayMode,
      throwOnError: false,
      strict: false
    });
    
    return (
      <span 
        className={`katex-math ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (error) {
    console.warn('KaTeX rendering error:', error);
    return (
      <span className={`math-error ${className}`}>
        {displayMode ? `$$${math}$$` : `$${math}$`}
      </span>
    );
  }
}

/**
 * Theory Box Components
 */
export function TheoryBoxKnowledge({ children }: { children: React.ReactNode }) {
  return (
    <div className="theory-box-knowledge">
      {children}
    </div>
  );
}

export function TheoryBoxDefinition({ children }: { children: React.ReactNode }) {
  return (
    <div className="theory-box-definition">
      {children}
    </div>
  );
}

export function TheoryExample({ children }: { children: React.ReactNode }) {
  return (
    <div className="theory-example">
      {children}
    </div>
  );
}

export function TheoryNote({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="theory-note" data-title={title}>
      {children}
    </div>
  );
}

export function TheoryItemize({ children }: { children: React.ReactNode }) {
  return (
    <ul className="theory-itemize">
      {children}
    </ul>
  );
}

/**
 * Parse LaTeX content and convert to React components
 */
export function parseLatexToReact(content: string): ReactParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const components: React.ReactNode[] = [];
  
  try {
    // Split content into processable chunks
    const chunks = preprocessContent(content);
    
    // Process each chunk
    chunks.forEach((chunk, index) => {
      try {
        const component = processChunk(chunk, index);
        if (component) {
          components.push(component);
        }
      } catch (error) {
        errors.push(`Error processing chunk ${index}: ${error}`);
        // Add fallback text component
        components.push(
          React.createElement('div', 
            { key: `error-${index}`, className: 'theory-error' },
            `Error: ${chunk.substring(0, 50)}...`
          )
        );
      }
    });
    
  } catch (error) {
    errors.push(`Fatal parsing error: ${error}`);
    // Return fallback component
    components.push(
      React.createElement('div', 
        { key: 'fatal-error', className: 'theory-fatal-error' },
        'Unable to parse LaTeX content'
      )
    );
  }
  
  return { components, errors, warnings };
}

/**
 * Preprocess content into manageable chunks
 */
function preprocessContent(content: string): string[] {
  // Split by major structural elements
  const chunks: string[] = [];
  let currentChunk = '';
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Check if line starts a new major element
    if (line.match(/^\\(section|subsection|subsubsection|begin)\{/)) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
    }
    currentChunk += line + '\n';
  }
  
  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 0);
}

/**
 * Process individual content chunk
 */
function processChunk(chunk: string, index: number): React.ReactNode | null {
  // Handle sections
  const sectionMatch = chunk.match(/^\\section\{([^}]+)\}/);
  if (sectionMatch) {
    const title = sectionMatch[1];
    const content = chunk.replace(/^\\section\{[^}]+\}\s*/, '');
    return React.createElement('div', { key: `section-${index}` }, [
      React.createElement('h2', { key: 'title', className: 'theory-section' }, title),
      ...processInlineContent(content, `section-content-${index}`)
    ]);
  }
  
  // Handle subsections
  const subsectionMatch = chunk.match(/^\\subsection\{([^}]+)\}/);
  if (subsectionMatch) {
    const title = subsectionMatch[1];
    const content = chunk.replace(/^\\subsection\{[^}]+\}\s*/, '');
    return React.createElement('div', { key: `subsection-${index}` }, [
      React.createElement('h3', { key: 'title', className: 'theory-subsection' }, title),
      ...processInlineContent(content, `subsection-content-${index}`)
    ]);
  }
  
  // Handle subsubsections
  const subsubsectionMatch = chunk.match(/^\\subsubsection\{([^}]+)\}/);
  if (subsubsectionMatch) {
    const title = subsubsectionMatch[1];
    const content = chunk.replace(/^\\subsubsection\{[^}]+\}\s*/, '');
    return React.createElement('div', { key: `subsubsection-${index}` }, [
      React.createElement('h4', { key: 'title', className: 'theory-subsubsection' }, title),
      ...processInlineContent(content, `subsubsection-content-${index}`)
    ]);
  }
  
  // Handle environments
  const envMatch = chunk.match(/^\\begin\{([^}]+)\}([\s\S]*?)\\end\{\1\}/);
  if (envMatch) {
    const envName = envMatch[1];
    const envContent = envMatch[2];
    return processEnvironment(envName, envContent, index);
  }
  
  // Handle regular content
  return React.createElement('div', 
    { key: `content-${index}`, className: 'theory-content' },
    processInlineContent(chunk, `inline-${index}`)
  );
}

/**
 * Process environment content
 */
function processEnvironment(envName: string, content: string, index: number): React.ReactNode {
  const key = `env-${envName}-${index}`;
  const processedContent = processInlineContent(content, `${key}-content`);
  
  switch (envName) {
    case 'boxkn':
      // eslint-disable-next-line react/no-children-prop
      return React.createElement(TheoryBoxKnowledge, { key, children: processedContent });
    case 'boxdn':
      // eslint-disable-next-line react/no-children-prop
      return React.createElement(TheoryBoxDefinition, { key, children: processedContent });
    case 'vd':
      // eslint-disable-next-line react/no-children-prop
      return React.createElement(TheoryExample, { key, children: processedContent });
    case 'khung4':
      // eslint-disable-next-line react/no-children-prop
      return React.createElement(TheoryNote, { key, children: processedContent });
    case 'itemize':
      // eslint-disable-next-line react/no-children-prop
      return React.createElement(TheoryItemize, { key, children: processItemizeContent(content, key) });
    default:
      return React.createElement('div',
        { key, className: `theory-env-${envName}` },
        processedContent
      );
  }
}

/**
 * Process inline content (text with commands and math)
 */
function processInlineContent(content: string, keyPrefix: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let remaining = content;
  let elementIndex = 0;
  
  // Process math first (to avoid conflicts with other patterns)
  remaining = remaining.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
    const placeholder = `__DISPLAY_MATH_${elementIndex}__`;
    elements.push(
      React.createElement(MathComponent, {
        key: `${keyPrefix}-math-display-${elementIndex}`,
        math,
        displayMode: true
      })
    );
    elementIndex++;
    return placeholder;
  });
  
  remaining = remaining.replace(/\$([^$]+)\$/g, (match, math) => {
    const placeholder = `__INLINE_MATH_${elementIndex}__`;
    elements.push(
      React.createElement(MathComponent, {
        key: `${keyPrefix}-math-inline-${elementIndex}`,
        math,
        displayMode: false
      })
    );
    elementIndex++;
    return placeholder;
  });
  
  // Process other commands
  Object.entries(LATEX_COMMANDS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'g');
    remaining = remaining.replace(regex, (match, ...groups) => {
      const placeholder = `__COMMAND_${elementIndex}__`;
      
      // Create appropriate React element based on command
      if (pattern.includes('indam')) {
        elements.push(
          React.createElement('strong', {
            key: `${keyPrefix}-emphasis-${elementIndex}`,
            className: 'theory-emphasis'
          }, groups[0])
        );
      } else if (pattern.includes('indamm')) {
        elements.push(
          React.createElement('strong', {
            key: `${keyPrefix}-emphasis-colored-${elementIndex}`,
            className: 'theory-emphasis-colored'
          }, groups[0])
        );
      } else if (pattern.includes('textbf')) {
        elements.push(
          React.createElement('strong', {
            key: `${keyPrefix}-bold-${elementIndex}`
          }, groups[0])
        );
      } else {
        // Fallback to text replacement
        return replacement.replace(/\$1/g, groups[0]);
      }
      
      elementIndex++;
      return placeholder;
    });
  });
  
  // Split remaining text and insert React elements
  const finalElements: React.ReactNode[] = [];
  const parts = remaining.split(/(__[A-Z_]+_\d+__)/);
  
  parts.forEach((part, index) => {
    if (part.match(/^__[A-Z_]+_\d+__$/)) {
      // Find corresponding React element
      const elementIdx = parseInt(part.match(/\d+/)?.[0] || '0');
      if (elements[elementIdx]) {
        finalElements.push(elements[elementIdx]);
      }
    } else if (part.trim()) {
      // Regular text
      finalElements.push(
        React.createElement('span', {
          key: `${keyPrefix}-text-${index}`
        }, part)
      );
    }
  });
  
  return finalElements;
}

/**
 * Process itemize content
 */
function processItemizeContent(content: string, keyPrefix: string): React.ReactNode[] {
  const items: React.ReactNode[] = [];
  const lines = content.split('\n');
  let currentItem = '';
  let itemIndex = 0;
  
  for (const line of lines) {
    if (line.trim().startsWith('\\item')) {
      // Save previous item
      if (currentItem.trim()) {
        const isCustomBullet = currentItem.includes('\\iconMT');
        items.push(
          React.createElement('li', {
            key: `${keyPrefix}-item-${itemIndex}`,
            className: isCustomBullet ? 'theory-item-custom' : ''
          }, processInlineContent(currentItem.replace(/\\item.*?\]/, ''), `${keyPrefix}-item-content-${itemIndex}`))
        );
        itemIndex++;
      }
      currentItem = line;
    } else {
      currentItem += '\n' + line;
    }
  }
  
  // Add final item
  if (currentItem.trim()) {
    const isCustomBullet = currentItem.includes('\\iconMT');
    items.push(
      React.createElement('li', {
        key: `${keyPrefix}-item-${itemIndex}`,
        className: isCustomBullet ? 'theory-item-custom' : ''
      }, processInlineContent(currentItem.replace(/\\item.*?\]/, ''), `${keyPrefix}-item-content-${itemIndex}`))
    );
  }
  
  return items;
}

/**
 * Simple wrapper function for easy usage
 */
export function LatexToReact({ content }: { content: string }) {
  const result = parseLatexToReact(content);
  
  if (result.errors.length > 0) {
    console.warn('LaTeX parsing errors:', result.errors);
  }
  
  return (
    <div className="theory-latex-content">
      {result.components}
      {result.errors.length > 0 && (
        <div className="theory-parse-errors">
          <h4>Parsing Errors:</h4>
          <ul>
            {result.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
