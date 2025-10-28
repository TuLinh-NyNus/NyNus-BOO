/**
 * LaTeX Themes for Monaco Editor
 * ==============================
 * Custom light and dark themes optimized for LaTeX editing
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import * as monaco from 'monaco-editor';

// ===== LIGHT THEME =====

export const latexLightTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    // Comments
    { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },

    // LaTeX commands
    { token: 'keyword.latex', foreground: '0969da', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'd73a49', fontStyle: 'bold' },
    
    // Math commands
    { token: 'keyword.math', foreground: '6f42c1', fontStyle: 'bold' },
    
    // Exam-specific commands
    { token: 'keyword.exam', foreground: 'e36209', fontStyle: 'bold' },

    // Math content
    { token: 'string.math.display', foreground: '032f62', background: 'f6f8fa' },
    { token: 'string.math.inline', foreground: '032f62', background: 'f6f8fa' },
    { token: 'text.math', foreground: '24292e' },
    { token: 'number.math', foreground: '005cc5' },
    { token: 'variable.math', foreground: '6f42c1', fontStyle: 'italic' },
    { token: 'operator.math', foreground: 'd73a49' },

    // Delimiters
    { token: 'delimiter.bracket', foreground: '24292e', fontStyle: 'bold' },
    { token: 'delimiter.bracket.math', foreground: 'd73a49', fontStyle: 'bold' },
    { token: 'delimiter.square', foreground: '6f42c1' },
    { token: 'delimiter.square.math', foreground: '6f42c1', fontStyle: 'bold' },
    { token: 'delimiter.parenthesis', foreground: '586069' },
    { token: 'delimiter.parenthesis.math', foreground: '0969da' },

    // Environments
    { token: 'string.environment', foreground: '22863a', fontStyle: 'bold' },

    // Numbers and strings
    { token: 'number', foreground: '005cc5' },
    { token: 'number.float', foreground: '005cc5' },
    { token: 'string', foreground: '032f62' },

    // Text
    { token: 'text', foreground: '24292e' },

    // Invalid
    { token: 'string.invalid', foreground: 'ffffff', background: 'd73a49' }
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#24292e',
    'editor.lineHighlightBackground': '#f6f8fa',
    'editor.selectionBackground': '#0366d625',
    'editor.selectionHighlightBackground': '#34d05840',
    'editorCursor.foreground': '#044289',
    'editorWhitespace.foreground': '#d1d5da',
    'editorIndentGuide.background': '#e1e4e8',
    'editorIndentGuide.activeBackground': '#d73a49',
    'editorLineNumber.foreground': '#959da5',
    'editorLineNumber.activeForeground': '#24292e',
    'editorBracketMatch.background': '#34d05840',
    'editorBracketMatch.border': '#34d058'
  }
};

// ===== DARK THEME =====

export const latexDarkTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Comments
    { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },

    // LaTeX commands
    { token: 'keyword.latex', foreground: '79c0ff', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'ff7b72', fontStyle: 'bold' },
    
    // Math commands
    { token: 'keyword.math', foreground: 'd2a8ff', fontStyle: 'bold' },
    
    // Exam-specific commands
    { token: 'keyword.exam', foreground: 'ffa657', fontStyle: 'bold' },

    // Math content
    { token: 'string.math.display', foreground: 'a5d6ff', background: '161b22' },
    { token: 'string.math.inline', foreground: 'a5d6ff', background: '161b22' },
    { token: 'text.math', foreground: 'e6edf3' },
    { token: 'number.math', foreground: '79c0ff' },
    { token: 'variable.math', foreground: 'd2a8ff', fontStyle: 'italic' },
    { token: 'operator.math', foreground: 'ff7b72' },

    // Delimiters
    { token: 'delimiter.bracket', foreground: 'e6edf3', fontStyle: 'bold' },
    { token: 'delimiter.bracket.math', foreground: 'ff7b72', fontStyle: 'bold' },
    { token: 'delimiter.square', foreground: 'd2a8ff' },
    { token: 'delimiter.square.math', foreground: 'd2a8ff', fontStyle: 'bold' },
    { token: 'delimiter.parenthesis', foreground: '8b949e' },
    { token: 'delimiter.parenthesis.math', foreground: '79c0ff' },

    // Environments
    { token: 'string.environment', foreground: '7ee787', fontStyle: 'bold' },

    // Numbers and strings
    { token: 'number', foreground: '79c0ff' },
    { token: 'number.float', foreground: '79c0ff' },
    { token: 'string', foreground: 'a5d6ff' },

    // Text
    { token: 'text', foreground: 'e6edf3' },

    // Invalid
    { token: 'string.invalid', foreground: 'ffffff', background: 'da3633' }
  ],
  colors: {
    'editor.background': '#0d1117',
    'editor.foreground': '#e6edf3',
    'editor.lineHighlightBackground': '#161b22',
    'editor.selectionBackground': '#264f78',
    'editor.selectionHighlightBackground': '#3fb95040',
    'editorCursor.foreground': '#79c0ff',
    'editorWhitespace.foreground': '#484f58',
    'editorIndentGuide.background': '#21262d',
    'editorIndentGuide.activeBackground': '#ff7b72',
    'editorLineNumber.foreground': '#7d8590',
    'editorLineNumber.activeForeground': '#e6edf3',
    'editorBracketMatch.background': '#3fb95040',
    'editorBracketMatch.border': '#3fb950'
  }
};

// ===== THEME REGISTRATION =====

export function registerLatexThemes() {
  // Register light theme
  monaco.editor.defineTheme('latex-light', latexLightTheme);
  
  // Register dark theme
  monaco.editor.defineTheme('latex-dark', latexDarkTheme);
}

// ===== THEME UTILITIES =====

export function getLatexTheme(isDark: boolean): string {
  return isDark ? 'latex-dark' : 'latex-light';
}

export function applyLatexTheme(editor: monaco.editor.IStandaloneCodeEditor, isDark: boolean) {
  const theme = getLatexTheme(isDark);
  editor.updateOptions({ theme });
}

const latexThemesModule = {
  registerLatexThemes,
  getLatexTheme,
  applyLatexTheme,
  latexLightTheme,
  latexDarkTheme
};

export default latexThemesModule;





