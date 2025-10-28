/**
 * LaTeX Diagnostics Provider for Monaco Editor
 * ===========================================
 * Provides real-time error detection and highlighting for LaTeX syntax
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import * as monaco from 'monaco-editor';

// ===== TYPES =====

export interface LaTeXError {
  line: number;
  column: number;
  length: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface LaTeXValidationResult {
  isValid: boolean;
  errors: LaTeXError[];
  warnings: LaTeXError[];
}

// ===== VALIDATION RULES =====

export class LaTeXValidator {
  private static readonly COMMON_COMMANDS = [
    'begin', 'end', 'documentclass', 'usepackage', 'title', 'author', 'date',
    'section', 'subsection', 'chapter', 'paragraph', 'maketitle',
    'frac', 'sqrt', 'sum', 'int', 'prod', 'lim', 'sin', 'cos', 'tan',
    'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta', 'lambda',
    'textbf', 'textit', 'underline', 'emph', 'label', 'ref', 'cite',
    // Exam-specific commands
    'choice', 'True', 'loigiai', 'ex'
  ];

  private static readonly MATH_ENVIRONMENTS = [
    'equation', 'align', 'gather', 'multline', 'cases', 'matrix',
    'pmatrix', 'bmatrix', 'vmatrix', 'Vmatrix'
  ];

  private static readonly EXAM_ENVIRONMENTS = [
    'ex'
  ];

  /**
   * Validate LaTeX content and return diagnostics
   */
  static validate(content: string): LaTeXValidationResult {
    const errors: LaTeXError[] = [];
    const warnings: LaTeXError[] = [];
    const lines = content.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;

      // Check for bracket mismatches
      this.checkBracketMatching(line, lineNumber, errors);

      // Check for unknown commands
      this.checkUnknownCommands(line, lineNumber, warnings);

      // Check for environment mismatches
      this.checkEnvironmentMatching(lines, lineIndex, errors);

      // Check for math mode issues
      this.checkMathMode(line, lineNumber, errors, warnings);

      // Check for exam-specific syntax
      this.checkExamSyntax(line, lineNumber, errors, warnings);
    }

    // Check overall document structure
    this.checkDocumentStructure(content, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check for bracket matching issues
   */
  private static checkBracketMatching(line: string, lineNumber: number, errors: LaTeXError[]) {
    const brackets = { '{': 0, '[': 0, '(': 0 };
    const closingBrackets = { '}': '{', ']': '[', ')': '(' };

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char in brackets) {
        brackets[char as keyof typeof brackets]++;
      } else if (char in closingBrackets) {
        const opening = closingBrackets[char as keyof typeof closingBrackets];
        if (brackets[opening as keyof typeof brackets] > 0) {
          brackets[opening as keyof typeof brackets]--;
        } else {
          errors.push({
            line: lineNumber,
            column: i + 1,
            length: 1,
            message: `Unmatched closing bracket '${char}'`,
            severity: 'error',
            code: 'bracket-mismatch'
          });
        }
      }
    }

    // Check for unclosed brackets
    Object.entries(brackets).forEach(([bracket, count]) => {
      if (count > 0) {
        errors.push({
          line: lineNumber,
          column: 1,
          length: line.length,
          message: `Unclosed '${bracket}' bracket`,
          severity: 'error',
          code: 'unclosed-bracket'
        });
      }
    });
  }

  /**
   * Check for unknown LaTeX commands
   */
  private static checkUnknownCommands(line: string, lineNumber: number, warnings: LaTeXError[]) {
    const commandRegex = /\\([a-zA-Z@]+)/g;
    let match;

    while ((match = commandRegex.exec(line)) !== null) {
      const command = match[1];
      
      if (!this.COMMON_COMMANDS.includes(command) && !command.match(/^[A-Z][a-z]*$/)) {
        warnings.push({
          line: lineNumber,
          column: match.index + 1,
          length: match[0].length,
          message: `Unknown command '\\${command}'. Make sure it's spelled correctly.`,
          severity: 'warning',
          code: 'unknown-command'
        });
      }
    }
  }

  /**
   * Check for environment matching
   */
  private static checkEnvironmentMatching(lines: string[], currentIndex: number, errors: LaTeXError[]) {
    const line = lines[currentIndex];
    const lineNumber = currentIndex + 1;
    
    const beginMatch = line.match(/\\begin\{([^}]+)\}/);
    if (beginMatch) {
      const envName = beginMatch[1];
      const endPattern = new RegExp(`\\\\end\\{${envName}\\}`);
      
      // Look for matching \end
      let found = false;
      for (let i = currentIndex + 1; i < lines.length; i++) {
        if (endPattern.test(lines[i])) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        errors.push({
          line: lineNumber,
          column: beginMatch.index! + 1,
          length: beginMatch[0].length,
          message: `Missing \\end{${envName}} for this environment`,
          severity: 'error',
          code: 'missing-end-environment'
        });
      }
    }
  }

  /**
   * Check math mode syntax
   */
  private static checkMathMode(line: string, lineNumber: number, errors: LaTeXError[], warnings: LaTeXError[]) {
    // Check for unmatched $ signs
    const dollarSigns = (line.match(/\$/g) || []).length;
    if (dollarSigns % 2 !== 0) {
      const lastDollarIndex = line.lastIndexOf('$');
      warnings.push({
        line: lineNumber,
        column: lastDollarIndex + 1,
        length: 1,
        message: 'Unmatched $ sign. Math mode may not be properly closed.',
        severity: 'warning',
        code: 'unmatched-math-delimiter'
      });
    }

    // Check for double dollar signs
    const doubleDollarMatch = line.match(/\$\$/g);
    if (doubleDollarMatch && doubleDollarMatch.length % 2 !== 0) {
      warnings.push({
        line: lineNumber,
        column: 1,
        length: line.length,
        message: 'Unmatched $$ delimiter for display math mode.',
        severity: 'warning',
        code: 'unmatched-display-math'
      });
    }
  }

  /**
   * Check exam-specific syntax
   */
  private static checkExamSyntax(line: string, lineNumber: number, errors: LaTeXError[], warnings: LaTeXError[]) {
    // Check for \choice without proper structure
    if (line.includes('\\choice') && !line.includes('\\choice[')) {
      const choiceIndex = line.indexOf('\\choice');
      
      // Should be followed by answer options
      if (!line.includes('{')) {
        warnings.push({
          line: lineNumber,
          column: choiceIndex + 1,
          length: 7,
          message: '\\choice should be followed by answer options in braces',
          severity: 'warning',
          code: 'incomplete-choice'
        });
      }
    }

    // Check for \True usage
    if (line.includes('\\True') && !line.includes('{\\True')) {
      const trueIndex = line.indexOf('\\True');
      warnings.push({
        line: lineNumber,
        column: trueIndex + 1,
        length: 5,
        message: '\\True should be used inside choice braces: {\\True answer}',
        severity: 'warning',
        code: 'incorrect-true-usage'
      });
    }

    // Check for \loigiai structure
    if (line.includes('\\loigiai') && !line.includes('\\loigiai{')) {
      const loigiaiIndex = line.indexOf('\\loigiai');
      warnings.push({
        line: lineNumber,
        column: loigiaiIndex + 1,
        length: 8,
        message: '\\loigiai should be followed by explanation in braces: \\loigiai{explanation}',
        severity: 'warning',
        code: 'incomplete-loigiai'
      });
    }
  }

  /**
   * Check overall document structure
   */
  private static checkDocumentStructure(content: string, errors: LaTeXError[], warnings: LaTeXError[]) {
    // Check for \begin{ex} without \end{ex}
    const beginExMatches = content.match(/\\begin\{ex\}/g);
    const endExMatches = content.match(/\\end\{ex\}/g);
    
    const beginCount = beginExMatches ? beginExMatches.length : 0;
    const endCount = endExMatches ? endExMatches.length : 0;
    
    if (beginCount !== endCount) {
      errors.push({
        line: 1,
        column: 1,
        length: 1,
        message: `Mismatched \\begin{ex} and \\end{ex}. Found ${beginCount} begin(s) and ${endCount} end(s).`,
        severity: 'error',
        code: 'mismatched-ex-environment'
      });
    }

    // Check for basic exam question structure
    if (content.includes('\\begin{ex}')) {
      if (!content.includes('\\choice')) {
        warnings.push({
          line: 1,
          column: 1,
          length: 1,
          message: 'Exam question should include \\choice for answer options',
          severity: 'warning',
          code: 'missing-choice'
        });
      }
      
      if (!content.includes('\\loigiai')) {
        warnings.push({
          line: 1,
          column: 1,
          length: 1,
          message: 'Exam question should include \\loigiai for explanation',
          severity: 'warning',
          code: 'missing-explanation'
        });
      }
    }
  }
}

// ===== DIAGNOSTICS PROVIDER =====

export const latexDiagnosticsProvider = {
  /**
   * Provide diagnostics for LaTeX content
   */
  provideDiagnostics: (model: monaco.editor.ITextModel): monaco.editor.IMarkerData[] => {
    const content = model.getValue();
    const validation = LaTeXValidator.validate(content);
    
    const markers: monaco.editor.IMarkerData[] = [];
    
    // Add errors
    validation.errors.forEach(error => {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: error.line,
        startColumn: error.column,
        endLineNumber: error.line,
        endColumn: error.column + error.length,
        message: error.message,
        code: error.code
      });
    });
    
    // Add warnings
    validation.warnings.forEach(warning => {
      markers.push({
        severity: monaco.MarkerSeverity.Warning,
        startLineNumber: warning.line,
        startColumn: warning.column,
        endLineNumber: warning.line,
        endColumn: warning.column + warning.length,
        message: warning.message,
        code: warning.code
      });
    });
    
    return markers;
  }
};

// ===== REGISTRATION FUNCTION =====

export function registerLatexDiagnostics() {
  // Register diagnostics provider
  const disposable = monaco.editor.onDidCreateModel((model) => {
    if (model.getLanguageId() === 'latex') {
      // Validate on content change
      const validate = () => {
        const markers = latexDiagnosticsProvider.provideDiagnostics(model);
        monaco.editor.setModelMarkers(model, 'latex', markers);
      };
      
      // Initial validation
      validate();
      
      // Validate on change (debounced)
      let timeoutId: NodeJS.Timeout;
      const onContentChange = model.onDidChangeContent(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(validate, 500); // 500ms debounce
      });
      
      // Clean up when model is disposed
      model.onWillDispose(() => {
        onContentChange.dispose();
        clearTimeout(timeoutId);
      });
    }
  });
  
  return disposable;
}

const latexDiagnosticsModule = {
  LaTeXValidator,
  latexDiagnosticsProvider,
  registerLatexDiagnostics
};

export default latexDiagnosticsModule;
