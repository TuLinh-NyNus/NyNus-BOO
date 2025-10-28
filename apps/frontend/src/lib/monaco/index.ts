/**
 * Monaco Editor LaTeX Integration
 * ==============================
 * Central export point for all Monaco LaTeX features
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// Language definition
export {
  registerLatexLanguage,
  latexLanguageConfig,
  latexLanguage,
  latexCommands
} from './latex-language';

// Themes
export {
  registerLatexThemes,
  getLatexTheme,
  applyLatexTheme,
  latexLightTheme,
  latexDarkTheme
} from './latex-themes';

// Auto-completion
export {
  registerLatexCompletion,
  latexCompletionProvider,
  basicCommands,
  examCommands,
  mathEnvironments,
  greekLetters,
  mathOperators
} from './latex-completion';

// Diagnostics
export {
  registerLatexDiagnostics,
  latexDiagnosticsProvider,
  LaTeXValidator
} from './latex-diagnostics';

// Types
export type {
  LaTeXError,
  LaTeXValidationResult
} from './latex-diagnostics';

/**
 * Initialize all LaTeX features for Monaco Editor
 */
export async function initializeLatexSupport() {
  const [
    { registerLatexLanguage },
    { registerLatexThemes },
    { registerLatexCompletion },
    { registerLatexDiagnostics }
  ] = await Promise.all([
    import('./latex-language'),
    import('./latex-themes'),
    import('./latex-completion'),
    import('./latex-diagnostics')
  ]);
  
  registerLatexLanguage();
  registerLatexThemes();
  registerLatexCompletion();
  registerLatexDiagnostics();
}

const monacoLatexSupport = {
  initializeLatexSupport
};

export default monacoLatexSupport;
