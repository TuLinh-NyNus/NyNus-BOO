/**
 * LaTeX Components
 * Unified LaTeX module exports với hierarchical structure
 */

// All components
export * from './components';

// Styles
export * from './styles';

// Main renderers (convenience exports)
export { UnifiedLatexRenderer as default } from './components/unified-renderer';
export { UnifiedLatexRenderer } from './components/unified-renderer';

// Legacy renderers (for backward compatibility)
export { KaTeXRenderer } from './components/katex-renderer';
export { default as LaTeXRenderer } from './components/latex-renderer';

// Re-export for convenience
export { KaTeXRenderer as SimpleLatexRenderer } from './components/katex-renderer';
export { default as AdvancedLatexRenderer } from './components/latex-renderer';
